import { Resend } from 'resend'

// Initialize Resend lazily to avoid build-time errors
let resendInstance: Resend | null = null

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

// Email configuration
const FROM_EMAIL = 'Azteka DSD <orders@aztekafoods.com>'
// Admin emails from environment variable (comma-separated) or defaults
const ADMIN_EMAILS = process.env.ADMIN_NOTIFICATION_EMAILS
  ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',').map(e => e.trim())
  : ['ernestoponcedev@gmail.com'] // Default fallback

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  businessName: string
  items: OrderItem[]
  subtotal: number
  total: number
  orderDate: Date
  notes?: string
}

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

// Generate HTML email for customer
const generateCustomerEmailHTML = (data: OrderEmailData): string => {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
        <div style="font-weight: 500; color: #111827;">${item.name}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
        ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; color: #111827;">
        ${formatCurrency(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Order Confirmed!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">Thank you for your order</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <!-- Order Info -->
      <div style="margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 14px;">Order Number</span>
          <span style="color: #111827; font-weight: 600;">#${data.orderId.slice(-8).toUpperCase()}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #6b7280; font-size: 14px;">Business</span>
          <span style="color: #111827; font-weight: 500;">${data.businessName}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #6b7280; font-size: 14px;">Order Date</span>
          <span style="color: #111827; font-size: 13px;">${formatDate(data.orderDate)}</span>
        </div>
      </div>

      <!-- Items Table -->
      <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #111827;">Order Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-transform: uppercase;">Item</th>
            <th style="text-align: center; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
            <th style="text-align: right; padding: 8px 0; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-transform: uppercase;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- Total -->
      <div style="margin-top: 24px; padding: 16px; background: #059669; border-radius: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: white; font-size: 18px; font-weight: 600;">Order Total</span>
          <span style="color: white; font-size: 24px; font-weight: 700;">${formatCurrency(data.total)}</span>
        </div>
      </div>

      ${data.notes ? `
      <!-- Notes -->
      <div style="margin-top: 24px; padding: 16px; background: #fef3c7; border-radius: 12px;">
        <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Note:</strong> ${data.notes}</p>
      </div>
      ` : ''}

      <!-- Footer -->
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 14px;">Questions? Contact us at orders@aztekafoods.com</p>
        <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">Azteka Foods Distribution</p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}

// Generate HTML email for admin
const generateAdminEmailHTML = (data: OrderEmailData): string => {
  const itemsHTML = data.items.map(item => `
    <tr>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price)}</td>
      <td style="padding: 8px 12px; border: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); border-radius: 12px 12px 0 0; padding: 24px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">New Order Received</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 4px 0 0 0; font-size: 14px;">Order #${data.orderId.slice(-8).toUpperCase()}</p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px;">
      <!-- Customer Info -->
      <div style="margin-bottom: 20px; padding: 16px; background: #f9fafb; border-radius: 8px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Customer Information</h3>
        <p style="margin: 0 0 4px 0;"><strong>Business:</strong> ${data.businessName}</p>
        <p style="margin: 0 0 4px 0;"><strong>Contact:</strong> ${data.customerName}</p>
        <p style="margin: 0 0 4px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
        <p style="margin: 0;"><strong>Date:</strong> ${formatDate(data.orderDate)}</p>
      </div>

      <!-- Items Table -->
      <h3 style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-transform: uppercase;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="text-align: left; padding: 8px 12px; border: 1px solid #e5e7eb;">Product</th>
            <th style="text-align: center; padding: 8px 12px; border: 1px solid #e5e7eb;">Qty</th>
            <th style="text-align: right; padding: 8px 12px; border: 1px solid #e5e7eb;">Unit Price</th>
            <th style="text-align: right; padding: 8px 12px; border: 1px solid #e5e7eb;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr style="background: #059669; color: white;">
            <td colspan="3" style="padding: 12px; font-weight: 600; text-align: right;">ORDER TOTAL</td>
            <td style="padding: 12px; font-weight: 700; text-align: right; font-size: 18px;">${formatCurrency(data.total)}</td>
          </tr>
        </tfoot>
      </table>

      ${data.notes ? `
      <!-- Notes -->
      <div style="padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 14px; color: #92400e;"><strong>Customer Note:</strong> ${data.notes}</p>
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `
}

// Send order confirmation to customer
export async function sendOrderConfirmationToCustomer(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend()
    if (!resend) {
      console.warn('RESEND_API_KEY not set, skipping email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Order Confirmed - #${data.orderId.slice(-8).toUpperCase()}`,
      html: generateCustomerEmailHTML(data)
    })

    if (error) {
      console.error('Failed to send customer email:', error)
      return { success: false, error: error.message }
    }

    console.log('Customer email sent:', result?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending customer email:', error)
    return { success: false, error: String(error) }
  }
}

// Send order notification to admins
export async function sendOrderNotificationToAdmins(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend()
    if (!resend) {
      console.warn('RESEND_API_KEY not set, skipping admin email')
      return { success: false, error: 'Email service not configured' }
    }

    const { data: result, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAILS,
      subject: `New Order: ${data.businessName} - ${formatCurrency(data.total)}`,
      html: generateAdminEmailHTML(data)
    })

    if (error) {
      console.error('Failed to send admin email:', error)
      return { success: false, error: error.message }
    }

    console.log('Admin email sent:', result?.id)
    return { success: true }
  } catch (error) {
    console.error('Error sending admin email:', error)
    return { success: false, error: String(error) }
  }
}

// Send both emails
export async function sendOrderConfirmationEmails(data: OrderEmailData): Promise<{
  customerEmail: { success: boolean; error?: string }
  adminEmail: { success: boolean; error?: string }
}> {
  const [customerResult, adminResult] = await Promise.all([
    sendOrderConfirmationToCustomer(data),
    sendOrderNotificationToAdmins(data)
  ])

  return {
    customerEmail: customerResult,
    adminEmail: adminResult
  }
}

export type { OrderEmailData, OrderItem }
