// Use @sparticuz/chromium + puppeteer-core for serverless compatibility
let chromium: any
let puppeteerCore: any

async function getBrowser() {
  // Check if we're in a local development environment
  const isLocal = process.env.NODE_ENV === 'development' || process.env.VERCEL !== 'true'
  
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
  
  // Use newer @sparticuz/chromium API with proper configuration
  const executablePath = await chromium.executablePath()
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
      '--disable-gpu'
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
    
    // Evidence section - moved to separate page after References
    const evidenceSection = data.evidenceFiles.length > 0 ? `
    <div class="page-break"></div>
    <div class="section">
        <h2>Evidence Documents</h2>
        <p><strong>Total Files:</strong> ${data.evidenceFiles.length}</p>
        <div class="evidence-section">
            ${data.evidenceFiles.map(file => `
            <div style="margin-bottom: 15px;">
                <p><strong>${file.name}</strong> (${file.size} bytes)</p>
                <img src="${file.url}" alt="${file.name}" class="evidence-image" />
            </div>
            `).join('')}
        </div>
    </div>` : ''
    
    // Reference section (render if either reference exists)
    const hasRef1 = !!data.referenceValidation.reference_1
    const hasRef2 = !!data.referenceValidation.reference_2
    const referenceSection = (hasRef1 || hasRef2) ? `
    <div class="section">
        <h2>Reference Validation</h2>
        <div class="info-grid">
            ${hasRef1 ? `
            <div class="info-label">Reference 1:</div>
            <div class="info-value">
                ${data.referenceValidation.reference_1}
                ${data.referenceValidation.reference_1_valid === true ? 
                  '<span class="reference-status status-valid">VALID</span>' :
                  data.referenceValidation.reference_1_valid === false ?
                  '<span class="reference-status status-invalid">INVALID</span>' :
                  '<span class="reference-status status-pending">PENDING</span>'}
            </div>` : ''}
            
            ${hasRef2 ? `
            <div class="info-label">Reference 2:</div>
            <div class="info-value">
                ${data.referenceValidation.reference_2}
                ${data.referenceValidation.reference_2_valid === true ? 
                  '<span class="reference-status status-valid">VALID</span>' :
                  data.referenceValidation.reference_2_valid === false ?
                  '<span class="reference-status status-invalid">INVALID</span>' :
                  '<span class="reference-status status-pending">PENDING</span>'}
            </div>` : ''}
        </div>
    </div>` : `
    <div class="section">
        <h2>Reference Validation</h2>
        <div class="info-grid">
            <div class="info-label">Status:</div>
            <div class="info-value">No references provided - Evidence-based verification only</div>
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
      .replace(/\{\{user\.start_class\}\}/g, data.user.start_class?.toString() || '')
      .replace(/\{\{user\.start_year\}\}/g, data.user.start_year?.toString() || '')
      .replace(/\{\{user\.created_at\}\}/g, data.user.created_at)
      .replace(/\{\{user\.id\}\}/g, data.user.id)
      // (The conditional blocks above already collapsed middle name and phone)
      .replace(/\{\{#if user\.start_class\}\}[\s\S]*?\{\{\/if\}\}/g, data.user.start_class ? `
            <div class="info-label">Start Class:</div>
            <div class="info-value">Class ${data.user.start_class}</div>` : '')
      .replace(/\{\{#if user\.start_year\}\}[\s\S]*?\{\{\/if\}\}/g, data.user.start_year ? `
            <div class="info-label">Start Year:</div>
            <div class="info-value">${data.user.start_year}</div>` : '')
      .replace(/\{\{#if evidenceFiles\.length\}\}[\s\S]*?\{\{\/if\}\}/g, evidenceSection)
      // Replace the entire reference section - simple approach: match from {{#if referenceValidation.reference_1}} to <div class="section"> with System Information
      .replace(/\{\{#if referenceValidation\.reference_1\}\}[\s\S]*?<div class="section">\s*<h2>System Information<\/h2>/g, (hasRef1 || hasRef2) ? referenceSection + '\n\n    <div class="section">\n        <h2>System Information</h2>' : '\n\n    <div class="section">\n        <h2>System Information</h2>')
      .replace(/\{\{#if evidenceFiles\.length\}\}\{\{#if referenceValidation\.reference_1\}\}Evidence \+ References\{\{else\}\}Evidence Only\{\{\/if\}\}\{\{else\}\}References Only\{\{\/if\}\}/g, verificationMethod)
  }

  private getHTMLTemplate(): string {
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
            text-align: center;
            background-color: #1e40af;
            color: white;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
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
        <h1>BGHS Alumni Registration Verification</h1>
        <p>Barasat Paricharan Sarkar Government High School</p>
        <p>Registration ID: {{registrationId}} | Generated: {{submissionDate}}</p>
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
            
            <div class="info-label">Registration ID:</div>
            <div class="info-value">{{user.id}}</div>
        </div>
    </div>

    <div class="section">
        <h2>Academic Information</h2>
        <div class="info-grid">
            <div class="info-label">Last Class Attended:</div>
            <div class="info-value">Class {{user.last_class}}</div>
            
            <div class="info-label">Year of Leaving:</div>
            <div class="info-value">{{user.year_of_leaving}}</div>
            
            {{#if user.start_class}}
            <div class="info-label">Start Class:</div>
            <div class="info-value">Class {{user.start_class}}</div>
            {{/if}}
            
            {{#if user.start_year}}
            <div class="info-label">Start Year:</div>
            <div class="info-value">{{user.start_year}}</div>
            {{/if}}
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

    <div class="section">
        <h2>System Information</h2>
        <div class="info-grid">
            <div class="info-label">Registration Date:</div>
            <div class="info-value">{{user.created_at}}</div>
            
            <div class="info-label">Verification Method:</div>
            <div class="info-value">
                {{#if evidenceFiles.length}}{{#if referenceValidation.reference_1}}Evidence + References{{else}}Evidence Only{{/if}}{{else}}References Only{{/if}}
            </div>
        </div>
    </div>

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
            <p><strong>Admin Signature:</strong> _________________________</p>
            <p><strong>Date:</strong> _________________________</p>
            <p><strong>Status:</strong> □ Approved □ Rejected □ Needs Review</p>
        </div>
    </div>

    <div class="footer">
        <p>This document was automatically generated by the BGHS Alumni System</p>
        <p>Generated on {{submissionDate}} | Registration ID: {{registrationId}}</p>
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
