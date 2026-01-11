// src/data/WomenProducts.jsx
const womenProducts = [
  // =========================
  // UNSTITCHED — WINTER (4)
  // style: PRINTED / EMBROIDERED
  // =========================
  {
    id: 'w1',
    title: 'Winter Printed Khaddar 3 Piece Suit 01',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'AlKaram',
    color: 'White',
    price: 5500,
    originalPrice: 6500,
    isNew: true,
    salePercent: 15,
    onSale: true,
    inStock: true,
    unstitchedType: 'WINTER',
    style: 'PRINTED',
    pieces: '3 Piece',
    fabric: 'Khaddar',
    tag: 'winter',
    description:
      'Cozy winter printed khaddar 3-piece suit for warm everyday wear.',
    details: `Unstitched 3-Piece

Shirt
• Printed Khaddar Shirt
• Fabric: Khaddar

Dupatta
• Printed Khaddar Dupatta
• Fabric: Khaddar

Trouser
• Dyed Khaddar Trouser
• Fabric: Khaddar`,
    images: [
      '/images/printed.jfif',
      '/images/printed.jfif',
      '/images/printed.jfif',
    ],
    image: '/images/printed.jfif',
    popularity: 95,
  },
  {
    id: 'w2',
    title: 'Winter Printed Khaddar Shirt & Trouser 02',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Sapphire',
    color: 'Red',
    price: 5350,
    inStock: true,
    unstitchedType: 'WINTER',
    style: 'PRINTED',
    pieces: 'Shirt & Trouser',
    fabric: 'Khaddar',
    tag: 'winter',
    isBestSeller: true,
    description: 'Winter printed khaddar co-ord set (shirt & trouser).',
    details: `Unstitched 2-Piece (Co-ord)

Shirt
• Printed Khaddar Shirt
• Fabric: Khaddar

Trouser
• Dyed Khaddar Trouser
• Fabric: Khaddar`,
    images: ['/images/printed2.jfif'],
    image: '/images/printed2.jfif',
    popularity: 90,
  },
  {
    id: 'w3',
    title: 'Winter Embroidered Khaddar 3 Piece Suit 03',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Khaddi', // ✅ sidebar spelling
    color: 'Green',
    price: 6850,
    inStock: true,
    unstitchedType: 'WINTER',
    style: 'EMBROIDERED',
    pieces: '3 Piece',
    fabric: 'Khaddar',
    tag: 'winter',
    description:
      'Winter embroidered khaddar 3-piece suit with classy thread detailing.',
    details: `Unstitched 3-Piece

Shirt
• Embroidered Khaddar Shirt
• Fabric: Khaddar

Dupatta
• Matching Dupatta
• Fabric: Khaddar

Trouser
• Dyed Khaddar Trouser
• Fabric: Khaddar`,
    images: ['/images/embroidary1.jfif'],
    image: '/images/embroidary1.jfif',
    popularity: 88,
  },
  {
    id: 'w4',
    title: 'Winter Embroidered Co-ord Shirt & Trouser 04',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Nishat',
    color: 'Blue', // ✅ colors list me Grey nahi tha? (Grey colors list me nahi) so Blue used
    price: 6850,
    inStock: true,
    unstitchedType: 'WINTER',
    isNew: true,
    style: 'EMBROIDERED',
    pieces: 'Shirt & Trouser',
    fabric: 'Khaddar',
    tag: 'winter',
    description:
      'Winter embroidered khaddar co-ord set for a clean premium look.',
    details: `Unstitched 2-Piece (Co-ord)

Shirt
• Embroidered Khaddar Shirt
• Fabric: Khaddar

Trouser
• Dyed Khaddar Trouser
• Fabric: Khaddar`,
    images: ['/images/winteremb.jfif'],
    image: '/images/winteremb.jfif',
    popularity: 82,
  },

  // =========================
  // UNSTITCHED — PRINTED (3)
  // style: SIGNATURE / GLAM / DAILYWEAR
  // =========================
  {
    id: 'w5',
    title: 'Printed Lawn 3 Piece Suit (Signature) 01',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Nishat',
    color: 'White',
    price: 4200,
    inStock: true,
    unstitchedType: 'PRINTED',
    style: 'SIGNATURE',
    pieces: '3 Piece',
    fabric: 'Lawn',
    tag: 'printed',
    description:
      'Breathable signature printed lawn 3-piece suit for everyday summer comfort.',
    details: `Unstitched 3-Piece

Shirt
• Printed Lawn Shirt
• Fabric: Lawn

Dupatta
• Printed Lawn Dupatta
• Fabric: Lawn

Trouser
• Dyed Trouser
• Fabric: Lawn`,
    images: ['/images/printed4.jfif'],
    image: '/images/printed4.jfif',
    popularity: 88,
  },
  {
    id: 'w6',
    title: 'Printed Lawn 3 Piece Suit (Glam) 02',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Sapphire',
    color: 'Green',
    price: 4350,
    inStock: true,
    unstitchedType: 'PRINTED',
    style: 'GLAM',
    pieces: '3 Piece',
    fabric: 'Lawn',
    tag: 'printed',
    description: 'Glam printed lawn 3-piece suit with a slightly dressy vibe.',
    details: `Unstitched 3-Piece

Shirt
• Printed Lawn Shirt
• Fabric: Lawn

Dupatta
• Printed Lawn Dupatta
• Fabric: Lawn

Trouser
• Dyed Trouser
• Fabric: Lawn`,
    images: ['/images/printed5.jfif'],
    image: '/images/printed5.jfif',
    popularity: 86,
  },
  {
    id: 'w7',
    title: 'Printed Lawn Shirt (Dailywear) 01',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'AlKaram',
    color: 'Yellow',
    price: 2600,
    inStock: true,
    unstitchedType: 'PRINTED',
    style: 'DAILYWEAR',
    pieces: 'Shirt',
    fabric: 'Lawn',
    tag: 'printed',
    description:
      'Light dailywear printed lawn shirt piece — perfect for hot days.',
    details: `Unstitched 1-Piece

Shirt
• Printed Lawn Shirt
• Fabric: Lawn`,
    images: ['/images/product7.jfif'],
    image: '/images/product7.jfif',
    popularity: 80,
  },

  // =========================
  // UNSTITCHED — EMBROIDERED (2)
  // style: SIGNATURE / DAILYWEAR
  // =========================
  {
    id: 'w8',
    title: 'Luxury Embroidered Chefon 3 Piece (Signature) 01',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'J.',
    color: 'Red',
    price: 11500,
    inStock: true,
    unstitchedType: 'EMBROIDERED',
    style: 'SIGNATURE',
    pieces: '3 Piece',
    fabric: 'Chefon', // ✅ sidebar spelling (Chefon)
    tag: 'embroidered',
    description:
      'Signature luxury embroidered chefon 3-piece suit for formal festive wear.',
    details: `Unstitched 3-Piece

Shirt
• Embroidered Chefon Shirt
• Fabric: Chefon

Dupatta
• Chefon Dupatta
• Fabric: Chefon

Trouser
• Dyed Trouser
• Fabric: Chefon`,
    images: ['/images/red8.jfif'],
    image: '/images/red8.jfif',
    popularity: 92,
  },
  {
    id: 'w9',
    title: 'Embroidered Chefon Shirt & Trouser (Dailywear) 02',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Bonanza Satrangi',
    color: 'Orange',
    price: 9950,
    inStock: true,
    unstitchedType: 'EMBROIDERED',
    style: 'DAILYWEAR',
    pieces: 'Shirt & Trouser',
    fabric: 'Chefon', // ✅ sidebar spelling
    tag: 'embroidered',
    description:
      'Dailywear embroidered chefon co-ord (shirt & trouser) for elegant evenings.',
    details: `Unstitched 2-Piece

Shirt
• Embroidered Chefon Shirt
• Fabric: Chefon

Trouser
• Dyed Trouser
• Fabric: Chefon`,
    images: ['/images/embroidary2.jfif'],
    image: '/images/embroidary2.jfif', // ✅ fixed (was embroidary9)
    popularity: 86,
  },

  // =========================
  // UNSTITCHED — VELVET (1)
  // =========================
  {
    id: 'w10',
    title: 'Velvet Embroidered 2 Piece Suit 01',
    mainCategory: 'UNSTITCHED',
    category: 'Unstitched',
    brand: 'Sapphire',
    color: 'Black',
    price: 12800,
    inStock: true,
    unstitchedType: 'VELVET',
    style: 'EMBROIDERED',
    pieces: '2 Piece',
    fabric: 'Velvet',
    tag: 'velvet',
    isBestSeller: true,
    description:
      'Velvet embroidered 2-piece suit for sleek formal winter wear.',
    details: `Unstitched 2-Piece

Shirt
• Embroidered Velvet Shirt
• Fabric: Velvet

Trouser
• Dyed Trouser
• Fabric: Velvet / Suitable blend`,
    images: ['/images/valvet.jfif'],
    image: '/images/valvet.jfif',
    popularity: 86,
  },
];

export default womenProducts;
