import { SEORequest } from '../types';

const WORKER_URL = '/api/generate';

export async function generateSEOData(data: SEORequest): Promise<string> {
  const prompt = `
    Act as an expert Etsy SEO Consultant. 
    Generate a high-converting Etsy listing for the following product:
    
    Product Name: ${data.productName}
    ${data.storeName ? `Store Name: ${data.storeName}` : ''}
    Initial Description: ${data.productDescription}
    Target Audience: ${data.targetAudience}
    Style/Vibe: ${data.style}

    Please provide the following sections exactly:
    
    # TITLE
    (Catchy, SEO-optimised Title, max 140 chars, using high-volume keywords)

    # DESCRIPTION
    (Compelling, formatted Product Description that highlights benefits and features)

    # 13 SEO TAGS
    (Provide EXACTLY 13 unique tags, comma separated. This is critical for Etsy SEO. Do not provide fewer than 13. Ensure they are relevant, high-volume keywords.)

    # AI IMAGE PROMPTS
    (Provide 3 detailed prompts for generating product photos in an AI image generator)

    CRITICAL INSTRUCTION: You MUST provide EXACTLY 13 tags in the "# 13 SEO TAGS" section. This is a mandatory requirement for the user's Etsy shop optimisation.

    Ensure the tone is professional yet inviting. ${data.storeName ? `Include the store name "${data.storeName}" naturally where appropriate.` : 'Do not mention a specific store name.'}
  `;

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    const responseText = await response.text();
    
    if (!response.ok) {
      console.error(`[AI Service] Request failed with status ${response.status}`);
      let errorMessage = `Server Error (${response.status})`;
      try {
        const errorJson = JSON.parse(responseText);
        console.error(`[AI Service] Error details:`, errorJson);
        errorMessage = errorJson.details || errorJson.error || errorMessage;
      } catch {
        console.error(`[AI Service] Raw error response:`, responseText.substring(0, 500));
        errorMessage = responseText.substring(0, 100) || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Try to parse as JSON
    try {
      const result = JSON.parse(responseText);
      if (typeof result === 'string') return result;
      if (result.response) return result.response;
      if (result.text) return result.text;
      if (result.result) return result.result;
      return JSON.stringify(result, null, 2);
    } catch {
      // If not JSON, return as is
      return responseText;
    }
  } catch (error) {
    console.error('Error calling AI worker:', error);
    throw error;
  }
}
