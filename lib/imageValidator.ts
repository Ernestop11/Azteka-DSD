const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

type ImageMetadata = {
  width: number
  height: number
  transparent?: boolean
}

function assertBrowserEnvironment() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Image validation utilities require a browser environment.')
  }
}

async function readFileSlice(file: File, length: number): Promise<ArrayBuffer> {
  const slice = file.slice(0, length)
  return slice.arrayBuffer()
}

async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function detectTransparency(context: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = context.getImageData(0, 0, width, height)
  const totalPixels = width * height
  const sampleStep = Math.max(1, Math.floor(totalPixels / 100000)) * 4

  for (let i = 3; i < data.length; i += sampleStep) {
    if (data[i] < 250) {
      return true
    }
  }

  return false
}

export async function validatePNG(file: File): Promise<boolean> {
  if (!file) return false
  if (file.type && file.type !== 'image/png') return false

  const buffer = await readFileSlice(file, PNG_SIGNATURE.length)
  const bytes = new Uint8Array(buffer)

  if (bytes.length !== PNG_SIGNATURE.length) return false

  return PNG_SIGNATURE.every((value, index) => value === bytes[index])
}

export async function validateDimensions(file: File, maxWidth: number, maxHeight: number): Promise<boolean> {
  assertBrowserEnvironment()
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImageElement(dataUrl)

  return img.naturalWidth <= maxWidth && img.naturalHeight <= maxHeight
}

export async function ensureTransparentBackground(file: File): Promise<boolean | 'unknown'> {
  assertBrowserEnvironment()

  if (!(await validatePNG(file))) {
    return 'unknown'
  }

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    return 'unknown'
  }

  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImageElement(dataUrl)
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  context.drawImage(img, 0, 0)

  return detectTransparency(context, canvas.width, canvas.height)
}

export async function getImageMetadata(file: File): Promise<ImageMetadata> {
  assertBrowserEnvironment()
  const dataUrl = await readFileAsDataURL(file)
  const img = await loadImageElement(dataUrl)

  const metadata: ImageMetadata = {
    width: img.naturalWidth,
    height: img.naturalHeight,
  }

  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')

    if (context) {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      context.drawImage(img, 0, 0)
      metadata.transparent = detectTransparency(context, canvas.width, canvas.height)
    }
  } catch {
    metadata.transparent = undefined
  }

  return metadata
}
