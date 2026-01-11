export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Helper to convert file to base64
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Call Groq API for Text
 */
export const groqTextChat = async (messages) => {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // Fast and supported successor
                messages: messages,
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || `Groq API Error: ${response.status}`);
        }
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq Text API Error:', error);
        throw error; // Throw so StyleBot can catch and display it
    }
};

/**
 * Call Groq API for Vision
 */
export const groqVisionChat = async (base64Image, promptText = "Describe this fashion item. Identify color, main category (e.g. Kurta, Bag, Shoes), and style.") => {
    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: promptText },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: base64Image // Must be data:image/jpeg;base64,...
                                }
                            }
                        ]
                    }
                ],
                model: 'llama-3.2-11b-vision-preview',
                temperature: 0.5,
                max_tokens: 300
            })
        });

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Groq Vision API Error:', error);
        return null;
    }
};
