// src/components/women/UnstitchedTypeHeader.jsx
import React from 'react';
import '../../pages/WomenPage.css';

export default function UnstitchedTypeHeader({
  type, // 'WINTER' | 'PRINTED' | 'EMBROIDERED' | 'VELVET'
  activeStyle,
  onStyleChange,
  activePiece,
  onPieceChange,
}) {
  const upperType = (type || '').toUpperCase();
  const title = upperType ? `UNSTITCHED ${upperType}` : 'UNSTITCHED';

  // ✅ Style circles per main type
  const styleOptionsByType = {
    WINTER: [
      { key: 'PRINTED', label: 'Printed', img: '/images/winter.jfif' },
      {
        key: 'EMBROIDERED',
        label: 'Embroidered',
        img: '/images/embroidary4.jfif',
      },
    ],

    // ✅ PRINTED: Signature / Glam / Dailywear
    PRINTED: [
      { key: 'SIGNATURE', label: 'Signature', img: '/images/printed5.jfif' },
      { key: 'GLAM', label: 'Glam', img: '/images/embroidary6.jfif' },
      { key: 'DAILYWEAR', label: 'Dailywear', img: '/images/printed3.jfif' },
    ],

    // ✅ EMBROIDERED: Signature / Glam / Dailywear
    EMBROIDERED: [
      { key: 'SIGNATURE', label: 'Signature', img: '/images/embroidary7.jfif' },
      { key: 'GLAM', label: 'Glam', img: '/images/embroidary4.jfif' },
      { key: 'DAILYWEAR', label: 'Dailywear', img: '/images/embroidary6.jfif' },
    ],

    // ✅ VELVET: no style circles
    VELVET: [],
  };

  const styleOptions = styleOptionsByType[upperType] || [];
  const effectiveStyle = activeStyle || (styleOptions[0]?.key ?? null);

  // ✅ Piece pills depend on TYPE + STYLE
  // (You can change these arrays easily if you want)
  const piecesByTypeAndStyle = {
    WINTER: {
      PRINTED: ['3 Piece', 'Shirt & Trouser', 'Shirt'],
      EMBROIDERED: ['3 Piece', 'Shirt & Trouser'],
    },

    PRINTED: {
      SIGNATURE: ['3 Piece', '2 Piece', 'Shirt'],
      GLAM: ['3 Piece', 'Shirt & Trouser'],
      DAILYWEAR: ['2 Piece', 'Shirt', 'Shirt & Trouser'],
    },

    EMBROIDERED: {
      SIGNATURE: ['3 Piece', '2 Piece'],
      GLAM: ['3 Piece'],
      DAILYWEAR: ['2 Piece', 'Shirt & Trouser'],
    },

    // ❗VELVET: pills row nahi chahiye
    // isliye isko yahan nested style map me nahi rakha
  };

  const piecesOptions =
    upperType === 'VELVET'
      ? ['3 Piece', '2 Piece'] // ✅ Only two buttons, no secondary pills
      : (piecesByTypeAndStyle[upperType] &&
          piecesByTypeAndStyle[upperType][effectiveStyle]) ||
        [];

  const isVelvet = upperType === 'VELVET';

  return (
    <section className="u-type-wrapper u-type-wrapper-small">
      {/* Title */}
      <h2 className="u-type-title u-type-title-small">{title}</h2>

      {/* ✅ Style circles (only if not Velvet) */}
      {!isVelvet && styleOptions.length > 0 && (
        <div className="u-type-circles-row u-type-circles-row-small">
          {styleOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              className={`u-type-style-circle ${
                activeStyle === opt.key ? 'active' : ''
              }`}
              onClick={() => {
                onStyleChange && onStyleChange(opt.key);
                onPieceChange && onPieceChange(null); // reset piece when style changes
              }}
            >
              <div className="u-type-img-circle-small">
                <img src={opt.img} alt={opt.label} />
              </div>
              <p className="u-type-label-small">{opt.label}</p>
            </button>
          ))}
        </div>
      )}

      {/* ✅ Velvet: only 2 buttons (3 Piece / 2 Piece) and NO extra pills row */}
      {isVelvet && piecesOptions.length > 0 && (
        <div className="u-type-pills-row u-type-pills-row-small">
          {piecesOptions.map((p) => (
            <button
              key={p}
              type="button"
              className={`u-type-pill u-type-pill-small ${
                activePiece === p ? 'active' : ''
              }`}
              onClick={() => onPieceChange && onPieceChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Normal types: show pills row */}
      {!isVelvet && piecesOptions.length > 0 && (
        <div className="u-type-pills-row u-type-pills-row-small u-type-pills-row-secondary">
          {piecesOptions.map((p) => (
            <button
              key={p}
              type="button"
              className={`u-type-pill u-type-pill-small ${
                activePiece === p ? 'active' : ''
              }`}
              onClick={() => onPieceChange && onPieceChange(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
