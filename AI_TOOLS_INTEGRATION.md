# AI Tools Integration Documentation

## Overview

The AI Tools feature is now integrated with a powerful Hugging Face backend API that provides real AI-powered document enhancement and digital signature capabilities.

**Backend API:** https://huggingface.co/spaces/omgy/vero_ps

---

## Features

### 1. 📝 Document Enhancer
AI-powered document enhancement with LaTeX support using Google Gemini.

**Capabilities:**
- Improves writing quality and clarity
- Fixes grammar and spelling errors
- Enhances formatting and structure
- Supports mathematical notation (LaTeX)
- Optimizes for different document types

**Supported Document Types:**
- **Auto-detect** - Automatically identifies document type
- **Academic** - Research papers, theses, academic writing
- **Technical** - Technical documentation, manuals, specifications
- **Business** - Business documents, reports, proposals

### 2. ✍️ Sign Document
Add digital signatures to your documents.

**Capabilities:**
- Add signer name to document
- Custom signature text
- Multiple position options
- Professional signature formatting

**Signature Positions:**
- Bottom Right
- Bottom Left
- Top Right
- Top Left
- Center

---

## API Integration

### Service File: `src/lib/documentApiService.js`

This service handles all communication with the Hugging Face backend.

#### Key Functions:

```javascript
// Enhance document with AI
enhanceDocument(file, options)

// Add digital signature
addSignature(file, signatureOptions)

// Preview LaTeX equations
previewDocument(file)

// Check API health
checkHealth()

// Download result file
downloadBlob(blob, filename)
```

---

## How It Works

### Document Enhancement Flow:

1. **User uploads document** (.docx, .pdf, or .txt)
2. **Selects document type** (auto, academic, technical, business)
3. **Optionally provides instructions** (e.g., "Make it more formal")
4. **Clicks "Enhance Document"**
5. **Backend processes** with Google Gemini AI
6. **Returns enhanced document** with improvements
7. **User downloads** enhanced version

### API Request:
```javascript
POST https://omgy-vero-ps.hf.space/enhance

FormData:
- file: Document file
- prompt: (optional) Enhancement instructions
- doc_type: (optional) 'auto', 'academic', 'technical', or 'business'
```

### API Response:
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Body: Enhanced document blob (always .docx format)
- Header: `Content-Disposition: attachment; filename="enhanced_document.docx"`

**Important:** The backend always returns documents in Word (.docx) format, regardless of the input file type.

---

### Digital Signature Flow:

1. **User uploads document** (.docx or .pdf)
2. **Enters signer name** (required)
3. **Optionally enters custom signature text**
4. **Selects signature position**
5. **Clicks "Sign Document"**
6. **Backend adds signature** to document
7. **Returns signed document**
8. **User downloads** signed version

### API Request:
```javascript
POST https://omgy-vero-ps.hf.space/add-signature

FormData:
- file: Document file
- signature: Signature text
- position: 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'
- signer_name: Name of the signer
```

### API Response:
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Body: Signed document blob (always .docx format)
- Header: `Content-Disposition: attachment; filename="Signed_document.docx"`

**Important:** The signed document is always returned in Word (.docx) format.

---

## File Support

### Supported Input Formats:
- `.docx` - Microsoft Word Document
- `.doc` - Legacy Word Document
- `.pdf` - PDF Document
- `.txt` - Plain Text File

### Supported Output Formats:
- `.docx` - Microsoft Word Document (only format returned by backend)

**Note:** All processed documents are returned in Word (.docx) format regardless of input format.

### File Size Limit:
- **Maximum:** 10 MB per file
- **Validation:** Checked before upload

---

## Error Handling

The integration includes comprehensive error handling:

### Client-Side Validation:
- ✅ File type validation
- ✅ File size validation (10MB max)
- ✅ Required field validation
- ✅ Input format validation

### Server-Side Errors:
- API unavailable (503)
- Invalid file format (400)
- Processing failed (500)
- Network errors

### User Feedback:
```javascript
// Success
{
  success: true,
  data: Blob,
  filename: "enhanced_document.docx"
}

// Error
{
  success: false,
  error: "Error message for user"
}
```

---

## UI Components

### AITools.jsx Structure:

```
AITools Page
├── Tool Tabs (Enhance / Sign)
├── Tool Info (Title + Description)
├── Error Message (if any)
├── Upload Area (Drag & Drop)
│   ├── File Icon
│   ├── Browse Button
│   └── File Info (when uploaded)
├── Tool Options
│   ├── Enhancement Options
│   │   ├── Document Type Select
│   │   └── Instructions Textarea
│   └── Signature Options
│       ├── Signer Name Input
│       ├── Signature Text Input
│       └── Position Select
├── Process Button
└── Success State
    ├── Success Icon
    ├── Success Message
    └── Download Button
```

---

## Usage Examples

### Example 1: Basic Document Enhancement

```javascript
import { enhanceDocument, downloadBlob } from '../lib/documentApiService';

const file = document.querySelector('input[type="file"]').files[0];

const result = await enhanceDocument(file, {
  doc_type: 'auto'
});

if (result.success) {
  downloadBlob(result.data, result.filename);
} else {
  console.error(result.error);
}
```

### Example 2: Enhancement with Instructions

```javascript
const result = await enhanceDocument(file, {
  prompt: 'Make it more formal and add technical details',
  doc_type: 'technical'
});
```

### Example 3: Add Signature

```javascript
import { addSignature, downloadBlob } from '../lib/documentApiService';

const result = await addSignature(file, {
  signature: 'John Doe',
  position: 'bottom-right',
  signer_name: 'John Doe'
});

if (result.success) {
  downloadBlob(result.data, result.filename);
}
```

---

## Testing

### Test Document Enhancement:
1. Go to AI Tools → Document Enhancer
2. Upload a .docx, .pdf, or .txt file
3. Select document type (or leave as Auto)
4. Optionally add instructions
5. Click "Enhance Document"
6. Wait for processing (may take 10-30 seconds)
7. Download enhanced document (always in .docx Word format)

### Test Signature:
1. Go to AI Tools → Sign Document
2. Upload a .docx or .pdf file
3. Enter your full name
4. Optionally enter custom signature text
5. Select position
6. Click "Sign Document"
7. Wait for processing
8. Download signed document (always in .docx Word format)

---

## Backend API Endpoints

### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "service": "LaTeX Document Enhancement API",
  "version": "2.0.0",
  "gemini_available": true,
  "features": ["latex_output", "equation_formatting", "multi_format_support"]
}
```

### Enhance Document
```
POST /enhance

Body: multipart/form-data
- file: Document file
- prompt: (optional) Enhancement instructions
- doc_type: (optional) Document type

Response: Enhanced document blob
```

### Preview LaTeX
```
POST /preview

Body: multipart/form-data
- file: Document file

Response:
{
  "filename": "document.pdf",
  "has_math": true,
  "equation_count": 5,
  "equations": [...],
  "text_preview": "..."
}
```

### Add Signature
```
POST /add-signature

Body: multipart/form-data
- file: Document file
- signature: Signature text
- position: Position option
- signer_name: Signer's name

Response: Signed document blob
```

---

## Performance

### Expected Processing Times:
- **Document Enhancement:** 10-30 seconds (depends on file size)
- **Digital Signature:** 2-5 seconds
- **Preview:** 1-3 seconds

### Optimization Tips:
- Keep files under 5MB for faster processing
- Use specific document types instead of auto-detect
- Keep instructions concise (under 200 characters)

---

## Troubleshooting

### Issue: "Failed to enhance document"
**Possible causes:**
- File is corrupted or empty
- File exceeds 10MB limit
- Backend API is down
- Network connectivity issues

**Solutions:**
1. Check file size and format
2. Try a different file
3. Check network connection
4. Visit https://omgy-vero-ps.hf.space/health to check API status

### Issue: "No text extracted from document"
**Possible causes:**
- Document is empty
- Document is image-based PDF (scanned)
- File is corrupted

**Solutions:**
1. Ensure document contains readable text
2. Use OCR for scanned PDFs first
3. Try converting to .txt or .docx

### Issue: Signature not appearing
**Possible causes:**
- Signer name not provided
- Document format doesn't support signatures

**Solutions:**
1. Enter signer name (required)
2. Use .docx format for best results
3. Try different position

---

## Security & Privacy

### Data Handling:
- ✅ Files are processed server-side
- ✅ No files are permanently stored
- ✅ Temporary files are deleted after processing
- ✅ HTTPS encryption for all transfers

### API Security:
- CORS enabled for frontend access
- API key required for backend (Gemini)
- Rate limiting on backend
- Input validation and sanitization

---

## Future Enhancements

### Planned Features:
- [ ] Batch document processing
- [ ] Custom signature image upload
- [ ] Template-based signatures
- [ ] Document comparison (track changes)
- [ ] Style transfer between documents
- [ ] Multi-language support
- [ ] OCR for scanned documents
- [ ] PDF annotation tools
- [ ] Document translation
- [ ] Citation formatting

---

## Credits

### Technologies Used:
- **Backend:** Flask + Python
- **AI Model:** Google Gemini
- **Document Processing:** Pandoc, python-docx
- **LaTeX Processing:** Custom LaTeX processor
- **Hosting:** Hugging Face Spaces

### External Dependencies:
- `gemini_client.py` - Gemini API integration
- `document_converter.py` - Document format conversion
- `latex_processor.py` - LaTeX equation processing

---

## Support

### Backend API Status:
Check: https://omgy-vero-ps.hf.space/health

### Need Help?
- Review this documentation
- Check browser console for errors
- Test with sample documents first
- Contact support with error details

---

**Last Updated:** 2024
**API Version:** 2.0.0
**Integration Status:** ✅ Active & Operational