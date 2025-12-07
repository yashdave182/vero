# Vero Template Generator Backend

**AI-Powered Document Generation API**

This backend service provides powerful document generation capabilities using Google's Gemini 2.5 Flash AI model. Built with Flask and designed to be deployed on Hugging Face Spaces.

---

## 🚀 Features

### Document Templates
- ✅ **Resume Generator** - Professional resumes with AI-enhanced descriptions
- ✅ **Cover Letter Generator** - Personalized cover letters for job applications
- ✅ **Proposal Builder** - Business proposals with structured formatting
- ✅ **Invoice Template** - Professional invoices with calculations
- ✅ **Contract Generator** - Legal contracts with AI-assisted terms
- ✅ **Portfolio PDF Export** - Beautiful portfolio PDFs

### AI Capabilities
- 🤖 **Content Enhancement** - Improve writing quality and impact
- 🤖 **Smart Suggestions** - Context-aware content generation
- 🤖 **Multiple Tones** - Formal, creative, or technical styles
- 🤖 **LaTeX Support** - Handle mathematical equations
- 🤖 **Professional Formatting** - Industry-standard layouts

### Export Formats
- 📄 **Word Documents (.docx)** - All templates except portfolio
- 📄 **PDF Documents** - Portfolio export with beautiful formatting

---

## 📋 Prerequisites

- Python 3.11+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))
- Docker (for containerized deployment)
- Hugging Face account (for hosting)

---

## 🛠️ Installation

### Local Development

1. **Clone the repository**
```bash
cd vero_startup/hf_back
```

2. **Create virtual environment**
```bash
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here
```

5. **Run the application**
```bash
python app.py
```

The server will start on `http://localhost:7860`

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t vero-template-generator .
```

### Run Docker Container

```bash
docker run -p 7860:7860 \
  -e GEMINI_API_KEY=your_api_key \
  vero-template-generator
```

---

## ☁️ Hugging Face Spaces Deployment

### Step 1: Create a New Space

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Choose:
   - **Space name**: `vero-template-generator` (or your preferred name)
   - **License**: Apache 2.0
   - **Space SDK**: Docker
   - **Space hardware**: CPU basic (free tier works!)

### Step 2: Upload Files

Upload all files from this directory:
```
hf_back/
├── app.py
├── Dockerfile
├── requirements.txt
├── .env.example
├── utils/
│   ├── gemini_client.py
│   ├── docx_generator.py
│   └── pdf_generator.py
└── README.md
```

### Step 3: Configure Secrets

1. Go to your Space **Settings** → **Repository secrets**
2. Add secret:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key

### Step 4: Deploy

The Space will automatically build and deploy. Wait for the build to complete (3-5 minutes).

### Step 5: Test

Visit your Space URL:
```
https://huggingface.co/spaces/YOUR_USERNAME/vero-template-generator
```

Test the health endpoint:
```
https://YOUR_USERNAME-vero-template-generator.hf.space/health
```

---

## 📡 API Endpoints

### Health Check
```http
GET /health
```

Returns service status and available endpoints.

### Generate Resume
```http
POST /generate-resume
Content-Type: application/json

{
  "personal_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, NY",
    "linkedin": "linkedin.com/in/johndoe",
    "website": "johndoe.com"
  },
  "summary": "Experienced full-stack developer...",
  "experience": [
    {
      "title": "Senior Developer",
      "company": "Tech Corp",
      "location": "New York, NY",
      "start_date": "Jan 2020",
      "end_date": "Present",
      "responsibilities": [
        "Led team of 5 developers",
        "Architected microservices platform"
      ]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "school": "MIT",
      "graduation_date": "May 2019",
      "gpa": "3.8"
    }
  ],
  "skills": ["Python", "JavaScript", "React", "AWS"],
  "enhance_with_ai": true
}
```

**Response**: Word document (.docx)

### Generate Cover Letter
```http
POST /generate-cover-letter
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "position": "Senior Developer",
  "skills": ["Python", "React", "AWS"],
  "experience": "5 years of full-stack development",
  "tone": "formal",
  "generate_with_ai": true
}
```

**Response**: Word document (.docx)

### Generate Proposal
```http
POST /generate-proposal
Content-Type: application/json

{
  "title": "Web Development Proposal",
  "client_name": "ABC Company",
  "prepared_by": "Your Company",
  "project_title": "E-commerce Platform",
  "scope": "Develop full-featured e-commerce website",
  "deliverables": ["Website", "Admin Panel", "Mobile App"],
  "timeline": "3 months",
  "budget": "$50,000",
  "generate_with_ai": true
}
```

**Response**: Word document (.docx)

### Generate Invoice
```http
POST /generate-invoice
Content-Type: application/json

{
  "invoice_number": "INV-001",
  "invoice_date": "2024-01-15",
  "due_date": "2024-02-15",
  "from_info": {
    "name": "Your Business",
    "address": "123 Business St",
    "email": "billing@business.com",
    "phone": "+1234567890"
  },
  "to_info": {
    "name": "Client Name",
    "address": "456 Client Ave",
    "email": "client@example.com"
  },
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 40,
      "rate": 100,
      "amount": 4000
    }
  ],
  "tax_rate": 8.5,
  "notes": "Thank you for your business"
}
```

**Response**: Word document (.docx)

### Generate Contract
```http
POST /generate-contract
Content-Type: application/json

{
  "contract_type": "Freelance Service Agreement",
  "party1": {
    "name": "Service Provider Inc",
    "address": "123 Provider St"
  },
  "party2": {
    "name": "Client Company",
    "address": "456 Client Ave"
  },
  "effective_date": "January 20, 2024",
  "custom_terms": "Net 30 payment terms, weekly sprints",
  "generate_with_ai": true
}
```

**Response**: Word document (.docx)

### Generate Portfolio PDF
```http
POST /generate-portfolio-pdf
Content-Type: application/json

{
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "Passionate developer with 5 years experience...",
  "contact": {
    "email": "john@example.com",
    "phone": "+1234567890",
    "website": "johndoe.com",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "skills": {
    "Frontend": ["React", "Vue.js", "TypeScript"],
    "Backend": ["Node.js", "Python", "Go"],
    "Cloud": ["AWS", "Docker", "Kubernetes"]
  },
  "experience": [...],
  "projects": [...],
  "education": [...],
  "enhance_with_ai": false
}
```

**Response**: PDF document

### Enhance Description (Utility)
```http
POST /enhance-description
Content-Type: application/json

{
  "text": "I worked on a project using React",
  "context": "resume",
  "role": "Frontend Developer"
}
```

**Response**:
```json
{
  "original": "I worked on a project using React",
  "enhanced": "Architected and developed a modern web application using React, implementing responsive design patterns and state management solutions that improved user engagement by 40%",
  "success": true
}
```

### Enhance Skills Summary (Utility)
```http
POST /enhance-skills-summary
Content-Type: application/json

{
  "skills": ["Python", "React", "AWS", "Docker"],
  "experience_years": 5
}
```

**Response**:
```json
{
  "skills": ["Python", "React", "AWS", "Docker"],
  "summary": "Results-driven software engineer with 5 years of expertise in full-stack development, cloud infrastructure, and containerization. Proven track record in building scalable applications using Python and React, with deep knowledge of AWS cloud services and Docker containerization strategies.",
  "success": true
}
```

---

## 🧪 Testing

### Using cURL

**Health Check:**
```bash
curl https://your-space.hf.space/health
```

**Generate Resume:**
```bash
curl -X POST https://your-space.hf.space/generate-resume \
  -H "Content-Type: application/json" \
  -d @test_resume.json \
  --output resume.docx
```

### Using Postman

1. Import the provided Postman collection (if available)
2. Set the base URL to your Hugging Face Space URL
3. Test each endpoint individually

### Using Python

```python
import requests

# Generate resume
url = "https://your-space.hf.space/generate-resume"
data = {
    "personal_info": {
        "name": "John Doe",
        "email": "john@example.com"
    },
    "summary": "Professional summary",
    "skills": ["Python", "JavaScript"],
    "enhance_with_ai": True
}

response = requests.post(url, json=data)
with open("resume.docx", "wb") as f:
    f.write(response.content)
```

---

## 🔒 Security

### API Key Protection
- ✅ API keys stored in environment variables
- ✅ Never commit `.env` to version control
- ✅ Use Hugging Face Secrets for deployment

### Input Validation
- ✅ Request data validation
- ✅ File size limits (16MB max)
- ✅ Content-type checking
- ✅ Error handling for all endpoints

### CORS Configuration
- ✅ Configurable allowed origins
- ✅ Default: Allow all (development)
- ✅ Production: Set specific origins in `.env`

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY not found"
**Solution**: Ensure your API key is set in environment variables or Hugging Face Secrets.

### Issue: "Module not found" errors
**Solution**: Rebuild the container or reinstall dependencies:
```bash
pip install -r requirements.txt --force-reinstall
```

### Issue: PDF generation fails
**Solution**: Ensure system dependencies are installed (handled by Dockerfile):
```bash
apt-get install libpango-1.0-0 libharfbuzz0b libpangoft2-1.0-0
```

### Issue: Timeout on large documents
**Solution**: Increase gunicorn timeout in Dockerfile:
```dockerfile
CMD gunicorn --timeout 300 --bind 0.0.0.0:7860 app:app
```

### Issue: Space keeps restarting
**Solution**: Check logs in Hugging Face Space settings. Common causes:
- Invalid API key
- Missing dependencies
- Port conflicts (ensure using 7860)

---

## 📊 Performance

### Response Times (typical)
- Resume generation: 5-10 seconds (with AI enhancement)
- Cover letter: 3-8 seconds
- Proposal: 5-12 seconds
- Invoice: 1-2 seconds (no AI)
- Contract: 4-10 seconds
- Portfolio PDF: 2-5 seconds

### Resource Usage
- **CPU**: Low to medium (AI calls are API-based)
- **Memory**: ~500MB typical, ~1GB peak
- **Storage**: Minimal (documents generated in memory)

### Optimization Tips
1. Enable response caching for repeated requests
2. Use async/await for concurrent AI calls
3. Implement request queuing for high traffic
4. Consider upgrading to CPU upgrade tier for better performance

---

## 🔄 Updates & Maintenance

### Updating Dependencies
```bash
pip install --upgrade -r requirements.txt
pip freeze > requirements.txt
```

### Updating Gemini Client
Check for new Gemini API versions:
```bash
pip install --upgrade google-generativeai
```

### Monitoring
- Check Hugging Face Space logs regularly
- Monitor API usage in Google AI Studio
- Set up alerts for errors or downtime

---

## 📝 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `PORT` | No | 7860 | Server port |
| `FLASK_ENV` | No | production | Flask environment |
| `MAX_CONTENT_LENGTH` | No | 16777216 | Max upload size (bytes) |
| `LOG_LEVEL` | No | INFO | Logging level |

---

## 🤝 Contributing

### Adding New Templates

1. Create new generator function in `utils/docx_generator.py`
2. Add corresponding endpoint in `app.py`
3. Update Gemini prompts in `utils/gemini_client.py`
4. Test thoroughly
5. Update documentation

### Code Style
- Follow PEP 8
- Use type hints
- Add docstrings to all functions
- Keep functions focused and small

---

## 📄 License

This project is part of the Vero startup platform.

---

## 🆘 Support

### Getting Help
- Check the [Troubleshooting](#-troubleshooting) section
- Review Hugging Face Space logs
- Test locally first before deploying

### Contact
- Open an issue in the repository
- Check Hugging Face Space community discussions

---

## 🎯 Roadmap

### Planned Features
- [ ] Batch document generation
- [ ] Template customization API
- [ ] Webhook support for async generation
- [ ] Multiple AI model support (Claude, GPT)
- [ ] Document versioning
- [ ] Collaborative editing
- [ ] Real-time preview
- [ ] Advanced formatting options
- [ ] Custom branding/themes
- [ ] Multi-language support

---

## 🏆 Credits

**Built with:**
- Flask - Web framework
- Google Gemini AI - AI content generation
- python-docx - Word document generation
- ReportLab - PDF generation
- Hugging Face Spaces - Deployment platform

---

## 📈 Usage Stats

Once deployed, monitor your Space usage:
1. Go to Hugging Face Space settings
2. Check "Analytics" tab
3. Monitor requests, errors, and performance

---

**🚀 Ready to deploy? Follow the [Hugging Face Deployment](#️-hugging-face-spaces-deployment) guide above!**