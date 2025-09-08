import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
});

export async function generateLogoPrompts(businessName, industry, style) {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a professional logo designer. Generate creative, unique logo concepts based on user requirements."
        },
        {
          role: "user",
          content: `Create 3 detailed logo concept descriptions for a business called "${businessName}" in the ${industry} industry with a ${style} style. Each description should be 2-3 sentences and include specific visual elements, colors, and typography suggestions.`
        }
      ],
      max_tokens: 500,
      temperature: 0.8,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating logo prompts:', error);
    return `Logo Concept 1: Modern minimalist design featuring the ${businessName} name in clean sans-serif typography with a geometric icon symbol in deep blue and gray tones.

Logo Concept 2: Contemporary approach with stylized lettermark incorporating industry-relevant imagery, using bold typography and a vibrant color palette.

Logo Concept 3: Professional emblem-style logo combining text and symbolic elements with sophisticated color scheme and balanced composition.`;
  }
}

export async function generateAdCopy(productName, targetAudience, platform) {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a professional copywriter specializing in high-converting ad copy."
        },
        {
          role: "user",
          content: `Write 3 compelling ad copy variations for "${productName}" targeting ${targetAudience} on ${platform}. Focus on benefits, clear CTAs, and conversion optimization. Each should be platform-appropriate length.`
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating ad copy:', error);
    return `Ad Copy 1: Transform your business with ${productName}! Join thousands of satisfied customers who've already experienced the difference. Get started today - limited time offer!

Ad Copy 2: Why settle for ordinary when you can have extraordinary? ${productName} delivers results that matter to ${targetAudience}. Try it risk-free now!

Ad Copy 3: The secret to success? ${productName}. Discover what industry leaders already know. Click to unlock your potential today!`;
  }
}

export async function generateContentIdeas(industry, audience) {
  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: "You are a content marketing strategist who creates engaging content ideas."
        },
        {
          role: "user",
          content: `Generate 5 trending content ideas for a ${industry} business targeting ${audience}. Include blog post titles, social media concepts, and engagement strategies.`
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content ideas:', error);
    return `1. "5 Industry Secrets Every ${audience} Should Know" - Share insider tips and build authority
    
2. Behind-the-scenes content showing your process - Builds trust and transparency

3. Customer success stories and testimonials - Social proof that converts

4. "Common Mistakes in ${industry}" educational series - Positions you as the expert

5. Interactive polls and Q&A sessions - Boosts engagement and community building`;
  }
}