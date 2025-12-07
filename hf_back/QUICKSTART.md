# Quick Start Guide - Deploy in 10 Minutes! ⚡

Get your template generator backend live on Hugging Face in 10 minutes or less!

---

## ⏱️ 10-Minute Deployment

### Step 1: Get Gemini API Key (2 minutes)

1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key (starts with `AIza...`)
4. Save it somewhere safe

### Step 2: Create Hugging Face Space (3 minutes)

1. Go to https://huggingface.co/new-space
2. Fill in:
   - **Space name**: `vero-template-generator`
   - **License**: Apache 2.0
   - **SDK**: Docker
   - **Hardware**: CPU basic (free)
3. Click "Create Space"

### Step 3: Upload Files (3 minutes)

**Option A: Via Git (Recommended)**
```bash
# Clone your new space
git clone https://huggingface.co/spaces/YOUR_USERNAME/vero-template-generator
cd vero-template-generator

# Copy all files from hf_back/
cp -r /path/to/vero_startup/hf_back/* .

# Push to HF
git add .
git commit -m "Initial deployment"
git push
```

**Option B: Via Web UI**
1. Go to "Files" tab in your Space
2. Upload these files:
   - `app.py`
   - `Dockerfile`
   - `requirements.txt`
   - `README.md`
3. Create `utils` folder
4. Upload inside `utils/`:
   - `gemini_client.py`
   - `docx_generator.py`
   - `pdf_generator.py`

### Step 4: Add API Key Secret (1 minute)

1. Go to Space Settings (gear icon)
2. Scroll to "Repository secrets"
3. Click "New secret"
4. Name: `GEMINI_API_KEY`
5. Value: Your Gemini API key from Step 1
6. Click "Add secret"

### Step 5: Wait for Build (1 minute)

1. Go to "App" tab
2. Watch the build logs
3. Wait for "Running" status
4. You'll see: "Running on http://0.0.0.0:7860"

---

## ✅ Test Your Deployment

### Quick Health Check
```bash
curl https://YOUR_USERNAME-vero-template-generator.hf.space/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Vero Template Generator",
  "version": "1.0.0"
}
```

### Test Resume Generation
```bash
curl -X POST https://YOUR_USERNAME-vero-template-generator.hf.space/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "personal_info": {"name": "Test User", "email": "test@example.com"},
    "summary": "Test summary",
    "skills": ["Python", "JavaScript"],
    "enhance_with_ai": false
  }' \
  --output test_resume.docx
```

If you get a `.docx` file, **you're live!** 🎉

---

## 🔗 Your API URLs

Replace `YOUR_USERNAME` with your Hugging Face username:

**Base URL:**
```
https://YOUR_USERNAME-vero-template-generator.hf.space
```

**Endpoints:**
- Health: `GET /health`
- Resume: `POST /generate-resume`
- Cover Letter: `POST /generate-cover-letter`
- Proposal: `POST /generate-proposal`
- Invoice: `POST /generate-invoice`
- Contract: `POST /generate-contract`
- Portfolio PDF: `POST /generate-portfolio-pdf`

---

## 🎯 Next: Integrate with Frontend

### 1. Create API Service

Create `vero_startup/src/lib/templateApiService.js`:

```javascript
const API_BASE_URL = "https://YOUR_USERNAME-vero-template-generator.hf.space";

export const generateResume = async (data) => {
  const response = await fetch(`${API_BASE_URL}/generate-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate resume');
  }
  
  const blob = await response.blob();
  const filename = response.headers.get('content-disposition')
    ?.split('filename=')[1]
    ?.replace(/"/g, '') || 'resume.docx';
    
  return { blob, filename };
};

export const generateCoverLetter = async (data) => {
  const response = await fetch(`${API_BASE_URL}/generate-cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const blob = await response.blob();
  const filename = response.headers.get('content-disposition')
    ?.split('filename=')[1]
    ?.replace(/"/g, '') || 'cover_letter.docx';
    
  return { blob, filename };
};

// Add other functions similarly...

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

### 2. Update Template Pages

Example for Resume Generator:

```javascript
import { generateResume, downloadBlob } from '../../lib/templateApiService';

const handleGenerateResume = async () => {
  setIsGenerating(true);
  try {
    const data = {
      personal_info: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        // ... more fields
      },
      summary: formData.summary,
      experience: formData.experience,
      education: formData.education,
      skills: formData.skills,
      enhance_with_ai: aiEnhance
    };
    
    const { blob, filename } = await generateResume(data);
    downloadBlob(blob, filename);
    
    showSuccessMessage('Resume generated successfully!');
  } catch (error) {
    showErrorMessage(error.message);
  } finally {
    setIsGenerating(false);
  }
};
```

---

## 🐛 Troubleshooting

### Space won't start?
- Check build logs for errors
- Verify GEMINI_API_KEY is set in secrets
- Ensure all files are uploaded correctly

### API returns 500 error?
- Check Space logs (App tab → Logs button)
- Verify your Gemini API key is valid
- Test the key at https://makersuite.google.com

### Slow responses?
- Normal for free tier (5-10 seconds)
- Upgrade to CPU upgrade tier for faster performance
- Consider caching for repeated requests

---

## 💰 Cost Breakdown

**Free Tier (Good for Testing):**
- HF Space: $0/month
- Gemini API: Free (2M tokens/month)
- **Total: $0/month**

**Production (Recommended):**
- HF Space CPU Upgrade: $21.60/month
- Gemini API: ~$20-50/month (depends on usage)
- **Total: ~$40-70/month**

---

## 📊 Monitoring

### Check Space Health
```bash
# Automated monitoring script
watch -n 60 'curl -s https://YOUR_SPACE_URL/health | jq'
```

### View Logs
1. Go to your Space
2. Click "Logs" button
3. Monitor errors and requests

### Monitor API Usage
1. Go to https://makersuite.google.com
2. Check "API usage" section
3. Set up usage alerts

---

## 🎓 Learning Resources

### If you're new to:

**Hugging Face Spaces:**
- https://huggingface.co/docs/hub/spaces

**Gemini API:**
- https://ai.google.dev/tutorials/python_quickstart

**Flask:**
- https://flask.palletsprojects.com/quickstart/

**Docker:**
- https://docs.docker.com/get-started/

---

## 🚀 You're Done!

Your backend is now live and ready to generate documents!

**Your Space URL:**
```
https://YOUR_USERNAME-vero-template-generator.hf.space
```

### Share with your team:
- Backend developers: Share the URL and API docs
- Frontend developers: Share the templateApiService.js code
- Designers: Share example outputs

---

## 📝 Checklist

- [ ] Gemini API key obtained
- [ ] Hugging Face Space created
- [ ] Files uploaded
- [ ] Secret configured
- [ ] Build completed successfully
- [ ] Health endpoint tested
- [ ] Resume generation tested
- [ ] API URL saved
- [ ] Frontend service created
- [ ] Team notified

---

## 🎉 Success!

You now have a fully functional AI-powered document generation backend!

**What's next?**
1. Integrate with your frontend
2. Test all template types
3. Gather user feedback
4. Monitor usage and performance
5. Consider upgrading for production traffic

**Need help?** Check `README.md` and `DEPLOYMENT_CHECKLIST.md` for detailed guides.

---

**Happy generating! 📄✨**