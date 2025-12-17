/**
 * Warehouse Queue
 * In-memory FIFO queue with retry logic
 */

export interface WarehouseJob {
  id: string
  orderId: string
  action: 'print' | 'pick' | 'pack' | 'ship'
  payload?: Record<string, any>
  retryCount: number
  maxRetries: number
  createdAt: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

type JobProcessor = (job: WarehouseJob) => Promise<void>

class WarehouseQueue {
  private queue: WarehouseJob[] = []
  private processing: Set<string> = new Set()
  private processor: JobProcessor | null = null
  private isProcessing = false

  /**
   * Set the job processor function
   */
  setProcessor(processor: JobProcessor) {
    this.processor = processor
  }

  /**
   * Enqueue a job
   */
  enqueue(job: Omit<WarehouseJob, 'id' | 'retryCount' | 'createdAt' | 'status'>): string {
    const id = `${job.action}_${job.orderId}_${Date.now()}`
    const warehouseJob: WarehouseJob = {
      id,
      orderId: job.orderId,
      action: job.action,
      payload: job.payload,
      retryCount: 0,
      maxRetries: job.maxRetries || 3,
      createdAt: new Date(),
      status: 'pending',
    }

    this.queue.push(warehouseJob)
    this.processNext()

    return id
  }

  /**
   * Process the next job in the queue
   */
  async processNext(): Promise<void> {
    if (this.isProcessing || !this.processor || this.queue.length === 0) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0) {
      const job = this.queue.shift()
      if (!job) break

      if (job.status === 'failed' && job.retryCount >= job.maxRetries) {
        continue // Skip jobs that have exceeded max retries
      }

      if (this.processing.has(job.id)) {
        continue // Skip jobs already being processed
      }

      this.processing.add(job.id)
      job.status = 'processing'

      try {
        await this.processor(job)
        job.status = 'completed'
      } catch (error: any) {
        job.retryCount++
        if (job.retryCount < job.maxRetries) {
          // Re-queue for retry
          job.status = 'pending'
          this.queue.push(job)
          // Wait before retrying (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, job.retryCount - 1), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          job.status = 'failed'
          console.error(`Warehouse job ${job.id} failed after ${job.maxRetries} retries:`, error)
        }
      } finally {
        this.processing.delete(job.id)
      }
    }

    this.isProcessing = false
  }

  /**
   * Get queue status
   */
  getStatus(): {
    pending: number
    processing: number
    completed: number
    failed: number
  } {
    return {
      pending: this.queue.filter(j => j.status === 'pending').length,
      processing: this.processing.size,
      completed: 0, // Not tracked in memory
      failed: this.queue.filter(j => j.status === 'failed').length,
    }
  }

  /**
   * Clear completed and failed jobs
   */
  clear(): void {
    this.queue = this.queue.filter(j => j.status === 'pending' || j.status === 'processing')
  }
}

// Singleton instance
let queueInstance: WarehouseQueue | null = null

export function getWarehouseQueue(): WarehouseQueue {
  if (!queueInstance) {
    queueInstance = new WarehouseQueue()
  }
  return queueInstance
}

