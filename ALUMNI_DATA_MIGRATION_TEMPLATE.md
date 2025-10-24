# Alumni Data Migration Excel Template

## Template Structure

### Required Fields (Mandatory - Marked in RED background)
- **Email** - Primary contact email (MUST be unique)
- **First Name** - Alumni first name
- **Last Name** - Alumni last name  
- **Last Class** - Last class attended at BGHS (1-12)
- **Year of Leaving** - Year when left BGHS (YYYY format)
- **Batch Year** - Calculated from Year of Leaving (auto-calculated)

### Optional Fields (Marked in YELLOW background)
- **Phone** - Contact phone number (with country code)
- **Middle Name** - Middle name if available
- **Start Class** - Class when joined BGHS (1-12)
- **Start Year** - Year when joined BGHS (YYYY format)
- **Profession** - Current profession
- **Company** - Current company
- **Location** - Current location
- **Bio** - Brief biography
- **LinkedIn URL** - LinkedIn profile URL
- **Website URL** - Personal website URL
- **Role** - Default: alumni_member
- **Notes** - Admin notes for verification

## Excel Formatting Instructions

### Color Coding:
- **RED Background**: Mandatory fields (must be filled)
- **YELLOW Background**: Optional fields (can be left empty)
- **WHITE Background**: Auto-calculated fields (don't fill manually)

### Data Validation Rules:
1. **Email**: Must be valid email format, unique across all records
2. **Phone**: Include country code (e.g., +919876543210)
3. **Last Class**: Must be 1-12
4. **Year of Leaving**: Must be 4-digit year (1950-current year)
5. **Start Class**: Must be 1-12 (if provided)
6. **Start Year**: Must be 4-digit year (1950-current year) (if provided)
7. **Batch Year**: Auto-calculated as Year of Leaving
8. **Role**: Default to "alumni_member" unless specified otherwise

### Sample Data:
```
Email: john.doe@example.com
Phone: +919876543210
First Name: John
Last Name: Doe
Middle Name: Kumar
Last Class: 12
Year of Leaving: 2005
Start Class: 6
Start Year: 1998
Batch Year: 2005 (auto-calculated)
Profession: Software Engineer
Company: Tech Corp
Location: Bangalore
Bio: Alumni member from 2005 batch
LinkedIn URL: https://linkedin.com/in/johndoe
Website URL: https://johndoe.com
Role: alumni_member
Notes: Verified alumni
```

## Migration Process:
1. Fill Excel template with alumni data
2. Upload via Admin Utility UI
3. System validates and processes data
4. Creates auth users and profile records
5. Sends email notifications to new users

## Batch Processing:
- Recommended batch size: 100-200 records per upload
- System processes in chunks of 50 records
- Progress tracking and error reporting
- Rollback capability for failed batches
