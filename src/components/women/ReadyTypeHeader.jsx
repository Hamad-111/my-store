// src/components/women/ReadyTypeHeader.jsx
import React from 'react';
import '../../pages/WomenPage.css';

export default function ReadyTypeHeader({
  type, // 'EMBROIDERED' | 'PRINTED' | 'SOLIDS' | 'COORDS' | 'FORMALS' | 'KURTIS' | 'BOTTOMS'
  activeSubType, // e.g. 'Casual', 'Semi Formal', '2 Piece', etc.
  onSubTypeChange,
}) {
  const upperType = (type || '').toUpperCase();
  const title = upperType ? `READY TO WEAR ${upperType}` : 'READY TO WEAR';

  // 🎯 image circles per main type
  const styleOptionsByType = {
    EMBROIDERED: [
      { key: 'Casual', label: 'Casual', img: '/images/formals.jfif' },
      { key: 'Semi Formal', label: 'Semi Formal', img: '/images/green4.jfif' },
      { key: 'Luxury', label: 'Luxury', img: '/images/Red2.jfif' },
    ],
    PRINTED: [
      { key: 'Casual', label: 'Casual', img: '/images/formal1.jfif' },
      { key: '2 Piece', label: '2 Piece', img: '/images/product3.jfif' },
      { key: '3 Piece', label: '3 Piece', img: '/images/product1.jfif' },
    ],
    SOLIDS: [
      { key: 'Everyday', label: 'Everyday', img: '/images/solid.jfif' },
      { key: 'Office Wear', label: 'Office Wear', img: '/images/cords2.jfif' },
    ],
    COORDS: [
      { key: '2 Piece', label: '2 Piece', img: '/images/Coords.jfif' },
      { key: '3 Piece', label: '3 Piece', img: '/images/solid1.jfif' },
    ],
    FORMALS: [
      { key: 'Party Wear', label: 'Party Wear', img: '/images/printed.jfif' },
      { key: 'Wedding Wear', label: 'Wedding Wear', img: '/images/Red5.jfif' },
    ],
    KURTIS: [
      {
        key: 'Short Kurti',
        label: 'Short Kurti',
        img: '/images/product8.jfif',
      },
      { key: 'Long Kurti', label: 'Long Kurti', img: '/images/Red7.jfif' },
    ],
    BOTTOMS: [
      { key: 'Trousers', label: 'Trousers', img: '/images/womenbottom.jfif' },
      {
        key: 'Cigarette Pants',
        label: 'Cigarette Pants',
        img: '/images/womenbottom1.jfif',
      },
      { key: 'Shalwar', label: 'Shalwar', img: '/images/womenbottom3.jfif' },
    ],
  };

  const styleOptions = styleOptionsByType[upperType] || [];

  return (
    <section className="u-type-wrapper u-type-wrapper-small">
      <h2 className="u-type-title u-type-title-small">{title}</h2>

      {styleOptions.length > 0 && (
        <div className="u-type-circles-row u-type-circles-row-small">
          {styleOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`u-type-style-circle ${
                activeSubType === opt.key ? 'active' : ''
              }`}
              onClick={() => onSubTypeChange && onSubTypeChange(opt.key)}
            >
              <div className="u-type-img-circle-small">
                <img src={opt.img} alt={opt.label} />
              </div>
              <p className="u-type-label-small">{opt.label}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
