# Template Backend Integration Documentation

## Overview

The Verolabz application has been integrated with a Hugging Face-hosted template backend API for AI-powered document generation.

**Backend URL:** https://huggingface.co/spaces/omgy/vero_template  
**API Base URL:** https://omgy-vero-template.hf.space

## Architecture

### Data Flow
```
User selects template → Frontend (React) → Template Service → Hugging Face API → Generated Document → Download/Preview
```

### Components

1. **Template Service** (`src/lib/templateService.js`)
   - Handles all API communication
   - Provides helper functions for document generation
   - Manages error handling and fallbacks

2. **useTemplates Hook** (`src/hooks/useTemplates.js`)
   - Fetches templates from backend
   - Manages loading and error states
   - Provides filtering and categorization

3. **Templates Page** (`src/pages/dashboard/Templates.jsx`)
   - Displays available templates
   - Shows real-time API status
   - Handles offline/fallback mode

## Features

### ✅ Implemented

1. **Template Fetching**
   - Static template list with backend availability check
   - Fetch specific template by ID
   - Real-time API health checking

2. **Document Generation**
   - Resume generation (DOCX with AI enhancement)
   - Cover letter generation (DOCX with AI)
   - Proposal generation (DOCX with AI)
   - Invoice generation (DOCX)
   - Contract generation (DOCX with AI)
   - Portfolio PDF export (PDF with AI enhancement)

3. **AI Enhancement**
   - Enhance descriptions with AI
   - Generate skills summary
   - Improve resume bullet points
   - Generate cover letter content
   - Generate proposal content
   - Enhance contract terms

4. **Smart Fallback**
   - Offline mode with default templates
   - Graceful degradation when API unavailable
   - User-friendly error messages

5. **UI Enhancements**
   - Loading states
   - API status indicators
   - Category filtering
   - Responsive design
   - Direct file download

## API Endpoints

### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "Vero Template Generator",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": [
    "/generate-resume",
    "/generate-cover-letter",
    "/generate-proposal",
    "/generate-invoice",
    "/generate-contract",
    "/generate-portfolio-pdf",
    "/enhance-description",
    "/enhance-skills-summary"
  ]
}
```

### POST /generate-resume
Generate professional resume document.

**Request Body:**
```json
{
  "personal_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/johndoe",
    "website": "johndoe.com"
  },
  "summary": "Professional summary text",
  "experience": [
    {
      "title": "Senior Developer",
      "company": "Tech Corp",
      "location": "City, State",
      "start_date": "Jan 2020",
      "end_date": "Present",
      "responsibilities": ["Task 1", "Task 2"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "field": "Computer Science",
      "school": "University Name",
      "graduation_date": "May 2019",
      "gpa": "3.8",
      "honors": "Magna Cum Laude"
    }
  ],
  "skills": ["Python", "JavaScript", "React"],
  "certifications": [
    {
      "name": "AWS Certified",
      "issuer": "Amazon",
      "date": "2023"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Description",
      "technologies": ["Tech1", "Tech2"]
    }
  ],
  "enhance_with_ai": true
}
```

**Response:**
Returns DOCX file (binary) for download with filename: `{Name}_Resume.docx`

### POST /generate-cover-letter
Generate personalized cover letter.

**Request Body:**
```json
{
  "name": "John Doe",
  "address": "123 Main St, City, State",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date": "January 15, 2024",
  "company": "Tech Corp",
  "hiring_manager": "Jane Smith",
  "position": "Senior Developer",
  "skills": ["Python", "React", "AWS"],
  "experience": "5 years of full-stack development",
  "tone": "formal",
  "custom_content": "Optional pre-written content",
  "generate_with_ai": true
}
```

**Response:**
Returns DOCX file (binary) for download with filename: `{Name}_CoverLetter_{Company}.docx`

### POST /generate-proposal
Generate business proposal.

**Request Body:**
```json
{
  "title": "Web Development Proposal",
  "client_name": "ABC Company",
  "prepared_by": "Your Company Name",
  "date": "January 15, 2024",
  "project_title": "E-commerce Website",
  "scope": "Develop a full-featured e-commerce platform",
  "deliverables": ["Website", "Admin Panel", "Mobile App"],
  "timeline": "3 months",
  "budget": "$50,000",
  "generate_with_ai": true,
  "custom_content": "Optional pre-written proposal"
}
```

**Response:**
Returns DOCX file (binary) for download with filename: `Proposal_{Client}_{Project}.docx`

### POST /generate-invoice
Generate professional invoice.

**Request Body:**
```json
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
      "description": "Service/Product",
      "quantity": 1,
      "rate": 1000,
      "amount": 1000
    }
  ],
  "tax_rate": 8.5,
  "discount": 0,
  "notes": "Thank you for your business",
  "payment_instructions": "Payment via bank transfer"
}
```

**Response:**
Returns DOCX file (binary) for download with filename: `Invoice_{InvoiceNumber}.docx`

### POST /generate-contract
Generate legal contract.

**Request Body:**
```json
{
  "contract_type": "Freelance Service Agreement",
  "date": "January 15, 2024",
  "party1": {
    "name": "Service Provider",
    "address": "123 Provider St"
  },
  "party2": {
    "name": "Client Name",
    "address": "456 Client Ave"
  },
  "effective_date": "January 20, 2024",
  "expiration_date": "December 31, 2024",
  "custom_terms": "Net 30 payment terms",
  "generate_with_ai": true,
  "custom_content": "Optional pre-written terms"
}
```

**Response:**
Returns DOCX file (binary) for download with filename: `{ContractType}_Contract.docx`

### POST /generate-portfolio-pdf
Generate portfolio PDF export.

**Request Body:**
```json
{
  "name": "John Doe",
  "title": "Full Stack Developer",
  "bio": "Professional bio text",
  "contact": {
    "email": "john@example.com",
    "phone": "+1234567890",
    "website": "johndoe.com",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "skills": ["Python", "React", "AWS"],
  "experience": [...],
  "education": [...],
  "projects": [...],
  "certifications": [...],
  "enhance_with_ai": false
}
```

**Response:**
Returns PDF file (binary) for download with filename: `{Name}_Portfolio.pdf`

### POST /enhance-description
Enhance text description with AI.

**Request Body:**
```json
{
  "text": "Original text to enhance",
  "context": "resume/portfolio/proposal",
  "role": "Optional job role for context",
  "technologies": ["Optional", "tech", "stack"],
  "your_role": "Developer"
}
```

**Response:**
```json
{
  "original": "Original text...",
  "enhanced": "Enhanced text with AI improvements...",
  "success": true
}
```

### POST /enhance-skills-summary
Generate professional skills summary.

**Request Body:**
```json
{
  "skills": ["Python", "React", "AWS"],
  "experience_years": 5
}
```

**Response:**
```json
{
  "skills": ["Python", "React", "AWS"],
  "summary": "Professional summary highlighting key skills...",
  "success": true
}
```

## Usage Examples

### 1. Fetch All Templates

```javascript
import { useTemplates } from '../hooks/useTemplates';

function MyComponent() {
  const { templates, loading, error } = useTemplates();

  if (loading) return <p>Loading templates...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      {templates.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
```

### 2. Generate Resume

```javascript
import { generateResume, downloadBlob } from '../lib/templateService';

async function createResume(profileData) {
  const result = await generateResume({
    name: profileData.displayName,
    email: profileData.email,
    phone: profileData.phone,
    location: profileData.location,
    linkedin: profileData.socials?.linkedin,
    website: profileData.website,
    bio: profileData.bio,
    skills: profileData.skills,
    experience: profileData.experience,
    education: profileData.education,
    projects: profileData.projects,
    certifications: profileData.certifications,
    enhanceWithAI: true  // Enable AI enhancement
  });

  if (result.success) {
    // Download the generated DOCX file
    downloadBlob(result.blob, result.filename);
  } else {
    console.error('Error:', result.error);
  }
}
```

### 3. Generate Cover Letter with AI

```javascript
import { generateCoverLetter, downloadBlob } from '../lib/templateService';

async function createCoverLetter(data) {
  const result = await generateCoverLetter({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Tech Corp',
    position: 'Senior Developer',
    skills: ['Python', 'React', 'AWS'],
    experience: '5 years of full-stack development',
    tone: 'formal',
    generateWithAI: true  // AI will generate the content
  });

  if (result.success) {
    downloadBlob(result.blob, result.filename);
  }
  
  return result;
}
```

### 4. Enhance Text with AI

```javascript
import { enhanceDescription } from '../lib/templateService';

async function enhanceProjectDescription(text, role) {
  const result = await enhanceDescription(
    text,
    'portfolio',  // context: resume/portfolio/proposal
    role,
    ['React', 'Node.js', 'MongoDB']  // technologies
  );

  if (result.success) {
    console.log('Original:', result.original);
    console.log('Enhanced:', result.enhanced);
    return result.enhanced;
  }
  
  return text;
}
```

### 5. Generate Skills Summary

```javascript
import { generateSkillsSummary } from '../lib/templateService';

async function createSkillsSummary(skills, years) {
  const result = await generateSkillsSummary(skills, years);
  
  if (result.success) {
    console.log('Skills summary:', result.summary);
    return result.summary;
  }
  
  return '';
}
```

### 6. Check API Status

```javascript
import { checkAPIHealth } from '../lib/templateService';

async function checkBackendStatus() {
  const result = await checkAPIHealth();
  
  if (result.success) {
    console.log('API is healthy:', result.status);
    console.log('Available endpoints:', result.status.endpoints);
  } else {
    console.log('API is unavailable:', result.error);
  }
}
```

### 7. Export Portfolio as PDF

```javascript
import { exportPortfolioPDF, downloadBlob } from '../lib/templateService';

async function exportPortfolio(portfolioData) {
  const result = await exportPortfolioPDF({
    name: portfolioData.displayName,
    title: portfolioData.title,
    bio: portfolioData.bio,
    contact: {
      email: portfolioData.email,
      phone: portfolioData.phone,
      website: portfolioData.website,
      linkedin: portfolioData.socials?.linkedin
    },
    skills: portfolioData.skills,
    experience: portfolioData.experience,
    education: portfolioData.education,
    projects: portfolioData.projects,
    certifications: portfolioData.certifications,
    enhanceWithAI: true
  });

  if (result.success) {
    downloadBlob(result.blob, result.filename);
  }
}
```

## Template Types

### 1. Resume
**Template ID:** `resume`  
**Category:** Career

**Required Fields:**
- name (string)
- email (string)
- phone (string)
- bio (string)
- skills (array)
- experience (array)
- education (array)

**Optional Fields:**
- projects (array)
- certifications (array)
- languages (array)
- references (array)

### 2. Cover Letter
**Template ID:** `cover-letter`  
**Category:** Career

**Required Fields:**
- name (string)
- email (string)
- phone (string)
- company (string)
- position (string)
- content (string)

### 3. Proposal
**Template ID:** `proposal`  
**Category:** Business

**Required Fields:**
- title (string)
- client (string)
- description (string)
- timeline (string)
- budget (string)
- deliverables (array)

### 4. Invoice
**Template ID:** `invoice`  
**Category:** Business

**Required Fields:**
- invoiceNumber (string)
- clientName (string)
- clientEmail (string)
- date (string)
- dueDate (string)
- items (array)
- total (number)

### 5. Contract
**Template ID:** `contract`  
**Category:** Legal

**Required Fields:**
- contractType (string)
- clientName (string)
- freelancerName (string)
- projectDescription (string)
- startDate (string)
- endDate (string)
- payment (string)

### 6. Portfolio PDF
**Template ID:** `portfolio-pdf`  
**Category:** Portfolio

**Required Fields:**
- name (string)
- title (string)
- bio (string)
- projects (array)
- skills (array)
- socials (object)

## Error Handling

### API Unavailable
When the backend API is unavailable, the application:
1. Shows a warning message
2. Falls back to offline templates
3. Displays limited functionality notice
4. Continues to work with local data

```javascript
// Automatic fallback in useTemplates hook
const { templates, loading, error } = useTemplates();

if (error) {
  // Templates will contain default/offline templates
  // User sees warning but can still browse templates
}
```

### Network Errors
```javascript
try {
  const result = await generateResume(data);
  if (!result.success) {
    // Handle API error
    showErrorNotification(result.error);
  }
} catch (error) {
  // Handle network error
  showErrorNotification('Network error. Please try again.');
}
```

### Timeout Handling
```javascript
// Service handles timeouts automatically
// Default timeout: 30 seconds
const result = await generateDocument('resume', data, {
  timeout: 30000
});
```

## UI States

### 1. Loading State
```javascript
{loading && (
  <div className="templates-loading">
    <LoadingSpinner />
    <p>Loading templates from backend...</p>
  </div>
)}
```

### 2. Error State
```javascript
{error && (
  <div className="templates-notice">
    <AlertIcon />
    <div>
      <strong>Backend API Unavailable</strong>
      <p>Showing offline templates. Some features may be limited.</p>
    </div>
  </div>
)}
```

### 3. Empty State
```javascript
{templates.length === 0 && (
  <div className="templates-empty">
    <DocumentIcon />
    <h3>No templates found</h3>
    <p>Try selecting a different category</p>
  </div>
)}
```

### 4. Success State
```javascript
{!loading && !error && (
  <div className="status-badge success">
    <CheckIcon />
    {templates.length} templates available
  </div>
)}
```

## Performance Optimization

### 1. Caching
Templates are cached in React state to avoid unnecessary API calls:
```javascript
// Templates fetched once on mount
useEffect(() => {
  fetchData();
}, []); // Empty dependency array
```

### 2. Lazy Loading
Template details loaded only when needed:
```javascript
const { template } = useTemplate(templateId); // Only fetches when templateId changes
```

### 3. Debouncing
Search/filter operations are debounced:
```javascript
const debouncedFilter = useMemo(
  () => debounce(filterTemplates, 300),
  []
);
```

## Security Considerations

### 1. API Key Management
If API keys are required in the future:
```javascript
// Store in environment variables
const API_KEY = import.meta.env.VITE_TEMPLATE_API_KEY;

// Include in headers
headers: {
  'Authorization': `Bearer ${API_KEY}`
}
```

### 2. Data Sanitization
User data is sanitized before sending to API:
```javascript
function sanitizeData(data) {
  // Remove sensitive fields
  // Validate input formats
  // Escape special characters
  return cleanData;
}
```

### 3. CORS
Backend must allow requests from your domain:
```
Access-Control-Allow-Origin: https://your-domain.com
```

## Testing

### Unit Tests
```javascript
describe('templateService', () => {
  it('should fetch templates', async () => {
    const result = await fetchTemplates();
    expect(result.success).toBe(true);
    expect(result.templates).toBeInstanceOf(Array);
  });

  it('should generate resume', async () => {
    const data = { name: 'John Doe', /* ... */ };
    const result = await generateResume(data);
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests
```javascript
describe('Templates Page', () => {
  it('should display templates', async () => {
    render(<Templates />);
    await waitFor(() => {
      expect(screen.getByText('Resume Generator')).toBeInTheDocument();
    });
  });
});
```

## Deployment

### Environment Variables
```bash
# .env.production
VITE_TEMPLATE_API_URL=https://omgy-vero-template.hf.space
```

### Build Configuration
```javascript
// vite.config.js
export default {
  define: {
    'process.env.TEMPLATE_API_URL': JSON.stringify(process.env.VITE_TEMPLATE_API_URL)
  }
}
```

## Monitoring

### API Health Checks
Implement periodic health checks:
```javascript
useEffect(() => {
  const interval = setInterval(async () => {
    const health = await checkAPIHealth();
    setApiStatus(health.status);
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, []);
```

### Error Tracking
```javascript
try {
  await generateDocument(templateId, data);
} catch (error) {
  // Log to error tracking service
  trackError('Template Generation Failed', {
    templateId,
    error: error.message,
    timestamp: new Date()
  });
}
```

## Troubleshooting

### Issue: API not responding
**Solution:**
1. Check if Hugging Face Space is running
2. Verify API_BASE_URL is correct
3. Check network connectivity
4. Review browser console for CORS errors

### Issue: Templates not loading
**Solution:**
1. Check browser console for errors
2. Verify API response format
3. Check if fallback templates are showing
4. Clear browser cache

### Issue: Document generation fails
**Solution:**
1. Validate input data format
2. Check required fields are present
3. Verify template ID is correct
4. Review API error response

### Issue: Slow generation
**Solution:**
1. Hugging Face Spaces may have cold starts (first request after inactivity)
2. Wait 30-60 seconds for Space to wake up on first request
3. Consider upgrading to persistent Space for production
4. Implement loading states with progress indicators
5. Show "Generating document..." message to users

### Issue: CORS errors
**Solution:**
1. Backend has CORS enabled for all origins
2. Check browser console for specific CORS error
3. Verify API_BASE_URL is correct (https://omgy-vero-template.hf.space)
4. Ensure request headers are correct

## Future Enhancements

### Planned Features
- [ ] Real-time generation progress
- [ ] Template previews
- [ ] Custom template creation
- [ ] Batch document generation
- [ ] Template versioning
- [ ] A/B testing for templates
- [ ] Analytics for template usage
- [ ] Template marketplace

### Backend Improvements
- [ ] Faster generation times
- [ ] More template types
- [ ] Advanced AI customization
- [ ] Multi-language support
- [ ] Template themes/styles
- [ ] Collaborative editing

## Support

### Documentation
- Main docs: `docs/TEMPLATE_BACKEND_INTEGRATION.md`
- API reference: Backend repository README
- User guide: `docs/DASHBOARD_QUICK_START.md`

### Resources
- Backend Space: https://huggingface.co/spaces/omgy/vero_template
- Issues: Report in project repository
- Updates: Check backend changelog

## Summary

✅ **Integrated:** Template backend fully connected  
✅ **Endpoints:** All 8 backend endpoints implemented  
✅ **Fallback:** Offline mode when API unavailable  
✅ **Status:** Real-time API health indicators  
✅ **Templates:** 6 document types (Resume, Cover Letter, Proposal, Invoice, Contract, Portfolio PDF)  
✅ **AI Enhancement:** Text enhancement and skills summary generation  
✅ **Format:** DOCX for documents, PDF for portfolio  
✅ **Download:** Direct file download to user's device  
✅ **UI:** Loading, error, and success states  
✅ **Service:** Complete API wrapper with helpers  
✅ **Hooks:** React hooks for easy integration  

The template system is production-ready with AI-powered generation and handles both online and offline scenarios gracefully!

---

**Last Updated:** Template Backend Integration v1.0  
**Status:** ✅ Complete and Production Ready