import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import SignaturePad from "../../components/SignaturePad";
import "./AITools.css";
import {
  enhanceDocument,
  addSignature,
  downloadBlob,
  getDocumentTypes,
  getSignaturePositions,
  previewDocument,
} from "../../lib/documentApiService";

const tools = [
  {
    id: "enhance",
    name: "Document Enhancer",
    description:
      "Improve writing quality, fix grammar, and enhance formatting with AI",
    icon: "✨",
  },
  {
    id: "sign",
    name: "Sign Document",
    description: "Add digital signatures to your documents",
    icon: "✍️",
  },
];

export default function AITools() {
  const [activeTool, setActiveTool] = useState("enhance");
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const [resultFile, setResultFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Enhancement options
  const [enhancePrompt, setEnhancePrompt] = useState("");
  const [docType, setDocType] = useState("auto");

  // Signature options
  const [signatureName, setSignatureName] = useState("");
  const [signaturePosition, setSignaturePosition] = useState("bottom-right");
  const [signatureData, setSignatureData] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError("");
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      let result;

      if (activeTool === "enhance") {
        // Enhance document
        result = await enhanceDocument(file, {
          prompt: enhancePrompt,
          doc_type: docType,
        });
      } else if (activeTool === "sign") {
        // Validate signature inputs
        if (!signatureData) {
          setError("Please draw your signature");
          setIsProcessing(false);
          return;
        }

        if (!signatureName) {
          setError("Please provide your name");
          setIsProcessing(false);
          return;
        }

        // Add signature
        result = await addSignature(file, {
          signature: signatureData,
          position: signaturePosition,
          signer_name: signatureName,
        });
      }

      if (result.success) {
        setResultFile({
          blob: result.data,
          filename: result.filename,
        });
        setIsComplete(true);
      } else {
        setError(result.error || "Processing failed. Please try again.");
      }
    } catch (err) {
      console.error("Processing error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (resultFile) {
      downloadBlob(resultFile.blob, resultFile.filename);
    }
  };

  const handlePreview = async () => {
    if (!resultFile) return;

    setIsLoadingPreview(true);
    setShowPreview(true);

    try {
      // Create a File object from the blob for preview
      const file = new File([resultFile.blob], resultFile.filename, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      const result = await previewDocument(file);

      if (result.success) {
        setPreviewData(result.data);
      } else {
        setPreviewData({ error: result.error || "Failed to load preview" });
      }
    } catch (err) {
      console.error("Preview error:", err);
      setPreviewData({ error: "An error occurred while loading preview" });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleReset = () => {
    setFile(null);
    setIsComplete(false);
    setError("");
    setResultFile(null);
    setEnhancePrompt("");
    setSignatureData(null);
    setSignatureName("");
    setShowPreview(false);
    setPreviewData(null);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="ai-tools-page">
        <div className="tools-header">
          <div>
            <h1 className="tools-title">AI Tools</h1>
            <p className="tools-subtitle">
              Powerful tools to enhance your documents
            </p>
          </div>
        </div>

        {/* Tool Tabs */}
        <div className="tools-tabs">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-tab ${activeTool === tool.id ? "active" : ""}`}
              onClick={() => {
                setActiveTool(tool.id);
                handleReset();
              }}
            >
              <span className="tool-tab-icon">{tool.icon}</span>
              <span className="tool-tab-name">{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="tool-content">
          <div className="tool-info">
            <h2 className="tool-name">
              {tools.find((t) => t.id === activeTool)?.icon}{" "}
              {tools.find((t) => t.id === activeTool)?.name}
            </h2>
            <p className="tool-description">
              {tools.find((t) => t.id === activeTool)?.description}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!isComplete ? (
            <>
              {/* Upload Area */}
              <div
                className={`upload-area ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {!file ? (
                  <>
                    <div className="upload-icon">
                      <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <p className="upload-text">
                      Drag and drop your file here, or{" "}
                      <label className="upload-browse">
                        browse
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileSelect}
                          hidden
                        />
                      </label>
                    </p>
                    <p className="upload-hint">
                      Supports PDF, DOC, DOCX, TXT (Max 10MB) • Output: Word
                      (.docx)
                    </p>
                  </>
                ) : (
                  <div className="file-info">
                    <div className="file-icon">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div className="file-details">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button className="file-remove" onClick={handleReset}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Tool-specific Options */}
              {file && (
                <div className="tool-options">
                  {activeTool === "enhance" && (
                    <>
                      <div className="option-group">
                        <label className="option-label">Document Type</label>
                        <select
                          className="option-select"
                          value={docType}
                          onChange={(e) => setDocType(e.target.value)}
                        >
                          {getDocumentTypes().map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} - {type.description}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="option-group">
                        <label className="option-label">
                          Enhancement Instructions (Optional)
                        </label>
                        <textarea
                          className="option-textarea"
                          placeholder="E.g., 'Make it more formal', 'Add technical details', 'Improve clarity'..."
                          value={enhancePrompt}
                          onChange={(e) => setEnhancePrompt(e.target.value)}
                          rows="3"
                        />
                        <p className="option-hint">
                          Leave blank for general enhancement
                        </p>
                      </div>
                    </>
                  )}

                  {activeTool === "sign" && (
                    <>
                      <SignaturePad onSignatureChange={setSignatureData} />

                      <div className="option-group">
                        <label className="option-label">Your Full Name *</label>
                        <input
                          type="text"
                          className="option-input"
                          placeholder="John Doe"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          required
                        />
                        <p className="option-hint">
                          For identification purposes only (not the signature
                          itself)
                        </p>
                      </div>

                      <div className="option-group">
                        <label className="option-label">
                          Signature Position
                        </label>
                        <select
                          className="option-select"
                          value={signaturePosition}
                          onChange={(e) => setSignaturePosition(e.target.value)}
                        >
                          {getSignaturePositions().map((pos) => (
                            <option key={pos.value} value={pos.value}>
                              {pos.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Process Button */}
              {file && (
                <div className="process-actions">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleProcess}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <div className="spinner" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {activeTool === "enhance" && "Enhance Document"}
                        {activeTool === "sign" && "Sign Document"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Success State */
            <div className="success-state">
              <div className="success-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h3 className="success-title">
                Document Processed Successfully!
              </h3>
              <p className="success-description">
                Your document has been{" "}
                {activeTool === "enhance" ? "enhanced" : "signed"} and is ready
                for download as a Word document (.docx).
              </p>
              <div className="success-actions">
                <Button variant="primary" size="lg" onClick={handlePreview}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Preview Document
                </Button>
                <Button variant="primary" size="lg" onClick={handleDownload}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Word Document
                </Button>
                <Button variant="secondary" size="lg" onClick={handleReset}>
                  Process Another
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="preview-modal-overlay" onClick={closePreview}>
            <div
              className="preview-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="preview-modal-header">
                <h3>Document Preview</h3>
                <button className="preview-close-btn" onClick={closePreview}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="preview-modal-body">
                {isLoadingPreview ? (
                  <div className="preview-loading">
                    <div className="spinner" />
                    <p>Loading preview...</p>
                  </div>
                ) : previewData?.error ? (
                  <div className="preview-error">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p>{previewData.error}</p>
                    <p className="preview-hint">
                      You can still download the document below.
                    </p>
                  </div>
                ) : previewData ? (
                  <div className="preview-content">
                    {/* Document Info */}
                    {previewData.filename && (
                      <div className="preview-info-section">
                        <div className="preview-info-item">
                          <strong>File:</strong> {previewData.filename}
                        </div>
                        {previewData.has_math !== undefined && (
                          <div className="preview-info-item">
                            <strong>Contains Math:</strong>{" "}
                            {previewData.has_math ? "Yes" : "No"}
                          </div>
                        )}
                        {previewData.equation_count > 0 && (
                          <div className="preview-info-item">
                            <strong>Equations Found:</strong>{" "}
                            {previewData.equation_count}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Text Preview */}
                    {previewData.preview_text && (
                      <div className="preview-text-section">
                        <h4>Document Content Preview:</h4>
                        <pre className="preview-text">
                          {previewData.preview_text}
                        </pre>
                      </div>
                    )}

                    {/* LaTeX Equations */}
                    {previewData.latex_equations &&
                      previewData.latex_equations.length > 0 && (
                        <div className="preview-equations-section">
                          <h4>
                            LaTeX Equations (
                            {previewData.latex_equations.length}
                            ):
                          </h4>
                          <div className="preview-equations">
                            {previewData.latex_equations.map((eq, idx) => (
                              <div key={idx} className="preview-equation">
                                <span className="equation-number">
                                  #{idx + 1}
                                </span>
                                <code>{eq}</code>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Empty State */}
                    {!previewData.preview_text &&
                      (!previewData.latex_equations ||
                        previewData.latex_equations.length === 0) && (
                        <div className="preview-empty">
                          <p>Preview not available for this document type.</p>
                          <p className="preview-hint">
                            Please download to view the full document.
                          </p>
                        </div>
                      )}
                  </div>
                ) : null}
              </div>
              <div className="preview-modal-footer">
                <Button variant="primary" onClick={handleDownload}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download .docx
                </Button>
                <Button variant="secondary" onClick={closePreview}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
