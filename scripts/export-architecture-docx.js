const fs = require('fs')
const path = require('path')
const { Document, Packer, Paragraph, HeadingLevel, TextRun } = require('docx')

function mdToDocxParagraphs(md) {
  const lines = md.split(/\r?\n/)
  const paras = []
  for (const line of lines) {
    if (!line.trim()) { paras.push(new Paragraph('')); continue }
    if (line.startsWith('## ')) {
      paras.push(new Paragraph({ text: line.replace(/^##\s+/, ''), heading: HeadingLevel.HEADING_2 }))
    } else if (line.startsWith('### ')) {
      paras.push(new Paragraph({ text: line.replace(/^###\s+/, ''), heading: HeadingLevel.HEADING_3 }))
    } else if (line.startsWith('- ')) {
      paras.push(new Paragraph({ children: [ new TextRun({ text: '• ' + line.replace(/^-\s+/, ''), }) ] }))
    } else {
      paras.push(new Paragraph(line))
    }
  }
  return paras
}

async function run() {
  const mdPath = path.resolve(process.cwd(), 'PROJECT_ARCHITECTURE.md')
  if (!fs.existsSync(mdPath)) {
    console.error('PROJECT_ARCHITECTURE.md not found')
    process.exit(1)
  }
  const md = fs.readFileSync(mdPath, 'utf8')
  const doc = new Document({ sections: [{ properties: {}, children: mdToDocxParagraphs(md) }] })
  const buffer = await Packer.toBuffer(doc)
  const outPath = path.resolve(process.cwd(), 'PROJECT_ARCHITECTURE.docx')
  fs.writeFileSync(outPath, buffer)
  console.log('Created:', outPath)
}

run().catch(err => { console.error(err); process.exit(1) })


