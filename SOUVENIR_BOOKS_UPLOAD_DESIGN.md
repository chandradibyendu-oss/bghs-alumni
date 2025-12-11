# Souvenir Books PDF Upload Design

## 📁 R2 Storage Folder Structure

### Current Structure:
```
bghs-gallery/
├── gallery/              # Alumni photo gallery
├── events/               # Event promotional images
├── blog/                 # Blog post images
├── evidence/             # Verification documents
├── registration-pdfs/    # Registration certificates
├── avatars/              # User profile pictures
└── temp-evidence/        # Temporary uploads
```

### New Addition:
```
bghs-gallery/
└── souvenirs/            # Souvenir book PDFs (NEW)
    ├── 2024/
    │   └── souvenir-2024.pdf
    ├── 2023/
    │   └── souvenir-2023.pdf
    └── 2022/
        └── souvenir-2022.pdf
```

**Folder Organization:**
- Main folder: `souvenirs/`
- Sub-folders by year: `souvenirs/{year}/`
- File naming: `souvenir-{year}-{timestamp}.pdf` or `souvenir-{year}.pdf`

---

## 🔧 Implementation Plan

### 1. **R2 Storage Method** (`lib/r2-storage.ts`)

Add a new method to handle souvenir PDF uploads:

```typescript
/**
 * Upload souvenir book PDF to R2
 * @param pdfBuffer PDF file buffer
 * @param year Year of the souvenir book
 * @param originalFileName Original filename
 * @returns PDF URL
 */
async uploadSouvenirPDF(
  pdfBuffer: Buffer, 
  year: number, 
  originalFileName: string
): Promise<string> {
  try {
    // Generate filename: souvenir-{year}-{timestamp}.pdf
    const timestamp = Date.now()
    const fileName = `souvenir-${year}-${timestamp}.pdf`
    
    // Upload to souvenirs/{year}/ folder
    const result = await this.uploadFile(
      pdfBuffer, 
      fileName, 
      'application/pdf', 
      `souvenirs/${year}`
    )
    
    return result.url
  } catch (error) {
    console.error('Failed to upload souvenir PDF:', error)
    throw new Error(`Failed to upload PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
```

**Features:**
- ✅ Organized by year in sub-folders
- ✅ Unique filename with timestamp to prevent conflicts
- ✅ Returns public URL for database storage
- ✅ Handles errors gracefully

---

### 2. **API Route** (`app/api/souvenirs/upload/route.ts`)

Create a new API endpoint for admin uploads:

```typescript
POST /api/souvenirs/upload
```

**Request:**
- `FormData` with:
  - `file`: PDF file (required)
  - `year`: Year of souvenir book (required, integer)
  - `title`: Optional title/description
  - `coverImage`: Optional cover image (for thumbnail)

**Validation:**
- ✅ File type: Only `application/pdf`
- ✅ File size: Max 100MB (souvenir books can be large)
- ✅ Year: Valid integer, reasonable range (e.g., 1900-2100)
- ✅ Authentication: Requires admin permission (`can_manage_content` or `can_access_admin`)

**Response:**
```json
{
  "success": true,
  "url": "https://cdn.example.com/souvenirs/2024/souvenir-2024-1234567890.pdf",
  "key": "souvenirs/2024/souvenir-2024-1234567890.pdf",
  "size": 5242880,
  "year": 2024
}
```

**Error Handling:**
- 400: Missing fields, invalid file type, file too large
- 401: Not authenticated
- 403: Insufficient permissions
- 500: Upload failed

---

### 3. **Admin Upload Interface**

**Location:** `/admin/souvenirs` (new page) or add to existing admin section

**Features:**
- 📤 **Upload Form:**
  - File picker (PDF only)
  - Year input (dropdown or number input)
  - Title/Description (optional)
  - Cover image upload (optional, for thumbnail)
  - Preview before upload
  - Progress indicator

- 📋 **Existing Books List:**
  - Grid/list of uploaded souvenir books
  - Shows: Year, Title, Upload Date, File Size
  - Actions: View, Edit, Delete, Download
  - Search/Filter by year

- ⚙️ **Settings per Book:**
  - Public/Members-only visibility
  - Enable/Disable download
  - Edit metadata (year, title, description)

---

### 4. **Database Schema**

```sql
CREATE TABLE souvenir_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  pdf_url TEXT NOT NULL,
  cover_image_url TEXT,
  file_size BIGINT,
  is_public BOOLEAN DEFAULT true,
  allow_download BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_souvenir_books_year ON souvenir_books(year DESC);
CREATE INDEX idx_souvenir_books_public ON souvenir_books(is_public, year DESC);

-- RLS Policies
ALTER TABLE souvenir_books ENABLE ROW LEVEL SECURITY;

-- Public can view public souvenir books
CREATE POLICY "Public can view public souvenir books" ON souvenir_books
  FOR SELECT USING (is_public = true);

-- Authenticated users can view all souvenir books
CREATE POLICY "Authenticated users can view all souvenir books" ON souvenir_books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.id IS NOT NULL
    )
  );

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage souvenir books" ON souvenir_books
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND (
        p.role = 'super_admin'
        OR EXISTS (
          SELECT 1 FROM role_permissions rp
          JOIN roles r ON rp.role_id = r.id
          WHERE r.name = p.role
          AND rp.permission_name IN ('can_manage_content', 'can_access_admin')
        )
      )
    )
  );
```

---

## 📤 Upload Flow

### Step-by-Step Process:

1. **Admin navigates to** `/admin/souvenirs`
2. **Clicks "Upload New Souvenir Book"**
3. **Fills form:**
   - Selects PDF file
   - Enters year (e.g., 2024)
   - Optionally adds title and cover image
4. **Clicks "Upload"**
5. **Frontend:**
   - Validates file (type, size)
   - Shows upload progress
   - Calls `/api/souvenirs/upload`
6. **Backend API:**
   - Validates authentication & permissions
   - Validates file (PDF, max 100MB)
   - Converts file to buffer
   - Calls `r2Storage.uploadSouvenirPDF(buffer, year, filename)`
   - Gets public URL from R2
   - Saves to database (`souvenir_books` table)
   - Returns success with URL
7. **Frontend:**
   - Shows success message
   - Refreshes list of souvenir books
   - Book is now visible on About page

---

## 🔍 File Size Considerations

**Souvenir Books Characteristics:**
- Typically large PDFs (10-50MB, sometimes 100MB+)
- High-quality images and graphics
- Many pages (50-200+ pages)

**Recommendations:**
- **Max Upload Size:** 100MB (configurable)
- **Storage:** R2 handles large files well
- **Loading:** Use PDF.js or similar for client-side rendering
- **Performance:** Consider lazy loading or pagination in viewer
- **CDN:** R2 public URLs serve files efficiently

---

## 🎨 Cover Image (Optional Enhancement)

**Purpose:** Display thumbnail instead of generic PDF icon

**Implementation:**
- Upload cover image separately (JPG/PNG)
- Store in `souvenirs/{year}/covers/` folder
- Link to `cover_image_url` in database
- Display on About page grid

**Alternative:** Extract first page of PDF as thumbnail (server-side)

---

## 🔐 Security & Permissions

**Upload Permissions:**
- ✅ `can_manage_content` - Can upload/manage souvenir books
- ✅ `can_access_admin` - Full admin access

**View Permissions:**
- ✅ Public: Can view if `is_public = true`
- ✅ Authenticated: Can view all souvenir books
- ✅ Download: Controlled by `allow_download` flag

**File Access:**
- R2 files are publicly accessible via URL
- No signed URLs needed (public content)
- If needed later, can implement signed URLs for private books

---

## 📝 Summary

**What We'll Create:**
1. ✅ Database table: `souvenir_books`
2. ✅ R2 method: `uploadSouvenirPDF()` in `lib/r2-storage.ts`
3. ✅ API route: `/api/souvenirs/upload`
4. ✅ Admin page: `/admin/souvenirs` (optional, can add later)
5. ✅ Component: `SouvenirBooksSection` for About page
6. ✅ PDF Viewer: Modal/page component for viewing PDFs

**R2 Folder:**
- `souvenirs/{year}/souvenir-{year}-{timestamp}.pdf`

**File Limits:**
- Type: PDF only
- Size: 100MB max
- Organization: By year in sub-folders

---

## ✅ Ready to Implement?

This design follows the existing patterns in your codebase:
- ✅ Uses same R2 storage pattern as events/blog images
- ✅ Follows same API route structure
- ✅ Uses same permission system
- ✅ Consistent with database schema patterns
- ✅ Minimal changes to existing code

**Next Steps:**
1. Create database schema SQL file
2. Add `uploadSouvenirPDF()` method to `r2-storage.ts`
3. Create API upload route
4. Create SouvenirBooksSection component
5. Add section to About page
6. Create PDF viewer component
7. (Optional) Create admin management page

