import { Product, Category, Coupon } from '../types';

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Computers, flagship smartphones, and pro audio gear',
    image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
    order: 1,
    isActive: true,
  },
  {
    id: 'smartphones',
    name: 'Smartphones & Tablets',
    slug: 'smartphones',
    description: 'Flagship mobile devices, OLED tablets, and accessories',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    order: 2,
    isActive: true,
  },
  {
    id: 'laptops',
    name: 'Laptops & Workstations',
    slug: 'laptops',
    description: 'High-performance ultrabooks, MacBooks, and gaming workstations',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    order: 3,
    isActive: true,
  },
  {
    id: 'audio',
    name: 'Pro Audio & Headphones',
    slug: 'audio',
    description: 'Wireless ANC headphones, audiophile monitors, and soundbars',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    order: 4,
    isActive: true,
  },
  {
    id: 'wearables',
    name: 'Wearable Tech',
    slug: 'wearables',
    description: 'Smartwatches, health monitors, and augmented gear',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    order: 5,
    isActive: true,
  },
  {
    id: 'photography',
    name: 'Cameras & Optics',
    slug: 'photography',
    description: 'Full-frame cameras, cine lenses, and optics gear',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    order: 6,
    isActive: true,
  },
  {
    id: 'fashion',
    name: 'Luxury Fashion',
    slug: 'fashion',
    description: 'Designer apparel, premium footwear, and timeless attire',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
    order: 7,
    isActive: true,
  },
  {
    id: 'gaming',
    name: 'Gaming & Entertainment',
    slug: 'gaming',
    description: 'Next-gen consoles, VR headsets, and portable handhelds',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    order: 8,
    isActive: true,
  },
];

export const SAMPLE_PRODUCTS: Product[] = [
  // --- SMARTPHONES & TABLETS ---
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    slug: 'iphone-15-pro-max',
    description: 'Forged in titanium with the ground-breaking A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
    price: 145000,
    discountPrice: 135000,
    discountPercent: 7,
    category: 'Smartphones & Tablets',
    brand: 'Apple',
    sku: 'APL-IP15PM-256',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 142,
    isFeatured: true,
    isFlashDeal: true,
    flashDealBadge: 'HOT DEAL',
    flashDealSold: 19,
    isActive: true,
    specifications: [
      { key: 'Display', value: '6.7-inch Super Retina XDR OLED 120Hz' },
      { key: 'Chipset', value: 'Apple A17 Pro (3nm)' },
      { key: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto' },
      { key: 'Battery', value: 'Up to 29 hours video playback' }
    ],
    features: [
      'Aerospace-grade Titanium design',
      'A17 Pro chip with 6-core GPU',
      'Customizable Action Button',
      'USB-C port with USB 3 speeds'
    ]
  },
  {
    id: 'samsung-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra AI',
    slug: 'samsung-s24-ultra',
    description: 'Unleash Galaxy AI productivity with built-in S Pen, Titanium shield frame, and legendary 200MP Quad Telephoto camera system.',
    price: 155000,
    discountPrice: 142000,
    discountPercent: 8,
    category: 'Smartphones & Tablets',
    brand: 'Samsung',
    sku: 'SMG-S24U-512',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 115,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Display', value: '6.8" Dynamic AMOLED 2X 120Hz 2600 nits' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
      { key: 'Camera', value: '200MP + 50MP 5x + 10MP 3x + 12MP Ultra Wide' },
      { key: 'Battery', value: '5000 mAh with 45W Fast Charging' }
    ],
    features: [
      'Circle to Search with Google AI',
      'Live Call Translation in real-time',
      'Titanium frame with Gorilla Armor glass',
      'Integrated low-latency S Pen stylus'
    ]
  },
  {
    id: 'ipad-pro-13-m4',
    name: 'iPad Pro 13" M4 Ultra Retina OLED',
    slug: 'ipad-pro-13-m4',
    description: 'Impossibly thin design featuring groundbreaking Tandem OLED display, ultra-fast M4 chip, and Next-Gen Apple Pencil Pro support.',
    price: 155000,
    discountPrice: 148000,
    discountPercent: 4,
    category: 'Smartphones & Tablets',
    brand: 'Apple',
    sku: 'APL-IPAD13-M4',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 56,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Display', value: '13" Ultra Retina XDR Tandem OLED' },
      { key: 'Chip', value: 'Apple M4 chip with 16-core Neural Engine' },
      { key: 'Storage', value: '256GB High-Speed NVMe' }
    ],
    features: [
      'Thinnest Apple product ever at 5.1mm',
      '1000 nits full-screen brightness',
      'Thunderbolt / USB 4 port'
    ]
  },

  // --- LAPTOPS & WORKSTATIONS ---
  {
    id: 'macbook-pro-16-m3-max',
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'The ultimate pro laptop featuring the M3 Max chip with 16-core CPU and 40-core GPU, up to 128GB unified memory, and Liquid Retina XDR display.',
    price: 380000,
    discountPrice: 355000,
    discountPercent: 6,
    category: 'Laptops & Workstations',
    brand: 'Apple',
    sku: 'APL-MBP16-M3M',
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 64,
    isFeatured: true,
    isFlashDeal: true,
    flashDealBadge: '৳25,000 SAVINGS',
    flashDealSold: 11,
    isActive: true,
    specifications: [
      { key: 'Processor', value: 'Apple M3 Max 16-core CPU, 40-core GPU' },
      { key: 'Memory', value: '48GB Unified Memory' },
      { key: 'Storage', value: '1TB Superfast SSD' },
      { key: 'Display', value: '16.2" Liquid Retina XDR 120Hz' }
    ],
    features: [
      'Up to 22 hours battery life',
      'Space Black aluminum enclosure',
      'HDMI 2.1, SDXC slot, 3x Thunderbolt 4',
      'Studio-quality three-mic array'
    ]
  },
  {
    id: 'dell-xps-16-oled',
    name: 'Dell XPS 16 Touch OLED Laptop',
    slug: 'dell-xps-16-oled',
    description: 'Iconic modern design crafted from CNC aluminum and Gorilla Glass 3, featuring 3.2K OLED Touch Display and NVIDIA RTX graphics.',
    price: 285000,
    discountPrice: 265000,
    discountPercent: 8,
    category: 'Laptops & Workstations',
    brand: 'Dell',
    sku: 'DLL-XPS16-OLED',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 42,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Processor', value: 'Intel Core Ultra 9 185H' },
      { key: 'GPU', value: 'NVIDIA GeForce RTX 4070 8GB GDDR6' },
      { key: 'RAM', value: '32GB LPDDR5x 7467MHz' }
    ],
    features: [
      '3.2K (3200x2000) InfinityEdge OLED Touch screen',
      'Capacitive touch function row',
      'Quad speaker design with Waves MaxxAudio'
    ]
  },
  {
    id: 'asus-rog-g16',
    name: 'ASUS ROG Zephyrus G16 Nebula OLED',
    slug: 'asus-rog-g16',
    description: 'Ultra-thin precision CNC gaming laptop with 2.5K 240Hz Nebula OLED display and liquid metal cooling technology.',
    price: 245000,
    discountPrice: 228000,
    discountPercent: 7,
    category: 'Laptops & Workstations',
    brand: 'ASUS',
    sku: 'ASU-G16-RTX4080',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 78,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Screen', value: '16" 2.5K 240Hz OLED 0.2ms G-Sync' },
      { key: 'GPU', value: 'NVIDIA RTX 4080 12GB' },
      { key: 'Weight', value: '1.85 kg Light Aluminum Chassis' }
    ],
    features: [
      'Slash Lighting array on lid',
      'Tri-Fan technology with Vapor Chamber',
      'Wi-Fi 7 ultra-fast wireless networking'
    ]
  },
  {
    id: 'samsung-galaxy-z-fold-6',
    name: 'Samsung Galaxy Z Fold 6 AI',
    slug: 'samsung-galaxy-z-fold-6',
    description: 'The thinnest, lightest Galaxy Z Fold ever with Dual-Screen AI productivity, Armor Aluminum frame, and FlexMode multitasking.',
    price: 235000,
    discountPrice: 218000,
    discountPercent: 7,
    category: 'Smartphones & Tablets',
    brand: 'Samsung',
    sku: 'SMG-ZF6-512GB',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 56,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Main Screen', value: '7.6" Dynamic AMOLED 2X 120Hz' },
      { key: 'Processor', value: 'Snapdragon 8 Gen 3 for Galaxy' },
      { key: 'Durability', value: 'IP48 Water & Dust Resistance' }
    ],
    features: [
      'Circle to Search with Google',
      'Live Translate audio phone calls',
      'FlexCam auto-zoom framing'
    ]
  },
  {
    id: 'google-pixel-9-pro-xl',
    name: 'Google Pixel 9 Pro XL AI',
    slug: 'google-pixel-9-pro-xl',
    description: 'Pro design with custom Tensor G4 chip, 16GB RAM, Gemini Nano on-device AI, and state-of-the-art triple rear camera system.',
    price: 142000,
    discountPrice: 132000,
    discountPercent: 7,
    category: 'Smartphones & Tablets',
    brand: 'Google',
    sku: 'GGL-P9PXL-256',
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 67,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Display', value: '6.8" Super Actua OLED (1-120Hz)' },
      { key: 'Chipset', value: 'Google Tensor G4 with Titan M2' },
      { key: 'Camera', value: '50MP Main + 48MP Ultrawide + 48MP 5x Telephoto' }
    ],
    features: [
      'Add Me AI photo group feature',
      'Pixel Studio text-to-image generator',
      '7 years of OS & Security updates'
    ]
  },

  // --- PRO AUDIO & HEADPHONES ---
  {
    id: 'sony-wh-1000xm5',
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5',
    description: 'Industry-leading noise canceling headphones with two processors, 8 microphones, exceptional sound quality, and crystal clear call quality.',
    price: 45000,
    discountPrice: 39500,
    discountPercent: 12,
    category: 'Pro Audio & Headphones',
    brand: 'Sony',
    sku: 'SNY-WH1000M5-BLK',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 98,
    isFeatured: true,
    isFlashDeal: true,
    flashDealBadge: '30% OFF',
    flashDealSold: 22,
    isActive: true,
    specifications: [
      { key: 'Battery Life', value: 'Up to 30 hours with Noise Canceling ON' },
      { key: 'Driver Unit', value: '30mm specially designed driver' },
      { key: 'Connectivity', value: 'Bluetooth 5.2, Multipoint' },
      { key: 'Weight', value: '250g' }
    ],
    features: [
      'Auto NC Optimizer for personalized noise cancellation',
      'Ultra-comfortable lightweight design',
      'Speak-to-Chat technology',
      'Precise Voice Pickup for crystal calls'
    ]
  },
  {
    id: 'airpods-max-usb-c',
    name: 'Apple AirPods Max (USB-C)',
    slug: 'airpods-max-usb-c',
    description: 'Over-ear headphones re-imagined with custom acoustic design, H1 chips, Personalised Spatial Audio, and lossless audio listening over USB-C.',
    price: 68000,
    discountPrice: 62000,
    discountPercent: 9,
    category: 'Pro Audio & Headphones',
    brand: 'Apple',
    sku: 'APL-APM-USBC-MID',
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 88,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Acoustics', value: 'Apple-designed dynamic driver with Dual H1 chips' },
      { key: 'Battery', value: 'Up to 20 hours listening time' }
    ],
    features: [
      'Anodized aluminum ear cups with breathable mesh headband',
      'Pro-level Active Noise Cancellation & Transparency mode',
      'Precision Digital Crown volume & track control'
    ]
  },
  {
    id: 'sennheiser-hd800s',
    name: 'Sennheiser HD 800 S Reference Headphones',
    slug: 'sennheiser-hd800s',
    description: 'Handcrafted in Germany open-back audiophile headphones featuring revolutionary 56mm Ring Radiator transducers for uncompromised spatial realism.',
    price: 215000,
    discountPrice: 198000,
    discountPercent: 8,
    category: 'Pro Audio & Headphones',
    brand: 'Sennheiser',
    sku: 'SNH-HD800S-GER',
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 34,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Impedance', value: '300 Ohms' },
      { key: 'Frequency Response', value: '4 Hz - 51,000 Hz' },
      { key: 'Transducer', value: '56mm Ring Radiator' }
    ],
    features: [
      'Absorber technology reduces unwanted frequency spikes',
      'Microfiber ear pads crafted for ultimate long sessions',
      'Symmetric impedance-matched balanced cable included'
    ]
  },

  // --- WEARABLE TECH ---
  {
    id: 'apple-watch-ultra-2',
    name: 'Apple Watch Ultra 2 Titanium',
    slug: 'apple-watch-ultra-2',
    description: 'The most capable Apple Watch with S9 SiP, bright 3000-nit display, double tap gesture, and up to 72 hours battery life in low power mode.',
    price: 98000,
    discountPrice: 92000,
    discountPercent: 6,
    category: 'Wearable Tech',
    brand: 'Apple',
    sku: 'APL-AWU2-49MM',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 82,
    isFeatured: false,
    isFlashDeal: true,
    flashDealBadge: '20% OFF',
    flashDealSold: 38,
    isActive: true,
    specifications: [
      { key: 'Case', value: '49mm Titanium Case with 100m Water Resistance' },
      { key: 'Display', value: 'Always-On Retina Sapphire Crystal 3000 nits' },
      { key: 'Sensors', value: 'Precision Dual-Frequency GPS, Depth Gauge, ECG' }
    ],
    features: [
      'Customizable Action Button',
      'Double tap gesture control',
      'Night Mode in Wayfinder dial',
      'EN13319 certified for diving to 40m'
    ]
  },
  {
    id: 'garmin-fenix-7-pro',
    name: 'Garmin fēnix 7 Pro Sapphire Solar',
    slug: 'garmin-fenix-7-pro',
    description: 'Ultimate multisport GPS watch with solar charging Power Sapphire lens, built-in LED flashlight, and advanced endurance metrics.',
    price: 112000,
    discountPrice: 104000,
    discountPercent: 7,
    category: 'Wearable Tech',
    brand: 'Garmin',
    sku: 'GRM-FNX7P-SLR',
    stock: 11,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 61,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Battery', value: 'Up to 22 days in smartwatch mode with solar' },
      { key: 'Lens', value: 'Power Sapphire Scratch-Resistant Crystal' },
      { key: 'Flashlight', value: 'Multi-LED White & Red Safety Strobe' }
    ],
    features: [
      'Hill Score & Endurance Score analysis',
      'Preloaded TopoActive maps and SkiView maps',
      'SATIQ multi-band dual GPS accuracy'
    ]
  },

  // --- CAMERAS & OPTICS ---
  {
    id: 'leica-q3-camera',
    name: 'Leica Q3 Full-Frame Compact Camera',
    slug: 'leica-q3-camera',
    description: 'Combining timeless craftsmanship with modern innovation, the Leica Q3 features a 60MP BSI CMOS sensor and fixed Summilux 28mm f/1.7 ASPH lens.',
    price: 750000,
    discountPrice: 720000,
    discountPercent: 4,
    category: 'Cameras & Optics',
    brand: 'Leica',
    sku: 'LCA-Q3-BLK',
    stock: 5,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 31,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Sensor', value: '60.3MP Full-Frame BSI CMOS Sensor' },
      { key: 'Lens', value: 'Summilux 28mm f/1.7 ASPH Lens' },
      { key: 'Video', value: '8K30 and 4K60 10-Bit Video Recording' },
      { key: 'Screen', value: '3" Tilting Touchscreen LCD' }
    ],
    features: [
      'Triple Resolution Technology (60/36/18MP)',
      'Hybrid Autofocus System',
      'Wireless charging support',
      'IP52 weather sealing'
    ]
  },
  {
    id: 'sony-a7iv-camera',
    name: 'Sony Alpha a7 IV Mirrorless Camera',
    slug: 'sony-a7iv-camera',
    description: 'An all-in-one hybrid camera featuring 33MP Exmor R sensor, BIONZ XR processor, 4K 60p 10-bit recording, and real-time Eye AF.',
    price: 285000,
    discountPrice: 265000,
    discountPercent: 7,
    category: 'Cameras & Optics',
    brand: 'Sony',
    sku: 'SNY-A7M4-BODY',
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 112,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Sensor', value: '33MP Full-Frame Exmor R BSI CMOS' },
      { key: 'Stabilization', value: '5-Axis In-Body Image Stabilization (5.5 stops)' },
      { key: 'AF System', value: '759-Point Phase Detection AF' }
    ],
    features: [
      'Real-time Eye AF for Humans, Animals, and Birds',
      '7K oversampled 4K 30p resolution without pixel binning',
      'S-Cinetone color profile for filmic footage'
    ]
  },

  // --- LUXURY FASHION ---
  {
    id: 'designer-cashmere-coat',
    name: 'Monogram Cashmere Wool Overcoat',
    slug: 'designer-cashmere-coat',
    description: 'Handcrafted in Italy from 100% Mongolian cashmere. Tailored silhouette featuring silk lining, horn buttons, and timeless peak lapels.',
    price: 185000,
    discountPrice: 155000,
    discountPercent: 16,
    category: 'Luxury Fashion',
    brand: 'ShefaloBD Couture',
    sku: 'PSC-COAT-CAMEL-M',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    reviewsCount: 19,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Material', value: '100% Italian Cashmere' },
      { key: 'Lining', value: '100% Mulberry Silk' },
      { key: 'Fit', value: 'Modern Tailored Fit' },
      { key: 'Care', value: 'Dry Clean Only' }
    ],
    features: [
      'Hand-stitched peak lapels',
      'Genuine horn buttons',
      'Interior welt pockets with gold embroidery'
    ]
  },
  {
    id: 'leather-chelsea-boots',
    name: 'Handcrafted Calfskin Chelsea Boots',
    slug: 'leather-chelsea-boots',
    description: 'Artisanal Italian leather boots constructed with Goodyear welt durability, soft memory leather insoles, and sleek elastic gussets.',
    price: 48000,
    discountPrice: 42000,
    discountPercent: 12,
    category: 'Luxury Fashion',
    brand: 'Artisanal Heritage',
    sku: 'ATH-BOOT-BLK-42',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 45,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Leather', value: 'Full-grain Tuscan Calf Leather' },
      { key: 'Sole', value: 'Goodyear Welted Leather & Rubber Sole' }
    ],
    features: [
      'Breathable leather lining',
      'Reinforced pull tabs for effortless entry',
      'Hand-burnished toe box detail'
    ]
  },

  // --- GAMING & ENTERTAINMENT ---
  {
    id: 'playstation-5-pro',
    name: 'PlayStation 5 Pro 2TB Digital Console',
    slug: 'playstation-5-pro',
    description: 'Experience ultra-sharp gaming with PlayStation Spectral Super Resolution (PSSR) AI upscaling, 60 FPS ray tracing, and 2TB high-speed SSD.',
    price: 98000,
    discountPrice: 92000,
    discountPercent: 6,
    category: 'Gaming & Entertainment',
    brand: 'Sony',
    sku: 'SNY-PS5PRO-2TB',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 210,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'GPU', value: '67% more Compute Units than PS5' },
      { key: 'Storage', value: '2TB Custom Ultra-Fast NVMe SSD' },
      { key: 'Networking', value: 'Wi-Fi 7 wireless connectivity' }
    ],
    features: [
      'PlayStation Spectral Super Resolution (PSSR)',
      'Advanced Ray Tracing reflection lighting',
      'DualSense haptic feedback and adaptive triggers'
    ]
  },
  {
    id: 'meta-quest-3-512gb',
    name: 'Meta Quest 3 Mixed Reality VR Headset 512GB',
    slug: 'meta-quest-3-512gb',
    description: 'Transform your space into a virtual playground with high-res full-color Passthrough, Snapdragon XR2 Gen 2 power, and 4K+ Infinite Display.',
    price: 78000,
    discountPrice: 72000,
    discountPercent: 8,
    category: 'Gaming & Entertainment',
    brand: 'Meta',
    sku: 'MTA-QST3-512',
    stock: 16,
    images: [
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 94,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Display', value: '4K+ Infinite Display (2064x2208 per eye)' },
      { key: 'Processor', value: 'Snapdragon XR2 Gen 2' },
      { key: 'Audio', value: 'Integrated 3D Spatial Audio Speakers' }
    ],
    features: [
      'Full-color Passthrough mixed reality',
      'Touch Plus ring-free ergonomic controllers',
      'TruTouch haptics for sensory realism'
    ]
  },
  {
    id: 'steam-deck-oled-1tb',
    name: 'Valve Steam Deck OLED 1TB Handheld',
    slug: 'steam-deck-oled-1tb',
    description: 'Vibrant 7.4" 90Hz HDR OLED screen, custom 6nm AMD APU, 50Wh battery, anti-glare etched glass display, and premium carrying case.',
    price: 92000,
    discountPrice: 85000,
    discountPercent: 8,
    category: 'Gaming & Entertainment',
    brand: 'Valve',
    sku: 'VLV-STMDECK-1TB',
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 142,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Display', value: '7.4" 90Hz HDR OLED (1000 nits peak brightness)' },
      { key: 'Storage', value: '1TB High-Speed NVMe SSD' },
      { key: 'APU', value: '6nm AMD APU (4 cores / 8 threads)' }
    ],
    features: [
      'Vibrant HDR OLED contrast & rich blacks',
      'Wi-Fi 6E download speeds',
      'Etched anti-glare premium screen glass'
    ]
  },
  {
    id: 'fujifilm-x100vi',
    name: 'Fujifilm X100VI Digital Camera',
    slug: 'fujifilm-x100vi',
    description: 'The iconic digital compact featuring a 40.2MP X-Trans CMOS 5 HR sensor, in-body image stabilization (IBIS), and 20 Film Simulation modes.',
    price: 220000,
    discountPrice: 198000,
    discountPercent: 10,
    category: 'Cameras & Optics',
    brand: 'Fujifilm',
    sku: 'FJF-X100VI-SIL',
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 78,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Sensor', value: '40.2MP X-Trans CMOS 5 HR' },
      { key: 'Lens', value: 'Fujinon 23mm f/2.0 II Lens' },
      { key: 'IBIS', value: '6.0-Stop 5-Axis In-Body Image Stabilization' }
    ],
    features: [
      'REALA ACE & 20 Film Simulation modes',
      'Advanced Hybrid Viewfinder (Optical & Electronic)',
      '6.2K 30p internal video recording'
    ]
  },
  {
    id: 'bose-quietcomfort-ultra',
    name: 'Bose QuietComfort Ultra Headphones',
    slug: 'bose-quietcomfort-ultra',
    description: 'World-class active noise cancellation with Bose Immersive Audio, CustomTune sound calibration, and ultra-plush protein leather ear cushions.',
    price: 52000,
    discountPrice: 46500,
    discountPercent: 10,
    category: 'Pro Audio & Headphones',
    brand: 'Bose',
    sku: 'BOS-QCU-BLK',
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 115,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Audio', value: 'Spatial Bose Immersive Audio Mode' },
      { key: 'Battery', value: 'Up to 24 hours playback (18 hrs with Immersive)' },
      { key: 'Microphones', value: 'Revolutionary noise-rejecting mic array' }
    ],
    features: [
      'CustomTune audio personalization',
      'Quiet, Aware, and Immersion listening modes',
      'Seamless multi-point Bluetooth 5.3 connection'
    ]
  },

  // --- ELECTRONICS ---
  {
    id: 'apple-mac-studio-m2-ultra',
    name: 'Apple Mac Studio M2 Ultra (24-Core CPU, 60-Core GPU)',
    slug: 'apple-mac-studio-m2-ultra',
    description: 'Outrageous performance powered by M2 Ultra chip, supporting up to 8 8K displays with 64GB Unified Memory and 1TB NVMe SSD.',
    price: 420000,
    discountPrice: 395000,
    discountPercent: 6,
    category: 'Electronics',
    brand: 'Apple',
    sku: 'APL-MCSTUDIO-M2U',
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
    rating: 5.0,
    reviewsCount: 41,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Processor', value: 'Apple M2 Ultra (24-core CPU, 60-core GPU)' },
      { key: 'Unified Memory', value: '64GB High-Bandwidth Memory' },
      { key: 'Storage', value: '1TB Ultra-Fast SSD' },
      { key: 'Ports', value: '6x Thunderbolt 4, 10Gb Ethernet, HDMI 2.1' }
    ],
    features: [
      'Empowered by dual M2 Max die connected via UltraFusion',
      'Extremely quiet thermal architecture',
      'Supports up to eight 4K / eight 8K Pro displays'
    ]
  },
  {
    id: 'sony-bravia-65-qdoled',
    name: 'Sony BRAVIA XR 65" 4K QD-OLED Master TV',
    slug: 'sony-bravia-65-qdoled',
    description: 'Our brightest OLED screen ever powered by Cognitive Processor XR with Acoustic Surface Audio+ that vibrates the screen into a speaker.',
    price: 240000,
    discountPrice: 220000,
    discountPercent: 8,
    category: 'Electronics',
    brand: 'Sony',
    sku: 'SNY-BRV65-QDOLED',
    stock: 9,
    images: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 68,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Display', value: '65" QD-OLED 4K 120Hz Dolby Vision' },
      { key: 'Processor', value: 'Cognitive Processor XR' },
      { key: 'Audio', value: 'Acoustic Surface Audio+ with built-in subwoofers' }
    ],
    features: [
      'Quantum Dot OLED technology for unbelievable color depth',
      'Perfect for PlayStation 5 with Auto HDR Tone Mapping',
      'Google TV smart interface with Voice Control'
    ]
  },
  {
    id: 'dji-mavic-3-pro-cine',
    name: 'DJI Mavic 3 Pro Cine 4K Drone',
    slug: 'dji-mavic-3-pro-cine',
    description: 'Triple-camera flagship drone featuring 4/3 CMOS Hasselblad camera, dual tele lenses, Apple ProRes encoding, and 43-min flight time.',
    price: 310000,
    discountPrice: 289000,
    discountPercent: 7,
    category: 'Electronics',
    brand: 'DJI',
    sku: 'DJI-MVC3P-CINE',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 83,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Primary Camera', value: '4/3 CMOS Hasselblad 20MP Camera' },
      { key: 'Tele Cameras', value: '70mm Medium Tele + 166mm Full Tele' },
      { key: 'Video', value: '5.1K 50fps / 4K 120fps Apple ProRes 422 HQ' }
    ],
    features: [
      '1TB built-in SSD storage',
      'Omnidirectional obstacle sensing',
      '15km HD video transmission range'
    ]
  },
  {
    id: 'asus-rog-swift-32-oled',
    name: 'Asus ROG Swift 32" 4K 240Hz QD-OLED Monitor',
    slug: 'asus-rog-swift-32-oled',
    description: 'World’s first 32-inch 4K QD-OLED gaming monitor with 240Hz refresh rate, 0.03ms response time, custom heatsink, and G-Sync compatibility.',
    price: 165000,
    discountPrice: 148000,
    discountPercent: 10,
    category: 'Electronics',
    brand: 'ASUS',
    sku: 'ASU-PG32UCDM-OLED',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 94,
    isFeatured: true,
    isActive: true,
    specifications: [
      { key: 'Panel', value: '32" 4K (3840x2160) QD-OLED 240Hz 0.03ms' },
      { key: 'Brightness', value: '1000 nits Peak Brightness (HDR)' },
      { key: 'Connectivity', value: 'DisplayPort 1.4 DSC, HDMI 2.1, USB-C 90W PD' }
    ],
    features: [
      'Custom passive heatsink prevents OLED burn-in',
      'Uniform Brightness setting keeps luminance constant',
      'Aura Sync RGB backlight customization'
    ]
  },
  {
    id: 'sonos-ultimate-home-theater',
    name: 'Sonos Ultimate Wireless Dolby Atmos Sound System',
    slug: 'sonos-ultimate-home-theater',
    description: 'Immerse your space in spatial audio with Sonos Arc soundbar, dual Sub Gen 3 woofers, and Era 300 rear surround speakers.',
    price: 185000,
    discountPrice: 168000,
    discountPercent: 9,
    category: 'Electronics',
    brand: 'Sonos',
    sku: 'SNS-ULT-HT-SYS',
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    reviewsCount: 52,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Channels', value: '7.1.4 Dolby Atmos Spatial System' },
      { key: 'Tuning', value: 'Trueplay acoustic room calibration' },
      { key: 'Wireless', value: 'Wi-Fi 6, Apple AirPlay 2, Spotify Connect' }
    ],
    features: [
      'Crystal clear dialogue with Speech Enhancement',
      'Dual force-canceling Sub subwoofers with zero rattle',
      'Simple single eARC HDMI connection to TV'
    ]
  },
  {
    id: 'keychron-q1-max',
    name: 'Keychron Q1 Max Wireless Custom Keyboard',
    slug: 'keychron-q1-max',
    description: '75% Layout full CNC aluminum custom mechanical keyboard with 2.4GHz wireless connection, Gateron Jupiter switches, and QMK/VIA customization.',
    price: 26000,
    discountPrice: 22500,
    discountPercent: 13,
    category: 'Electronics',
    brand: 'Keychron',
    sku: 'KCH-Q1MAX-BLK',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
    ],
    thumbnail: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    reviewsCount: 120,
    isFeatured: false,
    isActive: true,
    specifications: [
      { key: 'Body', value: 'Full CNC Machined Aluminum Shell' },
      { key: 'Connectivity', value: '2.4GHz Wireless, Bluetooth 5.1, Type-C Wired' },
      { key: 'Keycaps', value: 'KSA Profile Double-shot PBT Keycaps' }
    ],
    features: [
      'Double-gasket mount structure for acoustics',
      'Hot-swappable switch sockets',
      'South-facing RGB backlight LED lighting'
    ]
  }
];

export const SAMPLE_COUPONS: Coupon[] = [
  {
    id: 'SAVE20',
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    minOrder: 10000,
    isActive: true,
  },
  {
    id: 'PRO50',
    code: 'PRO50',
    type: 'fixed',
    value: 5000,
    minOrder: 20000,
    isActive: true,
  },
  {
    id: 'WELCOME10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minOrder: 5000,
    isActive: true,
  }
];

