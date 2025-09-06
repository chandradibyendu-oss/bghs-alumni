import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

interface R2UploadResponse {
  key: string
  url: string
  size: number
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
}

export const r2Storage = new R2Storage()
export type { R2UploadResponse }