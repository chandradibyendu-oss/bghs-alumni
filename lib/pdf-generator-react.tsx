import { Document, Page, Text, View, Image, StyleSheet, Font, pdf } from '@react-pdf/renderer'

export interface EvidenceFile {
  name: string
  size: number
  url: string
  type?: string
}

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

// Font.register can be added later if we host a font URL

const styles = StyleSheet.create({
  page: { padding: 20, backgroundColor: '#f9f9f9' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e40af', color: '#fff', padding: 12, borderRadius: 6 },
  headerLogo: { width: 60, height: 60, backgroundColor: '#fff', borderRadius: 4, padding: 4, marginRight: 12 },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 16, fontWeight: 700 as any },
  headerSub: { fontSize: 10, marginTop: 2 },
  section: { backgroundColor: '#fff', padding: 10, marginTop: 10, borderRadius: 6, borderColor: '#e5e7eb', borderWidth: 1 },
  sectionTitle: { color: '#1e40af', fontSize: 12, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  gridRow: { flexDirection: 'row', marginBottom: 4 },
  gridLabel: { width: '35%', fontSize: 10, fontWeight: 700 as any, color: '#374151' },
  gridValue: { width: '65%', fontSize: 10, color: '#6b7280' },
  evidenceWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  evidenceImage: { width: 140, height: 140, marginRight: 6, marginBottom: 6, borderWidth: 1, borderColor: '#d1d5db' },
  footer: { textAlign: 'center', fontSize: 9, color: '#6b7280', marginTop: 10 },
  pill: { fontSize: 9, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 3 },
  pillValid: { backgroundColor: '#dcfce7', color: '#166534' },
  pillInvalid: { backgroundColor: '#fef2f2', color: '#dc2626' },
  pillPending: { backgroundColor: '#fef3c7', color: '#d97706' }
})

function getLogoSource(): string {
  const customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'bghs-gallery'
  if (customDomain) return `https://${customDomain}/static/logos/bghs-logo.png`
  if (accountId) return `https://pub-${accountId}.r2.dev/${bucketName}/static/logos/bghs-logo.png`
  return 'https://alumnibghs.org/bghs-logo.png'
}

function StatusPill({ valid }: { valid: boolean | undefined }) {
  let text = 'PENDING'
  let pillStyle: any = styles.pillPending
  if (valid === true) { 
    text = 'VALID'
    pillStyle = styles.pillValid 
  }
  if (valid === false) { 
    text = 'INVALID'
    pillStyle = styles.pillInvalid 
  }
  const combinedStyle: any = [styles.pill, pillStyle]
  return <Text style={combinedStyle}>{text}</Text>
}

export async function generateRegistrationPDFReact(data: RegistrationPDFData): Promise<Buffer> {
  const fullName = `${data.user.first_name}${data.user.middle_name ? ' ' + data.user.middle_name : ''} ${data.user.last_name}`
  const formattedDate = new Date(data.submissionDate).toLocaleString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata'
  })

  const Doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image style={styles.headerLogo} src={getLogoSource()} />
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>BARASAT GOVT. HIGH SCHOOL EX-STUDENTS ASSOCIATION</Text>
            <Text style={styles.headerSub}>Registration No.: S/31084</Text>
            <Text style={styles.headerSub}>K.N.C. ROAD, BARASAT, NORTH 24 PARGANAS, KOLKATA - 700124</Text>
            <Text style={styles.headerSub}>System ID: {data.registrationId} | Generated: {formattedDate}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.gridRow}><Text style={styles.gridLabel}>Full Name:</Text><Text style={styles.gridValue}>{fullName}</Text></View>
          <View style={styles.gridRow}><Text style={styles.gridLabel}>Email:</Text><Text style={styles.gridValue}>{data.user.email}</Text></View>
          <View style={styles.gridRow}><Text style={styles.gridLabel}>Phone:</Text><Text style={styles.gridValue}>{data.user.phone || 'Not provided'}</Text></View>
          <View style={styles.gridRow}><Text style={styles.gridLabel}>System ID:</Text><Text style={styles.gridValue}>{data.user.id}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <View style={styles.gridRow}><Text style={styles.gridLabel}>Last Class Attended:</Text><Text style={styles.gridValue}>Class {data.user.last_class}</Text></View>
          <View style={styles.gridRow}><Text style={styles.gridLabel}>Year of Leaving:</Text><Text style={styles.gridValue}>{data.user.year_of_leaving}</Text></View>
        </View>

        {(data.referenceValidation.reference_1 || data.referenceValidation.reference_2) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reference Validation</Text>
            {data.referenceValidation.reference_1 && (
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Reference 1:</Text>
                <Text style={styles.gridValue}>{data.referenceValidation.reference_1} </Text>
                <StatusPill valid={data.referenceValidation.reference_1_valid} />
              </View>
            )}
            {data.referenceValidation.reference_2 && (
              <View style={styles.gridRow}>
                <Text style={styles.gridLabel}>Reference 2:</Text>
                <Text style={styles.gridValue}>{data.referenceValidation.reference_2} </Text>
                <StatusPill valid={data.referenceValidation.reference_2_valid} />
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evidence Documents</Text>
          {data.evidenceFiles.length > 0 ? (
            <View style={styles.evidenceWrap}>
              {data.evidenceFiles.map((f, idx) => (
                <Image key={idx} style={styles.evidenceImage} src={f.url} />
              ))}
            </View>
          ) : (
            <View style={styles.gridRow}><Text style={styles.gridLabel}>Status:</Text><Text style={styles.gridValue}>Not provided</Text></View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Notes</Text>
          <Text style={{ fontSize: 10, color: '#6b7280' } as any}>[Space for admin verification notes and approval decision]</Text>
        </View>

        <View style={styles.footer}>
          <Text>This document was automatically generated by the BGHS Alumni System</Text>
          <Text>Generated on {formattedDate} | System ID: {data.registrationId}</Text>
        </View>
      </Page>
    </Document>
  )

  try {
    const pdfDoc = pdf(Doc)
    const buffer = await pdfDoc.toBuffer()
    // Ensure we return a proper Buffer for Node.js
    if (Buffer.isBuffer(buffer)) {
      return buffer
    }
    // Handle Uint8Array or other formats
    if (buffer instanceof Uint8Array) {
      return Buffer.from(buffer)
    }
    // Last resort: convert to buffer
    return Buffer.from(buffer as any)
  } catch (error) {
    console.error('React-PDF generation error:', error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}


