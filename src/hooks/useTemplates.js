/**
 * useTemplates Hook
 *
 * Custom React hook for fetching and managing templates from the backend API
 * Backend: https://huggingface.co/spaces/omgy/vero_template
 *
 * Usage:
 *   const { templates, loading, error, refetch } = useTemplates();
 */

import { useEffect, useState, useCallback } from "react";
import { fetchTemplates, fetchTemplateById } from "../lib/templateService";

/**
 * Fetch all templates from backend
 */
export function useTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchTemplates();

    if (result.success) {
      setTemplates(result.templates);
    } else {
      setError(result.error);
      // Fallback to default templates if API fails
      setTemplates(getDefaultTemplates());
    }

    setLoading(false);
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { templates, loading, error, refetch };
}

/**
 * Fetch a specific template by ID
 *
 * @param {string} templateId - Template ID
 */
export function useTemplate(templateId) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!templateId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchTemplateById(templateId);

      if (result.success) {
        setTemplate(result.template);
      } else {
        setError(result.error);
        // Fallback to default template
        const defaultTemplates = getDefaultTemplates();
        const fallback = defaultTemplates.find((t) => t.id === templateId);
        setTemplate(fallback || null);
      }

      setLoading(false);
    };

    fetchData();
  }, [templateId]);

  return { template, loading, error };
}

/**
 * Hook for template generation state management
 */
export function useTemplateGeneration() {
  const [generating, setGenerating] = useState(false);
  const [generatedDocument, setGeneratedDocument] = useState(null);
  const [error, setError] = useState(null);

  const generate = useCallback(async (generateFn) => {
    setGenerating(true);
    setError(null);
    setGeneratedDocument(null);

    try {
      const result = await generateFn();

      if (result.success) {
        setGeneratedDocument(result.document);
        return result;
      } else {
        setError(result.error);
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGenerating(false);
    setGeneratedDocument(null);
    setError(null);
  }, []);

  return { generating, generatedDocument, error, generate, reset };
}

/**
 * Default/fallback templates when API is unavailable
 */
function getDefaultTemplates() {
  return [
    {
      id: "resume",
      name: "Resume Generator",
      description: "Create a professional resume that stands out",
      icon: "📄",
      category: "Career",
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
    },
    {
      id: "cover-letter",
      name: "Cover Letter",
      description: "Craft personalized cover letters quickly",
      icon: "✉️",
      category: "Career",
      fields: ["name", "email", "phone", "company", "position", "content"],
    },
    {
      id: "proposal",
      name: "Proposal Builder",
      description: "Write compelling client proposals with AI",
      icon: "📝",
      category: "Business",
      fields: [
        "title",
        "client",
        "description",
        "timeline",
        "budget",
        "deliverables",
      ],
    },
    {
      id: "invoice",
      name: "Invoice Template",
      description: "Professional invoices for your clients",
      icon: "🧾",
      category: "Business",
      fields: [
        "invoiceNumber",
        "clientName",
        "clientEmail",
        "date",
        "dueDate",
        "items",
        "total",
      ],
    },
    {
      id: "contract",
      name: "Contract Template",
      description: "Freelance contracts and agreements",
      icon: "📋",
      category: "Legal",
      fields: [
        "contractType",
        "clientName",
        "freelancerName",
        "projectDescription",
        "startDate",
        "endDate",
        "payment",
      ],
    },
    {
      id: "portfolio-pdf",
      name: "Portfolio PDF",
      description: "Export your portfolio as a PDF",
      icon: "📁",
      category: "Portfolio",
      fields: ["name", "title", "bio", "projects", "skills", "socials"],
    },
  ];
}

/**
 * Hook to filter templates by category
 *
 * @param {Array} templates - Array of templates
 * @param {string} category - Category to filter by ('All' shows all)
 */
export function useFilteredTemplates(templates, category = "All") {
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (category === "All") {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(
        templates.filter((template) => template.category === category),
      );
    }
  }, [templates, category]);

  return filteredTemplates;
}

/**
 * Hook to get unique categories from templates
 *
 * @param {Array} templates - Array of templates
 */
export function useTemplateCategories(templates) {
  const [categories, setCategories] = useState(["All"]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const uniqueCategories = [
      "All",
      ...new Set(templates.map((t) => t.category)),
    ];
    setCategories(uniqueCategories);
  }, [templates]);

  return categories;
}
