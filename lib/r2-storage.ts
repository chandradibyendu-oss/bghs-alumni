import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface R2UploadResponse {
  key: string
  url: string
  size: number
}

interface EvidenceFile {
  name: string
  url: string
  size: number
  type: string
}

interface EvidenceUploadResponse {
  files: EvidenceFile[]
  totalSize: number
}

class R2Storage {
  private client: S3Client
  private bucketName: string

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bghs-gallery'
    
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'gallery'
  ): Promise<R2UploadResponse> {
    const key = `${folder}/${filename}`
    
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })

    try {
      const result = await this.client.send(command)
      
      // Generate public URL - use custom domain if available, otherwise use R2 domain
      const url = this.getPublicUrl(key)
      
      return {
        key,
        url,
        size: buffer.length
      }
    } catch (error) {
      console.error('R2 upload error:', error)
      throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    try {
      await this.client.send(command)
    } catch (error) {
      console.error('R2 delete error:', error)
      throw new Error(`Failed to delete from R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  getPublicUrl(key: string): string {
    const customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN
    if (customDomain) {
      return `https://${customDomain}/${key}`
    }
    // Use R2's public URL format
    return `https://pub-${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev/${this.bucketName}/${key}`
  }

  async generatePresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })

    return await getSignedUrl(this.client, command, { expiresIn })
  }

  /**
   * Upload evidence files for alumni verification
   * @param files Array of File objects from the frontend
   * @param userId User ID for organizing files in folders
   * @returns Promise with uploaded file information
   */
  async uploadEvidenceFiles(files: File[], userId: string): Promise<EvidenceUploadResponse> {
    const EVIDENCE_LIMITS = {
      maxFiles: 5,
      maxSizePerFile: 5 * 1024 * 1024, // 5MB
      maxTotalSize: 20 * 1024 * 1024, // 20MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    }

    // Validate file count
    if (files.length > EVIDENCE_LIMITS.maxFiles) {
      throw new Error(`Maximum ${EVIDENCE_LIMITS.maxFiles} files allowed`)
    }

    // Validate each file
    const validFiles: File[] = []
    let totalSize = 0

    for (const file of files) {
      // Check file type
      if (!EVIDENCE_LIMITS.allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type: ${file.type}. Only JPG, PNG, PDF files are allowed.`)
      }

      // Check file size
      if (file.size > EVIDENCE_LIMITS.maxSizePerFile) {
        throw new Error(`File ${file.name} exceeds 5MB limit`)
      }

      // Check total size
      totalSize += file.size
      if (totalSize > EVIDENCE_LIMITS.maxTotalSize) {
        throw new Error(`Total upload size cannot exceed ${EVIDENCE_LIMITS.maxTotalSize / 1024 / 1024}MB`)
      }

      validFiles.push(file)
    }

    // Upload files
    const uploadedFiles: EvidenceFile[] = []
    
    for (const file of validFiles) {
      try {
        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())
        
        // Generate unique filename with timestamp
        const timestamp = Date.now()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}-${sanitizedName}`
        
        // Upload to evidence folder
        const result = await this.uploadFile(buffer, fileName, file.type, `evidence/${userId}`)
        
        uploadedFiles.push({
          name: file.name,
          url: result.url,
          size: file.size,
          type: file.type
        })
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error)
        throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      files: uploadedFiles,
      totalSize
    }
  }

  /**
   * Delete evidence files for a user
   * @param userId User ID
   * @param fileKeys Array of file keys to delete
   */
  async deleteEvidenceFiles(userId: string, fileKeys: string[]): Promise<void> {
    for (const key of fileKeys) {
      try {
        await this.deleteFile(key)
      } catch (error) {
        console.error(`Failed to delete evidence file ${key}:`, error)
        // Continue with other files even if one fails
      }
    }
  }
}

export const r2Storage = new R2Storage()
export type { R2UploadResponse, EvidenceFile, EvidenceUploadResponse }