// Use serverless-compatible Chromium on Vercel and full Puppeteer locally
let puppeteerLib: any
let chromium: any
const isServerless = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined

async function getPuppeteer() {
  if (isServerless) {
    if (!chromium) {
      // Lazy import to avoid bundling issues
      const mod = await import('@sparticuz/chromium')
      chromium = mod.default || mod
    }
    if (!puppeteerLib) {
      const mod = await import('puppeteer-core')
      puppeteerLib = mod.default || mod
    }
    return { puppeteer: puppeteerLib, chromium }
  }

  if (!puppeteerLib) {
    const mod = await import('puppeteer')
    puppeteerLib = mod.default || mod
  }
  return { puppeteer: puppeteerLib, chromium: null as any }
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
    
    // Evidence section
    const evidenceSection = data.evidenceFiles.length > 0 ? `
    <div class="section">
        <h2>Evidence Documents</h2>
        <p><strong>Total Files:</strong> ${data.evidenceFiles.length}</p>
        <div class="evidence-section">
            ${data.evidenceFiles.map(file => `
            <div style="margin-bottom: 20px;">
                <p><strong>${file.name}</strong> (${file.size} bytes)</p>
                <img src="${file.url}" alt="${file.name}" class="evidence-image" />
            </div>
            `).join('')}
        </div>
    </div>` : ''
    
    // Reference section
    const referenceSection = data.referenceValidation.reference_1 ? `
    <div class="section">
        <h2>Reference Validation</h2>
        <div class="info-grid">
            ${data.referenceValidation.reference_1 ? `
            <div class="info-label">Reference 1:</div>
            <div class="info-value">
                ${data.referenceValidation.reference_1}
                ${data.referenceValidation.reference_1_valid === true ? 
                  '<span class="reference-status status-valid">VALID</span>' :
                  data.referenceValidation.reference_1_valid === false ?
                  '<span class="reference-status status-invalid">INVALID</span>' :
                  '<span class="reference-status status-pending">PENDING</span>'}
            </div>` : ''}
            
            ${data.referenceValidation.reference_2 ? `
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
    </div>` : ''
    
    // Verification method
    const verificationMethod = data.evidenceFiles.length > 0 
      ? (data.referenceValidation.reference_1 ? 'Evidence + References' : 'Evidence Only')
      : 'References Only'
    
    return template
      .replace(/\{\{registrationId\}\}/g, data.registrationId)
      .replace(/\{\{submissionDate\}\}/g, data.submissionDate)
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
      .replace(/\{\{#if user\.start_class\}\}[\s\S]*?\{\{\/if\}\}/g, data.user.start_class ? `
            <div class="info-label">Start Class:</div>
            <div class="info-value">Class ${data.user.start_class}</div>` : '')
      .replace(/\{\{#if user\.start_year\}\}[\s\S]*?\{\{\/if\}\}/g, data.user.start_year ? `
            <div class="info-label">Start Year:</div>
            <div class="info-value">${data.user.start_year}</div>` : '')
      .replace(/\{\{#if evidenceFiles\.length\}\}[\s\S]*?\{\{\/if\}\}/g, evidenceSection)
      .replace(/\{\{#if referenceValidation\.reference_1\}\}[\s\S]*?\{\{\/if\}\}/g, referenceSection)
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
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        .header {
            text-align: center;
            background-color: #1e40af;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .section {
            background-color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 10px;
            margin-bottom: 15px;
        }
        .info-label {
            font-weight: bold;
            color: #374151;
        }
        .info-value {
            color: #6b7280;
        }
        .evidence-section {
            margin-top: 20px;
        }
        .evidence-image {
            max-width: 200px;
            max-height: 200px;
            margin: 10px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }
        .reference-status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
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
            margin-top: 40px;
            padding: 20px;
            background-color: #f3f4f6;
            border-radius: 8px;
            font-size: 12px;
            color: #6b7280;
        }
        .admin-notes {
            border: 2px dashed #d1d5db;
            padding: 20px;
            margin-top: 20px;
            background-color: #f9fafb;
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

    <div class="section admin-notes">
        <h2>Admin Notes</h2>
        <p style="color: #6b7280; font-style: italic;">
            [Space for admin verification notes and approval decision]
        </p>
        <br><br><br><br>
        <div style="border-top: 1px solid #d1d5db; padding-top: 10px;">
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
      const { puppeteer, chromium } = await getPuppeteer()
      let browser: any
      if (isServerless) {
        // Use the correct executablePath method and tmp dir for @sparticuz/chromium on Vercel
        const executablePath = await chromium.executablePath()
        browser = await puppeteer.launch({
          args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
          defaultViewport: chromium.defaultViewport,
          executablePath,
          headless: chromium.headless !== false,
          ignoreHTTPSErrors: true,
        })
      } else {
        browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
      }

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
