export interface PrintableOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PrintableOrder {
  customerName: string;
  createdAt?: string;
  total?: number;
  items: PrintableOrderItem[];
}

const formatCurrency = (value: number | undefined) => {
  if (value === undefined || Number.isNaN(value)) return '$0.00';
  return `$${value.toFixed(2)}`;
};

export function printOrder(order: PrintableOrder) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', 'PRINT', 'width=900,height=700');

  if (!printWindow) {
    console.warn('Unable to open print window');
    return;
  }

  const createdDate = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : new Date().toLocaleString();

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; text-align:center; border-bottom: 1px solid #eee;">${item.quantity}</td>
          <td style="padding: 8px; text-align:right; border-bottom: 1px solid #eee;">${formatCurrency(item.price)}</td>
          <td style="padding: 8px; text-align:right; border-bottom: 1px solid #eee;">${formatCurrency(
            item.price * item.quantity
          )}</td>
        </tr>
      `
    )
    .join('');

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = order.total ?? subtotal;

  const html = `
    <html>
      <head>
        <title>Azteka DSD Order - ${order.customerName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
            margin: 0;
            padding: 24px;
            background: #f8fafc;
            color: #0f172a;
          }
          .header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
          }
          .logo {
            width: 72px;
            height: 72px;
            border-radius: 16px;
            object-fit: cover;
            border: 2px solid #e2e8f0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          }
          .totals {
            margin-top: 16px;
            text-align: right;
            font-size: 18px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="/logo.png" alt="Azteka Foods" class="logo" />
          <div>
            <h1>Azteka DSD Order</h1>
            <p>Customer: <strong>${order.customerName}</strong></p>
            <p>Date: ${createdDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="text-align:left; padding: 12px;">Item</th>
              <th style="text-align:center; padding: 12px;">Qty</th>
              <th style="text-align:right; padding: 12px;">Price</th>
              <th style="text-align:right; padding: 12px;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="totals">
          <p>Subtotal: <strong>${formatCurrency(subtotal)}</strong></p>
          <p>Total: <strong>${formatCurrency(total)}</strong></p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
}
