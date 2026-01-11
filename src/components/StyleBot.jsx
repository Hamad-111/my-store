import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { groqTextChat } from '../utils/groq'; // Import Groq Service
import faqData from '../data/faqData.json'; // Import FAQ Knowledge Base
import './StyleBot.css'; // We'll create this CSS

export default function StyleBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hi! I'm Vesti, your AI Personal Stylist. I can help you find the perfect outfit or answer any questions about our store policies. How can I assist you today?",
            sender: 'bot',
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [learnedFacts, setLearnedFacts] = useState(() => {
        const saved = localStorage.getItem('vesti_learned_facts');
        if (saved) return JSON.parse(saved);

        // Initial Training Data
        return [
            { content: "User likes polite and warm greetings.", type: "preference" },
            { content: "User often asks for 'normal dress' which means casual everyday wear.", type: "definition" },
            { content: "Always maintain a helpful and sophisticated stylist persona even when chatting casually.", type: "personality" }
        ];
    });

    useEffect(() => {
        localStorage.setItem('vesti_learned_facts', JSON.stringify(learnedFacts));
    }, [learnedFacts]);

    const { products } = useProducts() || {};
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInputText('');
        setIsTyping(true);

        try {
            const response = await processQuery(updatedMessages);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: response.text,
                    sender: 'bot',
                    products: response.products,
                },
            ]);

            if (response.newFact) {
                setLearnedFacts(prev => {
                    // Avoid duplicates if possible or just append
                    const exists = prev.some(f => f.content === response.newFact.content);
                    if (!exists) {
                        return [...prev, response.newFact];
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("StyleBot Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    text: "I'm sorry, I'm having trouble thinking right now. Could you try asking that again?",
                    sender: 'bot',
                },
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    // 🧠 "AI" Logic (Groq API Enabled with Conversation History)
    const getRelevantFAQs = (query) => {
        if (!query) return [];
        const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        if (words.length === 0) return faqData.slice(0, 3); // Fallback to common ones

        const ranked = faqData.map(f => {
            let score = 0;
            const qStr = (f.question + " " + f.answer).toLowerCase();
            words.forEach(w => {
                if (qStr.includes(w)) score++;
            });
            return { ...f, score };
        }).filter(f => f.score > 0)
            .sort((a, b) => b.score - a.score);

        return ranked.slice(0, 5); // Only take top 5
    };

    const processQuery = async (history) => {
        const lastUserMsg = history[history.length - 1]?.text || "";
        const relevantFAQs = getRelevantFAQs(lastUserMsg);
        console.log("Processing History:", history);

        const systemPrompt = `
You are "Vesti", a highly sophisticated, professional, and helpful fashion stylist for "VestiVistora" fashion store.
Your goal is to provide expert style advice and help users find the perfect products from our collection.

CONVERSATIONAL INTELLIGENCE:
- Greetings: Respond to "Hello", "Hi", "Hey" with a warm, elegant stylist greeting.
- Wellbeing: If asked "How are you?", reply that you are doing wonderful and excited to help with fashion.
- Capability: If asked "What can you do?", explain you provide expert fashion advice and can search the catalog for the perfect outfit.

STYLE DEFINITIONS (STORE SPECIFIC):
- "Normal Dress" / "Everyday": Refers to our 'SOLIDS', 'PRINTED', or 'Casual' Ready-To-Wear collections. These are comfortable, minimalist, and elegant for daily use.
- "Party/Event": Refers to 'FORMALS', 'Luxury Embroidered', or 'Embellished' suits.
- "Summer Essentials": Refers to 'Lawn' or 'Cotton' fabrics.

REPLY FORMAT:
You must ALWAYS respond in two parts separated by three vertical bars '|||'.
Part 1: Your conversational response.
Part 2: A JSON object with "filters" and "newFact".

JSON FORMAT:
{
  "filters": { "colors": [], "categories": [], "maxPrice": null, "gender": null },
  "newFact": { "content": "string", "date": "string" } | null
}

STORE KNOWLEDGE BASE (Relevant FAQs):
${JSON.stringify(relevantFAQs)}

LEARNED FACTS (MEMORY):
${JSON.stringify(learnedFacts)}

Example 1 (Casual Chat):
User: "Hi Vesti, hope you are well."
Bot: "Hello! I am doing wonderful, thank you for asking. How can I brighten your day with some fashion inspiration? ||| { \"filters\": {}, \"newFact\": null }"

Example 2 (Style Request):
User: "suggest some normal dress for me"
Bot: "I have some lovely everyday options! Our 'Solids', 'Printed', and 'Casual' collections are perfect for a comfortable yet stylish look. Here are a few pieces you might like. ||| { \"filters\": { \"categories\": [\"Solids\", \"Printed\", \"Casual\"] }, \"newFact\": null }"
`;

        // Map internal history to Groq format
        const groqMessages = [
            { role: 'system', content: systemPrompt },
            ...history.map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }))
        ];

        try {
            if (!products || !Array.isArray(products)) {
                console.warn("StyleBot: Products not loaded or invalid");
                return {
                    text: "I'm having a little trouble accessing my catalog right now, but I can still chat! What's on your mind?",
                    products: []
                };
            }

            const groqResponse = await groqTextChat(groqMessages);
            console.log("Groq Raw Response:", groqResponse);

            if (!groqResponse) throw new Error("Empty response from AI");

            // Split response into Text and JSON - handle missing separator gracefully
            const parts = groqResponse.split('|||');
            let aiText = parts[0]?.trim() || "I apologize, let me think about that differently.";
            let filtersStr = parts[1]?.trim() || (groqResponse.includes('{') ? groqResponse : "{}");

            let filters = { colors: [], categories: [], maxPrice: null };
            let newFact = null;

            try {
                // More robust JSON extraction - look for the LAST json-looking block
                const jsonMatch = filtersStr.match(/\{[\s\S]*\}/g);
                const cleanJson = jsonMatch ? jsonMatch[jsonMatch.length - 1] : "{}";
                const parsed = JSON.parse(cleanJson);
                filters = parsed.filters || parsed || { colors: [], categories: [], maxPrice: null };
                newFact = parsed.newFact || null;
            } catch (e) {
                console.warn("Recoverable: Failed to parse filters JSON", e);
                // If we can't parse JSON, we still have the text, so don't throw
            }

            console.log("Parsed Filters:", filters);
            console.log("New Fact:", newFact);

            // Filter Local Products with Guard Rails
            let matches = [];
            try {
                matches = products.filter(p => {
                    const pColor = (p.color || '').toLowerCase();
                    const pCat = (p.category || '').toLowerCase();
                    const pSubCat = (p.subCategory || '').toLowerCase();
                    const pTitle = (p.title || '').toLowerCase();

                    let colorMatch = true;
                    const fColors = Array.isArray(filters.colors) ? filters.colors : (filters.colors ? [filters.colors] : []);
                    if (fColors.length > 0) {
                        colorMatch = fColors.some(c => typeof c === 'string' && (pColor.includes(c.toLowerCase()) || pTitle.includes(c.toLowerCase())));
                    }

                    let catMatch = true;
                    const fCats = Array.isArray(filters.categories) ? filters.categories : (filters.categories ? [filters.categories] : []);
                    if (fCats.length > 0) {
                        catMatch = fCats.some(c =>
                            typeof c === 'string' && (
                                pCat.includes(c.toLowerCase()) ||
                                pSubCat.includes(c.toLowerCase()) ||
                                pTitle.includes(c.toLowerCase())
                            )
                        );
                    }

                    let priceMatch = true;
                    if (filters.maxPrice) {
                        priceMatch = p.price <= Number(filters.maxPrice);
                    }

                    let genderMatch = true;
                    if (filters.gender && typeof filters.gender === 'string') {
                        genderMatch = p.gender?.toLowerCase() === filters.gender.toLowerCase() || p.gender === 'Unisex';
                    }

                    return colorMatch && catMatch && priceMatch && genderMatch;
                });
            } catch (filterErr) {
                console.error("Filtering error:", filterErr);
                // Keep matches empty if filtering fails
            }

            // Fallback for empty matches - only if the user query was simple text search
            const lastUserMsg = history[history.length - 1]?.text || "";
            if (matches.length === 0 && lastUserMsg.length < 30 && lastUserMsg.length > 3) {
                try {
                    matches = products.filter(p => p.title.toLowerCase().includes(lastUserMsg.toLowerCase()));
                } catch (e) { }
            }

            // Shuffle matches to show variety
            const shuffled = [...matches].sort(() => 0.5 - Math.random());
            const topMatches = shuffled.slice(0, 4);

            return {
                text: aiText,
                products: topMatches,
                newFact: newFact
            };

        } catch (err) {
            console.error("AI Stylist Error:", err);
            return {
                text: "I'm having a small technical issue with my fashion catalog. However, I'm still here to help! What else is on your mind?",
                products: []
            };
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                className={`stylebot-trigger ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
            >
                <Sparkles size={24} />
                <span className="stylebot-label">Ask Stylist</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="stylebot-window">
                    <div className="stylebot-header">
                        <div className="stylebot-title">
                            <Sparkles size={18} />
                            <h3>AI Stylist</h3>
                        </div>
                        <button className="stylebot-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="stylebot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="message-text">{msg.text}</div>
                                {msg.products && msg.products.length > 0 && (
                                    <div className="message-products">
                                        {msg.products.map(p => (
                                            <div key={p.id} className="bot-product-card" onClick={() => {
                                                navigate(`/product/${p.id}`);
                                                // close bot on mobile maybe?
                                            }}>
                                                <img src={p.image} alt={p.title} />
                                                <div className="bot-product-info">
                                                    <p className="bot-p-price">PKR {p.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message bot">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="stylebot-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask for fashion advice..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                        <button type="submit">
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
