#!/usr/bin/env node

/**
 * Azteka DSD Print Agent
 *
 * Runs on a local computer (warehouse Mac or Raspberry Pi) and:
 * 1. Polls the VPS for pending print jobs every 5 seconds
 * 2. Downloads job data
 * 3. Prints to local printer via CUPS
 * 4. Reports status back to VPS
 *
 * SETUP:
 * 1. Copy this folder to the warehouse computer
 * 2. Run: npm install
 * 3. Create .env file with VPS_URL and PRINT_AGENT_SECRET
 * 4. Run: npm start (or use PM2 for production)
 *
 * ENV VARIABLES:
 * - VPS_URL: The base URL of your VPS (e.g., https://azteka.yourdomain.com)
 * - PRINT_AGENT_SECRET: Secret key matching VPS PRINT_AGENT_SECRET
 * - AGENT_NAME: Name of this agent (default: hostname)
 * - PRINTER_NAME: CUPS printer name (default: HP_Color_LaserJet_MFP_M281fdw__FD3E28_)
 * - POLL_INTERVAL: Seconds between polls (default: 5)
 */

import { spawn, exec } from 'child_process'
import { writeFile, unlink, readFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir, hostname } from 'os'
import { randomUUID } from 'crypto'

// Load environment variables from .env file if present
try {
  const envPath = new URL('.env', import.meta.url).pathname
  const envContent = await readFile(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value.replace(/^["']|["']$/g, '')
      }
    }
  })
} catch {
  // .env file not found, use environment variables
}

// Configuration
const VPS_URL = process.env.VPS_URL || 'http://localhost:3000'
const AGENT_SECRET = process.env.PRINT_AGENT_SECRET || ''
const AGENT_NAME = process.env.AGENT_NAME || hostname()
const PRINTER_NAME = process.env.PRINTER_NAME || 'HP_Color_LaserJet_MFP_M281fdw__FD3E28_'
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '5', 10) * 1000

// State
let isProcessing = false
let lastError = null
let printerStatus = 'UNKNOWN'
let jobsProcessed = 0

console.log('========================================')
console.log('     AZTEKA DSD PRINT AGENT')
console.log('========================================')
console.log(`Agent Name: ${AGENT_NAME}`)
console.log(`VPS URL: ${VPS_URL}`)
console.log(`Printer: ${PRINTER_NAME}`)
console.log(`Poll Interval: ${POLL_INTERVAL / 1000}s`)
console.log('========================================')
console.log('')

if (!AGENT_SECRET) {
  console.error('ERROR: PRINT_AGENT_SECRET not configured!')
  console.error('Please set PRINT_AGENT_SECRET in .env file or environment')
  process.exit(1)
}

/**
 * Check if printer is available via CUPS
 */
async function checkPrinterStatus() {
  return new Promise((resolve) => {
    exec(`lpstat -p ${PRINTER_NAME}`, (error, stdout, stderr) => {
      if (error) {
        printerStatus = 'OFFLINE'
        resolve('OFFLINE')
      } else if (stdout.includes('idle')) {
        printerStatus = 'ONLINE'
        resolve('ONLINE')
      } else if (stdout.includes('printing')) {
        printerStatus = 'PRINTING'
        resolve('PRINTING')
      } else {
        printerStatus = 'UNKNOWN'
        resolve('UNKNOWN')
      }
    })
  })
}

/**
 * Send heartbeat to VPS
 */
async function sendHeartbeat() {
  try {
    const response = await fetch(`${VPS_URL}/api/print-queue/heartbeat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AGENT_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentName: AGENT_NAME,
        printerStatus,
        printerName: PRINTER_NAME,
        queueDepth: 0,
        lastError: lastError || undefined,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`[Heartbeat] Failed: ${response.status} ${error}`)
    }
  } catch (error) {
    console.error(`[Heartbeat] Error: ${error.message}`)
  }
}

/**
 * Print text content via CUPS lp command
 */
async function printText(text, jobName, copies = 1) {
  const tempFile = join(tmpdir(), `azteka-print-${randomUUID()}.txt`)

  try {
    // Write text to temp file
    await writeFile(tempFile, text, 'utf-8')

    // Print using lp command
    return new Promise((resolve) => {
      const lp = spawn('lp', [
        '-d', PRINTER_NAME,
        '-n', copies.toString(),
        '-t', jobName,
        '-o', 'media=letter',
        '-o', 'cpi=12',
        '-o', 'lpi=8',
        tempFile,
      ])

      let output = ''
      let errorOutput = ''

      lp.stdout.on('data', (data) => {
        output += data.toString()
      })

      lp.stderr.on('data', (data) => {
        errorOutput += data.toString()
      })

      lp.on('close', async (code) => {
        // Clean up temp file
        try {
          await unlink(tempFile)
        } catch {}

        if (code === 0) {
          const match = output.match(/request id is (\S+)/)
          resolve({
            success: true,
            jobId: match ? match[1] : undefined,
          })
        } else {
          resolve({
            success: false,
            error: errorOutput || `Print failed with code ${code}`,
          })
        }
      })

      lp.on('error', (err) => {
        resolve({
          success: false,
          error: err.message,
        })
      })
    })
  } catch (error) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Process a single print job
 */
async function processJob(job) {
  console.log(`[Job ${job.id}] Processing ${job.type}...`)

  try {
    // Mark job as printing
    await fetch(`${VPS_URL}/api/print-queue/${job.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AGENT_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'PRINTING' }),
    })

    // Get print content from payload
    const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload
    const textContent = payload.textContent

    if (!textContent) {
      throw new Error('No textContent in job payload')
    }

    // Print the content
    const jobName = `${job.type} - ${payload.orderNumber || job.sourceId || 'Unknown'}`
    const result = await printText(textContent, jobName, job.copies || 1)

    if (result.success) {
      console.log(`[Job ${job.id}] Printed successfully (CUPS Job: ${result.jobId})`)

      // Mark as completed
      await fetch(`${VPS_URL}/api/print-queue/${job.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AGENT_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      jobsProcessed++
      lastError = null
    } else {
      throw new Error(result.error || 'Print failed')
    }
  } catch (error) {
    console.error(`[Job ${job.id}] Error: ${error.message}`)
    lastError = error.message

    // Mark as failed
    await fetch(`${VPS_URL}/api/print-queue/${job.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AGENT_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'FAILED',
        errorMsg: error.message,
      }),
    })
  }
}

/**
 * Poll VPS for pending jobs
 */
async function pollForJobs() {
  if (isProcessing) return

  try {
    isProcessing = true

    // Check printer status first
    await checkPrinterStatus()

    // Send heartbeat
    await sendHeartbeat()

    // Skip if printer is offline
    if (printerStatus === 'OFFLINE') {
      console.log(`[Poll] Printer offline, skipping...`)
      return
    }

    // Fetch pending jobs
    const response = await fetch(
      `${VPS_URL}/api/print-queue?agent=${encodeURIComponent(AGENT_NAME)}`,
      {
        headers: {
          'Authorization': `Bearer ${AGENT_SECRET}`,
        },
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API error: ${response.status} ${error}`)
    }

    const data = await response.json()

    if (data.jobs && data.jobs.length > 0) {
      console.log(`[Poll] Found ${data.jobs.length} pending job(s)`)

      // Process jobs one at a time
      for (const job of data.jobs) {
        await processJob(job)
      }
    }
  } catch (error) {
    console.error(`[Poll] Error: ${error.message}`)
    lastError = error.message
  } finally {
    isProcessing = false
  }
}

/**
 * Main loop
 */
async function main() {
  // Initial check
  await checkPrinterStatus()
  console.log(`[Startup] Printer status: ${printerStatus}`)

  // Send initial heartbeat
  await sendHeartbeat()
  console.log(`[Startup] Heartbeat sent`)
  console.log('')
  console.log('Polling for print jobs...')
  console.log('')

  // Poll immediately
  await pollForJobs()

  // Then poll on interval
  setInterval(pollForJobs, POLL_INTERVAL)

  // Periodic heartbeat (every 60 seconds, independent of polling)
  setInterval(sendHeartbeat, 60000)
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Shutdown] Stopping print agent...')
  console.log(`[Stats] Jobs processed this session: ${jobsProcessed}`)
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n[Shutdown] Stopping print agent...')
  console.log(`[Stats] Jobs processed this session: ${jobsProcessed}`)
  process.exit(0)
})

// Start
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
