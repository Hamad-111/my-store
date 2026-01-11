import React, { useState } from 'react';
import { X, Upload, Camera, Loader } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { fileToBase64, groqVisionChat } from '../utils/groq'; // Import Groq
import './VisualSearchModal.css';

export default function VisualSearchModal({ onClose }) {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [results, setResults] = useState(null);

    const { products } = useProducts();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(URL.createObjectURL(selected)); // Preview
            analyzeImage(selected);
        }
    };

    const analyzeImage = async (fileObj) => {
        setAnalyzing(true);
        setResults(null);

        try {
            const base64 = await fileToBase64(fileObj);

            // Call Groq Vision Model
            const jsonResponse = await groqVisionChat(base64, `
                Analyze this fashion image. 
                Identify the following attributes and return ONLY a JSON object:
                - color: string (e.g. "Red", "Blue")
                - category: string (e.g. "Kurta", "Dress", "Bag", "Shoes", "Jewellery")
                - style: string (e.g. "Casual", "Formal", "Party")
                
                Example: {"color": "Red", "category": "Kurta", "style": "Formal"}
                
                Return ONLY JSON.
            `);

            console.log("Groq Vision Response:", jsonResponse);

            let attributes = { color: '', category: '', style: '' };
            if (jsonResponse) {
                try {
                    const jsonStr = jsonResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    attributes = JSON.parse(jsonStr);
                } catch (e) {
                    console.error("Failed to parse Vision JSON", e);
                }
            }

            console.log("Extracted Attributes:", attributes);

            const detectedTags = [attributes.color, attributes.category, attributes.style].filter(Boolean);

            // Filter Products
            const matched = products.filter(p => {
                // Simple keyword matching against our structured data
                const pColor = (p.color || '').toLowerCase();
                const pCat = (p.category || '').toLowerCase(); // ReadyToWear, etc
                const pMainCat = (p.mainCategory || '').toLowerCase(); // UNSTITCHED, ACCESSORIES
                const pTitle = (p.title || '').toLowerCase();

                // Check Color
                const colorMatch = !attributes.color || pColor.includes(attributes.color.toLowerCase()) || pTitle.includes(attributes.color.toLowerCase());

                // Check Category (fuzzy)
                const catMatch = !attributes.category ||
                    pCat.includes(attributes.category.toLowerCase()) ||
                    pMainCat.includes(attributes.category.toLowerCase()) ||
                    pTitle.includes(attributes.category.toLowerCase());

                return colorMatch && catMatch;
            }).slice(0, 4);

            setResults({
                tags: detectedTags.length > 0 ? detectedTags : ['No clear fashion items detected'],
                items: matched
            });

        } catch (error) {
            console.error("Visual Search Error:", error);
            setResults({
                tags: ['Error analyzing image'],
                items: []
            });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="vs-backdrop" onClick={onClose}>
            <div className="vs-modal" onClick={e => e.stopPropagation()}>
                <button className="vs-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className="vs-title">Visual Search <span className="vs-beta">BETA</span></h2>
                <p className="vs-subtitle">Upload an image to find similar products.</p>

                {/* Upload Area */}
                {!file && (
                    <div className="vs-upload-area">
                        <input type="file" accept="image/*" onChange={handleFileChange} id="vs-file" hidden />
                        <label htmlFor="vs-file" className="vs-dropbox">
                            <Camera size={48} className="vs-icon" />
                            <span>Click to Upload or Drag Photo</span>
                        </label>
                    </div>
                )}

                {/* Analysis / Results */}
                {file && (
                    <div className="vs-preview-section">
                        <div className="vs-picked-img-wrapper">
                            <img src={file} alt="search" className="vs-picked-img" />
                            {analyzing && (
                                <div className="vs-scanning-overlay">
                                    <div className="vs-scan-line"></div>
                                </div>
                            )}
                        </div>

                        {analyzing ? (
                            <div className="vs-status">
                                <Loader className="spin" size={20} />
                                <span>Analyzing colors and patterns...</span>
                            </div>
                        ) : (
                            results && (
                                <div className="vs-results-area">
                                    <div className="vs-tags">
                                        <span>Detected: </span>
                                        {results.tags.map(t => <span key={t} className="vs-tag">{t}</span>)}
                                    </div>

                                    <h3>Similar Products Found:</h3>
                                    <div className="vs-grid">
                                        {results.items.map(p => (
                                            <div key={p.id} className="vs-card" onClick={() => {
                                                onClose();
                                                navigate(`/product/${p.id}`);
                                            }}>
                                                <img src={p.image} alt={p.title} />
                                                <div className="vs-info">
                                                    <p className="vs-p-price">PKR {p.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {results.items.length === 0 && <p>No exact matches found.</p>}

                                    <button className="vs-reset" onClick={() => setFile(null)}>Try Another Photo</button>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
