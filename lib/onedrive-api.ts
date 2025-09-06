interface OneDriveTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

interface OneDriveUploadResponse {
  id: string
  name: string
  size: number
  webUrl: string
  downloadUrl: string
}

class OneDriveAPI {
  private clientId: string
  private clientSecret: string
  private tenantId: string
  private redirectUri: string

  constructor() {
    this.clientId = process.env.MICROSOFT_CLIENT_ID || ''
    this.clientSecret = process.env.MICROSOFT_CLIENT_SECRET || ''
    this.tenantId = process.env.MICROSOFT_TENANT_ID || 'common'
    // Default to the Next.js API callback route on port 3001
    this.redirectUri =
      process.env.ONEDRIVE_REDIRECT_URI || 'http://localhost:3001/api/auth/onedrive/callback'
  }

  private async getAccessToken(): Promise<string> {
    // First try to use existing access token
    const existingToken = process.env.ONEDRIVE_ACCESS_TOKEN
    if (existingToken) {
      return existingToken
    }

    // If no access token, try to refresh using refresh token
    const refreshToken = process.env.ONEDRIVE_REFRESH_TOKEN
    if (refreshToken) {
      try {
        const newTokens = await this.refreshAccessToken(refreshToken)
        return newTokens.access_token
      } catch (error) {
        console.error('Failed to refresh token:', error)
        throw new Error('Authentication failed. Please re-authenticate.')
      }
    }

    throw new Error('No authentication tokens available. Please authenticate first.')
  }

  private async refreshAccessToken(refreshToken: string): Promise<OneDriveTokens> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'https://graph.microsoft.com/Files.ReadWrite'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token refresh failed: ${error}`)
    }

    const tokens = await response.json()
    
    // Update environment variables (in production, store in database)
    if (process.env.NODE_ENV === 'development') {
      console.log('New tokens received. Update your .env.local file:')
      console.log(`ONEDRIVE_ACCESS_TOKEN=${tokens.access_token}`)
      console.log(`ONEDRIVE_REFRESH_TOKEN=${tokens.refresh_token}`)
    }

    return tokens
  }

  async uploadFile(file: File, folderPath: string = 'BGHS-Gallery'): Promise<OneDriveUploadResponse> {
    const accessToken = await this.getAccessToken()
    
    // Create folder if it doesn't exist
    await this.ensureFolderExists(folderPath, accessToken)
    
    // Upload file
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}/${file.name}:/content`
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Upload failed: ${error}`)
    }

    const result = await response.json()
    
    // Get download URL for the uploaded file
    const downloadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${result.id}/content`
    
    return {
      id: result.id,
      name: result.name,
      size: result.size,
      webUrl: result.webUrl,
      downloadUrl: downloadUrl
    }
  }

  async uploadFileBuffer(
    buffer: Buffer, 
    filename: string, 
    mimeType: string,
    folderPath: string = 'alumnibghs/BGHSGallery'
  ): Promise<OneDriveUploadResponse> {
    const accessToken = await this.getAccessToken()
    
    // Create folder structure if it doesn't exist
    await this.ensureFolderExists('alumnibghs', accessToken)
    await this.ensureFolderExists('alumnibghs/BGHSGallery', accessToken)
    if (folderPath.includes('thumbnails')) {
      await this.ensureFolderExists('alumnibghs/BGHSGallery/thumbnails', accessToken)
    }
    
    // Upload file
    const uploadUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}/${filename}:/content`
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': mimeType,
      },
      body: buffer as BodyInit,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Upload failed: ${error}`)
    }

    const result = await response.json()
    
    // Get public download URL for the uploaded file
    const downloadUrl = await this.getPublicDownloadUrl(result.id, accessToken)
    
    return {
      id: result.id,
      name: result.name,
      size: result.size,
      webUrl: result.webUrl,
      downloadUrl: downloadUrl
    }
  }

  private async ensureFolderExists(folderPath: string, accessToken: string): Promise<void> {
    try {
      // Try to get the folder
      const folderUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${folderPath}`
      const response = await fetch(folderUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        // Folder exists
        return
      }
    } catch (error) {
      // Folder doesn't exist, create it
    }

    // Split path and create nested folders
    const pathParts = folderPath.split('/')
    let currentPath = ''
    
    for (const part of pathParts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      
      try {
        // Check if this level exists
        const checkUrl = `https://graph.microsoft.com/v1.0/me/drive/root:/${currentPath}`
        const checkResponse = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        })

        if (checkResponse.ok) {
          continue // Folder exists, move to next level
        }
      } catch (error) {
        // Folder doesn't exist, create it
      }

      // Create folder
      const parentPath = pathParts.slice(0, pathParts.indexOf(part)).join('/')
      const createUrl = parentPath 
        ? `https://graph.microsoft.com/v1.0/me/drive/root:/${parentPath}/children`
        : `https://graph.microsoft.com/v1.0/me/drive/root/children`

      const folderResponse = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: part,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename'
        }),
      })

      if (!folderResponse.ok) {
        const error = await folderResponse.text()
        throw new Error(`Failed to create folder ${part}: ${error}`)
      }
    }
  }

  private async getPublicDownloadUrl(fileId: string, accessToken: string): Promise<string> {
    try {
      // Try to get a public download URL
      const fileUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        const fileData = await response.json()
        
        // Try to get a direct download URL
        const downloadUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`
        
        // Return URL with access token for direct access
        return `${downloadUrl}?access_token=${accessToken}`
      }
    } catch (error) {
      console.warn('Could not get public download URL:', error)
    }

    // Fallback to direct content URL with access token
    return `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content?access_token=${accessToken}`
  }

  async deleteFile(fileId: string): Promise<void> {
    const accessToken = await this.getAccessToken()
    
    const deleteUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Delete failed: ${error}`)
    }
  }

  async getFileDownloadUrl(fileId: string): Promise<string> {
    const accessToken = await this.getAccessToken()
    
    const fileUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`
    
    // Return a URL that includes the access token for direct download
    return `${fileUrl}?access_token=${accessToken}`
  }

  getAuthUrl(): string {
    const authUrl = new URL(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`)
    
    authUrl.searchParams.set('client_id', this.clientId)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('redirect_uri', this.redirectUri)
    authUrl.searchParams.set('scope', 'https://graph.microsoft.com/Files.ReadWrite offline_access')
    authUrl.searchParams.set('response_mode', 'query')
    
    return authUrl.toString()
  }

  async exchangeCodeForTokens(code: string): Promise<OneDriveTokens> {
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
      scope: 'https://graph.microsoft.com/Files.ReadWrite offline_access'
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    return await response.json()
  }
}

export const oneDriveAPI = new OneDriveAPI()
export type { OneDriveUploadResponse, OneDriveTokens }
