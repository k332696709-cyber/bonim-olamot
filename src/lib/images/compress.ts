/**
 * Shrinks a photo in the browser before it is uploaded: the longest side becomes at most `maxSide`
 * pixels and it is saved as a JPEG. A phone photo of several megabytes becomes a few hundred
 * kilobytes, which keeps the whole request under the hosting limit (about 4.5 MB).
 * If the browser cannot read the image, the original file is returned.
 */
export async function compressImage(file: File, maxSide = 1600, quality = 0.82): Promise<File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' } as ImageBitmapOptions)
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const w = Math.max(1, Math.round(bitmap.width * scale))
    const h = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close?.()
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob || blob.size === 0) return file
    // Keep the original if it was already smaller.
    if (blob.size >= file.size && file.type === 'image/jpeg') return file
    const name = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${name}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return file
  }
}

/** Photos above this size after compression could still break the upload. */
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024
