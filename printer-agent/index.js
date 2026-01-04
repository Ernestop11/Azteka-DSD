#!/usr/bin/env node

/**
 * Azteka Print Agent
 *
 * A print agent that runs on the warehouse Mac, polls the VPS for print jobs,
 * and sends them to the local printer.
 *
 * Usage:
 *   node index.js
 *
 * Environment variables:
 *   VPS_URL - The VPS API base URL (default: https://aztekafoods.com)
 *   PRINT_AGENT_SECRET - The shared secret for authenticating with the VPS
 *   AGENT_NAME - Name of this agent (default: warehouse-mac)
 *   POLL_INTERVAL - Seconds between polls (default: 5)
 *   PRINTER_NAME - Name of the printer to use (optional, uses default if not set)
 */

// Load environment variables from .env file
require('dotenv').config();

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');
const puppeteer = require('puppeteer');

// Shared browser instance for PDF generation
let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
  return browser;
}

// Configuration
const config = {
  vpsUrl: process.env.VPS_URL || 'https://aztekafoods.com',
  secret: process.env.PRINT_AGENT_SECRET || '',
  agentName: process.env.AGENT_NAME || 'warehouse-mac',
  pollInterval: parseInt(process.env.POLL_INTERVAL || '5', 10) * 1000,
  printerName: process.env.PRINTER_NAME || null,
};

// Logging utility
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = { info: '\x1b[36m[INFO]\x1b[0m', error: '\x1b[31m[ERROR]\x1b[0m', success: '\x1b[32m[OK]\x1b[0m', warn: '\x1b[33m[WARN]\x1b[0m' };
  console.log(`${timestamp} ${prefix[level] || '[LOG]'} ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

// Make HTTP request
function request(method, urlPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, config.vpsUrl);
    const isHttps = url.protocol === 'https:';
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Bearer ${config.secret}`,
        'Content-Type': 'application/json',
        'User-Agent': `AztekaPrintAgent/${config.agentName}`,
      },
    };

    const req = (isHttps ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${json.error || data}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// Get list of available printers on macOS
function getAvailablePrinters() {
  try {
    const output = execSync('lpstat -p 2>/dev/null || echo ""', { encoding: 'utf-8' });
    const printers = [];
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/^printer (\S+)/);
      if (match) {
        printers.push(match[1]);
      }
    }
    return printers;
  } catch (e) {
    return [];
  }
}

// Get default printer
function getDefaultPrinter() {
  try {
    const output = execSync('lpstat -d 2>/dev/null || echo ""', { encoding: 'utf-8' });
    const match = output.match(/system default destination: (\S+)/);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

// Generate formatted HTML picking list with FIXED HEADER on all pages
// Uses CSS position:fixed for running header - no Puppeteer displayHeaderFooter
function generateFormattedPickingListHTML(job) {
  const payload = job.payload;
  const items = payload.items || [];
  const totalCases = items.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
  const totalPacks = items.reduce((sum, item) => sum + ((item.quantity || item.qty || 0) * (item.packCount || item.unitsPerCase || 1)), 0);

  // Sort items by warehouse location, then by name
  const sortedItems = [...items].sort((a, b) => {
    const locA = (a.location || a.warehouseLocation || 'ZZZ').toUpperCase();
    const locB = (b.location || b.warehouseLocation || 'ZZZ').toUpperCase();
    if (locA !== locB) return locA.localeCompare(locB);
    return (a.name || '').localeCompare(b.name || '');
  });

  const customerName = (payload.customerName || 'CUSTOMER').toUpperCase();
  const orderNumber = payload.orderNumber || payload.orderId || '-';
  const orderDate = payload.date || new Date().toLocaleDateString();
  const salesRep = payload.salesRep || payload.orderedBy || payload.createdBy || '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: letter;
      margin: 0.5in 0.4in 0.5in 0.4in;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11px;
      line-height: 1.3;
      color: #000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* FIXED HEADER - repeats on every page */
    .page-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: #fff;
      border: 2px solid #000;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
    }

    .header-customer {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 1px;
    }

    .header-title {
      font-size: 16px;
      font-weight: 700;
      text-align: center;
    }

    .header-order {
      text-align: right;
      font-size: 11px;
    }

    .header-order-num {
      font-size: 18px;
      font-weight: 700;
    }

    /* Content wrapper - adds top padding for header */
    .content {
      padding-top: 85px; /* Space for fixed header */
    }

    /* Stats bar */
    .stats-bar {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 12px;
      padding: 6px 12px;
      border: 1px solid #999;
      background: #f5f5f5;
    }
    .stat-value { font-weight: 900; font-size: 14px; }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      page-break-inside: auto;
    }

    thead { display: table-header-group; }

    tr { page-break-inside: avoid; page-break-after: auto; }

    th {
      background: #e0e0e0;
      padding: 8px 5px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border: 1px solid #000;
    }
    th.left { text-align: left; padding-left: 12px; }

    td {
      padding: 6px 5px;
      border: 1px solid #000;
      vertical-align: middle;
    }

    tr:nth-child(even) { background: #f8f8f8; }

    /* Column styles */
    .col-loc {
      width: 50px;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
    }

    .col-name {
      text-align: left;
      font-size: 16px;
      font-weight: 600;
      padding: 8px 12px !important;
    }

    .col-desc {
      font-size: 11px;
      color: #555;
      font-weight: 400;
      display: block;
      margin-top: 2px;
    }

    .col-cases { width: 65px; text-align: center; }
    .col-pack { width: 55px; text-align: center; font-size: 12px; }
    .col-check { width: 40px; text-align: center; }

    /* Quantity box */
    .qty-box {
      display: inline-block;
      min-width: 40px;
      padding: 6px 10px;
      border: 2px solid #000;
      font-size: 18px;
      font-weight: 900;
      text-align: center;
      background: #fff;
    }

    /* Checkbox */
    .check-box {
      display: inline-block;
      width: 22px;
      height: 22px;
      border: 2px solid #000;
      background: #fff;
    }

    /* Total row */
    .totals-row { background: #e0e0e0 !important; }
    .totals-row td { font-weight: 700; font-size: 13px; padding: 10px 6px; }

    /* Footer */
    .footer-section {
      border: 1px solid #000;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
    }
    .footer-item { flex: 1; }
    .footer-label { font-size: 10px; color: #666; text-transform: uppercase; }
    .footer-line { border-bottom: 1px solid #000; height: 22px; margin-right: 20px; }
  </style>
</head>
<body>
  <!-- FIXED HEADER - appears on every page -->
  <div class="page-header">
    <div class="header-customer">${customerName}</div>
    <div class="header-title">PICKING LIST</div>
    <div class="header-order">
      <div class="header-order-num">#${orderNumber}</div>
      <div>${orderDate}</div>
    </div>
  </div>

  <!-- Content with padding for header -->
  <div class="content">
    <!-- Stats bar -->
    <div class="stats-bar">
      <div>Items: <span class="stat-value">${sortedItems.length}</span></div>
      <div>Total Cases: <span class="stat-value">${totalCases}</span></div>
      <div>Total Packs: <span class="stat-value">${totalPacks}</span></div>
      ${salesRep ? `<div>Rep: <span class="stat-value">${salesRep}</span></div>` : ''}
    </div>

    <table>
      <thead>
        <tr>
          <th>LOC</th>
          <th class="left">PRODUCT</th>
          <th>CASES</th>
          <th>PACK</th>
          <th>✓</th>
        </tr>
      </thead>
      <tbody>
${sortedItems.map(item => {
  const qty = item.quantity || item.qty || 0;
  const packCount = item.packCount || item.unitsPerCase || 1;
  const loc = item.location || item.warehouseLocation || '-';
  const name = item.name || item.productName || '-';
  const desc = item.invoiceDescription || item.description || '';
  return `        <tr>
          <td class="col-loc">${loc}</td>
          <td class="col-name">${name}${desc ? `<span class="col-desc">${desc}</span>` : ''}</td>
          <td class="col-cases"><span class="qty-box">${qty}</span></td>
          <td class="col-pack">${packCount}</td>
          <td class="col-check"><span class="check-box"></span></td>
        </tr>`;
}).join('\n')}
        <tr class="totals-row">
          <td style="text-align:right;font-weight:700;">TOTAL:</td>
          <td style="text-align:right;padding-right:15px;">${sortedItems.length} items</td>
          <td class="col-cases"><span class="qty-box">${totalCases}</span></td>
          <td class="col-pack">${totalPacks}</td>
          <td></td>
        </tr>
      </tbody>
    </table>

    <div class="footer-section">
      <div class="footer-item">
        <div class="footer-label">Picked By:</div>
        <div class="footer-line"></div>
      </div>
      <div class="footer-item">
        <div class="footer-label">Checked By:</div>
        <div class="footer-line"></div>
      </div>
      <div class="footer-item">
        <div class="footer-label">Date:</div>
        <div class="footer-line"></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// Generate printable content from job using Puppeteer for PDF
async function generatePrintContent(job) {
  const tempDir = os.tmpdir();
  const payload = job.payload;

  // For picking lists, generate formatted HTML and convert to PDF with Puppeteer
  // PDF uses much less ink than PNG screenshots
  if (job.type === 'PICKING_LIST') {
    const htmlContent = generateFormattedPickingListHTML(job);
    const pdfPath = path.join(tempDir, `azteka-print-${job.id}.pdf`);

    try {
      const browser = await getBrowser();
      const page = await browser.newPage();

      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      // Generate PDF - header is embedded in HTML using CSS position:fixed
      // This avoids Puppeteer displayHeaderFooter overlap issues
      await page.pdf({
        path: pdfPath,
        format: 'Letter',
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: '0.5in', right: '0.4in', bottom: '0.5in', left: '0.4in' },
      });
      await page.close();
      log('info', `Generated PDF picking list with Puppeteer: ${pdfPath}`);
      return { filePath: pdfPath, format: 'pdf' };
    } catch (e) {
      log('error', `Puppeteer PDF generation failed: ${e.message}`);
      throw e;
    }
  }

    // For other types, generate HTML (will try Chrome PDF, fallback to text)
    const htmlPath = path.join(tempDir, `azteka-print-${job.id}.html`);

    // Create HTML content for other document types
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
    th { background: #eee; }
  </style>
</head>
<body>`;

    // PACKING_SLIP (HTML with pricing)
    if (job.type === 'PACKING_SLIP') {
      const items = payload.items || [];
      let grandTotal = 0;
      const totalQty = items.reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);

      html += `
  <!-- WHO: Customer Name - BIG and prominent -->
  <div class="who-section">
    <div class="customer-name">${(payload.customerName || 'CUSTOMER').toUpperCase()}</div>
  </div>

  <!-- Quick Info Bar -->
  <div class="info-bar">
    <div class="info-item">
      <span class="info-label">Order #</span>
      <span class="info-value">${payload.orderNumber || payload.orderId || '-'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Date</span>
      <span class="info-value">${payload.date || new Date().toLocaleDateString()}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Items</span>
      <span class="info-value">${items.length}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Cases</span>
      <span class="info-value large">${totalQty}</span>
    </div>
  </div>
  ${payload.address ? `<div style="font-size:16px;margin-bottom:15px;"><strong>Ship To:</strong> ${payload.address}</div>` : ''}

  <!-- Items Table with Pricing -->
  <table>
    <thead>
      <tr>
        <th>Product Name</th>
        <th class="col-qty">Cases</th>
        <th style="width:90px;text-align:right">Price</th>
        <th style="width:100px;text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>`;

      for (const item of items) {
        const qty = item.quantity || item.qty || 0;
        const price = item.price || 0;
        const total = qty * price;
        grandTotal += total;
        html += `
      <tr>
        <td>
          <span class="product-name">${item.name || item.productName || '-'}</span>
          <div style="font-size:12px;color:#666;">SKU: ${item.sku || '-'}</div>
        </td>
        <td class="col-qty"><span class="qty">${qty}</span></td>
        <td style="text-align:right;font-size:16px;">$${price.toFixed(2)}</td>
        <td style="text-align:right;font-size:18px;font-weight:700;">$${total.toFixed(2)}</td>
      </tr>`;
      }

      // Grand total row
      html += `
      <tr class="totals-row">
        <td>GRAND TOTAL</td>
        <td class="col-qty"><span class="qty">${totalQty}</span></td>
        <td style="text-align:right;">cases</td>
        <td style="text-align:right;font-size:24px;">$${grandTotal.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Footer -->
  <div class="footer">
    <div>
      <div class="azteka-logo">AZTEKA FOODS</div>
      <div class="printed-date">${new Date().toLocaleString()}</div>
    </div>
    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Received By</div>
    </div>
  </div>`;

    } else if (job.type === 'INVOICE') {
      html += `
  <h1>INVOICE</h1>
  <div class="header">
    <div>
      <strong>Invoice #:</strong> ${payload.invoiceNumber || payload.orderId || 'N/A'}<br>
      <strong>Customer:</strong> ${payload.customerName || 'N/A'}<br>
      <strong>Date:</strong> ${payload.date || new Date().toLocaleDateString()}<br>
      <strong>Due Date:</strong> ${payload.dueDate || 'Upon Receipt'}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>`;

      const items = payload.items || [];
      let subtotal = 0;
      for (const item of items) {
        const qty = item.quantity || item.qty || 0;
        const price = item.price || 0;
        const total = qty * price;
        subtotal += total;
        html += `
      <tr>
        <td>${item.name || item.productName || '-'}</td>
        <td>${qty}</td>
        <td>$${price.toFixed(2)}</td>
        <td>$${total.toFixed(2)}</td>
      </tr>`;
      }

      const tax = payload.tax || 0;
      const grandTotal = subtotal + tax;

      html += `
    </tbody>
  </table>
  <div class="total">
    Subtotal: $${subtotal.toFixed(2)}<br>
    Tax: $${tax.toFixed(2)}<br>
    <strong>Total Due: $${grandTotal.toFixed(2)}</strong>
  </div>`;

    } else if (job.type === 'BOX_LABEL') {
      html += `
  <div style="text-align: center; padding: 20px;">
    <h1 style="font-size: 24px; margin-bottom: 20px;">BOX ${payload.boxNumber || 1} of ${payload.totalBoxes || 1}</h1>
    <div style="font-size: 20px; margin-bottom: 15px;">
      <strong>${payload.customerName || 'Customer'}</strong>
    </div>
    <div style="font-size: 16px; margin-bottom: 10px;">
      Order: ${payload.orderNumber || payload.orderId || 'N/A'}
    </div>
    <div style="font-size: 14px;">
      ${payload.date || new Date().toLocaleDateString()}
    </div>
  </div>`;

    } else if (job.type === 'DELIVERY_SHEET') {
      html += `
  <h1>DELIVERY SHEET</h1>
  <div class="header">
    <div>
      <strong>Driver:</strong> ${payload.driverName || 'N/A'}<br>
      <strong>Date:</strong> ${payload.date || new Date().toLocaleDateString()}<br>
      <strong>Route:</strong> ${payload.routeName || 'N/A'}
    </div>
  </div>
  <h2>Stops</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Customer</th>
        <th>Address</th>
        <th>Items</th>
        <th>Signature</th>
      </tr>
    </thead>
    <tbody>`;

      const stops = payload.stops || [];
      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        html += `
      <tr>
        <td>${i + 1}</td>
        <td>${stop.customerName || '-'}</td>
        <td>${stop.address || '-'}</td>
        <td>${stop.itemCount || 0}</td>
        <td style="width: 100px; height: 30px; border: 1px solid #999;"></td>
      </tr>`;
      }

      html += `
    </tbody>
  </table>
  <div class="total">Total Stops: ${stops.length}</div>`;

    } else {
      // Generic print
      html += `
  <h1>${job.type}</h1>
  <pre>${JSON.stringify(payload, null, 2)}</pre>`;
    }

    html += `
  <div class="footer">
    Printed by Azteka DSD • ${new Date().toLocaleString()}
  </div>
</body>
</html>`;

  // Write HTML to temp file and convert to PDF with Puppeteer
  fs.writeFileSync(htmlPath, html);

  // Convert HTML to PDF using Puppeteer
  const pdfPath = htmlPath.replace('.html', '.pdf');
  try {
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' },
    });
    await page.close();
    log('info', `Generated PDF with Puppeteer: ${pdfPath}`);
    // Clean up HTML file
    try { fs.unlinkSync(htmlPath); } catch (e) {}
    return { filePath: pdfPath, format: 'pdf' };
  } catch (e) {
    log('error', `Puppeteer PDF failed: ${e.message}`);
    // Fallback to HTML
    return { filePath: htmlPath, format: 'html' };
  }
}

// Print a file using lp command (macOS)
// Puppeteer generates PDFs, so we use lp for all files now
async function printFile(filePath, copies = 1) {
  const ext = path.extname(filePath).toLowerCase();

  // Build lp command for PDF or any file
  let cmd = `lp`;
  if (config.printerName) {
    cmd += ` -d "${config.printerName}"`;
  }
  if (copies > 1) {
    cmd += ` -n ${copies}`;
  }
  cmd += ` "${filePath}"`;

  log('info', `Executing: ${cmd}`);

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Print failed: ${stderr || error.message}`));
      } else {
        // Extract job ID from output
        const match = stdout.match(/request id is (\S+)/);
        const jobId = match ? match[1] : 'sent';
        resolve({ jobId, output: stdout });
      }
    });
  });
}

// Update job status on VPS
async function updateJobStatus(jobId, status, errorMsg = null) {
  try {
    await request('PATCH', `/api/print-queue/${jobId}`, {
      status,
      errorMsg,
    });
    log('info', `Updated job ${jobId} status to ${status}`);
  } catch (e) {
    log('error', `Failed to update job status: ${e.message}`);
  }
}

// Process a single print job
async function processJob(job) {
  log('info', `Processing job ${job.id} (${job.type})`);

  try {
    // Update status to PRINTING
    await updateJobStatus(job.id, 'PRINTING');

    // Generate printable content (text for picking lists, HTML for others)
    const { filePath } = await generatePrintContent(job);

    // Send to printer
    const result = await printFile(filePath, job.copies || 1);
    log('success', `Printed job ${job.id}: ${result.jobId}`);

    // Clean up temp file
    try {
      fs.unlinkSync(filePath);
      // Also try to clean up any generated PDF
      const pdfPath = filePath.replace('.txt', '.pdf').replace('.html', '.pdf');
      if (pdfPath !== filePath) fs.unlinkSync(pdfPath);
    } catch (e) {
      // Ignore cleanup errors
    }

    // Update status to COMPLETED
    await updateJobStatus(job.id, 'COMPLETED');

    return true;
  } catch (error) {
    log('error', `Job ${job.id} failed: ${error.message}`);
    await updateJobStatus(job.id, 'FAILED', error.message);
    return false;
  }
}

// Poll for new jobs
async function pollForJobs() {
  try {
    const response = await request('GET', `/api/print-queue?agent=${encodeURIComponent(config.agentName)}`);

    if (response.jobs && response.jobs.length > 0) {
      log('info', `Found ${response.jobs.length} pending jobs`);

      for (const job of response.jobs) {
        await processJob(job);
        // Small delay between jobs
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  } catch (error) {
    log('error', `Poll failed: ${error.message}`);
  }
}

// Main loop
async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║         AZTEKA PRINT AGENT                       ║
║                                                  ║
║  VPS: ${config.vpsUrl.padEnd(42)}║
║  Agent: ${config.agentName.padEnd(40)}║
║  Poll Interval: ${String(config.pollInterval / 1000).padEnd(32)}s║
╚══════════════════════════════════════════════════╝
`);

  // Check configuration
  if (!config.secret) {
    log('error', 'PRINT_AGENT_SECRET environment variable is required');
    log('info', 'Generate a secret on the VPS and set it as PRINT_AGENT_SECRET');
    process.exit(1);
  }

  // List available printers
  const printers = getAvailablePrinters();
  const defaultPrinter = getDefaultPrinter();

  if (printers.length === 0) {
    log('warn', 'No printers found. Make sure a printer is connected and configured.');
  } else {
    log('info', `Available printers: ${printers.join(', ')}`);
    log('info', `Default printer: ${defaultPrinter || 'none'}`);

    if (config.printerName) {
      if (printers.includes(config.printerName)) {
        log('info', `Using configured printer: ${config.printerName}`);
      } else {
        log('warn', `Configured printer "${config.printerName}" not found. Using default.`);
        config.printerName = null;
      }
    }
  }

  // Test VPS connection
  try {
    log('info', 'Testing VPS connection...');
    await request('GET', `/api/print-queue?agent=${encodeURIComponent(config.agentName)}`);
    log('success', 'VPS connection successful');
  } catch (error) {
    log('error', `VPS connection failed: ${error.message}`);
    log('info', 'Check VPS_URL and PRINT_AGENT_SECRET settings');
    process.exit(1);
  }

  // Start polling loop
  log('info', 'Starting poll loop...');

  while (true) {
    try {
      await pollForJobs();
    } catch (e) {
      log('error', `Poll loop error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, config.pollInterval));
  }
}

// Handle shutdown gracefully
process.on('SIGINT', () => {
  log('info', 'Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('info', 'Shutting down...');
  process.exit(0);
});

// Handle unhandled promise rejections (prevents silent crashes)
process.on('unhandledRejection', (reason, promise) => {
  log('error', `Unhandled rejection: ${reason}`);
});

process.on('uncaughtException', (error) => {
  log('error', `Uncaught exception: ${error.message}`);
  // Don't exit - keep the agent running
});

// Run
main().catch((error) => {
  log('error', `Fatal error: ${error.message}`);
  process.exit(1);
});
