# Resume Generation Troubleshooting Guide

## Issue: Resume Only Shows Header and Skills

If your generated resume only contains:
- Name
- Contact info
- Skills (basic list)
- **Missing**: Bio/Summary, Projects with descriptions, Experience, Education

This guide will help you diagnose and fix the problem.

---

## Step 1: Check Your Portfolio Data

1. Go to **Portfolio Builder** in your dashboard
2. Make sure you have filled in:
   - ✅ **Name** (at the top)
   - ✅ **Title/Role** (e.g., "Full Stack Developer")
   - ✅ **Bio** (professional summary - this becomes your resume summary)
   - ✅ **Skills** (add at least 3-5 skills)
   - ✅ **Projects** (at least 1 project with):
     - Project Name
     - **Description** (this is critical!)
     - Technologies/Tech Stack
     - Live URL (optional)
     - GitHub URL (optional)

3. Click **Save Portfolio** after making changes

### Important: Projects MUST have descriptions!
If a project has no description, it won't appear in the resume or will show as empty.

---

## Step 2: Use the Data Preview Feature

1. Go to **Templates** → **Resume Generator**
2. Click the **"🔍 Show Data Preview"** button
3. Review what data will be sent:
   - Check if `projects` array has your projects
   - Verify each project has a `description` field
   - Confirm `bio` is not empty
   - Ensure `skills` array contains your skills

### Example of correct project data:
```json
{
  "id": "1234567890",
  "name": "E-Commerce Platform",
  "description": "Built a full-stack e-commerce application with user authentication and payment processing",
  "tech": ["React", "Node.js", "MongoDB"],
  "liveUrl": "https://example.com",
  "githubUrl": "https://github.com/user/project"
}
```

### Example of INCORRECT project data (won't appear):
```json
{
  "id": "1234567890",
  "name": "My Project",
  "description": "",  // ❌ EMPTY - This project won't show up!
  "tech": [],
  "liveUrl": "",
  "githubUrl": ""
}
```

---

## Step 3: Check AI Enhancement Setting

The **"Enhance with AI"** toggle can affect your resume:

### ✅ AI Enhancement OFF (Recommended for testing)
- Uses your exact text as-is
- Faster generation
- Good for seeing if data is flowing correctly

### ⚡ AI Enhancement ON
- Uses Gemini AI to improve descriptions
- Takes longer to generate
- May skip sections if descriptions are too short or vague
- Requires valid GEMINI_API_KEY on backend

**Recommendation:** Turn OFF AI enhancement first to test if your data appears. Once confirmed, you can turn it ON for polished content.

---

## Step 4: Check Browser Console

1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Click **"Generate Document"**
4. Look for debug logs:

```
=== RESUME GENERATION DEBUG ===
Profile Data received: {...}
Payload being sent to backend: {...}
Number of projects: 1
Projects data: [...]
Skills data: [...]
Summary/Bio: "..."
AI Enhancement enabled: true
================================
```

### What to check:
- `Number of projects` should match your portfolio
- `Projects data` should show your project objects
- `Summary/Bio` should not be empty
- Each project should have a `description`

---

## Step 5: Check Backend Logs

If frontend shows correct data but resume is still incomplete:

1. Open your backend terminal (where `python app.py` is running)
2. Generate a resume
3. Look for debug output:

```
================================================================================
RESUME GENERATION REQUEST
================================================================================
Personal Info: {'name': 'Yash Dave', ...}
Summary/Bio: Your bio text here
Skills: ['ai', 'ml', 'react', 'js', 'html']
Projects count: 1
Projects data: [{'name': 'Project Name', 'description': '...', ...}]
...
================================================================================
```

### Common Issues:

#### Issue: `Projects count: 0` (but you have projects)
**Fix:** Projects aren't being sent from frontend. Check Step 2.

#### Issue: `Projects data: [{'name': 'fucku', 'description': '', ...}]`
**Fix:** Project has no description. Add description in Portfolio Builder.

#### Issue: `Summary/Bio: EMPTY`
**Fix:** Bio field is empty. Add bio in Portfolio Builder.

#### Issue: AI enhancement errors
**Fix:** Check GEMINI_API_KEY is set correctly in backend environment.

---

## Step 6: Common Solutions

### Solution 1: Re-enter Portfolio Data
Sometimes data doesn't save correctly. Try:
1. Go to Portfolio Builder
2. Re-enter your bio
3. Re-enter project descriptions (make them at least 20 characters)
4. Click **Save Portfolio**
5. Wait for success message
6. Try generating resume again

### Solution 2: Turn Off AI Enhancement
1. In Resume Generator, uncheck **"Enhance with AI"**
2. This bypasses AI processing and uses your exact text
3. If resume now works, the issue was with AI enhancement
4. You can turn it back on later

### Solution 3: Clear and Restart
1. Close all browser tabs with the app
2. Restart backend: `Ctrl+C` then `python app.py`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Login again
5. Try generating resume

### Solution 4: Check Data Types
Make sure in Portfolio Builder:
- Skills is an **array** (not a string)
- Projects is an **array** (not empty)
- Each project has `tech` as an **array** (not a string)

---

## Expected Resume Sections

A complete resume should include:

1. ✅ **Header** (Name, Email, Phone, Location, Links)
2. ✅ **Professional Summary** (from Bio field)
3. ✅ **Skills** (from Skills array)
4. ✅ **Projects** (from Projects array - with descriptions!)
5. ⚠️ **Experience** (optional - from Profile)
6. ⚠️ **Education** (optional - from Profile)
7. ⚠️ **Certifications** (optional - from Profile)

If sections 1-4 are present, your resume generation is working correctly!

---

## Still Not Working?

### Debug Checklist:
- [ ] Portfolio has bio filled in
- [ ] Portfolio has at least 1 project with description
- [ ] Portfolio has been saved (green success message)
- [ ] Data Preview shows correct data
- [ ] AI Enhancement is OFF (for testing)
- [ ] Browser console shows no errors
- [ ] Backend is running and shows no errors
- [ ] GEMINI_API_KEY is set (if using AI enhancement)

### Get More Help:
Share the following information:
1. Screenshot of Data Preview
2. Browser console logs (the debug section)
3. Backend terminal logs (the debug section)
4. Generated resume file
5. Expected vs actual content

---

## Technical Details

### Data Flow:
```
Portfolio Builder (Firebase)
    ↓
TemplateGenerator.jsx (loads portfolio)
    ↓
templateService.js (builds payload)
    ↓
Backend /generate-resume endpoint
    ↓
Gemini AI (if enhancement enabled)
    ↓
docx_generator.py
    ↓
Resume.docx file
```

### Key Files:
- **Frontend:** `src/pages/dashboard/PortfolioBuilder.jsx`
- **Frontend:** `src/pages/dashboard/TemplateGenerator.jsx`
- **Frontend:** `src/lib/templateService.js`
- **Backend:** `hf_back/app.py` (line 65: `/generate-resume`)
- **Backend:** `hf_back/utils/docx_generator.py` (line 74: `generate_resume`)
- **Backend:** `hf_back/utils/gemini_client.py` (line 272: `enhance_portfolio_description`)

### Field Mapping:
| Portfolio Field | Resume Section |
|----------------|----------------|
| `name` | Header (Name) |
| `email` | Header (Contact) |
| `phone` | Header (Contact) |
| `bio` | Professional Summary |
| `skills[]` | Skills Section |
| `projects[].name` | Project Title |
| `projects[].description` | Project Description |
| `projects[].tech[]` | Technologies |
| `socials.linkedin` | Header (LinkedIn) |
| `socials.website` | Header (Portfolio) |

---

## Success Criteria

Your resume generation is working when:
1. ✅ Generated DOCX file opens without errors
2. ✅ Contains your name and contact info
3. ✅ Has a Professional Summary section with your bio
4. ✅ Lists all your skills
5. ✅ Shows all projects with full descriptions
6. ✅ Each project lists technologies used
7. ✅ File size is > 15 KB (not just a header)

---

**Last Updated:** 2024
**Version:** 1.0.0