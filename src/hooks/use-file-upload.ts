'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UploadOptions {
  bucket: string
  folder?: string
  maxSize?: number // in MB
  allowedTypes?: string[]
}

interface UploadResult {
  url: string
  path: string
  fileName: string
  fileSize: number
  mimeType: string
}

interface UseFileUploadReturn {
  uploadFiles: (files: File[], options: UploadOptions) => Promise<UploadResult[]>
  uploading: boolean
  progress: number
  error: string | null
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const uploadFiles = async (files: File[], options: UploadOptions): Promise<UploadResult[]> => {
    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      const results: UploadResult[] = []
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file size
        if (options.maxSize && file.size > options.maxSize * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} excede el tamaño máximo de ${options.maxSize}MB`)
        }

        // Validate file type
        if (options.allowedTypes && !options.allowedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase())
          }
          return file.type.match(type.replace('*', '.*'))
        })) {
          throw new Error(`Tipo de archivo no permitido: ${file.name}`)
        }

        // Generate unique filename
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop()
        const fileName = `${timestamp}_${randomString}.${fileExtension}`
        
        // Create file path
        const filePath = options.folder 
          ? `${options.folder}/${fileName}`
          : fileName

        // Upload file to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from(options.bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw new Error(`Error subiendo ${file.name}: ${uploadError.message}`)
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(options.bucket)
          .getPublicUrl(filePath)

        results.push({
          url: publicUrl,
          path: filePath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type
        })

        // Update progress
        setProgress(((i + 1) / totalFiles) * 100)
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al subir archivos'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return {
    uploadFiles,
    uploading,
    progress,
    error
  }
}

// Utility function to delete files from Supabase Storage
export async function deleteFile(bucket: string, filePath: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath])

  if (error) {
    throw new Error(`Error eliminando archivo: ${error.message}`)
  }
}

// Utility function to get file URL
export function getFileUrl(bucket: string, filePath: string): string {
  const supabase = createClient()
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)

  return publicUrl
}