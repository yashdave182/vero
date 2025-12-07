/**
 * Document API Service
 *
 * Handles communication with the Hugging Face backend API for:
 * - Document Enhancement (AI-powered with LaTeX support)
 * - Digital Signature Addition
 *
 * Backend: https://huggingface.co/spaces/omgy/vero_ps
 */

const API_BASE_URL = "https://omgy-vero-ps.hf.space";

/**
 * Enhance document using AI
 *
 * @param {File} file - Document file (.docx, .pdf, .txt)
 * @param {Object} options - Enhancement options
 * @param {string} options.prompt - Optional user instructions for enhancement
 * @param {string} options.doc_type - Document type: 'auto', 'academic', 'technical', 'business'
 * @returns {Promise<{success: boolean, data?: Blob, error?: string}>}
 */
export const enhanceDocument = async (file, options = {}) => {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file type
    const validExtensions = [".docx", ".pdf", ".txt", ".doc"];
    const fileExt = "." + file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      return {
        success: false,
        error: `Unsupported file format. Please use: ${validExtensions.join(", ")}`,
      };
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size exceeds 10MB limit",
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);

    // Add optional parameters
    if (options.prompt) {
      formData.append("prompt", options.prompt);
    }
    if (options.doc_type) {
      formData.append("doc_type", options.doc_type);
    }

    console.log("Enhancing document:", file.name);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/enhance`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error message
      let errorMessage = "Failed to enhance document";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      return { success: false, error: errorMessage };
    }

    // Get the enhanced document blob
    const blob = await response.blob();

    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `enhanced_${file.name}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Ensure filename has .docx extension (backend always returns .docx)
    filename = filename.replace(/\.(pdf|txt|doc)$/i, ".docx");
    if (!filename.toLowerCase().endsWith(".docx")) {
      filename = filename.replace(/\.[^.]+$/, "") + ".docx";
    }

    console.log("Document enhanced successfully:", filename);

    return {
      success: true,
      data: blob,
      filename: filename,
    };
  } catch (error) {
    console.error("Error enhancing document:", error);
    return {
      success: false,
      error:
        error.message ||
        "Network error. Please check your connection and try again.",
    };
  }
};

/**
 * Preview LaTeX equations in document
 *
 * @param {File} file - Document file
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const previewDocument = async (file) => {
  try {
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const formData = new FormData();
    formData.append("file", file);

    console.log("Previewing document:", file.name);

    const response = await fetch(`${API_BASE_URL}/preview`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "Preview failed";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      return { success: false, error: errorMessage };
    }

    const data = await response.json();

    // Backend returns: { filename, has_math, equation_count, equations, text_preview }
    // Transform to expected format
    const transformedData = {
      preview_text: data.text_preview || "",
      latex_equations: data.equations?.map((eq) => eq.content) || [],
      has_math: data.has_math || false,
      equation_count: data.equation_count || 0,
      filename: data.filename || file.name,
    };

    console.log(
      "Preview loaded successfully:",
      transformedData.equation_count,
      "equations found",
    );

    return { success: true, data: transformedData };
  } catch (error) {
    console.error("Error previewing document:", error);
    return {
      success: false,
      error: error.message || "Failed to preview document",
    };
  }
};

/**
 * Add digital signature to document
 *
 * @param {File} file - Document file (PDF or DOCX)
 * @param {Object} signatureOptions - Signature options
 * @param {string} signatureOptions.signature - Signature data (base64 image or text)
 * @param {string} signatureOptions.position - Position: 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'center'
 * @param {string} signatureOptions.signer_name - Name of the signer
 * @returns {Promise<{success: boolean, data?: Blob, error?: string}>}
 */
export const addSignature = async (file, signatureOptions = {}) => {
  try {
    // Validate file
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate signature data
    if (!signatureOptions.signature) {
      return { success: false, error: "No signature provided" };
    }

    // Create FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("signature", signatureOptions.signature);

    if (signatureOptions.position) {
      formData.append("position", signatureOptions.position);
    }

    if (signatureOptions.signer_name) {
      formData.append("signer_name", signatureOptions.signer_name);
    }

    console.log("Adding signature to document:", file.name);

    // Make API request
    const response = await fetch(`${API_BASE_URL}/add-signature`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      // Try to parse error message
      let errorMessage = "Failed to add signature";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      return { success: false, error: errorMessage };
    }

    // Get the signed document blob
    const blob = await response.blob();

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `Signed_${file.name}`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Ensure filename has .docx extension (backend always returns .docx)
    filename = filename.replace(/\.(pdf|txt|doc)$/i, ".docx");
    if (!filename.toLowerCase().endsWith(".docx")) {
      filename = filename.replace(/\.[^.]+$/, "") + ".docx";
    }

    console.log("Signature added successfully:", filename);

    return {
      success: true,
      data: blob,
      filename: filename,
    };
  } catch (error) {
    console.error("Error adding signature:", error);
    return {
      success: false,
      error:
        error.message ||
        "Network error. Please check your connection and try again.",
    };
  }
};

/**
 * Check API health status
 *
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
    });

    if (!response.ok) {
      return { success: false, error: "Health check failed" };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Error checking health:", error);
    return {
      success: false,
      error: error.message || "Cannot reach API server",
    };
  }
};

/**
 * Download blob as file
 *
 * @param {Blob} blob - File blob
 * @param {string} filename - Filename for download
 */
export const downloadBlob = (blob, filename) => {
  try {
    // Ensure the blob has the correct MIME type for .docx
    const docxBlob = new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const url = window.URL.createObjectURL(docxBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error("Error downloading file:", error);
    return { success: false, error: "Failed to download file" };
  }
};

/**
 * Convert blob to data URL for preview
 *
 * @param {Blob} blob - File blob
 * @returns {Promise<string>} Data URL
 */
export const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Get supported file formats
 */
export const getSupportedFormats = () => {
  return {
    input: [".docx", ".pdf", ".txt", ".doc"],
    output: [".docx"], // Backend only returns .docx format
    maxSize: 10 * 1024 * 1024, // 10MB
  };
};

/**
 * Get document type options
 */
export const getDocumentTypes = () => {
  return [
    {
      value: "auto",
      label: "Auto-detect",
      description: "Automatically detect document type",
    },
    {
      value: "academic",
      label: "Academic",
      description: "Research papers, theses, academic writing",
    },
    {
      value: "technical",
      label: "Technical",
      description: "Technical documentation, manuals",
    },
    {
      value: "business",
      label: "Business",
      description: "Business documents, reports, proposals",
    },
  ];
};

/**
 * Get signature position options
 */
export const getSignaturePositions = () => {
  return [
    { value: "bottom-right", label: "Bottom Right" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "top-right", label: "Top Right" },
    { value: "top-left", label: "Top Left" },
    { value: "center", label: "Center" },
  ];
};
