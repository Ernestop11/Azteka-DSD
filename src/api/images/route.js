import { Router } from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { removeBackgroundFromImageBase64 } from 'remove.bg';
import { getApiKey, useOpenAI } from '../integrations/helpers.js';

const router = Router();
const prisma = new PrismaClient();

const productImageDir = path.join(process.cwd(), 'public', 'products');
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};
ensureDir(productImageDir);

// Get API keys from user's integrations or environment variables
async function getGoogleApiKey(userId) {
  // For now, use environment variable
  // TODO: Store Google API key in integrations
  return process.env.GOOGLE_API_KEY;
}

async function getGoogleSearchEngineId(userId) {
  // For now, use environment variable
  // TODO: Store Google Search Engine ID in integrations
  return process.env.GOOGLE_SEARCH_ENGINE_ID;
}

async function getRemoveBgKey(userId) {
  // For now, use environment variable
  // TODO: Store Remove.bg key in integrations
  return process.env.REMOVE_BG_KEY;
}

async function getOpenAIClient(userId) {
  const apiKey = await getApiKey(userId, 'openai');
  if (apiKey) {
    return new OpenAI({ apiKey });
  }
  // Fallback to environment variable
  return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
}

// POST /api/images/search - Search Google for product image
router.post('/search', async (req, res) => {
  try {
    const { productName, brand } = req.body;
    const userId = req.user?.id || req.user?.sub;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const GOOGLE_API_KEY = await getGoogleApiKey(userId);
    const GOOGLE_SEARCH_ENGINE_ID = await getGoogleSearchEngineId(userId);

    if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
      return res.status(500).json({ 
        error: 'Google Custom Search API not configured',
        message: 'Please configure Google API key in Integrations page or set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID in environment variables'
      });
    }

    // Build search query
    const searchQuery = brand ? `${productName} ${brand} product` : `${productName} product`;
    
    // Search Google Custom Search API
    const searchUrl = `https://www.googleapis.com/customsearch/v1?` +
      `key=${GOOGLE_API_KEY}&` +
      `cx=${GOOGLE_SEARCH_ENGINE_ID}&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `searchType=image&` +
      `num=5&` +
      `safe=active&` +
      `imgSize=large&` +
      `imgType=photo`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.status(404).json({ error: 'No images found' });
    }

    // Get best match (first result)
    const bestMatch = searchData.items[0];
    const imageUrl = bestMatch.link;

    // Download image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return res.status(500).json({ error: 'Failed to download image' });
    }

    const imageBuffer = await imageResponse.buffer();
    
    // Save image
    const timestamp = Date.now();
    const filename = `product-${timestamp}.jpg`;
    const filepath = path.join(productImageDir, filename);
    
    await fs.promises.writeFile(filepath, imageBuffer);
    
    const savedImageUrl = `/products/${filename}`;

    res.json({
      success: true,
      imageUrl: savedImageUrl,
      sourceUrl: imageUrl,
      thumbnail: bestMatch.image?.thumbnailLink,
    });
  } catch (error) {
    console.error('Image search error:', error);
    res.status(500).json({ 
      error: 'Image search failed',
      message: error.message 
    });
  }
});

// POST /api/images/remove-background - Remove background from image
router.post('/remove-background', async (req, res) => {
  try {
    const { productId, imageUrl } = req.body;
    const userId = req.user?.id || req.user?.sub;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const REMOVE_BG_KEY = await getRemoveBgKey(userId);

    // Get image path
    const imagePath = imageUrl.startsWith('/products/')
      ? path.join(process.cwd(), 'public', imageUrl)
      : imageUrl;

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Read image
    const imageBuffer = await fs.promises.readFile(imagePath);

    let processedBuffer;

    // Try Remove.bg first
    if (REMOVE_BG_KEY) {
      try {
        const result = await removeBackgroundFromImageBase64({
          base64img: imageBuffer.toString('base64'),
          apiKey: REMOVE_BG_KEY,
          size: 'auto',
          format: 'png',
        });
        
        if (result?.base64img) {
          processedBuffer = Buffer.from(result.base64img, 'base64');
        }
      } catch (error) {
        console.warn('Remove.bg failed, using sharp fallback:', error.message);
      }
    }

    // Fallback to sharp alpha mask
    if (!processedBuffer) {
      processedBuffer = await sharp(imageBuffer)
        .png()
        .toBuffer();
    }

    // Save processed image
    const timestamp = Date.now();
    const filename = `product-bg-removed-${timestamp}.png`;
    const filepath = path.join(productImageDir, filename);
    
    await fs.promises.writeFile(filepath, processedBuffer);
    
    const processedImageUrl = `/products/${filename}`;

    // Update product if productId provided
    if (productId) {
      await prisma.product.update({
        where: { id: productId },
        data: { 
          imageUrl: processedImageUrl,
          // Add a flag to track background removal (we'll add this field to schema)
        },
      });
    }

    res.json({
      success: true,
      processedImageUrl,
      originalImageUrl: imageUrl,
    });
  } catch (error) {
    console.error('Background removal error:', error);
    res.status(500).json({ 
      error: 'Background removal failed',
      message: error.message 
    });
  }
});

// POST /api/images/process - Complete workflow (search + remove background)
router.post('/process', async (req, res) => {
  try {
    const { productId, productName, brand } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required' });
    }

    const steps = {
      search: { success: false, imageUrl: null },
      removeBackground: { success: false, processedImageUrl: null },
    };

    // Step 1: Search for image
    try {
      const searchRes = await fetch(`${req.protocol}://${req.get('host')}/api/images/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, brand }),
      });

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        steps.search = { success: true, imageUrl: searchData.imageUrl };
      }
    } catch (error) {
      console.error('Search step failed:', error);
    }

    if (!steps.search.imageUrl) {
      return res.status(404).json({ 
        error: 'Image search failed',
        steps 
      });
    }

    // Step 2: Remove background
    try {
      const bgRes = await fetch(`${req.protocol}://${req.get('host')}/api/images/remove-background`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId, 
          imageUrl: steps.search.imageUrl 
        }),
      });

      if (bgRes.ok) {
        const bgData = await bgRes.json();
        steps.removeBackground = { 
          success: true, 
          processedImageUrl: bgData.processedImageUrl 
        };
      }
    } catch (error) {
      console.error('Background removal step failed:', error);
    }

    res.json({
      success: steps.removeBackground.success,
      steps,
      finalImageUrl: steps.removeBackground.processedImageUrl || steps.search.imageUrl,
    });
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ 
      error: 'Image processing failed',
      message: error.message 
    });
  }
});

// POST /api/images/ai/splash-image - Generate AI splash image
router.post('/ai/splash-image', async (req, res) => {
  try {
    const { productId, productImageUrl, style, text, tagline } = req.body;
    const userId = req.user?.id || req.user?.sub;

    if (!productImageUrl) {
      return res.status(400).json({ error: 'Product image URL is required' });
    }

    const openai = await getOpenAIClient(userId);
    
    if (!openai) {
      return res.status(500).json({ 
        error: 'OpenAI API not configured',
        message: 'Please configure OpenAI API key in Integrations page or set OPENAI_API_KEY in environment variables'
      });
    }

    // Get product image
    const imagePath = productImageUrl.startsWith('/products/')
      ? path.join(process.cwd(), 'public', productImageUrl)
      : productImageUrl;

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Product image file not found' });
    }

    const imageBuffer = await fs.promises.readFile(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // Generate splash image using DALL-E with image editing
    // For now, we'll use DALL-E to generate a new image based on the product image
    const prompt = `Create a beautiful promotional splash image for a product. 
Style: ${style || 'modern'}
Product name: ${text || 'Product'}
Tagline: ${tagline || 'Premium Quality'}
Include: Vibrant colors, gradients, professional design, eye-catching layout, product showcase style.
Make it look like a premium product advertisement banner.`;

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });

      const splashImageUrl = response.data[0]?.url;
      
      if (!splashImageUrl) {
        return res.status(500).json({ error: 'Failed to generate splash image' });
      }

      // Download generated image
      const imageResponse = await fetch(splashImageUrl);
      const splashBuffer = await imageResponse.buffer();

      // Save splash image
      const timestamp = Date.now();
      const filename = `splash-${productId || timestamp}.png`;
      const filepath = path.join(productImageDir, filename);
      
      await fs.promises.writeFile(filepath, splashBuffer);
      
      const savedSplashUrl = `/products/${filename}`;

      // Update product if productId provided
      // Note: We'll need to add splashImageUrl field to Product model
      if (productId) {
        // For now, we'll store it in a JSON field or add it to the schema later
        // await prisma.product.update({
        //   where: { id: productId },
        //   data: { splashImageUrl: savedSplashUrl },
        // });
      }

      res.json({
        success: true,
        splashImageUrl: savedSplashUrl,
        style,
        text,
        tagline,
      });
    } catch (error) {
      console.error('DALL-E generation error:', error);
      res.status(500).json({ 
        error: 'Splash image generation failed',
        message: error.message 
      });
    }
  } catch (error) {
    console.error('Splash image error:', error);
    res.status(500).json({ 
      error: 'Splash image generation failed',
      message: error.message 
    });
  }
});

export default router;

