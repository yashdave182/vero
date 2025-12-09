# Template Generation Testing Guide

## Quick Testing Steps

### 1. Start the Application

```bash
cd C:\Users\yashd\Downloads\vero_startup
npm run dev
```

The app should start on `http://localhost:5173`

### 2. Navigate to Templates

1. Sign in to your account
2. Go to **Dashboard** → **Templates**
3. You should see 6 templates:
   - 📄 Resume Generator
   - ✉️ Cover Letter
   - 📝 Business Proposal
   - 🧾 Invoice Generator
   - 📋 Contract Template
   - 📁 Portfolio PDF

### 3. Check API Status

Look at the top right of the Templates page for the status badge:

- ✅ **Green badge** (`X templates available`) = Backend is online
- ⚠️ **Yellow badge** (`Using offline templates`) = Backend is offline

### 4. Test Document Generation

#### Test Resume Generation

1. Click on **"Resume Generator"**
2. Fill in the form:
   - Name: Your name (auto-filled from profile)
   - Email: Your email (auto-filled)
   - Phone: Your phone number
   - Professional Summary: Brief bio
   - ✅ Check "Enhance content with AI"
3. Click **"Generate Document"**
4. Wait 5-30 seconds (first request may take longer)
5. A DOCX file should download automatically

**Expected Result:**
- Button shows "Generating..." with spinner
- Success message appears: "Your document has been generated and downloaded"
- File downloads: `YourName_Resume.docx`

#### Test Cover Letter

1. Go back and click **"Cover Letter"**
2. Fill in:
   - Your Name
   - Email
   - Phone
   - Company Name (e.g., "Tech Corp")
   - Position (e.g., "Senior Developer")
   - ✅ Check "Generate content with AI"
3. Click **"Generate Document"**
4. Wait for generation
5. File downloads: `YourName_CoverLetter_TechCorp.docx`

#### Test Portfolio PDF

1. Click **"Portfolio PDF"**
2. Form pre-fills with your profile data
3. ✅ Check "Enhance portfolio with AI"
4. Click **"Generate Document"**
5. Wait for generation
6. PDF downloads: `YourName_Portfolio.pdf`

### 5. Check Backend Logs

Open your Hugging Face Space logs:
https://huggingface.co/spaces/omgy/vero_template

**Expected logs when generating resume:**
```
✓ All services initialized successfully
Enhancing resume content with AI...
Generating resume document...
```

### 6. Test Offline Mode

1. Stop the Hugging Face backend (or disconnect internet)
2. Go to Templates page
3. Should see yellow badge: "Using offline templates"
4. Yellow notice box appears explaining API is unavailable
5. Templates still visible (6 templates)
6. Clicking "Generate" will show error but gracefully

### 7. Common Scenarios

#### Scenario 1: Backend is Sleeping (Cold Start)

**Symptoms:**
- First request takes 30-60 seconds
- Button shows "Generating..." for a long time

**Solution:**
- Wait patiently for the first request
- Subsequent requests will be faster
- This is normal for Hugging Face Spaces

#### Scenario 2: Backend Returns Error

**Symptoms:**
- Red error alert appears
- Error message shown

**Possible Causes:**
- Missing required fields (check form)
- Backend API error
- Network timeout

**Solution:**
- Check all required fields are filled
- Try again in a few seconds
- Check browser console for errors

#### Scenario 3: File Doesn't Download

**Symptoms:**
- Success message appears but no file downloads

**Solution:**
- Check browser's download settings
- Allow downloads from localhost
- Check browser console for errors
- Try different browser

### 8. Browser Console Checks

Open browser console (F12) and check for:

**Successful generation:**
```
[Vite] connected
Generating resume document...
```

**Network request:**
```
POST https://omgy-vero-template.hf.space/generate-resume
Status: 200
Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

**Errors:**
```
Error generating resume: [error message]
```

### 9. Test Each Template

| Template | Fields to Test | Expected Output |
|----------|---------------|-----------------|
| Resume | Name, email, bio, skills | `Name_Resume.docx` |
| Cover Letter | Name, company, position | `Name_CoverLetter_Company.docx` |
| Proposal | Title, client, project | `Proposal_Client_Project.docx` |
| Invoice | Invoice number, client | `Invoice_INV-XXX.docx` |
| Contract | Contract type, parties | `ContractType_Contract.docx` |
| Portfolio PDF | Name, title, bio | `Name_Portfolio.pdf` |

### 10. Verify Generated Documents

After downloading, open the files:

**Resume (DOCX):**
- Should have professional formatting
- Name, contact info at top
- Summary section
- Experience/Education sections
- Skills listed
- AI-enhanced descriptions (if enabled)

**Cover Letter (DOCX):**
- Proper letter format
- Date, addresses
- AI-generated content matching job/company
- Professional tone

**Portfolio PDF:**
- PDF format
- Professional layout
- Projects showcased
- Skills highlighted
- Contact information

### 11. Performance Benchmarks

**Expected Generation Times:**

| Template | Cold Start | Warm Start |
|----------|-----------|------------|
| Resume (no AI) | 30-60s | 5-10s |
| Resume (with AI) | 45-90s | 10-20s |
| Cover Letter (AI) | 40-80s | 10-20s |
| Proposal (AI) | 40-80s | 10-20s |
| Invoice | 20-40s | 3-8s |
| Contract (AI) | 40-80s | 10-20s |
| Portfolio PDF | 30-60s | 8-15s |

### 12. Troubleshooting

#### Problem: Backend URL Not Working

**Check:**
```javascript
// In templateService.js
const API_BASE_URL = "https://omgy-vero-template.hf.space";
```

**Test backend directly:**
```bash
curl https://omgy-vero-template.hf.space/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "service": "Vero Template Generator",
  "version": "1.0.0"
}
```

#### Problem: CORS Errors

**Check browser console:**
```
Access-Control-Allow-Origin error
```

**Solution:**
- Backend should have CORS enabled
- Check Flask app has `CORS(app)`
- Try different browser

#### Problem: Large File Timeout

**Symptoms:**
- Request times out after 30s
- No response from backend

**Solution:**
- Backend may be processing
- Wait up to 60 seconds
- Check Hugging Face Space logs
- Restart Space if needed

### 13. Success Criteria

✅ All 6 templates visible on Templates page
✅ API status indicator works (green/yellow)
✅ Can navigate to each template generator
✅ Forms pre-fill with profile data
✅ Generate button works
✅ Loading state shows during generation
✅ Success message appears after generation
✅ File downloads automatically
✅ Generated documents are valid (can open)
✅ AI enhancement works when enabled
✅ Error messages show when backend fails
✅ Offline mode works with fallback

### 14. Quick Test Script

Run this in browser console after navigating to a template generator:

```javascript
// Test resume generation (paste in console)
const testData = {
  name: "Test User",
  email: "test@example.com",
  phone: "+1234567890",
  bio: "Experienced developer",
  skills: ["JavaScript", "React", "Node.js"],
  enhanceWithAI: false
};

console.log("Testing resume generation...");
// Then click the Generate button manually
```

### 15. Backend Health Check

```bash
# Check if backend is running
curl https://omgy-vero-template.hf.space/health

# Expected: Status 200 with JSON response

# Check endpoints list
curl https://omgy-vero-template.hf.space/ | jq

# Test resume generation (requires valid JSON)
curl -X POST https://omgy-vero-template.hf.space/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "personal_info": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "enhance_with_ai": false
  }' \
  --output test_resume.docx
```

### 16. Report Issues

If you find bugs, note:

1. **What you did:** Step-by-step actions
2. **What happened:** Actual result
3. **What expected:** Expected result
4. **Browser console:** Error messages
5. **Backend logs:** From Hugging Face Space
6. **Network tab:** HTTP status codes

### 17. Known Limitations

- ⚠️ First request after backend sleep: 30-60 seconds
- ⚠️ AI enhancement adds 10-15 seconds to generation
- ⚠️ Large portfolios (many projects) take longer
- ⚠️ Backend has rate limits (if many users)
- ⚠️ Free Hugging Face Spaces may have downtime

### 18. Next Steps After Testing

If everything works:
- ✅ Templates generate successfully
- ✅ Files download properly
- ✅ AI enhancement works
- ✅ Fallback mode works

Then you're ready for:
1. Production deployment
2. User documentation
3. Marketing/launch
4. Analytics tracking

---

## Quick Reference

**Templates Page:** `/dashboard/templates`
**Generator Page:** `/dashboard/templates/:templateId`
**Backend URL:** `https://omgy-vero-template.hf.space`
**Backend Health:** `https://omgy-vero-template.hf.space/health`

**Key Files:**
- `src/lib/templateService.js` - API calls
- `src/pages/dashboard/TemplateGenerator.jsx` - Generation form
- `src/hooks/useTemplates.js` - Template data

**Support:**
- Backend logs: Hugging Face Space
- Frontend logs: Browser console
- Network: Browser DevTools Network tab

---

**Last Updated:** Template Backend Integration v1.0
**Status:** ✅ Ready for Testing