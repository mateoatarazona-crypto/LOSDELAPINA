'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, Image, File } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFilesChange: (files: File[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number // in MB
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

interface FileWithPreview extends File {
  preview?: string
}

export function FileUpload({
  onFilesChange,
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx'],
  maxFiles = 5,
  maxSize = 10,
  className,
  disabled = false,
  showPreview = true
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return

    const validFiles: FileWithPreview[] = []
    
    Array.from(newFiles).forEach((file) => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        alert(`El archivo ${file.name} es muy grande. Máximo ${maxSize}MB.`)
        return
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase())
        }
        return file.type.match(type.replace('*', '.*'))
      })

      if (!isValidType) {
        alert(`Tipo de archivo no válido: ${file.name}`)
        return
      }

      // Create preview for images
      const fileWithPreview = file as FileWithPreview
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file)
      }

      validFiles.push(fileWithPreview)
    })

    const updatedFiles = [...files, ...validFiles].slice(0, maxFiles)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, maxFiles, maxSize, acceptedTypes, onFilesChange])

  const removeFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    // Revoke object URL to prevent memory leaks
    if (files[index].preview) {
      URL.revokeObjectURL(files[index].preview!)
    }
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, onFilesChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled) return
    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return
    handleFiles(e.target.files)
  }, [disabled, handleFiles])

  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={files.length < maxFiles && !disabled ? openFileDialog : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          className="hidden"
          disabled={disabled || files.length >= maxFiles}
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {files.length >= maxFiles 
                ? `Máximo ${maxFiles} archivos alcanzado`
                : 'Arrastra archivos aquí o haz clic para seleccionar'
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Tipos permitidos: {acceptedTypes.join(', ')} • Máximo {maxSize}MB por archivo
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              
              {showPreview && file.preview && (
                <div className="flex-shrink-0 mr-3">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                </div>
              )}
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Custom hook for file upload functionality
export const useFileUpload = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const handleFilesChange = useCallback((newFiles: FileWithPreview[]) => {
    setFiles(newFiles)
  }, [])

  const clearFiles = useCallback(() => {
    setFiles([])
  }, [])

  return {
    files,
    handleFilesChange,
    clearFiles
  }
}

export default FileUpload