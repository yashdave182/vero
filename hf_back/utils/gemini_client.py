"""
Gemini AI Client
Handles all interactions with Google's Gemini 2.5 Flash API
"""

import json
import os
import sys
from typing import Any, Dict, List, Optional

import google.generativeai as genai


class GeminiClient:
    """Client for Google Gemini AI API"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Gemini client

        Args:
            api_key: Google Gemini API key (optional, reads from env if not provided)
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")

        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")

        # Configure Gemini
        genai.configure(api_key=self.api_key)

        # Initialize model (Gemini 2.5 Flash)
        self.model = genai.GenerativeModel("gemini-2.0-flash-exp")

        # Safety settings
        self.safety_settings = [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE",
            },
        ]

        print(f"✓ Gemini AI client initialized successfully", file=sys.stderr)

    def generate_text(
        self, prompt: str, temperature: float = 0.7, max_tokens: int = 2048
    ) -> str:
        """
        Generate text using Gemini

        Args:
            prompt: Input prompt
            temperature: Creativity level (0.0 to 1.0)
            max_tokens: Maximum response length

        Returns:
            Generated text
        """
        try:
            generation_config = {
                "temperature": temperature,
                "max_output_tokens": max_tokens,
                "top_p": 0.95,
                "top_k": 40,
            }

            response = self.model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=self.safety_settings,
            )

            return response.text

        except Exception as e:
            print(f"Error generating text: {str(e)}", file=sys.stderr)
            raise

    def enhance_resume_description(self, description: str, role: str = "") -> str:
        """
        Enhance a resume job description

        Args:
            description: Original description
            role: Job role/title for context

        Returns:
            Enhanced description
        """
        prompt = f"""You are a professional resume writer. Enhance the following job description to be more impactful and achievement-focused.

Role: {role}
Original Description: {description}

Requirements:
- Use strong action verbs
- Quantify achievements where possible
- Focus on impact and results
- Keep it concise (2-3 sentences)
- Professional tone
- Do not add fake numbers or achievements

Enhanced Description:"""

        return self.generate_text(prompt, temperature=0.5)

    def generate_cover_letter(self, data: Dict[str, Any]) -> str:
        """
        Generate a personalized cover letter

        Args:
            data: Dictionary containing:
                - name: Applicant name
                - company: Company name
                - position: Job position
                - skills: List of relevant skills
                - experience: Brief experience summary
                - tone: Tone (formal, creative, technical)

        Returns:
            Complete cover letter text
        """
        tone_guides = {
            "formal": "Professional and formal business style",
            "creative": "Engaging and creative while remaining professional",
            "technical": "Technical and detail-oriented style",
        }

        tone = data.get("tone", "formal")
        tone_guide = tone_guides.get(tone, tone_guides["formal"])

        prompt = f"""Write a compelling cover letter with the following details:

Applicant Name: {data.get("name", "Applicant")}
Company: {data.get("company", "the company")}
Position: {data.get("position", "the position")}
Relevant Skills: {", ".join(data.get("skills", []))}
Experience Summary: {data.get("experience", "No experience provided")}

Tone: {tone_guide}

Structure:
1. Opening paragraph: Show enthusiasm and mention how you learned about the position
2. Body paragraphs (2-3): Highlight relevant skills and experiences
3. Closing paragraph: Express interest in an interview and thank them

Requirements:
- Personalized and specific to the role
- Highlight relevant achievements
- Professional formatting
- 3-4 paragraphs
- Do not include [Date] or address placeholders

Cover Letter:"""

        return self.generate_text(prompt, temperature=0.7, max_tokens=1500)

    def generate_proposal(self, data: Dict[str, Any]) -> str:
        """
        Generate a business proposal

        Args:
            data: Dictionary containing:
                - client_name: Client name
                - project_title: Project title
                - scope: Project scope
                - timeline: Expected timeline
                - budget: Budget estimate (optional)
                - deliverables: List of deliverables

        Returns:
            Complete proposal text
        """
        prompt = f"""Create a professional business proposal with the following details:

Client: {data.get("client_name", "Client")}
Project: {data.get("project_title", "Project")}
Scope: {data.get("scope", "Not specified")}
Timeline: {data.get("timeline", "To be determined")}
Budget: {data.get("budget", "To be discussed")}
Deliverables: {", ".join(data.get("deliverables", []))}

Structure:
1. Executive Summary
2. Project Overview
3. Scope of Work
4. Deliverables
5. Timeline
6. Investment (if budget provided)
7. Next Steps

Requirements:
- Professional and persuasive
- Clear and specific
- Well-structured with sections
- Professional tone

Proposal:"""

        return self.generate_text(prompt, temperature=0.6, max_tokens=2048)

    def enhance_contract_terms(self, contract_type: str, custom_terms: str = "") -> str:
        """
        Generate or enhance contract terms

        Args:
            contract_type: Type of contract (freelance, service, nda, etc.)
            custom_terms: Custom requirements or terms

        Returns:
            Contract terms text
        """
        prompt = f"""Generate professional contract terms for a {contract_type} agreement.

Custom Requirements: {custom_terms if custom_terms else "Standard terms"}

Include:
1. Scope of Services
2. Payment Terms
3. Timeline and Deadlines
4. Intellectual Property Rights
5. Confidentiality
6. Termination Clause
7. Liability and Warranties

Requirements:
- Professional legal language
- Clear and specific
- Balanced for both parties
- Industry-standard terms
- Add disclaimer that this should be reviewed by legal counsel

Contract Terms:"""

        return self.generate_text(prompt, temperature=0.4, max_tokens=2048)

    def enhance_portfolio_description(self, project_data: Dict[str, Any]) -> str:
        """
        Enhance portfolio project description

        Args:
            project_data: Dictionary containing:
                - title: Project title
                - description: Current description
                - technologies: List of technologies used
                - role: Your role in the project

        Returns:
            Enhanced project description
        """
        prompt = f"""Enhance this portfolio project description to be more compelling and professional:

Project: {project_data.get("title", "Project")}
Current Description: {project_data.get("description", "")}
Technologies: {", ".join(project_data.get("technologies", []))}
Role: {project_data.get("role", "Developer")}

Requirements:
- Start with impact/achievement
- Highlight technical skills
- Mention problem solved
- Keep concise (3-4 sentences)
- Professional and engaging

Enhanced Description:"""

        return self.generate_text(prompt, temperature=0.6)

    def generate_skills_summary(
        self, skills: List[str], experience_years: int = 0
    ) -> str:
        """
        Generate a professional skills summary

        Args:
            skills: List of skills
            experience_years: Years of experience

        Returns:
            Skills summary paragraph
        """
        prompt = f"""Create a compelling professional summary for someone with:

Skills: {", ".join(skills)}
Years of Experience: {experience_years if experience_years > 0 else "Entry-level"}

Requirements:
- 2-3 sentences
- Highlight key strengths
- Professional tone
- Focus on value proposition
- Do not exaggerate

Professional Summary:"""

        return self.generate_text(prompt, temperature=0.6, max_tokens=300)

    def improve_text_quality(self, text: str, style: str = "professional") -> str:
        """
        General purpose text improvement

        Args:
            text: Text to improve
            style: Desired style (professional, casual, technical, creative)

        Returns:
            Improved text
        """
        prompt = f"""Improve the following text in a {style} style:

Original: {text}

Requirements:
- Fix grammar and spelling
- Improve clarity and flow
- Maintain original meaning
- Use appropriate vocabulary
- Keep similar length

Improved Text:"""

        return self.generate_text(prompt, temperature=0.5)

    def generate_json_structured(
        self, prompt: str, schema: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate structured JSON response

        Args:
            prompt: Prompt for generation
            schema: Expected JSON schema

        Returns:
            Dictionary with generated data
        """
        full_prompt = f"""{prompt}

Respond with valid JSON matching this structure:
{json.dumps(schema, indent=2)}

JSON Response:"""

        response_text = self.generate_text(full_prompt, temperature=0.5)

        try:
            # Extract JSON from response
            if "```json" in response_text:
                json_str = response_text.split("```json")[1].split("```")[0].strip()
            elif "```" in response_text:
                json_str = response_text.split("```")[1].split("```")[0].strip()
            else:
                json_str = response_text.strip()

            return json.loads(json_str)

        except Exception as e:
            print(f"Error parsing JSON: {str(e)}", file=sys.stderr)
            return {}


# Singleton instance
_gemini_client = None


def get_gemini_client() -> GeminiClient:
    """Get or create Gemini client singleton"""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client
