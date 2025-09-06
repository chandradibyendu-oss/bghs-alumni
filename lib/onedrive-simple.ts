import sharp from 'sharp'

interface OneDriveUploadResponse {
  id: string
  name: string
  size: number
  webUrl: string
  downloadUrl: string
}

class OneDriveSimpleAPI {
  private folderId: string
  private shareToken: string

  constructor() {
    // Extract from your shared folder URL: https://1drv.ms/f/c/2a6cbd2a417a6af5/EsKARNChK6lCgVvUycjtDBoBNM4yD3yzFCheS8sUJMIXdQ?e=dvWilT
    this.folderId = process.env.ONEDRIVE_FOLDER_ID || '2a6cbd2a417a6af5'
    this.shareToken = process.env.ONEDRIVE_SHARE_TOKEN || 'EsKARNChK6lCgVvUycjtDBoBNM4yD3yzFCheS8sUJMIXdQ'
  }

  /**
   * Upload a file directly to your OneDrive cloud folder
   * Uses the shared folder link to upload directly to MyFiles/alumnibghs/BGHSGallery
   */
  async uploadFile(
    filename: string,
    buffer: Buffer,
    mimeType: string = 'image/jpeg'
  ): Promise<OneDriveUploadResponse> {
    try {
      // Use OneDrive API to upload directly to your shared folder
      // Your folder path: MyFiles/alumnibghs/BGHSGallery
      const uploadUrl = `https://graph.microsoft.com/v1.0/drives/${this.folderId}/root:/MyFiles/alumnibghs/BGHSGallery/${filename}:/content`
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': mimeType,
          'Authorization': `Bearer ${await this.getAccessToken()}`,
        },
        body: buffer as BodyInit,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`OneDrive upload failed: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      
      return {
        id: result.id,
        name: result.name,
        size: result.size,
        webUrl: result.webUrl,
        downloadUrl: result['@microsoft.graph.downloadUrl'] || result.webUrl
      }
    } catch (error) {
      console.error('OneDrive upload error:', error)
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to upload to OneDrive: ${message}`)
    }
  }

  /**
   * Get access token for OneDrive API
   * For shared folders, we need to use a different authentication approach
   */
  private async getAccessToken(): Promise<string> {
    // For shared folder access, we need to use the share token
    // This is a simplified approach - in production you'd need proper OAuth
    const shareUrl = `https://1drv.ms/f/c/${this.folderId}/${this.shareToken}`
    
    // For now, return a placeholder - this would need proper OAuth implementation
    // or use the Microsoft Graph API with proper authentication
    throw new Error('OneDrive authentication not yet implemented. Please use Azure App Registration for direct cloud upload.')
  }

  /**
   * Generate thumbnail for uploaded image
   */
  async generateThumbnail(buffer: Buffer, filename: string): Promise<Buffer> {
    try {
      const thumbnail = await sharp(buffer)
        .resize(300, 300, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 80 })
        .toBuffer()
      
      return thumbnail
    } catch (error) {
      console.error('Thumbnail generation error:', error)
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to generate thumbnail: ${message}`)
    }
  }

  /**
   * Upload both original and thumbnail
   */
  async uploadWithThumbnail(
    originalBuffer: Buffer,
    filename: string,
    mimeType: string = 'image/jpeg'
  ): Promise<{
    original: OneDriveUploadResponse
    thumbnail: OneDriveUploadResponse
  }> {
    try {
      // Upload original image
      const original = await this.uploadFile(filename, originalBuffer, mimeType)
      
      // Generate and upload thumbnail
      const thumbnailBuffer = await this.generateThumbnail(originalBuffer, filename)
      const thumbnailFilename = `thumb_${filename}`
      const thumbnail = await this.uploadFile(thumbnailFilename, thumbnailBuffer, 'image/jpeg')
      
      return { original, thumbnail }
    } catch (error) {
      console.error('Upload with thumbnail error:', error)
      throw (error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * Get folder information
   */
  getFolderInfo() {
    return {
      folderId: this.folderId,
      shareToken: this.shareToken,
      shareUrl: `https://1drv.ms/f/c/${this.folderId}/${this.shareToken}`,
      syncPath: process.env.ONEDRIVE_SYNC_PATH || 'C:\\Users\\Public\\BGHS-Gallery'
    }
  }
}

export const oneDriveSimpleAPI = new OneDriveSimpleAPI()
