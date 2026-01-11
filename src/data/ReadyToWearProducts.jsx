// src/data/ReadyToWearProducts.jsx

const readyToWearProducts = [
  // ============================
  // EMBROIDERED (3)
  // ============================
  {
    id: 'rtw1',
    title: 'Embroidered Lawn Kurta',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'EMBROIDERED',
    rtwSubType: 'Casual',
    brand: 'Khaadi',
    color: 'White',
    price: 5490,
    originalPrice: 6490,
    salePercent: 15,
    onSale: true,
    inStock: false,
    fabric: 'Lawn',
    size: 'M',
    popularity: 96,
    tag: 'embroidered',
    description: 'Casual embroidered lawn kurta for everyday wear.',
    details: `Ready To Wear

• Type: Embroidered
• SubType: Casual
• Fabric: Lawn
• Size: M`,
    images: ['/images/Lawn.jfif', '/images/Lawn.jfif', '/images/Lawn.jfif'],
    image: '/images/Lawn.jfif',
  },
  {
    id: 'rtw2',
    title: 'Embroidered Chiffon Kurta',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'EMBROIDERED',
    rtwSubType: 'Semi Formal',
    brand: 'Sapphire',
    color: 'Green',
    price: 7990,
    originalPrice: 8990,
    isBestSeller: true,
    salePercent: 11,
    onSale: true,
    inStock: true,
    fabric: 'Chiffon',
    size: 'S',
    popularity: 90,
    tag: 'embroidered',
    description: 'Semi formal chiffon kurta with elegant embroidery.',
    details: `Ready To Wear

• Type: Embroidered
• SubType: Semi Formal
• Fabric: Chiffon
• Size: S`,
    images: ['/images/embroidary8.jfif', '/images/embroidary8.jfif'],
    image: '/images/embroidary8.jfif',
  },
  {
    id: 'rtw3',
    title: 'Luxury Embroidered Chiffon Suit',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'EMBROIDERED',
    rtwSubType: 'Luxury',
    brand: 'Khaadi',
    color: 'Purple',
    price: 13990,
    originalPrice: 15990,
    salePercent: 13,
    onSale: true,
    inStock: true,
    fabric: 'Chiffon',
    size: 'L',
    popularity: 92,
    tag: 'embroidered',
    description: 'Luxury embroidered chiffon suit for festive evenings.',
    details: `Ready To Wear

• Type: Embroidered
• SubType: Luxury
• Fabric: Chiffon
• Size: L`,
    images: ['/images/embroidary10.jfif', '/images/embroidary10.jfif'],
    image: '/images/embroidary10.jfif',
  },

  // ============================
  // PRINTED (2)
  // ============================
  {
    id: 'rtw4',
    title: 'Printed Lawn Kurta',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'PRINTED',
    rtwSubType: 'Casual',
    brand: 'Alkaram',
    color: 'Black',
    price: 3990,
    originalPrice: 4500,
    salePercent: 11,
    onSale: true,
    inStock: true,
    fabric: 'Lawn',
    size: 'M',
    popularity: 88,
    tag: 'printed',
    description: 'Light printed lawn kurta for daily summer styling.',
    details: `Ready To Wear

• Type: Printed
• SubType: Casual
• Fabric: Lawn
• Size: M`,
    images: ['/images/formal.jfif', '/images/formal.jfif'],
    image: '/images/formal.jfif',
  },
  {
    id: 'rtw5',
    title: 'Printed 3 Piece Lawn Suit',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'PRINTED',
    rtwSubType: '3 Piece',
    brand: 'Nishat',
    color: 'Pink',
    price: 5890,
    originalPrice: 6600,
    salePercent: 11,
    onSale: true,
    inStock: true,
    fabric: 'Lawn',
    size: 'M',
    popularity: 82,
    tag: 'printed',
    description: 'Printed 3-piece suit for complete ready outfit.',
    details: `Ready To Wear

• Type: Printed
• SubType: 3 Piece
• Fabric: Lawn
• Size: M`,
    images: ['/images/formal2.jfif', '/images/formal2.jfif'],
    image: '/images/formal2.jfif',
  },

  // ============================
  // SOLIDS (2)
  // ============================
  {
    id: 'rtw6',
    title: 'Solid Lawn Kurta',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'SOLIDS',
    rtwSubType: 'Everyday',
    brand: 'Khaadi',
    color: 'Pink',
    price: 3290,
    originalPrice: 3590,
    salePercent: 8,
    onSale: true,
    inStock: true,
    fabric: 'Lawn',
    size: 'S',
    popularity: 80,
    tag: 'solids',
    description: 'Solid everyday kurta for minimal clean look.',
    details: `Ready To Wear

• Type: Solids
• SubType: Everyday
• Fabric: Lawn
• Size: S`,
    images: ['/images/formal3.jfif', '/images/formal3.jfif'],
    image: '/images/formal3.jfif',
  },
  {
    id: 'rtw7',
    title: 'Solid Cotton Kurta (Office Wear)',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'SOLIDS',
    rtwSubType: 'Office Wear',
    brand: 'J.',
    color: 'Blue',
    price: 3490,
    originalPrice: 3990,
    salePercent: 12,
    onSale: true,
    inStock: true,
    fabric: 'Cotton',
    size: 'M',
    popularity: 78,
    tag: 'solids',
    description: 'Office wear kurta in cotton for comfort.',
    details: `Ready To Wear

• Type: Solids
• SubType: Office Wear
• Fabric: Cotton
• Size: M`,
    images: ['/images/formals.jfif', '/images/formals.jfif'],
    image: '/images/formals.jfif',
  },

  // ============================
  // COORDS (1)
  // ============================
  {
    id: 'rtw8',
    title: 'Printed Co-ord Set – 2 Piece',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'COORDS',
    rtwSubType: '2 Piece',
    brand: 'Sapphire',
    color: 'Pink',
    price: 6490,
    originalPrice: 6990,
    salePercent: 7,
    onSale: true,
    inStock: true,
    fabric: 'Lawn',
    isNew: true,
    isBestSeller: true,
    size: 'M',
    popularity: 86,
    tag: 'coords',
    description: 'Trendy 2-piece co-ord set for modern styling.',
    details: `Ready To Wear

• Type: Co-ords
• SubType: 2 Piece
• Fabric: Lawn
• Size: M`,
    images: ['/images/Coords.jfif', '/images/Coords.jfif'],
    image: '/images/Coords.jfif',
  },

  // ============================
  // KURTIS (1)
  // ============================
  {
    id: 'rtw9',
    title: 'Short Kurti – Printed Lawn',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'KURTIS',
    rtwSubType: 'Short Kurti',
    brand: 'Khaadi',
    color: 'Orange',
    price: 2990,
    originalPrice: 3290,
    salePercent: 9,
    onSale: true,
    inStock: true,
    fabric: 'Lawn',
    size: 'S',
    popularity: 82,
    tag: 'kurtis',
    description: 'Short kurti in lawn for casual days.',
    details: `Ready To Wear

• Type: Kurtis
• SubType: Short Kurti
• Fabric: Lawn
• Size: S`,
    images: ['/images/cords4.jfif', '/images/cords4.jfif'],
    image: '/images/cords4.jfif',
  },

  // ============================
  // BOTTOMS (1)
  // ============================
  {
    id: 'rtw10',
    title: 'Straight Trousers – White',
    mainCategory: 'READY_TO_WEAR',
    category: 'ReadyToWear',
    rtwType: 'BOTTOMS',
    rtwSubType: 'Trousers',
    brand: 'Nishat',
    color: 'White',
    price: 2490,
    originalPrice: 2790,
    salePercent: 11,
    onSale: true,
    inStock: true,
    fabric: 'Cotton',
    size: 'M',
    popularity: 81,
    tag: 'bottoms',
    description: 'Straight trousers for daily wear.',
    details: `Ready To Wear

• Type: Bottoms
• SubType: Trousers
• Fabric: Cotton
• Size: M`,
    images: ['/images/womenbottom1.jfif', '/images/womenbottom1.jfif'],
    image: '/images/womenbottom1.jfif',
  },
];

export default readyToWearProducts;
