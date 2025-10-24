# Alumni Data Migration System

## Overview
This system allows administrators to bulk migrate alumni data from Excel/CSV files into the BGHS Alumni platform. It creates both authentication users and profile records automatically.

## Features

### ✅ **Excel/CSV Support**
- **Pandoc Integration**: Uses Pandoc for Excel (.xlsx, .xls) to CSV conversion
- **Native CSV Support**: Direct CSV file processing
- **Batch Processing**: Handles large files (1000+ records) in chunks of 50
- **Progress Tracking**: Real-time progress and error reporting

### ✅ **Data Validation**
- **Field Validation**: Validates all required fields and data types
- **Duplicate Detection**: Prevents duplicate email addresses
- **Data Range Validation**: Ensures years, classes are within valid ranges
- **Error Reporting**: Detailed error messages for failed records

### ✅ **User Creation**
- **Auth Users**: Creates Supabase auth users with temporary passwords
- **Profile Records**: Creates complete profile records with all data
- **Auto-Approval**: Migrated records are automatically approved
- **Role Assignment**: Assigns appropriate roles (default: alumni_member)

## File Structure

### Template File
- **Location**: `alumni-migration-template.csv`
- **Format**: CSV with header row
- **Sample Data**: Includes example records

### Admin Interface
- **Location**: `/admin/alumni-migration`
- **Access**: Super Admin and Admin roles only
- **Features**: File upload, progress tracking, result display

### API Endpoint
- **Location**: `/api/admin/alumni-migration/upload`
- **Method**: POST
- **Processing**: Pandoc conversion + batch processing

## Field Mapping

### Required Fields (Mandatory)
| Excel Column | Database Field | Validation |
|--------------|----------------|------------|
| Email | email | Unique, valid email format |
| First Name | first_name | Non-empty string |
| Last Name | last_name | Non-empty string |
| Last Class | last_class | Integer 1-12 |
| Year of Leaving | year_of_leaving | Integer 1950-current year |

### Optional Fields
| Excel Column | Database Field | Validation |
|--------------|----------------|------------|
| Phone | phone | Optional phone number |
| Middle Name | middle_name | Optional string |
| Start Class | start_class | Integer 1-12 |
| Start Year | start_year | Integer 1950-current year |
| Batch Year | batch_year | Auto-calculated from Year of Leaving |
| Profession | profession | Optional string |
| Company | company | Optional string |
| Location | location | Optional string |
| Bio | bio | Optional text |
| LinkedIn URL | linkedin_url | Optional URL |
| Website URL | website_url | Optional URL |
| Role | role | Default: alumni_member |

## Migration Process

### 1. **File Preparation**
```csv
Email,Phone,First Name,Last Name,Middle Name,Last Class,Year of Leaving,Start Class,Start Year,Batch Year,Profession,Company,Location,Bio,LinkedIn URL,Website URL,Role,Notes
john.doe@example.com,+919876543210,John,Doe,Kumar,12,2005,6,1998,2005,Software Engineer,Tech Corp,Bangalore,Alumni member,https://linkedin.com/in/johndoe,https://johndoe.com,alumni_member,Verified alumni
```

### 2. **Upload Process**
1. Admin navigates to `/admin/alumni-migration`
2. Downloads template file
3. Fills template with alumni data
4. Uploads file via drag-and-drop or file picker
5. System processes file in background

### 3. **Processing Steps**
1. **File Validation**: Check file type and size
2. **Pandoc Conversion**: Convert Excel to CSV if needed
3. **CSV Parsing**: Parse CSV content into JSON objects
4. **Batch Processing**: Process records in chunks of 50
5. **User Creation**: Create auth users and profiles
6. **Result Reporting**: Display success/failure statistics

### 4. **Error Handling**
- **Duplicate Emails**: Skip existing users, report as failed
- **Invalid Data**: Skip invalid records, report specific errors
- **System Errors**: Rollback failed batches, cleanup temp files
- **Progress Tracking**: Real-time updates on processing status

## Performance Considerations

### **Scalability**
- **Batch Size**: 50 records per batch (configurable)
- **Memory Management**: Processes files in chunks
- **Temp File Cleanup**: Automatic cleanup of temporary files
- **Database Optimization**: Uses prepared statements and transactions

### **Large File Handling**
- **Progress Updates**: Real-time progress reporting
- **Error Recovery**: Continues processing after individual failures
- **Resource Management**: Efficient memory and CPU usage
- **Timeout Handling**: Prevents long-running requests

## Security Features

### **Access Control**
- **Admin Only**: Restricted to super_admin and admin roles
- **Authentication**: Requires valid Supabase session
- **File Validation**: Strict file type and size validation

### **Data Protection**
- **Temporary Passwords**: Secure random passwords for new users
- **Auto-Approval**: Migrated users are pre-approved
- **Cleanup**: Automatic cleanup of temporary files
- **Error Logging**: Detailed logging without exposing sensitive data

## Usage Instructions

### **For Administrators**

1. **Access Migration Tool**
   - Login as super_admin or admin
   - Navigate to Dashboard
   - Click "Alumni Migration" card

2. **Prepare Data File**
   - Download template CSV file
   - Fill with alumni data (100-200 records recommended)
   - Ensure all required fields are populated
   - Validate data format and ranges

3. **Upload and Process**
   - Drag and drop file or click to browse
   - Click "Upload and Process"
   - Monitor progress and results
   - Review success/failure statistics

4. **Review Results**
   - Check successful imports
   - Review failed records and errors
   - Download error report if needed
   - Upload additional batches if required

### **Best Practices**

1. **File Preparation**
   - Use provided template format
   - Validate data before upload
   - Keep batch sizes reasonable (100-200 records)
   - Include all required fields

2. **Data Quality**
   - Verify email addresses are unique
   - Ensure years are within valid ranges
   - Check class numbers (1-12)
   - Validate phone numbers include country codes

3. **Processing**
   - Process during low-traffic periods
   - Monitor system performance
   - Keep backup of original data
   - Test with small batches first

## Troubleshooting

### **Common Issues**

1. **File Upload Fails**
   - Check file size (max 10MB)
   - Verify file format (.csv, .xlsx, .xls)
   - Ensure file is not corrupted

2. **Pandoc Conversion Fails**
   - Verify Pandoc is installed
   - Check Excel file format
   - Ensure file is not password protected

3. **Data Validation Errors**
   - Check required fields are populated
   - Verify data types and ranges
   - Ensure email addresses are unique

4. **Database Errors**
   - Check database connection
   - Verify table permissions
   - Review error logs for details

### **Error Messages**

| Error | Cause | Solution |
|-------|-------|----------|
| "No file provided" | File not uploaded | Select a file before uploading |
| "File size must be less than 10MB" | File too large | Reduce file size or split into batches |
| "Failed to convert Excel file" | Pandoc error | Check file format or use CSV |
| "User with email already exists" | Duplicate email | Remove duplicate or update existing |
| "Last class must be between 1 and 12" | Invalid class | Correct class number |
| "Year of leaving must be between 1950 and current year" | Invalid year | Correct year value |

## Technical Architecture

### **Components**

1. **Frontend**: React component with drag-and-drop upload
2. **API**: Next.js API route with file processing
3. **Pandoc**: External tool for Excel conversion
4. **Database**: Supabase with batch operations
5. **File System**: Temporary file handling with cleanup

### **Data Flow**

```
Excel/CSV File → Upload → Validation → Pandoc Conversion → CSV Parsing → Batch Processing → User Creation → Results
```

### **Dependencies**

- **Pandoc**: Excel to CSV conversion
- **Supabase**: Database operations
- **Node.js**: File system operations
- **Next.js**: API routes and file handling

## Future Enhancements

### **Planned Features**
- **Email Notifications**: Send welcome emails to migrated users
- **Password Reset**: Allow users to set their own passwords
- **Bulk Operations**: Update existing records in bulk
- **Advanced Validation**: Custom validation rules
- **Audit Trail**: Track migration history and changes

### **Performance Improvements**
- **Streaming Processing**: Process very large files
- **Background Jobs**: Queue-based processing
- **Caching**: Cache validation results
- **Parallel Processing**: Multiple batch processing

This migration system provides a robust, scalable solution for bulk alumni data import while maintaining data integrity and system performance.
