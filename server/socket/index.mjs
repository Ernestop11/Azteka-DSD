/**
 * Socket.IO Handlers
 * Setup all Socket.IO event handlers
 */

import { setupOrderHandlers } from './orders.mjs'
import { setupWarehouseHandlers } from './warehouse.mjs'

/**
 * Setup all Socket.IO handlers
 */
export function setupSocketHandlers(io, prisma) {
  console.log('[Socket] Setting up Socket.IO handlers...')

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`)

    // Setup handlers
    setupOrderHandlers(socket, io, prisma)
    setupWarehouseHandlers(socket, io, prisma)

    // Disconnect handler
    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Client disconnected: ${socket.id} (${reason})`)
    })

    // Error handler
    socket.on('error', (error) => {
      console.error(`[Socket] Error from ${socket.id}:`, error)
    })
  })

  console.log('[Socket] Socket.IO handlers setup complete')
}

/**
 * Emit order update to all subscribers
 */
export function emitOrderUpdate(io, orderId, status, data = {}) {
  io.to('orders').emit('order:updated', {
    orderId,
    status,
    ...data,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Emit warehouse notification
 */
export function emitWarehouseNotification(io, type, message, data = {}) {
  io.to('warehouse').emit('warehouse:notification', {
    type,
    message,
    ...data,
    timestamp: new Date().toISOString(),
  })
}

