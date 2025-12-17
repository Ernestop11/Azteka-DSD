// ====================================
// DEV ENDPOINTS FOR FULFILLMENT TESTING
// ====================================

// Helper function to emit orders-updated event
const emitOrdersUpdated = () => {
  io.emit('orders-updated');
  console.log('📡 orders-updated emitted');
};

// Store mock orders in app context
app.set('mockOrders', []);

// Seed demo orders
app.post('/api/dev/seed-orders', async (_req, res) => {
  const now = new Date();
  const demo = [
    { id: 'ORD-1001', customer_name: 'Taqueria Jalisco', status: 'PENDING', updatedAt: now },
    { id: 'ORD-1002', customer_name: 'La Poblanita', status: 'PICKING', updatedAt: now },
    { id: 'ORD-1003', customer_name: 'Villa Corona', status: 'LOADED', updatedAt: now },
  ];

  // Normalize for consistent API response
  const normalized = demo.map((o) => ({
    id: o.id,
    customerName: o.customer_name,
    status: o.status,
    updatedAt: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
  }));
  
  app.set('mockOrders', normalized);
  
  res.json({ ok: true, count: demo.length });
  emitOrdersUpdated();
});

// Clear all orders
app.post('/api/dev/clear-orders', async (_req, res) => {
  app.set('mockOrders', []);
  res.json({ ok: true });
  emitOrdersUpdated();
});

// Get all orders (returns mock orders for now)
app.get('/api/dev/orders', async (_req, res) => {
  const mockOrders = app.get('mockOrders') || [];
  res.json(mockOrders);
});
