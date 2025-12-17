/**
 * Express Worker Server
 * Handles Socket.IO, background workers, and scheduled tasks
 * 
 * Port: 3003
 * Purpose: Real-time updates, background job processing
 */

import express from 'express'
import { Server as SocketIOServer } from 'socket.io'
import http from 'http'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env.production') })
dotenv.config({ path: join(__dirname, '..', '.env') })

// Import workers and handlers
import { startPrintQueueWorker } from './workers/printQueue.mjs'
import { setupSocketHandlers } from './socket/index.mjs'
import { setupCronJobs } from './cron/dailyTasks.mjs'

// Initialize
const app = express()
const server = http.createServer(app)
const prisma = new PrismaClient()

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['*']

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

const PORT = process.env.WORKER_PORT || 3003
const WORKER_ID = process.env.WORKER_ID || `worker-${Date.now()}`

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'express-worker',
    workerId: WORKER_ID,
    port: PORT,
    timestamp: new Date().toISOString(),
  })
})

// API endpoint to notify worker of new jobs
app.post('/api/queue/notify', async (req, res) => {
  try {
    const { jobId, orderId } = req.body
    
    if (!jobId && !orderId) {
      return res.status(400).json({ error: 'jobId or orderId required' })
    }

    // Emit event to connected clients
    io.emit('print:job:queued', { jobId, orderId })
    
    res.json({ success: true, message: 'Notification sent' })
  } catch (error) {
    console.error('[Worker] Error in /api/queue/notify:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
})

// Setup Socket.IO handlers
setupSocketHandlers(io, prisma)

// Start background workers
console.log(`[Worker] Starting background workers...`)
startPrintQueueWorker(prisma, io, WORKER_ID)

// Setup scheduled tasks
console.log(`[Worker] Setting up scheduled tasks...`)
setupCronJobs(prisma, io)

// Start server
server.listen(PORT, () => {
  console.log(`✅ Express Worker running on port ${PORT}`)
  console.log(`   Worker ID: ${WORKER_ID}`)
  console.log(`   Socket.IO ready for connections`)
  console.log(`   Background workers started`)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[Worker] SIGTERM received, shutting down gracefully...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('[Worker] Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  console.log('[Worker] SIGINT received, shutting down gracefully...')
  await prisma.$disconnect()
  server.close(() => {
    console.log('[Worker] Server closed')
    process.exit(0)
  })
})

