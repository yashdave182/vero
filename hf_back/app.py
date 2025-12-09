"""
Vero Template Generator Backend
Flask API for generating professional documents using Gemini AI
"""

import io
import os
import sys
from datetime import datetime

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from utils.docx_generator import get_docx_generator
from utils.gemini_client import get_gemini_client
from utils.pdf_generator import get_pdf_generator

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize services
try:
    gemini_client = get_gemini_client()
    docx_generator = get_docx_generator()
    pdf_generator = get_pdf_generator()
    print("✓ All services initialized successfully", file=sys.stderr)
except Exception as e:
    print(f"✗ Error initializing services: {str(e)}", file=sys.stderr)
    sys.exit(1)


# ============================================================================
# HEALTH CHECK
# ============================================================================


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "Vero Template Generator",
            "version": "1.0.0",
            "timestamp": datetime.now().isoformat(),
            "endpoints": [
                "/generate-resume",
                "/generate-cover-letter",
                "/generate-proposal",
                "/generate-invoice",
                "/generate-contract",
                "/generate-portfolio-pdf",
                "/enhance-description",
                "/enhance-skills-summary",
            ],
        }
    )


# ============================================================================
# RESUME GENERATOR
# ============================================================================


@app.route("/generate-resume", methods=["POST"])
def generate_resume():
    """
    Generate professional resume
    Expected JSON:
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
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Debug logging
        print("=" * 80, file=sys.stderr)
        print("RESUME GENERATION REQUEST", file=sys.stderr)
        print("=" * 80, file=sys.stderr)
        print(f"Personal Info: {data.get('personal_info', {})}", file=sys.stderr)
        print(
            f"Summary/Bio: {data.get('summary', 'EMPTY')[:100] if data.get('summary') else 'EMPTY'}",
            file=sys.stderr,
        )
        print(f"Skills: {data.get('skills', [])}", file=sys.stderr)
        print(f"Projects count: {len(data.get('projects', []))}", file=sys.stderr)
        for idx, proj in enumerate(data.get("projects", [])):
            print(
                f"  Project {idx + 1}: {proj.get('name', 'Unknown')}", file=sys.stderr
            )
            print(
                f"    Has description: {bool(proj.get('description'))}", file=sys.stderr
            )
            if proj.get("description"):
                print(
                    f"    Description length: {len(proj.get('description', ''))} chars",
                    file=sys.stderr,
                )
        print(f"Experience count: {len(data.get('experience', []))}", file=sys.stderr)
        print(f"Education count: {len(data.get('education', []))}", file=sys.stderr)
        print(
            f"Certifications count: {len(data.get('certifications', []))}",
            file=sys.stderr,
        )
        print(f"AI Enhancement: {data.get('enhance_with_ai', False)}", file=sys.stderr)
        print("=" * 80, file=sys.stderr)

        # Optional: Enhance descriptions with AI
        if data.get("enhance_with_ai", False):
            print("Enhancing resume content with AI...", file=sys.stderr)

            # Enhance professional summary
            if data.get("summary"):
                original_summary = data.get("summary")
                skills = data.get("skills", [])
                if isinstance(skills, dict):
                    skills = [s for skill_list in skills.values() for s in skill_list]
                try:
                    enhanced_summary = gemini_client.generate_skills_summary(
                        skills, data.get("years_experience", 0)
                    )
                    # Validate AI response
                    if (
                        enhanced_summary
                        and len(enhanced_summary) > 20
                        and "option" not in enhanced_summary.lower()
                    ):
                        data["summary"] = enhanced_summary
                    else:
                        print(
                            f"Warning: Invalid AI summary, keeping original",
                            file=sys.stderr,
                        )
                        data["summary"] = original_summary
                except Exception as e:
                    print(f"Error enhancing summary: {str(e)}", file=sys.stderr)
                    data["summary"] = original_summary

            # Enhance work experience descriptions
            if data.get("experience"):
                for exp in data["experience"]:
                    if exp.get("responsibilities"):
                        enhanced_resps = []
                        for resp in exp["responsibilities"]:
                            try:
                                enhanced = gemini_client.enhance_resume_description(
                                    resp, exp.get("title", "")
                                )
                                # Validate AI response
                                if (
                                    enhanced
                                    and len(enhanced) > 10
                                    and "option" not in enhanced.lower()
                                ):
                                    enhanced_resps.append(enhanced)
                                else:
                                    enhanced_resps.append(resp)
                            except Exception as e:
                                print(
                                    f"Error enhancing responsibility: {str(e)}",
                                    file=sys.stderr,
                                )
                                enhanced_resps.append(resp)
                        exp["responsibilities"] = enhanced_resps

            # Enhance project descriptions
            if data.get("projects"):
                for proj in data["projects"]:
                    if proj.get("description"):
                        try:
                            original_desc = proj.get("description")
                            print(
                                f"Enhancing project: {proj.get('name', 'Unknown')}",
                                file=sys.stderr,
                            )
                            print(
                                f"Original description: {original_desc[:100]}...",
                                file=sys.stderr,
                            )
                            enhanced = gemini_client.enhance_portfolio_description(proj)

                            # Validate AI response
                            if not enhanced or len(enhanced) < 20:
                                print(
                                    f"Warning: AI returned short/empty response, keeping original",
                                    file=sys.stderr,
                                )
                                enhanced = original_desc
                            elif (
                                "option" in enhanced.lower()
                                or "choose" in enhanced.lower()
                            ):
                                print(
                                    f"Warning: AI returned multiple options, keeping original",
                                    file=sys.stderr,
                                )
                                enhanced = original_desc
                            elif enhanced.count("\n\n") > 2:
                                print(
                                    f"Warning: AI returned multiple paragraphs, keeping original",
                                    file=sys.stderr,
                                )
                                enhanced = original_desc

                            proj["description"] = enhanced
                            print(
                                f"Enhanced description: {enhanced[:100]}...",
                                file=sys.stderr,
                            )
                        except Exception as e:
                            print(f"Error enhancing project: {str(e)}", file=sys.stderr)
                            # Keep original description on error

        # Debug: Log final data before DOCX generation
        print("-" * 80, file=sys.stderr)
        print("FINAL DATA BEING SENT TO DOCX GENERATOR:", file=sys.stderr)
        print(
            f"Summary: {data.get('summary', 'EMPTY')[:100] if data.get('summary') else 'EMPTY'}",
            file=sys.stderr,
        )
        print(f"Skills: {data.get('skills', [])}", file=sys.stderr)
        print(f"Projects count: {len(data.get('projects', []))}", file=sys.stderr)
        for idx, proj in enumerate(data.get("projects", [])):
            print(
                f"  Project {idx + 1}: {proj.get('name', 'Unknown')}", file=sys.stderr
            )
            print(
                f"    Description: {proj.get('description', 'EMPTY')[:100]}",
                file=sys.stderr,
            )
            print(
                f"    Technologies: {proj.get('technologies', []) or proj.get('tech', [])}",
                file=sys.stderr,
            )
        print("-" * 80, file=sys.stderr)

        # Generate DOCX
        print("Generating resume document...", file=sys.stderr)
        docx_buffer = docx_generator.generate_resume(data)

        # Prepare filename
        name = data.get("personal_info", {}).get("name", "Resume")
        filename = f"{name.replace(' ', '_')}_Resume.docx"

        return send_file(
            docx_buffer,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        print(f"Error generating resume: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# COVER LETTER GENERATOR
# ============================================================================


@app.route("/generate-cover-letter", methods=["POST"])
def generate_cover_letter():
    """
    Generate personalized cover letter
    Expected JSON:
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
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Generate content with AI if requested
        if data.get("generate_with_ai", True) and not data.get("custom_content"):
            print("Generating cover letter content with AI...", file=sys.stderr)
            content = gemini_client.generate_cover_letter(data)
            data["content"] = content
        elif data.get("custom_content"):
            data["content"] = data["custom_content"]
        else:
            return (
                jsonify(
                    {
                        "error": "Either generate_with_ai must be true or custom_content must be provided"
                    }
                ),
                400,
            )

        # Generate DOCX
        print("Generating cover letter document...", file=sys.stderr)
        docx_buffer = docx_generator.generate_cover_letter(data)

        # Prepare filename
        name = data.get("name", "Applicant").replace(" ", "_")
        company = data.get("company", "Company").replace(" ", "_")
        filename = f"{name}_CoverLetter_{company}.docx"

        return send_file(
            docx_buffer,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        print(f"Error generating cover letter: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# PROPOSAL GENERATOR
# ============================================================================


@app.route("/generate-proposal", methods=["POST"])
def generate_proposal():
    """
    Generate business proposal
    Expected JSON:
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
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Generate proposal content with AI if requested
        if data.get("generate_with_ai", True) and not data.get("custom_content"):
            print("Generating proposal content with AI...", file=sys.stderr)
            content = gemini_client.generate_proposal(data)
            data["content"] = content
        elif data.get("custom_content"):
            data["content"] = data["custom_content"]

        # Generate DOCX
        print("Generating proposal document...", file=sys.stderr)
        docx_buffer = docx_generator.generate_proposal(data)

        # Prepare filename
        client = data.get("client_name", "Client").replace(" ", "_")
        title = data.get("project_title", "Proposal").replace(" ", "_")
        filename = f"Proposal_{client}_{title}.docx"

        return send_file(
            docx_buffer,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        print(f"Error generating proposal: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# INVOICE GENERATOR
# ============================================================================


@app.route("/generate-invoice", methods=["POST"])
def generate_invoice():
    """
    Generate professional invoice
    Expected JSON:
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
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Validate required fields
        if not data.get("items"):
            return jsonify({"error": "Invoice items are required"}), 400

        # Generate DOCX
        print("Generating invoice document...", file=sys.stderr)
        docx_buffer = docx_generator.generate_invoice(data)

        # Prepare filename
        invoice_num = data.get("invoice_number", "INV-001").replace("/", "-")
        filename = f"Invoice_{invoice_num}.docx"

        return send_file(
            docx_buffer,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        print(f"Error generating invoice: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# CONTRACT GENERATOR
# ============================================================================


@app.route("/generate-contract", methods=["POST"])
def generate_contract():
    """
    Generate legal contract
    Expected JSON:
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
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Generate contract terms with AI if requested
        if data.get("generate_with_ai", True) and not data.get("custom_content"):
            print("Generating contract terms with AI...", file=sys.stderr)
            contract_type = data.get("contract_type", "Service Agreement")
            custom_terms = data.get("custom_terms", "")
            terms = gemini_client.enhance_contract_terms(contract_type, custom_terms)
            data["terms"] = terms
        elif data.get("custom_content"):
            data["terms"] = data["custom_content"]

        # Generate DOCX
        print("Generating contract document...", file=sys.stderr)
        docx_buffer = docx_generator.generate_contract(data)

        # Prepare filename
        contract_type = data.get("contract_type", "Contract").replace(" ", "_")
        filename = f"{contract_type}_Contract.docx"

        return send_file(
            docx_buffer,
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        print(f"Error generating contract: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# PORTFOLIO PDF EXPORT
# ============================================================================


@app.route("/generate-portfolio-pdf", methods=["POST"])
def generate_portfolio_pdf():
    """
    Generate portfolio PDF
    Expected JSON:
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
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Optional AI enhancement
        if data.get("enhance_with_ai", False):
            print("Enhancing portfolio content with AI...", file=sys.stderr)

            # Enhance bio
            if data.get("bio"):
                data["bio"] = gemini_client.improve_text_quality(
                    data["bio"], "professional"
                )

            # Enhance project descriptions
            if data.get("projects"):
                for proj in data["projects"]:
                    if proj.get("description"):
                        try:
                            enhanced = gemini_client.enhance_portfolio_description(proj)
                            proj["description"] = enhanced
                        except Exception as e:
                            print(f"Error enhancing project: {str(e)}", file=sys.stderr)

        # Generate PDF
        print("Generating portfolio PDF...", file=sys.stderr)
        pdf_buffer = pdf_generator.generate_portfolio_pdf(data)

        # Prepare filename
        name = data.get("name", "Portfolio").replace(" ", "_")
        filename = f"{name}_Portfolio.pdf"

        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        print(f"Error generating portfolio PDF: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# AI ENHANCEMENT UTILITIES
# ============================================================================


@app.route("/enhance-description", methods=["POST"])
def enhance_description():
    """
    Enhance text description with AI
    Expected JSON:
    {
        "text": "Original text to enhance",
        "context": "resume/portfolio/proposal",
        "role": "Optional job role for context"
    }
    """
    try:
        data = request.get_json()

        if not data or not data.get("text"):
            return jsonify({"error": "Text is required"}), 400

        text = data["text"]
        context = data.get("context", "general")
        role = data.get("role", "")

        if context == "resume":
            enhanced = gemini_client.enhance_resume_description(text, role)
        elif context == "portfolio":
            project_data = {
                "title": role,
                "description": text,
                "technologies": data.get("technologies", []),
                "role": data.get("your_role", "Developer"),
            }
            enhanced = gemini_client.enhance_portfolio_description(project_data)
        else:
            enhanced = gemini_client.improve_text_quality(text, "professional")

        return jsonify({"original": text, "enhanced": enhanced, "success": True})

    except Exception as e:
        print(f"Error enhancing description: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


@app.route("/enhance-skills-summary", methods=["POST"])
def enhance_skills_summary():
    """
    Generate professional skills summary
    Expected JSON:
    {
        "skills": ["Python", "React", "AWS"],
        "experience_years": 5
    }
    """
    try:
        data = request.get_json()

        if not data or not data.get("skills"):
            return jsonify({"error": "Skills list is required"}), 400

        skills = data["skills"]
        years = data.get("experience_years", 0)

        summary = gemini_client.generate_skills_summary(skills, years)

        return jsonify({"skills": skills, "summary": summary, "success": True})

    except Exception as e:
        print(f"Error generating skills summary: {str(e)}", file=sys.stderr)
        return jsonify({"error": str(e)}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "Internal server error"}), 500


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)
