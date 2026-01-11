import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Sparkles } from 'lucide-react';
import { groqTextChat } from '../utils/groq';

export default function AIRecommendations({ currentProduct }) {
    const { products } = useProducts();
    const navigate = useNavigate();

    const [recommendations, setRecommendations] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        if (!currentProduct || products.length === 0) return;

        const fetchRecommendations = async () => {
            setLoadingAI(true);

            const currentTitle = currentProduct.title || currentProduct.name;
            const currentCat = currentProduct.category || currentProduct.mainCategory;

            // AI Prompt
            const prompt = `
            I am viewing a fashion product: "${currentTitle}" (Category: ${currentCat}).
            Suggest 3 complementary item categories that would complete this look (e.g. if viewing a suit, suggest heels, clutch, jewelry).
            Return ONLY a JSON array of strings. Example: ["Heels", "Clutch", "Earrings"]
            `;

            try {
                const groqRes = await groqTextChat([
                    { role: 'system', content: 'You are a fashion stylist.' },
                    { role: 'user', content: prompt }
                ]);

                let suggestedCats = [];
                try {
                    const jsonStr = groqRes.replace(/```json/g, '').replace(/```/g, '').trim();
                    suggestedCats = JSON.parse(jsonStr);
                } catch (e) {
                    // Fallback if AI fails json
                    suggestedCats = ['Accessories', 'Footwear', 'Bags'];
                }

                if (!Array.isArray(suggestedCats)) suggestedCats = ['Accessories'];

                // Filter products based on AI suggestions
                const candidates = products.filter(p => {
                    if (p.id === currentProduct.id) return false;

                    const pCat = (p.category || '').toLowerCase();
                    const pMainCat = (p.mainCategory || '').toLowerCase();
                    const pTitle = (p.title || '').toLowerCase();

                    // Check if product matches any suggested category
                    // Check if product matches any suggested category (or default if none found)
                    const matchesCategory = suggestedCats.some(cat =>
                        pCat.includes(cat.toLowerCase()) ||
                        pMainCat.includes(cat.toLowerCase()) ||
                        pTitle.includes(cat.toLowerCase())
                    );

                    // Also check color harmony
                    const pColor = (p.color || '').toLowerCase();
                    const currentColor = (currentProduct.color || '').toLowerCase();
                    const isColorMatch = pColor === currentColor || ['gold', 'silver', 'black', 'white', 'nude'].includes(pColor);

                    // Allow match if Category Matches AND (Color Matches OR We are getting desperate)
                    // If AI gave specific categories, we respect them. If we have few candidates, we might relax color.
                    return matchesCategory && (isColorMatch || suggestedCats.length > 0);

                }).slice(0, 4);

                setRecommendations(candidates);

            } catch (err) {
                console.error("AI Recs Error", err);
                setRecommendations([]);
            } finally {
                setLoadingAI(false);
            }
        };

        fetchRecommendations();

    }, [currentProduct, products]);

    // If no AI recommendations, fallback to generic trending items to ensure section is visible
    const displayItems = recommendations.length > 0 ? recommendations : products.slice(0, 4);

    if (!currentProduct) return null;

    return (
        <section className="pd-section ai-recommendations">
            <div className="ai-title-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Sparkles size={20} color="#FFD700" fill="#FFD700" />
                <h3 className="pd-section-title" style={{ margin: 0 }}>
                    AI Style Picks: Complete the Look {loadingAI && <span style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'normal' }}>(Thinking...)</span>}
                </h3>
            </div>

            <div className="pd-related-grid">
                {displayItems.map((item) => (
                    <div
                        key={item.id}
                        className="pd-related-card"
                        onClick={() => {
                            navigate(`/product/${item.id}`);
                            window.scrollTo(0, 0);
                        }}
                    >
                        <img
                            src={item.image}
                            alt={item.name || item.title}
                            className="pd-related-img"
                        />
                        <div className="pd-related-info">
                            <p className="pd-related-brand">{item.brand}</p>
                            <p className="pd-related-name">{item.name || item.title}</p>
                            <p className="pd-related-price">
                                PKR {item.price.toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
