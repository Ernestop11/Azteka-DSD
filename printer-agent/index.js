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

const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const http = require('http');

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

// Generate PDF from print job payload
function generatePDF(job) {
  return new Promise((resolve, reject) => {
    // Simple PDF generation using built-in tools
    const tempDir = os.tmpdir();
    const pdfPath = path.join(tempDir, `azteka-print-${job.id}.pdf`);
    const payload = job.payload;

    // Create HTML content
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 20px; font-size: 12px; }
    h1 { font-size: 18px; margin-bottom: 10px; }
    h2 { font-size: 14px; margin: 15px 0 5px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 5px 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: bold; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .total { font-weight: bold; font-size: 14px; text-align: right; margin-top: 15px; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
  </style>
</head>
<body>`;

    if (job.type === 'PICKING_LIST') {
      html += `
  <h1>PICKING LIST</h1>
  <div class="header">
    <div>
      <strong>Order:</strong> ${payload.orderNumber || payload.orderId || 'N/A'}<br>
      <strong>Customer:</strong> ${payload.customerName || 'N/A'}<br>
      <strong>Date:</strong> ${payload.date || new Date().toLocaleDateString()}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Location</th>
        <th>SKU</th>
        <th>Product</th>
        <th>Qty</th>
        <th>Picked</th>
      </tr>
    </thead>
    <tbody>`;

      const items = payload.items || [];
      for (const item of items) {
        html += `
      <tr>
        <td>${item.location || '-'}</td>
        <td>${item.sku || '-'}</td>
        <td>${item.name || item.productName || '-'}</td>
        <td>${item.quantity || item.qty || 0}</td>
        <td>[ ]</td>
      </tr>`;
      }

      html += `
    </tbody>
  </table>
  <div class="total">Total Items: ${items.length}</div>`;

    } else if (job.type === 'PACKING_SLIP') {
      html += `
  <h1>PACKING SLIP</h1>
  <div class="header">
    <div>
      <strong>Order:</strong> ${payload.orderNumber || payload.orderId || 'N/A'}<br>
      <strong>Customer:</strong> ${payload.customerName || 'N/A'}<br>
      <strong>Address:</strong> ${payload.address || 'N/A'}<br>
      <strong>Date:</strong> ${payload.date || new Date().toLocaleDateString()}
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Product</th>
        <th>SKU</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>`;

      const items = payload.items || [];
      let grandTotal = 0;
      for (const item of items) {
        const qty = item.quantity || item.qty || 0;
        const price = item.price || 0;
        const total = qty * price;
        grandTotal += total;
        html += `
      <tr>
        <td>${item.name || item.productName || '-'}</td>
        <td>${item.sku || '-'}</td>
        <td>${qty}</td>
        <td>$${price.toFixed(2)}</td>
        <td>$${total.toFixed(2)}</td>
      </tr>`;
      }

      html += `
    </tbody>
  </table>
  <div class="total">Grand Total: $${grandTotal.toFixed(2)}</div>`;

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

    // Write HTML to temp file
    const htmlPath = path.join(tempDir, `azteka-print-${job.id}.html`);
    fs.writeFileSync(htmlPath, html);

    // Convert HTML to PDF using cupsfilter or textutil (macOS)
    // For simplicity, we'll use the lp command directly with HTML
    // Note: macOS CUPS can print HTML directly
    resolve({ htmlPath, pdfPath: htmlPath });
  });
}

// Print a file using lp command (macOS)
async function printFile(filePath, copies = 1) {
  const ext = path.extname(filePath).toLowerCase();
  let printPath = filePath;

  // For HTML, convert to plain text (most universally supported)
  if (ext === '.html') {
    const txtPath = filePath.replace('.html', '.txt');
    try {
      await new Promise((resolve, reject) => {
        exec(`textutil -convert txt -output "${txtPath}" "${filePath}"`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      printPath = txtPath;
      log('info', `Converted HTML to TXT: ${txtPath}`);
    } catch (e) {
      log('warn', 'Could not convert HTML to text');
    }
  }

  // Build lp command
  let cmd = `lp`;
  if (config.printerName) {
    cmd += ` -d "${config.printerName}"`;
  }
  if (copies > 1) {
    cmd += ` -n ${copies}`;
  }
  cmd += ` "${printPath}"`;

  log('info', `Executing: ${cmd}`);

  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Print failed: ${stderr || error.message}`));
      } else {
        // Extract job ID from lp output
        const match = stdout.match(/request id is (\S+)/);
        const jobId = match ? match[1] : 'unknown';
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

    // Generate printable content
    const { htmlPath } = await generatePDF(job);

    // Send to printer
    const result = await printFile(htmlPath, job.copies || 1);
    log('success', `Printed job ${job.id}: ${result.jobId}`);

    // Clean up temp file
    try {
      fs.unlinkSync(htmlPath);
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
    await pollForJobs();
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

// Run
main().catch((error) => {
  log('error', `Fatal error: ${error.message}`);
  process.exit(1);
});
