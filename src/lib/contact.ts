// This file contains utilities for client-side contact form handling
// For production, consider moving the Resend calls to a backend API

import { ContactFormData, emailService } from './resend';

export interface ContactFormSubmissionResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * Handle contact form submission
 * In production, this should be moved to a backend API endpoint
 */
export async function submitContactForm(formData: ContactFormData): Promise<ContactFormSubmissionResult> {
  try {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return {
        success: false,
        message: 'Please fill in all required fields.',
        error: 'VALIDATION_ERROR'
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
        error: 'INVALID_EMAIL'
      };
    }

    // For client-side demo, we'll simulate the API call
    // In production, replace this with a fetch call to your backend API
    const result = await emailService.sendContactForm(formData);

    if (result.success) {
      return {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
      };
    } else {
      return {
        success: false,
        message: 'Failed to send your message. Please try again or contact us directly via WhatsApp.',
        error: result.error
      };
    }
  } catch (error) {
    console.error('Contact form submission error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again or contact us directly via WhatsApp.',
      error: 'UNEXPECTED_ERROR'
    };
  }
}

/**
 * Validate contact form data
 */
export function validateContactForm(formData: ContactFormData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.name.trim()) {
    errors.push('Name is required');
  }

  if (!formData.email.trim()) {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  if (!formData.subject.trim()) {
    errors.push('Subject is required');
  }

  if (!formData.message.trim()) {
    errors.push('Message is required');
  }

  if (formData.phone && formData.phone.trim()) {
    // Validate Kenyan phone number format
    const phoneRegex = /^(\+254|254|0)[17]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      errors.push('Please enter a valid Kenyan phone number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
