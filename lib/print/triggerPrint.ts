/**
 * Print Trigger
 * Called by MultiStoreOrder success page to trigger print jobs
 */

import { getFieldTestConfig } from '@/config/fieldTest'
import { queuePrintJob, queuePrintJobs } from './queuePrintJob'

/**
 * Trigger print for a single order
 */
export async function triggerPrint(
  orderId: string,
  options: {
    onSuccess?: (orderId: string) => void
    onFailure?: (orderId: string, error: string) => void
  } = {}
): Promise<boolean> {
  const config = getFieldTestConfig()

  // Skip if safe mode is enabled
  if (config.safeMode) {
    console.log('[Print] Safe mode enabled, skipping print job')
    return false
  }

  // Check if auto-print is enabled (default: true)
  // For now, we'll always attempt to print unless safeMode is on
  // In the future, this could be a separate config flag

  try {
    const result = await queuePrintJob(orderId, {
      onSuccess: options.onSuccess,
      onFailure: options.onFailure,
    })

    return result.success
  } catch (error: any) {
    console.error('[Print] Error triggering print:', error)
    options.onFailure?.(orderId, error?.message || 'Unknown error')
    return false
  }
}

/**
 * Trigger print for multiple orders
 */
export async function triggerPrintMultiple(
  orderIds: string[],
  options: {
    onSuccess?: (orderId: string) => void
    onFailure?: (orderId: string, error: string) => void
  } = {}
): Promise<{ success: number; failed: number }> {
  const config = getFieldTestConfig()

  // Skip if safe mode is enabled
  if (config.safeMode) {
    console.log('[Print] Safe mode enabled, skipping print jobs')
    return { success: 0, failed: 0 }
  }

  try {
    const results = await queuePrintJobs(orderIds, {
      onSuccess: options.onSuccess,
      onFailure: options.onFailure,
    })

    const success = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    return { success, failed }
  } catch (error: any) {
    console.error('[Print] Error triggering multiple prints:', error)
    return { success: 0, failed: orderIds.length }
  }
}

