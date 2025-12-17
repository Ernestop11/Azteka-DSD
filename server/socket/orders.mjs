/**
 * Order Socket.IO Handlers
 * Real-time order update handlers
 */

/**
 * Setup order-related Socket.IO handlers
 */
export function setupOrderHandlers(socket, io, prisma) {
  // Subscribe to order updates
  socket.on('subscribe:orders', () => {
    socket.join('orders')
    console.log(`[Socket] ${socket.id} subscribed to order updates`)
    
    socket.emit('subscribed', {
      channel: 'orders',
      message: 'Subscribed to order updates',
    })
  })

  // Unsubscribe from order updates
  socket.on('unsubscribe:orders', () => {
    socket.leave('orders')
    console.log(`[Socket] ${socket.id} unsubscribed from order updates`)
  })

  // Subscribe to specific order
  socket.on('subscribe:order', (data) => {
    const { orderId } = data
    if (orderId) {
      socket.join(`order:${orderId}`)
      console.log(`[Socket] ${socket.id} subscribed to order ${orderId}`)
    }
  })

  // Request order status
  socket.on('order:status', async (data) => {
    try {
      const { orderId } = data
      if (!orderId) {
        socket.emit('error', { message: 'orderId required' })
        return
      }

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      })

      if (order) {
        socket.emit('order:status:response', {
          orderId,
          status: order.status,
          order,
        })
      } else {
        socket.emit('error', { message: 'Order not found' })
      }
    } catch (error) {
      console.error('[Socket] Error fetching order status:', error)
      socket.emit('error', { message: 'Failed to fetch order status' })
    }
  })
}

