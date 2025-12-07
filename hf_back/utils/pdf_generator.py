"""
PDF Generator Utility
Handles creation of PDF documents for portfolio exports
"""

import io
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    HRFlowable,
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


class PDFGenerator:
    """Generate professional PDF documents"""

    def __init__(self):
        """Initialize PDF generator"""
        self.page_size = letter
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(
            ParagraphStyle(
                name="CustomTitle",
                parent=self.styles["Heading1"],
                fontSize=24,
                textColor=colors.HexColor("#003366"),
                spaceAfter=30,
                alignment=TA_CENTER,
                fontName="Helvetica-Bold",
            )
        )

        # Subtitle style
        self.styles.add(
            ParagraphStyle(
                name="CustomSubtitle",
                parent=self.styles["Normal"],
                fontSize=14,
                textColor=colors.HexColor("#666666"),
                spaceAfter=20,
                alignment=TA_CENTER,
                fontName="Helvetica",
            )
        )

        # Section heading
        self.styles.add(
            ParagraphStyle(
                name="SectionHeading",
                parent=self.styles["Heading2"],
                fontSize=16,
                textColor=colors.HexColor("#003366"),
                spaceAfter=12,
                spaceBefore=20,
                fontName="Helvetica-Bold",
                borderWidth=1,
                borderColor=colors.HexColor("#003366"),
                borderPadding=5,
            )
        )

        # Body text
        self.styles.add(
            ParagraphStyle(
                name="CustomBody",
                parent=self.styles["Normal"],
                fontSize=11,
                textColor=colors.HexColor("#333333"),
                spaceAfter=10,
                alignment=TA_JUSTIFY,
                fontName="Helvetica",
            )
        )

        # Contact info
        self.styles.add(
            ParagraphStyle(
                name="ContactInfo",
                parent=self.styles["Normal"],
                fontSize=10,
                textColor=colors.HexColor("#666666"),
                alignment=TA_CENTER,
                fontName="Helvetica",
            )
        )

    def generate_portfolio_pdf(self, data: Dict[str, Any]) -> io.BytesIO:
        """
        Generate portfolio PDF

        Args:
            data: Portfolio data containing:
                - name: Full name
                - title: Professional title
                - bio: Biography
                - contact: Contact info (email, phone, website, linkedin)
                - skills: List or dict of skills
                - experience: List of work experiences
                - education: List of education entries
                - projects: List of projects
                - certifications: List of certifications (optional)

        Returns:
            BytesIO buffer containing the PDF file
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        # Container for the 'Flowable' objects
        elements = []

        # Header - Name and Title
        name = data.get("name", "Your Name")
        elements.append(Paragraph(name, self.styles["CustomTitle"]))

        title = data.get("title", "Professional Title")
        elements.append(Paragraph(title, self.styles["CustomSubtitle"]))

        # Contact Information
        contact = data.get("contact", {})
        contact_parts = []
        if contact.get("email"):
            contact_parts.append(contact["email"])
        if contact.get("phone"):
            contact_parts.append(contact["phone"])
        if contact.get("website"):
            contact_parts.append(
                f'<link href="{contact["website"]}">{contact["website"]}</link>'
            )
        if contact.get("linkedin"):
            contact_parts.append(f"LinkedIn: {contact['linkedin']}")

        if contact_parts:
            contact_text = " | ".join(contact_parts)
            elements.append(Paragraph(contact_text, self.styles["ContactInfo"]))
            elements.append(Spacer(1, 0.2 * inch))

        # Horizontal line
        elements.append(
            HRFlowable(width="100%", thickness=2, color=colors.HexColor("#003366"))
        )
        elements.append(Spacer(1, 0.2 * inch))

        # Bio/Summary
        if data.get("bio"):
            elements.append(
                Paragraph("PROFESSIONAL SUMMARY", self.styles["SectionHeading"])
            )
            elements.append(Paragraph(data["bio"], self.styles["CustomBody"]))
            elements.append(Spacer(1, 0.2 * inch))

        # Skills
        if data.get("skills"):
            elements.append(Paragraph("SKILLS", self.styles["SectionHeading"]))

            skills = data["skills"]
            if isinstance(skills, dict):
                # Categorized skills
                for category, skill_list in skills.items():
                    skills_text = f"<b>{category}:</b> {', '.join(skill_list)}"
                    elements.append(Paragraph(skills_text, self.styles["CustomBody"]))
            else:
                # Simple list
                skills_text = ", ".join(skills)
                elements.append(Paragraph(skills_text, self.styles["CustomBody"]))

            elements.append(Spacer(1, 0.2 * inch))

        # Work Experience
        if data.get("experience"):
            elements.append(Paragraph("WORK EXPERIENCE", self.styles["SectionHeading"]))

            for exp in data["experience"]:
                # Job title and company
                job_title = exp.get("title", "Position")
                company = exp.get("company", "Company")
                dates = f"{exp.get('start_date', 'Start')} - {exp.get('end_date', 'Present')}"

                title_text = f"<b>{job_title}</b> at {company}"
                elements.append(Paragraph(title_text, self.styles["CustomBody"]))

                # Dates and location
                location_text = dates
                if exp.get("location"):
                    location_text += f" | {exp['location']}"
                elements.append(
                    Paragraph(f"<i>{location_text}</i>", self.styles["CustomBody"])
                )

                # Responsibilities
                if exp.get("responsibilities"):
                    for resp in exp["responsibilities"]:
                        elements.append(
                            Paragraph(f"• {resp}", self.styles["CustomBody"])
                        )

                elements.append(Spacer(1, 0.15 * inch))

        # Projects
        if data.get("projects"):
            elements.append(Paragraph("PROJECTS", self.styles["SectionHeading"]))

            for proj in data["projects"]:
                # Project name
                proj_name = proj.get("name", "Project")
                elements.append(
                    Paragraph(f"<b>{proj_name}</b>", self.styles["CustomBody"])
                )

                # Description
                if proj.get("description"):
                    elements.append(
                        Paragraph(proj["description"], self.styles["CustomBody"])
                    )

                # Technologies
                if proj.get("technologies"):
                    tech_text = (
                        f"<i>Technologies: {', '.join(proj['technologies'])}</i>"
                    )
                    elements.append(Paragraph(tech_text, self.styles["CustomBody"]))

                # URL
                if proj.get("url"):
                    url_text = f'<link href="{proj["url"]}">{proj["url"]}</link>'
                    elements.append(Paragraph(url_text, self.styles["CustomBody"]))

                elements.append(Spacer(1, 0.15 * inch))

        # Education
        if data.get("education"):
            elements.append(Paragraph("EDUCATION", self.styles["SectionHeading"]))

            for edu in data["education"]:
                degree = edu.get("degree", "Degree")
                field = edu.get("field", "Field")
                school = edu.get("school", "School")
                grad_date = edu.get("graduation_date", "Graduation Date")

                edu_text = f"<b>{degree} in {field}</b>"
                elements.append(Paragraph(edu_text, self.styles["CustomBody"]))

                school_text = f"{school} | {grad_date}"
                elements.append(
                    Paragraph(f"<i>{school_text}</i>", self.styles["CustomBody"])
                )

                # GPA or honors
                if edu.get("gpa"):
                    elements.append(
                        Paragraph(f"GPA: {edu['gpa']}", self.styles["CustomBody"])
                    )
                if edu.get("honors"):
                    elements.append(Paragraph(edu["honors"], self.styles["CustomBody"]))

                elements.append(Spacer(1, 0.15 * inch))

        # Certifications
        if data.get("certifications"):
            elements.append(Paragraph("CERTIFICATIONS", self.styles["SectionHeading"]))

            for cert in data["certifications"]:
                cert_name = cert.get("name", "Certification")
                issuer = cert.get("issuer", "Issuer")
                cert_date = cert.get("date", "")

                cert_text = f"• <b>{cert_name}</b> - {issuer}"
                if cert_date:
                    cert_text += f" ({cert_date})"

                elements.append(Paragraph(cert_text, self.styles["CustomBody"]))

        # Footer
        elements.append(Spacer(1, 0.5 * inch))
        elements.append(
            HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC"))
        )
        footer_text = f"Generated on {datetime.now().strftime('%B %d, %Y')}"
        elements.append(Paragraph(footer_text, self.styles["ContactInfo"]))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer

    def generate_simple_pdf(self, content: str, title: str = "Document") -> io.BytesIO:
        """
        Generate a simple PDF from text content

        Args:
            content: Text content
            title: Document title

        Returns:
            BytesIO buffer containing the PDF file
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=self.page_size,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch,
        )

        elements = []

        # Title
        elements.append(Paragraph(title, self.styles["CustomTitle"]))
        elements.append(Spacer(1, 0.3 * inch))

        # Content
        paragraphs = content.split("\n\n")
        for para in paragraphs:
            if para.strip():
                elements.append(Paragraph(para.strip(), self.styles["CustomBody"]))
                elements.append(Spacer(1, 0.1 * inch))

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return buffer


# Singleton instance
_pdf_generator = None


def get_pdf_generator() -> PDFGenerator:
    """Get or create PDFGenerator singleton"""
    global _pdf_generator
    if _pdf_generator is None:
        _pdf_generator = PDFGenerator()
    return _pdf_generator
