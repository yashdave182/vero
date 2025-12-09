/**
 * Template Service
 *
 * Service for interacting with the Hugging Face template backend API
 * Backend URL: https://huggingface.co/spaces/omgy/vero_template
 *
 * Backend Endpoints:
 * - POST /generate-resume
 * - POST /generate-cover-letter
 * - POST /generate-proposal
 * - POST /generate-invoice
 * - POST /generate-contract
 * - POST /generate-portfolio-pdf
 * - POST /enhance-description
 * - POST /enhance-skills-summary
 * - GET /health
 */

// API Configuration
const API_BASE_URL = "https://omgy-vero-template.hf.space";

/**
 * Check API health status
 *
 * @returns {Promise<Object>} - { success: boolean, status?: Object, error?: string }
 */
export const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, status: data };
  } catch (error) {
    console.error("Error checking API health:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate resume from user profile
 *
 * @param {Object} profileData - User profile data
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export const generateResume = async (profileData) => {
  try {
    const payload = {
      personal_info: {
        name: profileData.name || profileData.displayName || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        location: profileData.location || "",
        linkedin: profileData.linkedin || profileData.socials?.linkedin || "",
        website: profileData.website || profileData.socials?.website || "",
      },
      summary: profileData.bio || profileData.summary || "",
      experience: profileData.experience || [],
      education: profileData.education || [],
      skills: profileData.skills || [],
      certifications: profileData.certifications || [],
      projects: profileData.projects || [],
      enhance_with_ai: profileData.enhanceWithAI || false,
    };

    const response = await fetch(`${API_BASE_URL}/generate-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      filename: `${payload.personal_info.name.replace(/\s+/g, "_")}_Resume.docx`,
    };
  } catch (error) {
    console.error("Error generating resume:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate cover letter
 *
 * @param {Object} data - Cover letter data
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export const generateCoverLetter = async (data) => {
  try {
    const payload = {
      name: data.name || "",
      address: data.address || "",
      email: data.email || "",
      phone: data.phone || "",
      date:
        data.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      company: data.company || "",
      hiring_manager: data.hiringManager || data.hiring_manager || "",
      position: data.position || "",
      skills: data.skills || [],
      experience: data.experience || "",
      tone: data.tone || "formal",
      custom_content: data.customContent || data.content || "",
      generate_with_ai: data.generateWithAI !== false,
    };

    const response = await fetch(`${API_BASE_URL}/generate-cover-letter`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      filename: `${payload.name.replace(/\s+/g, "_")}_CoverLetter_${payload.company.replace(/\s+/g, "_")}.docx`,
    };
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate proposal document
 *
 * @param {Object} data - Proposal data
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export const generateProposal = async (data) => {
  try {
    const payload = {
      title: data.title || "Business Proposal",
      client_name: data.clientName || data.client_name || data.client || "",
      prepared_by: data.preparedBy || data.prepared_by || "Your Company",
      date:
        data.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      project_title: data.projectTitle || data.project_title || "",
      scope: data.scope || data.description || "",
      deliverables: data.deliverables || [],
      timeline: data.timeline || "",
      budget: data.budget || "",
      generate_with_ai: data.generateWithAI !== false,
      custom_content: data.customContent || data.content || "",
    };

    const response = await fetch(`${API_BASE_URL}/generate-proposal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      filename: `Proposal_${payload.client_name.replace(/\s+/g, "_")}_${payload.project_title.replace(/\s+/g, "_")}.docx`,
    };
  } catch (error) {
    console.error("Error generating proposal:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate invoice
 *
 * @param {Object} data - Invoice data
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export const generateInvoice = async (data) => {
  try {
    const payload = {
      invoice_number:
        data.invoiceNumber || data.invoice_number || `INV-${Date.now()}`,
      invoice_date:
        data.invoiceDate ||
        data.invoice_date ||
        new Date().toISOString().split("T")[0],
      due_date: data.dueDate || data.due_date || "",
      from_info: {
        name: data.fromInfo?.name || data.from_info?.name || "",
        address: data.fromInfo?.address || data.from_info?.address || "",
        email: data.fromInfo?.email || data.from_info?.email || "",
        phone: data.fromInfo?.phone || data.from_info?.phone || "",
      },
      to_info: {
        name: data.toInfo?.name || data.to_info?.name || data.clientName || "",
        address: data.toInfo?.address || data.to_info?.address || "",
        email:
          data.toInfo?.email || data.to_info?.email || data.clientEmail || "",
      },
      items: data.items || [],
      tax_rate: data.taxRate || data.tax_rate || 0,
      discount: data.discount || 0,
      notes: data.notes || "",
      payment_instructions:
        data.paymentInstructions || data.payment_instructions || "",
    };

    const response = await fetch(`${API_BASE_URL}/generate-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      filename: `Invoice_${payload.invoice_number.replace(/\//g, "-")}.docx`,
    };
  } catch (error) {
    console.error("Error generating invoice:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate contract
 *
 * @param {Object} data - Contract data
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export const generateContract = async (data) => {
  try {
    const payload = {
      contract_type:
        data.contractType || data.contract_type || "Service Agreement",
      date:
        data.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      party1: {
        name: data.party1?.name || data.freelancerName || "",
        address: data.party1?.address || "",
      },
      party2: {
        name: data.party2?.name || data.clientName || "",
        address: data.party2?.address || "",
      },
      effective_date:
        data.effectiveDate || data.effective_date || data.startDate || "",
      expiration_date:
        data.expirationDate || data.expiration_date || data.endDate || "",
      custom_terms: data.customTerms || data.custom_terms || data.payment || "",
      generate_with_ai: data.generateWithAI !== false,
      custom_content: data.customContent || data.content || "",
    };

    const response = await fetch(`${API_BASE_URL}/generate-contract`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      filename: `${payload.contract_type.replace(/\s+/g, "_")}_Contract.docx`,
    };
  } catch (error) {
    console.error("Error generating contract:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Export portfolio as PDF
 *
 * @param {Object} portfolioData - Portfolio data
 * @returns {Promise<Object>} - { success: boolean, blob?: Blob, error?: string }
 */
export const exportPortfolioPDF = async (portfolioData) => {
  try {
    const payload = {
      name: portfolioData.name || portfolioData.displayName || "",
      title: portfolioData.title || "",
      bio: portfolioData.bio || "",
      contact: {
        email: portfolioData.email || portfolioData.contact?.email || "",
        phone: portfolioData.phone || portfolioData.contact?.phone || "",
        website:
          portfolioData.website ||
          portfolioData.contact?.website ||
          portfolioData.socials?.website ||
          "",
        linkedin:
          portfolioData.linkedin ||
          portfolioData.contact?.linkedin ||
          portfolioData.socials?.linkedin ||
          "",
      },
      skills: portfolioData.skills || [],
      experience: portfolioData.experience || [],
      education: portfolioData.education || [],
      projects: portfolioData.projects || [],
      certifications: portfolioData.certifications || [],
      enhance_with_ai: portfolioData.enhanceWithAI || false,
    };

    const response = await fetch(`${API_BASE_URL}/generate-portfolio-pdf`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const blob = await response.blob();
    return {
      success: true,
      blob: blob,
      filename: `${payload.name.replace(/\s+/g, "_")}_Portfolio.pdf`,
    };
  } catch (error) {
    console.error("Error exporting portfolio PDF:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Enhance text description with AI
 *
 * @param {string} text - Text to enhance
 * @param {string} context - Context (resume/portfolio/proposal)
 * @param {string} role - Optional role for context
 * @param {Array} technologies - Optional technologies (for portfolio)
 * @returns {Promise<Object>} - { success: boolean, enhanced?: string, error?: string }
 */
export const enhanceDescription = async (
  text,
  context = "general",
  role = "",
  technologies = [],
) => {
  try {
    const payload = {
      text: text,
      context: context,
      role: role,
      technologies: technologies,
      your_role: role,
    };

    const response = await fetch(`${API_BASE_URL}/enhance-description`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return {
      success: true,
      original: data.original,
      enhanced: data.enhanced,
    };
  } catch (error) {
    console.error("Error enhancing description:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate professional skills summary with AI
 *
 * @param {Array} skills - Array of skills
 * @param {number} experienceYears - Years of experience
 * @returns {Promise<Object>} - { success: boolean, summary?: string, error?: string }
 */
export const generateSkillsSummary = async (skills, experienceYears = 0) => {
  try {
    const payload = {
      skills: skills,
      experience_years: experienceYears,
    };

    const response = await fetch(`${API_BASE_URL}/enhance-skills-summary`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    return {
      success: true,
      summary: data.summary,
      skills: data.skills,
    };
  } catch (error) {
    console.error("Error generating skills summary:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Download blob as file
 *
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Desired filename
 * @returns {Object} - { success: boolean, error?: string }
 */
export const downloadBlob = (blob, filename) => {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error downloading file:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all available templates (static list based on backend endpoints)
 *
 * @returns {Promise<Object>} - { success: boolean, templates?: Array, error?: string }
 */
export const fetchTemplates = async () => {
  try {
    // Check if backend is available
    const healthCheck = await checkAPIHealth();

    const templates = [
      {
        id: "resume",
        name: "Resume Generator",
        description: "Create a professional resume with AI enhancement",
        icon: "📄",
        category: "Career",
        endpoint: "/generate-resume",
        fields: [
          "name",
          "email",
          "phone",
          "bio",
          "skills",
          "experience",
          "education",
          "projects",
        ],
        aiEnhancement: true,
      },
      {
        id: "cover-letter",
        name: "Cover Letter",
        description: "Generate personalized cover letters with AI",
        icon: "✉️",
        category: "Career",
        endpoint: "/generate-cover-letter",
        fields: [
          "name",
          "email",
          "company",
          "position",
          "skills",
          "experience",
        ],
        aiEnhancement: true,
      },
      {
        id: "proposal",
        name: "Business Proposal",
        description: "Create compelling client proposals",
        icon: "📝",
        category: "Business",
        endpoint: "/generate-proposal",
        fields: [
          "title",
          "client",
          "project",
          "scope",
          "deliverables",
          "timeline",
          "budget",
        ],
        aiEnhancement: true,
      },
      {
        id: "invoice",
        name: "Invoice Generator",
        description: "Professional invoices for your clients",
        icon: "🧾",
        category: "Business",
        endpoint: "/generate-invoice",
        fields: ["invoiceNumber", "client", "items", "total", "dueDate"],
        aiEnhancement: false,
      },
      {
        id: "contract",
        name: "Contract Template",
        description: "Generate legal contracts and agreements",
        icon: "📋",
        category: "Legal",
        endpoint: "/generate-contract",
        fields: ["contractType", "parties", "terms", "dates"],
        aiEnhancement: true,
      },
      {
        id: "portfolio-pdf",
        name: "Portfolio PDF",
        description: "Export your portfolio as a professional PDF",
        icon: "📁",
        category: "Portfolio",
        endpoint: "/generate-portfolio-pdf",
        fields: ["name", "title", "bio", "projects", "skills", "experience"],
        aiEnhancement: true,
      },
    ];

    return {
      success: true,
      templates: templates,
      apiAvailable: healthCheck.success,
    };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch a specific template by ID
 *
 * @param {string} templateId - Template ID
 * @returns {Promise<Object>} - { success: boolean, template?: Object, error?: string }
 */
export const fetchTemplateById = async (templateId) => {
  try {
    const result = await fetchTemplates();

    if (!result.success) {
      return result;
    }

    const template = result.templates.find((t) => t.id === templateId);

    if (!template) {
      return { success: false, error: "Template not found" };
    }

    return { success: true, template: template };
  } catch (error) {
    console.error("Error fetching template:", error);
    return { success: false, error: error.message };
  }
};

// Default export
export default {
  checkAPIHealth,
  fetchTemplates,
  fetchTemplateById,
  generateResume,
  generateCoverLetter,
  generateProposal,
  generateInvoice,
  generateContract,
  exportPortfolioPDF,
  enhanceDescription,
  generateSkillsSummary,
  downloadBlob,
};
