import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { Sparkles } from 'lucide-react';
import { groqTextChat } from '../utils/groq';

function norm(v) {
  return String(v ?? '')
    .trim()
    .toLowerCase();
}

function asArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return String(v)
    .split(/[,/|]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

// ✅ build a big searchable text per product (ALL possible fields)
function buildSearchBlob(p) {
  const sizes = asArray(p.sizes || p.size).join(' ');
  const tags = asArray(p.tags || p.keywords).join(' ');

  return norm(
    [
      p.title,
      p.name,
      p.brand,
      p.category,
      p.mainCategory,
      p.subCategory,
      p.type,
      p.style,
      p.fabric,
      p.material,
      p.color,
      p.pieces,
      sizes,
      tags,
      p.description,
    ].join(' ')
  );
}

function includesAny(blob, words = []) {
  if (!words.length) return false;
  return words.some((w) => blob.includes(norm(w)));
}

function countMatches(blob, words = []) {
  let score = 0;
  for (const w of words) {
    const ww = norm(w);
    if (!ww) continue;
    if (blob.includes(ww)) score += 1;
  }
  return score;
}

function priceScore(pPrice, currentPrice) {
  const a = Number(pPrice || 0);
  const b = Number(currentPrice || 0);
  if (!a || !b) return 0;
  const diff = Math.abs(a - b);
  const pct = diff / b; // relative diff
  if (pct <= 0.15) return 2; // close
  if (pct <= 0.3) return 1;
  return 0;
}

// basic color harmony boosts (you can expand later)
function colorBoost(pColor, currentColor) {
  const pc = norm(pColor);
  const cc = norm(currentColor);
  if (!pc || !cc) return 0;
  if (pc === cc) return 2;
  if (['gold', 'silver', 'black', 'white', 'nude', 'beige'].includes(pc))
    return 1;
  return 0;
}

export default function AIRecommendations({ currentProduct }) {
  const { products = [] } = useProducts();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // precompute blobs once
  const productIndex = useMemo(() => {
    return products.map((p) => ({
      p,
      blob: buildSearchBlob(p),
    }));
  }, [products]);

  useEffect(() => {
    if (!currentProduct || productIndex.length === 0) return;

    const run = async () => {
      setLoadingAI(true);

      // ✅ current product context (give AI MAX info)
      const currentContext = {
        title: currentProduct.title || currentProduct.name,
        brand: currentProduct.brand,
        mainCategory: currentProduct.mainCategory,
        category: currentProduct.category,
        subCategory: currentProduct.subCategory,
        type: currentProduct.type,
        style: currentProduct.style,
        fabric: currentProduct.fabric,
        material: currentProduct.material,
        color: currentProduct.color,
        sizes: currentProduct.sizes || currentProduct.size,
        price: currentProduct.price,
      };

      const prompt = `
You are a fashion stylist + search expert.
I want "Complete the Look" recommendations from my store catalogue.

Current product:
${JSON.stringify(currentContext, null, 2)}

Return ONLY valid JSON object with this shape:
{
  "keywords": ["..."],              // 6-12 search keywords
  "filters": {
    "brand": ["..."],               // optional
    "color": ["..."],               // optional
    "fabric": ["..."],              // optional
    "material": ["..."],            // optional
    "mainCategory": ["..."],        // optional
    "category": ["..."],            // optional
    "subCategory": ["..."]          // optional
  },
  "intent": "complete_the_look"
}

Rules:
- Keywords should include complementary items (e.g. clutch, heels, earrings, shawl, hair accessories)
- Add color/fabric suggestions if they match the look
- Do NOT add explanations, ONLY JSON
`;

      try {
        const groqRes = await groqTextChat([
          { role: 'system', content: 'You are a helpful fashion stylist.' },
          { role: 'user', content: prompt },
        ]);

        let ai = null;
        try {
          const clean = String(groqRes)
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
          ai = JSON.parse(clean);
        } catch {
          ai = null;
        }

        const keywords = Array.isArray(ai?.keywords) ? ai.keywords : [];
        const filters =
          ai?.filters && typeof ai.filters === 'object' ? ai.filters : {};

        // ✅ filter helper
        const passFilter = (p) => {
          const f = (k) => asArray(filters?.[k]).map(norm);

          const brandF = f('brand');
          const colorF = f('color');
          const fabricF = f('fabric');
          const materialF = f('material');
          const mainCatF = f('mainCategory');
          const catF = f('category');
          const subCatF = f('subCategory');

          const ok = (arr, value) =>
            arr.length ? arr.includes(norm(value)) : true;

          return (
            ok(brandF, p.brand) &&
            ok(colorF, p.color) &&
            ok(fabricF, p.fabric) &&
            ok(materialF, p.material) &&
            ok(mainCatF, p.mainCategory) &&
            ok(catF, p.category) &&
            ok(subCatF, p.subCategory)
          );
        };

        const currentId = String(currentProduct.id);
        const currentPrice = currentProduct.price;
        const currentColor = currentProduct.color;
        const currentBrand = currentProduct.brand;

        // ✅ score + rank
        const ranked = productIndex
          .filter(({ p }) => String(p.id) !== currentId)
          .filter(({ p }) => passFilter(p))
          .map(({ p, blob }) => {
            let score = 0;

            // keyword matching
            const km = countMatches(blob, keywords);
            score += km * 3;

            // same brand small boost (optional)
            if (currentBrand && norm(p.brand) === norm(currentBrand))
              score += 1;

            // color harmony boost
            score += colorBoost(p.color, currentColor);

            // price similarity boost
            score += priceScore(p.price, currentPrice);

            // tiny boost for having image + price
            if (p.image) score += 0.3;
            if (p.price) score += 0.2;

            return { p, score };
          })
          .sort((a, b) => b.score - a.score);

        // ✅ if AI keywords weak, fallback to “related + price”
        let picks = ranked
          .filter((x) => x.score > 0)
          .slice(0, 4)
          .map((x) => x.p);

        if (picks.length < 4) {
          const fallback = productIndex
            .filter(({ p }) => String(p.id) !== currentId)
            .map(({ p, blob }) => {
              const relWords = [
                currentProduct.mainCategory,
                currentProduct.category,
                currentProduct.subCategory,
                currentProduct.fabric,
                currentProduct.material,
              ].filter(Boolean);

              const s =
                countMatches(blob, relWords) * 2 +
                colorBoost(p.color, currentColor) +
                priceScore(p.price, currentPrice);

              return { p, s };
            })
            .sort((a, b) => b.s - a.s)
            .map((x) => x.p);

          for (const item of fallback) {
            if (picks.length >= 4) break;
            if (!picks.find((x) => String(x.id) === String(item.id)))
              picks.push(item);
          }
        }

        setRecommendations(picks);
      } catch (err) {
        console.error('AI Recs Error', err);
        setRecommendations([]);
      } finally {
        setLoadingAI(false);
      }
    };

    run();
  }, [currentProduct, productIndex]);

  if (!currentProduct) return null;

  // ✅ keep section visible even if empty
  const displayItems = recommendations.length
    ? recommendations
    : products.slice(0, 4);

  return (
    <section className="pd-section ai-recommendations">
      <div
        className="ai-title-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '1rem',
        }}
      >
        <Sparkles size={20} color="#FFD700" fill="#FFD700" />
        <h3 className="pd-section-title" style={{ margin: 0 }}>
          AI Style Picks: Complete the Look{' '}
          {loadingAI && (
            <span
              style={{ fontSize: '0.8rem', opacity: 0.7, fontWeight: 'normal' }}
            >
              (Thinking...)
            </span>
          )}
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
                PKR {Number(item.price || 0).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
