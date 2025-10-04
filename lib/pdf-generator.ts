// Use @sparticuz/chromium + puppeteer-core for serverless compatibility
let chromium: any
let puppeteerCore: any

async function getBrowser() {
  // Check if we're in a local development environment
  const isLocal = process.env.NODE_ENV === 'development' && !process.env.VERCEL
  
  if (isLocal) {
    // Use local puppeteer for development
    const puppeteer = await import('puppeteer')
    return await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }
  
  // Use @sparticuz/chromium for production/serverless
  if (!chromium) {
    const mod = await import('@sparticuz/chromium')
    chromium = mod.default || mod
  }
  if (!puppeteerCore) {
    const mod = await import('puppeteer-core')
    puppeteerCore = mod.default || mod
  }
  
  // Configure chromium for serverless environment
  const executablePath = await chromium.executablePath()
  
  // Set environment variables for serverless Chrome detection
  process.env.PUPPETEER_EXECUTABLE_PATH = executablePath
  process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true'
  process.env.PUPPETEER_CACHE_DIR = '/tmp/.cache/puppeteer'
  
  const browser = await puppeteerCore.launch({
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--mute-audio',
      '--safebrowsing-disable-auto-update',
      '--disable-background-networking',
      '--disable-field-trial-config',
      '--disable-ipc-flooding-protection'
    ],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless !== false,
    ignoreHTTPSErrors: true,
  })
  return browser
}

import { EvidenceFile } from './r2-storage'

export interface RegistrationPDFData {
  user: {
    id: string
    first_name: string
    middle_name?: string
    last_name: string
    email: string
    phone?: string
    last_class: number
    year_of_leaving: number
    start_class?: number
    start_year?: number
    created_at: string
  }
  evidenceFiles: EvidenceFile[]
  referenceValidation: {
    reference_1?: string
    reference_2?: string
    reference_1_valid?: boolean
    reference_2_valid?: boolean
  }
  registrationId: string
  submissionDate: string
}

export class PDFGenerator {
  private htmlTemplate: string

  constructor() {
    this.htmlTemplate = this.getHTMLTemplate()
  }

  private replaceTemplateVariables(template: string, data: RegistrationPDFData): string {
    const fullName = `${data.user.first_name} ${data.user.middle_name ? data.user.middle_name + ' ' : ''}${data.user.last_name}`
    const phoneDisplay = data.user.phone || 'Not provided'
    const startClassDisplay = data.user.start_class ? `Class ${data.user.start_class}` : ''
    const startYearDisplay = data.user.start_year ? data.user.start_year.toString() : ''
    
    // Format the date for display
    const formattedDate = new Date(data.submissionDate).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    })
    
    // Evidence section - always show, with content based on whether files are provided
    const evidenceSection = `
    <div class="page-break"></div>
    <div class="section">
        <h2>Evidence Documents</h2>
        ${data.evidenceFiles.length > 0 ? `
        <p><strong>Total Files:</strong> ${data.evidenceFiles.length}</p>
        <div class="evidence-section">
            ${data.evidenceFiles.map(file => `
            <div style="margin-bottom: 15px;">
                <p><strong>${file.name}</strong> (${file.size} bytes)</p>
                <img src="${file.url}" alt="${file.name}" class="evidence-image" />
            </div>
            `).join('')}
        </div>` : `
        <div class="info-grid">
            <div class="info-label">Status:</div>
            <div class="info-value">Not provided</div>
        </div>`}
    </div>`
    
    // Reference section (render if either reference exists)
    const hasRef1 = !!data.referenceValidation.reference_1
    const hasRef2 = !!data.referenceValidation.reference_2
    
    const formatReferenceInfo = (referenceId: string, isValid: boolean | undefined) => {
      if (isValid === true) {
        // For valid references, show detailed info (this would come from database lookup)
        return `
        <div class="reference-details">
            <div class="info-label">Registration ID:</div>
            <div class="info-value">${referenceId}</div>
            
            <div class="info-label">Alumni Name:</div>
            <div class="info-value">[Alumni Name from Database]</div>
            
            <div class="info-label">Passout Year:</div>
            <div class="info-value">[Passout Year from Database]</div>
            
            <div class="info-label">Last Class Attended:</div>
            <div class="info-value">[Last Class from Database]</div>
            
            <div class="info-label">Email:</div>
            <div class="info-value">[Email from Database]</div>
            
            <div class="info-label">Phone:</div>
            <div class="info-value">[Phone from Database]</div>
            
            <div class="info-label">Status:</div>
            <div class="info-value">Valid</div>
        </div>`
      } else if (isValid === false) {
        return `
        <div class="reference-details">
            <div class="info-label">Registration ID:</div>
            <div class="info-value">${referenceId}</div>
            
            <div class="info-label">Status:</div>
            <div class="info-value">Not Found</div>
        </div>`
      } else {
        return `
        <div class="reference-details">
            <div class="info-label">Registration ID:</div>
            <div class="info-value">${referenceId}</div>
            
            <div class="info-label">Status:</div>
            <div class="info-value">Pending Verification</div>
        </div>`
      }
    }
    
    const referenceSection = `
    <div class="section">
        <h2>Reference Validation</h2>
        <div class="reference-container">
            ${hasRef1 ? `
            <div class="reference-item reference-left">
                <h3>Reference 1</h3>
                ${formatReferenceInfo(data.referenceValidation.reference_1!, data.referenceValidation.reference_1_valid)}
            </div>` : `
            <div class="reference-item reference-left">
                <h3>Reference 1</h3>
                <div class="reference-details">
                    <div class="info-label">Registration ID:</div>
                    <div class="info-value">Not provided</div>
                </div>
            </div>`}
            
            ${hasRef2 ? `
            <div class="reference-item reference-right">
                <h3>Reference 2</h3>
                ${formatReferenceInfo(data.referenceValidation.reference_2!, data.referenceValidation.reference_2_valid)}
            </div>` : `
            <div class="reference-item reference-right">
                <h3>Reference 2</h3>
                <div class="reference-details">
                    <div class="info-label">Registration ID:</div>
                    <div class="info-value">Not provided</div>
                </div>
            </div>`}
        </div>
    </div>`
    
    // Verification method
    const verificationMethod = data.evidenceFiles.length > 0 
      ? (data.referenceValidation.reference_1 ? 'Evidence + References' : 'Evidence Only')
      : 'References Only'
    
    return template
      // Replace the full-name composite pattern exactly as it appears in template
      .replace(/\{\{user\.first_name\}\} \{\{#if user\.middle_name\}\}\{\{user\.middle_name\}\} \{\{\/if\}\}\{\{user\.last_name\}\}/g, fullName)
      // Replace the phone conditional pattern exactly as it appears in template
      .replace(/\{\{#if user\.phone\}\}\{\{user\.phone\}\}\{\{else\}\}Not provided\{\{\/if\}\}/g, phoneDisplay)
      .replace(/\{\{registrationId\}\}/g, data.registrationId)
      .replace(/\{\{submissionDate\}\}/g, data.submissionDate)
      .replace(/\{\{formattedDate\}\}/g, formattedDate)
      // Handle any remaining middle name conditional blocks
      .replace(/\{\{#if user\.middle_name\}\}[\s\S]*?\{\{\/if\}\}/g, data.user.middle_name && String(data.user.middle_name).trim() ? `${String(data.user.middle_name).trim()} ` : '')
      // Handle any remaining phone conditional blocks
      .replace(/\{\{#if user\.phone\}\}[\s\S]*?\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g, phoneDisplay)
      // Full name convenience (in case we ever need it)
      .replace(/\{\{user\.full_name\}\}/g, fullName)
      .replace(/\{\{user\.first_name\}\}/g, data.user.first_name)
      .replace(/\{\{user\.middle_name\}\}/g, data.user.middle_name || '')
      .replace(/\{\{user\.last_name\}\}/g, data.user.last_name)
      .replace(/\{\{user\.email\}\}/g, data.user.email)
      .replace(/\{\{user\.phone\}\}/g, phoneDisplay)
      .replace(/\{\{user\.last_class\}\}/g, data.user.last_class.toString())
      .replace(/\{\{user\.year_of_leaving\}\}/g, data.user.year_of_leaving.toString())
      .replace(/\{\{user\.created_at\}\}/g, data.user.created_at)
      .replace(/\{\{user\.id\}\}/g, data.user.id)
      .replace(/\{\{#if evidenceFiles\.length\}\}[\s\S]*?\{\{\/if\}\}/g, evidenceSection)
      // Always include evidence section (even if no files)
      .replace(/\{\{#if evidenceFiles\.length\}\}[\s\S]*?\{\{\/if\}\}/g, evidenceSection)
      // Replace the entire reference section - match from {{#if referenceValidation.reference_1}} to the next section or end
      .replace(/\{\{#if referenceValidation\.reference_1\}\}[\s\S]*?\{\{\/if\}\}/g, referenceSection)
      // Handle any remaining nested conditionals in the reference section
      .replace(/\{\{#if referenceValidation\.reference_1\}\}[\s\S]*?\{\{\/if\}\}/g, '')
      .replace(/\{\{#if referenceValidation\.reference_2\}\}[\s\S]*?\{\{\/if\}\}/g, '')
      .replace(/\{\{#if referenceValidation\.reference_1_valid\}\}[\s\S]*?\{\{\/if\}\}/g, '')
      .replace(/\{\{#if referenceValidation\.reference_2_valid\}\}[\s\S]*?\{\{\/if\}\}/g, '')
      .replace(/\{\{else if referenceValidation\.reference_1_valid === false\}\}[\s\S]*?\{\{else\}\}/g, '')
      .replace(/\{\{else if referenceValidation\.reference_2_valid === false\}\}[\s\S]*?\{\{else\}\}/g, '')
      .replace(/\{\{else\}\}[\s\S]*?\{\{\/if\}\}/g, '')
      .replace(/\{\{referenceValidation\.reference_1\}\}/g, '')
      .replace(/\{\{referenceValidation\.reference_2\}\}/g, '')
      // Clean up any remaining template closing tags
      .replace(/\{\{\/if\}\}/g, '')
      .replace(/\{\{else\}\}/g, '')
      .replace(/\{\{else if[^}]*\}\}/g, '')
      // Clean up any remaining template opening tags
      .replace(/\{\{#if[^}]*\}\}/g, '')
      .replace(/\{\{#each[^}]*\}\}/g, '')
      .replace(/\{\{\/each\}\}/g, '')
      .replace(/\{\{#if evidenceFiles\.length\}\}\{\{#if referenceValidation\.reference_1\}\}Evidence \+ References\{\{else\}\}Evidence Only\{\{\/if\}\}\{\{else\}\}References Only\{\{\/if\}\}/g, verificationMethod)
  }

  private getLogoSource(): string {
    // Use R2 public URL for logo (same approach as evidence images)
    const customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bghs-gallery'
    
    if (customDomain) {
      return `https://${customDomain}/static/logos/bghs-logo.png`
    } else if (accountId) {
      return `https://pub-${accountId}.r2.dev/${bucketName}/static/logos/bghs-logo.png`
    } else {
      // Fallback to domain-based URL
      return 'https://alumnibghs.org/bghs-logo.png'
    }
  }

  private getHTMLTemplate(): string {
    const logoSource = this.getLogoSource()
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BGHS Alumni Registration Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.3;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 15px;
            background-color: #f9f9f9;
            font-size: 12px;
        }
        .header {
            display: flex;
            align-items: center;
            background-color: #1e40af;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        .header-logo {
            flex-shrink: 0;
            margin-right: 15px;
        }
        .header-logo img {
            height: 60px;
            width: auto;
            border-radius: 4px;
            background-color: white;
            padding: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header-content {
            flex: 1;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
        }
        .header p {
            margin: 3px 0 0 0;
            font-size: 11px;
            opacity: 0.9;
        }
        .section {
            background-color: white;
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #1e40af;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
            margin-bottom: 8px;
            font-size: 14px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 6px;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .evidence-section {
            margin-top: 10px;
        }
        .evidence-image {
            max-width: 150px;
            max-height: 150px;
            margin: 5px;
            border: 1px solid #d1d5db;
            border-radius: 3px;
        }
        .reference-status {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: bold;
        }
        .status-valid {
            background-color: #dcfce7;
            color: #166534;
        }
        .status-invalid {
            background-color: #fef2f2;
            color: #dc2626;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #d97706;
        }
        .reference-container {
            display: flex;
            gap: 15px;
            align-items: flex-start;
        }
        .reference-item {
            flex: 1;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background-color: #f9fafb;
        }
        .reference-left {
            margin-right: 7px;
        }
        .reference-right {
            margin-left: 7px;
        }
        .reference-item h3 {
            margin: 0 0 10px 0;
            font-size: 13px;
            color: #374151;
            border-bottom: 1px solid #d1d5db;
            padding-bottom: 5px;
        }
        .reference-details {
            margin-bottom: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 10px;
            padding: 8px;
            background-color: #f3f4f6;
            border-radius: 6px;
            font-size: 10px;
            color: #6b7280;
        }
        .admin-notes {
            border: 1px dashed #d1d5db;
            padding: 10px;
            margin-top: 10px;
            background-color: #f9fafb;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-logo">
            <img src="${logoSource}" alt="BGHS Logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiByeD0iNCIgZmlsbD0iIzFmMjkzNyIvPgo8dGV4dCB4PSIzMCIgeT0iMzUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CR0hTPC90ZXh0Pgo8L3N2Zz4K';" />
        </div>
        <div class="header-content">
            <h1>BARASAT GOVT. HIGH SCHOOL EX-STUDENTS ASSOCIATION</h1>
            <p>Registration No.: S/31084</p>
            <p>K.N.C. ROAD, BARASAT, NORTH 24 PARGANAS, KOLKATA - 700124</p>
            <p style="margin-top: 10px; font-size: 10px; opacity: 0.8;">System ID: {{registrationId}} | Generated: {{formattedDate}}</p>
        </div>
    </div>

    <div class="section">
        <h2>Personal Information</h2>
        <div class="info-grid">
            <div class="info-label">Full Name:</div>
            <div class="info-value">{{user.first_name}} {{#if user.middle_name}}{{user.middle_name}} {{/if}}{{user.last_name}}</div>
            
            <div class="info-label">Email:</div>
            <div class="info-value">{{user.email}}</div>
            
            <div class="info-label">Phone:</div>
            <div class="info-value">{{#if user.phone}}{{user.phone}}{{else}}Not provided{{/if}}</div>
            
            <div class="info-label">System ID:</div>
            <div class="info-value">{{user.id}}</div>
            
            <div class="info-label">Member Registration ID:</div>
            <div class="info-value" style="border: 1px dashed #d1d5db; padding: 8px; background-color: #f9fafb; min-height: 20px;">
                <span style="color: #6b7280; font-style: italic;">[To be filled by admin after approval]</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Academic Information</h2>
        <div class="info-grid">
            <div class="info-label">Last Class Attended:</div>
            <div class="info-value">Class {{user.last_class}}</div>
            
            <div class="info-label">Year of Leaving:</div>
            <div class="info-value">{{user.year_of_leaving}}</div>
        </div>
    </div>

    {{#if referenceValidation.reference_1}}
    <div class="section">
        <h2>Reference Validation</h2>
        <div class="info-grid">
            {{#if referenceValidation.reference_1}}
            <div class="info-label">Reference 1:</div>
            <div class="info-value">
                {{referenceValidation.reference_1}}
                {{#if referenceValidation.reference_1_valid}}
                <span class="reference-status status-valid">VALID</span>
                {{else if referenceValidation.reference_1_valid === false}}
                <span class="reference-status status-invalid">INVALID</span>
                {{else}}
                <span class="reference-status status-pending">PENDING</span>
                {{/if}}
            </div>
            {{/if}}
            
            {{#if referenceValidation.reference_2}}
            <div class="info-label">Reference 2:</div>
            <div class="info-value">
                {{referenceValidation.reference_2}}
                {{#if referenceValidation.reference_2_valid}}
                <span class="reference-status status-valid">VALID</span>
                {{else if referenceValidation.reference_2_valid === false}}
                <span class="reference-status status-invalid">INVALID</span>
                {{else}}
                <span class="reference-status status-pending">PENDING</span>
                {{/if}}
            </div>
            {{/if}}
        </div>
    </div>
    {{/if}}


    {{#if evidenceFiles.length}}
    <div class="section">
        <h2>Evidence Documents</h2>
        <p><strong>Total Files:</strong> {{evidenceFiles.length}}</p>
        <div class="evidence-section">
            {{#each evidenceFiles}}
            <div style="margin-bottom: 20px;">
                <p><strong>{{this.name}}</strong> ({{this.size}} bytes)</p>
                <img src="{{this.url}}" alt="{{this.name}}" class="evidence-image" />
            </div>
            {{/each}}
        </div>
    </div>
    {{/if}}

    <div class="section admin-notes">
        <h2>Admin Notes</h2>
        <p style="color: #6b7280; font-style: italic;">
            [Space for admin verification notes and approval decision]
        </p>
        <br><br>
        <div style="border-top: 1px solid #d1d5db; padding-top: 8px;">
            <p><strong>Status:</strong> □ Approved □ Rejected □ Needs Review</p>
            <br>
            <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                <div style="flex: 1; margin-right: 20px;">
                    <p><strong>President Signature:</strong></p>
                    <div style="margin-top: 20px; border-bottom: 1px solid #000; padding-bottom: 2px; min-height: 25px;">
                        <span style="color: #9ca3af; font-size: 11px;">[Signature]</span>
                    </div>
                    <p style="margin-top: 8px; font-size: 11px; color: #6b7280;">Date: _________________</p>
                </div>
                <div style="flex: 1; margin-left: 20px;">
                    <p><strong>Secretary Signature:</strong></p>
                    <div style="margin-top: 20px; border-bottom: 1px solid #000; padding-bottom: 2px; min-height: 25px;">
                        <span style="color: #9ca3af; font-size: 11px;">[Signature]</span>
                    </div>
                    <p style="margin-top: 8px; font-size: 11px; color: #6b7280;">Date: _________________</p>
                </div>
            </div>
        </div>
    </div>

    <div class="footer">
        <p>This document was automatically generated by the BGHS Alumni System</p>
        <p>BARASAT GOVT. HIGH SCHOOL EX-STUDENTS ASSOCIATION | Registration No.: S/31084</p>
        <p>Generated on {{formattedDate}} | System ID: {{registrationId}}</p>
    </div>
</body>
</html>
    `
  }

  async generateRegistrationPDF(data: RegistrationPDFData): Promise<Buffer> {
    try {
      // Simple template replacement instead of Handlebars
      const html = this.replaceTemplateVariables(this.htmlTemplate, data)

      // Launch Puppeteer (serverless vs local)
      const browser = await getBrowser()

      const page = await browser.newPage()
      
      // Set page content
      await page.setContent(html, { waitUntil: 'networkidle0' })

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      })

      await browser.close()
      return Buffer.from(pdfBuffer)
    } catch (error) {
      console.error('PDF generation error:', error)
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const pdfGenerator = new PDFGenerator()
