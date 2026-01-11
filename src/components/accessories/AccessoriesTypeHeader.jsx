// src/components/accessories/AccessoriesTypeHeader.jsx
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../../pages/WomenPage.css';

const MAIN_ACCESSORY_CATS = [
  { key: 'jewellery', label: 'Jewellery', img: '/images/jewl.jfif' },
  { key: 'shawls', label: 'Shawls', img: '/images/womenshawl1.jfif' },
  {
    key: 'hair-accessories',
    label: 'Hair Accessories',
    img: '/images/scarf.jfif',
  },
];

const SUB_CATEGORY_MAP = {
  JEWELLRY: [
    { key: 'Necklace', label: 'Necklaces', img: '/images/womennecklace.jfif' },
    { key: 'Earrings', label: 'Earrings', img: '/images/womenearings.jfif' },
  ],
  SHAWLS: [{ key: 'Shawl', label: 'Shawls', img: '/images/womenshawl1.jfif' }],
  'HAIR ACCESSORIES': [
    { key: 'Claw Clip', label: 'Claw Clips', img: '/images/hair.jfif' },
    { key: 'Scrunchies', label: 'Scrunchies', img: '/images/j3.jfif' },
    { key: 'Hair Band', label: 'Hair Bands', img: '/images/j6.jfif' },
  ],
};

export default function AccessoriesTypeHeader({
  mainCategory,
  activeSubCategory,
  onSubCategoryChange,
}) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const urlCat = (searchParams.get('cat') || '').toLowerCase();

  // ROOT accessories
  if (!mainCategory) {
    return (
      <section className="u-type-wrapper u-type-wrapper-small">
        <h2 className="u-type-title u-type-title-small">ACCESSORIES</h2>

        <div className="u-type-circles-row-small">
          {MAIN_ACCESSORY_CATS.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`u-type-style-circle ${
                urlCat === c.key ? 'active' : ''
              }`}
              onClick={() => navigate(`/accessories?cat=${c.key}`)}
            >
              <div className="u-type-img-circle-small">
                <img src={c.img} alt={c.label} />
              </div>
              <p className="u-type-label-small">{c.label}</p>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const subCats = SUB_CATEGORY_MAP[mainCategory] || [];
  if (subCats.length === 0) return null;

  return (
    <section className="u-type-wrapper u-type-wrapper-small">
      <h2 className="u-type-title u-type-title-small">{mainCategory}</h2>

      <div className="u-type-circles-row-small">
        {subCats.map((sub) => (
          <button
            key={sub.key}
            type="button"
            className={`u-type-style-circle ${
              activeSubCategory === sub.key ? 'active' : ''
            }`}
            onClick={() => onSubCategoryChange(sub.key)}
          >
            <div className="u-type-img-circle-small">
              <img src={sub.img} alt={sub.label} />
            </div>
            <p className="u-type-label-small">{sub.label}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
