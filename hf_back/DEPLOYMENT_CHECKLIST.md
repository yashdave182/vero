# Hugging Face Deployment Checklist

## 📋 Pre-Deployment Checklist

### ✅ 1. Get Your Gemini API Key
- [ ] Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] Sign in with your Google account
- [ ] Click "Create API Key"
- [ ] Copy and save your API key securely
- [ ] Test the API key locally first

### ✅ 2. Verify Files
- [ ] `app.py` - Main Flask application
- [ ] `Dockerfile` - Docker configuration
- [ ] `requirements.txt` - Python dependencies
- [ ] `.env.example` - Environment variable template
- [ ] `README.md` - Documentation
- [ ] `utils/gemini_client.py` - AI client
- [ ] `utils/docx_generator.py` - Word document generator
- [ ] `utils/pdf_generator.py` - PDF generator
- [ ] `.gitignore` - Git ignore rules

### ✅ 3. Local Testing (Recommended)
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variable
export GEMINI_API_KEY=your_api_key_here

# Run locally
python app.py

# Test health endpoint
curl http://localhost:7860/health
```

### ✅ 4. Docker Testing (Optional but Recommended)
```bash
# Build image
docker build -t vero-templates .

# Run container
docker run -p 7860:7860 -e GEMINI_API_KEY=your_key vero-templates

# Test
curl http://localhost:7860/health
```

---

## 🚀 Deployment Steps

### Step 1: Create Hugging Face Account
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up or log in
3. Verify your email address

### Step 2: Create New Space
1. Click your profile → **"New Space"**
2. Fill in details:
   - **Owner**: Your username
   - **Space name**: `vero-template-generator` (or your choice)
   - **License**: Apache 2.0
   - **Select the Space SDK**: **Docker**
   - **Space hardware**: CPU basic (free tier is sufficient)
   - **Space visibility**: Public or Private
3. Click **"Create Space"**

### Step 3: Upload Files

#### Option A: Using Git (Recommended)
```bash
# Clone the repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/vero-template-generator
cd vero-template-generator

# Copy all backend files
cp -r /path/to/vero_startup/hf_back/* .

# Commit and push
git add .
git commit -m "Initial deployment"
git push
```

#### Option B: Using Web Interface
1. Go to your Space's "Files" tab
2. Click "Add file" → "Upload files"
3. Upload all files from `hf_back/` folder:
   - `app.py`
   - `Dockerfile`
   - `requirements.txt`
   - `README.md`
   - Create `utils/` folder and upload:
     - `gemini_client.py`
     - `docx_generator.py`
     - `pdf_generator.py`
4. Click "Commit changes to main"

### Step 4: Configure Secrets
1. Go to Space **Settings** (gear icon)
2. Scroll to **"Repository secrets"**
3. Click **"New secret"**
4. Add your API key:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your actual Gemini API key
5. Click **"Add secret"**

### Step 5: Wait for Build
1. Go to **"App"** tab
2. Watch the build logs (should take 3-5 minutes)
3. Look for: "Running on http://0.0.0.0:7860"
4. Space should show "Running" status

### Step 6: Test Your Deployment
1. Your Space URL: `https://YOUR_USERNAME-vero-template-generator.hf.space`
2. Test health endpoint:
   ```bash
   curl https://YOUR_USERNAME-vero-template-generator.hf.space/health
   ```
3. Expected response:
   ```json
   {
     "status": "healthy",
     "service": "Vero Template Generator",
     "version": "1.0.0"
   }
   ```

---

## 🧪 Testing Your Deployed API

### Test 1: Health Check
```bash
curl https://YOUR_SPACE_URL/health
```

### Test 2: Generate Simple Resume
```bash
curl -X POST https://YOUR_SPACE_URL/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "personal_info": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "summary": "Test summary",
    "skills": ["Python", "JavaScript"],
    "enhance_with_ai": false
  }' \
  --output test_resume.docx
```

### Test 3: Enhance Description
```bash
curl -X POST https://YOUR_SPACE_URL/enhance-description \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I worked on a web project",
    "context": "resume",
    "role": "Developer"
  }'
```

---

## 🔧 Troubleshooting

### ❌ Build Failed

**Check Dockerfile:**
- Ensure all file paths are correct
- Verify requirements.txt is complete
- Check Python version compatibility

**Solution:**
1. Review build logs in Space
2. Fix errors in your files
3. Commit and push changes
4. Build will restart automatically

### ❌ "GEMINI_API_KEY not found"

**Cause:** Secret not configured properly

**Solution:**
1. Go to Space Settings → Repository secrets
2. Verify secret name is exactly `GEMINI_API_KEY`
3. Re-enter the API key
4. Restart the Space (Settings → Factory reboot)

### ❌ Space Stuck in "Building"

**Possible Causes:**
- Large dependencies taking time
- Network issues
- Docker cache issues

**Solution:**
1. Wait 5-10 minutes (initial build can be slow)
2. If still stuck, go to Settings → Factory reboot
3. Check Community tab for similar issues

### ❌ "Module not found" Error

**Cause:** Missing dependency in requirements.txt

**Solution:**
1. Check which module is missing from error logs
2. Add it to `requirements.txt`
3. Commit and push
4. Build will restart

### ❌ API Returns 500 Error

**Debugging Steps:**
1. Check Space logs (App tab → "Logs" button)
2. Look for Python traceback
3. Common issues:
   - Invalid API key
   - Gemini API quota exceeded
   - Invalid request format

**Solution:**
- Fix the specific error shown in logs
- Test locally first with same request
- Verify API key is working

### ❌ Slow Response Times

**Causes:**
- Free tier CPU limitations
- Complex AI generation
- Large documents

**Solutions:**
1. Upgrade to CPU upgrade tier ($0.03/hour)
2. Reduce AI enhancement complexity
3. Implement caching for repeated requests

---

## 🎯 Post-Deployment Tasks

### ✅ 1. Save Your Space URL
```
https://YOUR_USERNAME-vero-template-generator.hf.space
```

### ✅ 2. Update Frontend Configuration
In your frontend (`vero_startup/src`), update the API base URL:

```javascript
// Create or update: src/lib/templateApiService.js
const API_BASE_URL = "https://YOUR_USERNAME-vero-template-generator.hf.space";
```

### ✅ 3. Document Your Endpoints
Save this for your frontend developers:
- Health: `GET /health`
- Resume: `POST /generate-resume`
- Cover Letter: `POST /generate-cover-letter`
- Proposal: `POST /generate-proposal`
- Invoice: `POST /generate-invoice`
- Contract: `POST /generate-contract`
- Portfolio PDF: `POST /generate-portfolio-pdf`

### ✅ 4. Monitor Usage
- Check Space analytics regularly
- Monitor Gemini API usage in Google AI Studio
- Set up error alerts if needed

### ✅ 5. Backup Configuration
Save these important values:
- Space URL
- Gemini API key (in secure location)
- Any custom configurations

---

## 📊 Performance Optimization

### For Production Use

1. **Upgrade Space Hardware**
   - Settings → Change hardware
   - CPU upgrade: Better performance
   - GPU: Not needed for this app

2. **Enable Caching**
   ```python
   # Add to app.py
   from flask_caching import Cache
   cache = Cache(app, config={'CACHE_TYPE': 'simple'})
   ```

3. **Implement Rate Limiting**
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app, key_func=get_remote_address)
   ```

4. **Add Request Queue**
   - Use Celery for async processing
   - Implement job status tracking

---

## 🔒 Security Best Practices

### ✅ 1. API Key Security
- [x] Never commit API keys to Git
- [x] Use Hugging Face Secrets
- [x] Rotate keys regularly
- [x] Monitor API usage for anomalies

### ✅ 2. Input Validation
- [x] Validate all request data
- [x] Sanitize user inputs
- [x] Set file size limits
- [x] Implement rate limiting

### ✅ 3. CORS Configuration
For production, restrict origins:
```python
# In app.py
CORS(app, origins=["https://yourdomain.com"])
```

### ✅ 4. Error Handling
- [x] Never expose internal errors to users
- [x] Log errors securely
- [x] Return generic error messages

---

## 📱 Frontend Integration

### Create API Service File

```javascript
// src/lib/templateApiService.js
const API_BASE_URL = "https://YOUR_SPACE_URL";

export const generateResume = async (data) => {
  const response = await fetch(`${API_BASE_URL}/generate-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate resume');
  }
  
  const blob = await response.blob();
  return blob;
};

export const generateCoverLetter = async (data) => {
  const response = await fetch(`${API_BASE_URL}/generate-cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const blob = await response.blob();
  return blob;
};

// Add similar functions for other endpoints...
```

---

## 🎉 Success Checklist

- [ ] Space is deployed and running
- [ ] Health endpoint returns 200 OK
- [ ] Test resume generation works
- [ ] Test cover letter generation works
- [ ] All endpoints tested successfully
- [ ] Frontend can connect to backend
- [ ] API key is secure and working
- [ ] Documentation is updated
- [ ] Team has access to Space URL
- [ ] Monitoring is set up

---

## 🆘 Getting Help

### Hugging Face Resources
- [Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- [Docker Spaces Guide](https://huggingface.co/docs/hub/spaces-sdks-docker)
- [Community Forums](https://discuss.huggingface.co/)

### Gemini AI Resources
- [Gemini API Docs](https://ai.google.dev/docs)
- [Python SDK Guide](https://github.com/google/generative-ai-python)
- [API Pricing](https://ai.google.dev/pricing)

### Common Issues Database
- Check Space logs first
- Search Hugging Face forums
- Review GitHub issues for similar problems

---

## 📈 Monitoring & Maintenance

### Daily Checks
- [ ] Space status is "Running"
- [ ] No error spikes in logs
- [ ] Response times are normal

### Weekly Checks
- [ ] Review Space analytics
- [ ] Check Gemini API usage
- [ ] Update dependencies if needed

### Monthly Checks
- [ ] Review and optimize costs
- [ ] Update documentation
- [ ] Plan feature improvements

---

## 🚀 Next Steps

After successful deployment:

1. **Integrate with Frontend**
   - Update API URLs
   - Test all template features
   - Handle errors gracefully

2. **Add Advanced Features**
   - Batch processing
   - Template customization
   - Webhook notifications

3. **Scale If Needed**
   - Monitor traffic
   - Upgrade hardware tier
   - Implement caching

4. **Gather Feedback**
   - Test with real users
   - Collect feature requests
   - Iterate and improve

---

**✨ Congratulations! Your template generator backend is now live! ✨**

**Your API URL:**
```
https://YOUR_USERNAME-vero-template-generator.hf.space
```

**Share this URL with your frontend team and start generating amazing documents!** 🎊