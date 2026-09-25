import { 
  Product, 
  Purchase, 
  Sale, 
  Customer, 
  Expense, 
  Wastage, 
  Intern, 
  StockMovement, 
  ActivityLog, 
  BusinessSettings 
} from '../types';

export const initialSettings: BusinessSettings = {
  businessName: 'Thinkaroo Stationery & Products',
  schoolName: 'Caliph Life School',
  tagline: 'Student-Managed Enterprise & Learning Lab',
  phone: '+91 98765 43210',
  email: 'thinkaroo@caliphschool.com',
  address: 'Caliph Life School Campus, Student Innovation Wing',
  defaultCommissionRate: 10,
  currencySymbol: '₹',
  categories: [
    'Notebooks & Planners',
    'Pens & Highlighters',
    'Pouches & Bags',
    'Art & Craft',
    'Math & Geometry',
    'Student Creations',
    'Accessories'
  ],
  paymentMethods: ['CASH', 'UPI', 'CARD'],
  billPrefix: 'TK-2026-',
  billFooterMessage: 'Thank you for supporting Caliph Life School student entrepreneurs!',
  showSchoolNameOnBill: true,
  lowStockThreshold: 10,
};

export const initialInterns: Intern[] = [
  {
    id: 'intern-1',
    email: 'admin@caliphschool.com',
    name: 'Mrs. Fatima (Faculty Mentor)',
    role: 'ADMIN',
    status: 'ENABLED',
    addedDate: '2026-08-01T09:00:00Z',
    lastLogin: '2026-09-12T10:15:00Z',
  },
  {
    id: 'intern-2',
    email: 'aarav.intern@caliphschool.com',
    name: 'Aarav Patel (Grade 11 Intern)',
    role: 'INTERN',
    status: 'ENABLED',
    addedDate: '2026-08-15T11:30:00Z',
    lastLogin: '2026-09-12T14:40:00Z',
  },
  {
    id: 'intern-3',
    email: 'zoya.intern@caliphschool.com',
    name: 'Zoya Khan (Grade 10 Intern)',
    role: 'INTERN',
    status: 'ENABLED',
    addedDate: '2026-08-15T11:30:00Z',
    lastLogin: '2026-09-11T16:20:00Z',
  },
  {
    id: 'intern-4',
    email: 'caliph.student@gmail.com',
    name: 'Rohan Sharma (Intern Lead)',
    role: 'INTERN',
    status: 'ENABLED',
    addedDate: '2026-08-20T10:00:00Z',
    lastLogin: '2026-09-12T16:05:00Z',
  },
  {
    id: 'intern-5',
    email: 'temp.intern@gmail.com',
    name: 'Sara Ali (Trainee)',
    role: 'INTERN',
    status: 'DISABLED',
    addedDate: '2026-09-01T14:00:00Z',
    lastLogin: '2026-09-02T12:00:00Z',
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    sku: 'TK-NB-01',
    name: 'Thinkaroo Premium Hardcover Notebook',
    category: 'Notebooks & Planners',
    description: '192 ruled pages, 100 GSM natural paper with elastic band and Thinkaroo kangaroo embossed badge.',
    unit: 'pcs',
    purchaseRate: 90,
    sellingRate: 160,
    discountPercent: 0,
    taxPercent: 0,
    ownStock: 45,
    commissionStock: 15,
    minStockAlert: 10,
    mainImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-1-1', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', isMain: true },
      { id: 'img-1-2', url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=600&q=80' }
    ],
    status: 'ACTIVE',
    createdAt: '2026-08-10T09:00:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
    changeHistory: [
      {
        id: 'ch-1',
        timestamp: '2026-08-10T09:00:00Z',
        intern: 'Mrs. Fatima',
        action: 'CREATED',
        details: 'Initial catalogue entry'
      }
    ]
  },
  {
    id: 'prod-2',
    sku: 'TK-PEN-02',
    name: 'Eco Smooth Glide Gel Pen Set (Pack of 5)',
    category: 'Pens & Highlighters',
    description: '0.5mm quick-dry japanese ink, recycled craft barrel with blue and black refills.',
    unit: 'pack',
    purchaseRate: 40,
    sellingRate: 75,
    ownStock: 80,
    commissionStock: 0,
    minStockAlert: 15,
    mainImage: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-2-1', url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'ACTIVE',
    createdAt: '2026-08-12T10:00:00Z',
    updatedAt: '2026-08-12T10:00:00Z',
    changeHistory: []
  },
  {
    id: 'prod-3',
    sku: 'TK-BAG-03',
    name: 'Thinkaroo Canvas Zipper Pouch',
    category: 'Pouches & Bags',
    description: 'Heavy duty 12oz natural cotton canvas, signature orange & sky blue zipper tab.',
    unit: 'pcs',
    purchaseRate: 85,
    sellingRate: 150,
    ownStock: 28,
    commissionStock: 12,
    minStockAlert: 8,
    mainImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-3-1', url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'ACTIVE',
    createdAt: '2026-08-15T11:00:00Z',
    updatedAt: '2026-09-02T10:30:00Z',
    changeHistory: []
  },
  {
    id: 'prod-4',
    sku: 'TK-ART-04',
    name: 'Handcrafted Resin Floral Bookmarks',
    category: 'Student Creations',
    description: 'Handmade by Caliph Life School Grade 9 Art Club. Clear epoxy with pressed flowers.',
    unit: 'pcs',
    purchaseRate: 35, // Base value for owner (student maker)
    sellingRate: 70,  // Commission product: 10% = ₹7 to Thinkaroo, ₹63 to student club
    ownStock: 0,
    commissionStock: 22,
    minStockAlert: 5,
    mainImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-4-1', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'ACTIVE',
    createdAt: '2026-08-18T14:20:00Z',
    updatedAt: '2026-08-18T14:20:00Z',
    changeHistory: []
  },
  {
    id: 'prod-5',
    sku: 'TK-GEO-05',
    name: 'Precision Metal Geometry Box Set',
    category: 'Math & Geometry',
    description: 'Sturdy tin box with die-cast compass, divider, 15cm ruler, protractor and set squares.',
    unit: 'set',
    purchaseRate: 70,
    sellingRate: 120,
    ownStock: 5, // LOW STOCK
    commissionStock: 0,
    minStockAlert: 10,
    mainImage: 'https://images.unsplash.com/photo-1581291518655-9523c932deda?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-5-1', url: 'https://images.unsplash.com/photo-1581291518655-9523c932deda?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'LOW_STOCK',
    createdAt: '2026-08-20T09:00:00Z',
    updatedAt: '2026-09-10T12:00:00Z',
    changeHistory: []
  },
  {
    id: 'prod-6',
    sku: 'TK-CRAFT-06',
    name: 'Origami Master Paper Kit (100 Sheets)',
    category: 'Art & Craft',
    description: 'Double-sided 15x15cm vibrant color craft sheets with instruction guide.',
    unit: 'pack',
    purchaseRate: 45,
    sellingRate: 90,
    ownStock: 0, // OUT OF STOCK
    commissionStock: 0,
    minStockAlert: 8,
    mainImage: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-6-1', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'OUT_OF_STOCK',
    createdAt: '2026-08-22T15:00:00Z',
    updatedAt: '2026-09-11T17:00:00Z',
    changeHistory: []
  },
  {
    id: 'prod-7',
    sku: 'TK-ART-07',
    name: 'Calligraphy Beginner Starter Set',
    category: 'Student Creations',
    description: 'Dual nib brush markers + guided stroke practice booklet created by Caliph Senior Art Guild.',
    unit: 'set',
    purchaseRate: 150,
    sellingRate: 250,
    ownStock: 10,
    commissionStock: 18,
    minStockAlert: 6,
    mainImage: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-7-1', url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'ACTIVE',
    createdAt: '2026-08-25T11:00:00Z',
    updatedAt: '2026-09-08T10:00:00Z',
    changeHistory: []
  },
  {
    id: 'prod-8',
    sku: 'TK-HL-08',
    name: 'Pastel Chisel Tip Highlighters (Set of 6)',
    category: 'Pens & Highlighters',
    description: 'Soft eye-friendly pastel tones, water-based non-bleed formulation.',
    unit: 'set',
    purchaseRate: 65,
    sellingRate: 110,
    ownStock: 35,
    commissionStock: 0,
    minStockAlert: 10,
    mainImage: 'https://images.unsplash.com/photo-1585336261026-77cc7c073845?auto=format&fit=crop&w=600&q=80',
    images: [
      { id: 'img-8-1', url: 'https://images.unsplash.com/photo-1585336261026-77cc7c073845?auto=format&fit=crop&w=600&q=80', isMain: true }
    ],
    status: 'ACTIVE',
    createdAt: '2026-08-28T14:00:00Z',
    updatedAt: '2026-08-28T14:00:00Z',
    changeHistory: []
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur-1',
    purchaseNumber: 'PO-2026-001',
    type: 'OWN',
    supplierOrOwner: 'National Paper Mart Wholesale',
    date: '2026-08-10',
    items: [
      { productId: 'prod-1', productName: 'Thinkaroo Premium Hardcover Notebook', quantity: 50, purchaseRate: 90, total: 4500 },
      { productId: 'prod-2', productName: 'Eco Smooth Glide Gel Pen Set (Pack of 5)', quantity: 100, purchaseRate: 40, total: 4000 }
    ],
    totalAmount: 8500,
    status: 'RECEIVED',
    notes: 'Term 1 initial stationery stock intake',
    receivedByIntern: 'Mrs. Fatima (Faculty Mentor)',
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'pur-2',
    purchaseNumber: 'PO-2026-002',
    type: 'COMMISSION',
    supplierOrOwner: 'Caliph Grade 9 Art Club (Owner: Haniya)',
    commissionRate: 10,
    date: '2026-08-18',
    items: [
      { productId: 'prod-4', productName: 'Handcrafted Resin Floral Bookmarks', quantity: 30, purchaseRate: 35, total: 1050 }
    ],
    totalAmount: 1050,
    status: 'RECEIVED',
    notes: 'Consignment sale: 10% commission to Thinkaroo upon sale',
    receivedByIntern: 'Aarav Patel (Grade 11 Intern)',
    createdAt: '2026-08-18T14:30:00Z'
  },
  {
    id: 'pur-3',
    purchaseNumber: 'PO-2026-003',
    type: 'OWN',
    supplierOrOwner: 'CraftMaster Supplies Ltd',
    date: '2026-08-20',
    items: [
      { productId: 'prod-3', productName: 'Thinkaroo Canvas Zipper Pouch', quantity: 35, purchaseRate: 85, total: 2975 },
      { productId: 'prod-5', productName: 'Precision Metal Geometry Box Set', quantity: 20, purchaseRate: 70, total: 1400 }
    ],
    totalAmount: 4375,
    status: 'RECEIVED',
    notes: 'Pouches & Geometry sets batch',
    receivedByIntern: 'Zoya Khan (Grade 10 Intern)',
    createdAt: '2026-08-20T11:00:00Z'
  },
  {
    id: 'pur-4',
    purchaseNumber: 'PO-2026-004',
    type: 'COMMISSION',
    supplierOrOwner: 'Caliph Senior Art Guild (Lead: Tariq)',
    commissionRate: 10,
    date: '2026-08-25',
    items: [
      { productId: 'prod-7', productName: 'Calligraphy Beginner Starter Set', quantity: 20, purchaseRate: 150, total: 3000 },
      { productId: 'prod-1', productName: 'Thinkaroo Premium Hardcover Notebook', quantity: 20, purchaseRate: 90, total: 1800 }
    ],
    totalAmount: 4800,
    status: 'RECEIVED',
    notes: 'Consignment items for student exhibition week',
    receivedByIntern: 'Aarav Patel (Grade 11 Intern)',
    createdAt: '2026-08-25T11:30:00Z'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale-1',
    billNumber: 'TK-2026-001',
    date: '2026-09-10',
    customerName: 'Ayaan Siddiqui (Grade 8)',
    customerPhone: '9845112233',
    isWalkIn: false,
    items: [
      {
        id: 'si-1-1',
        productId: 'prod-1',
        productName: 'Thinkaroo Premium Hardcover Notebook',
        sku: 'TK-NB-01',
        unit: 'pcs',
        stockType: 'OWN',
        quantity: 2,
        unitPrice: 160,
        purchaseRate: 90,
        discount: 0,
        lineTotal: 320,
        commissionRate: 0,
        commissionEarned: 0,
        ownerAmount: 0,
        profitOrCostShare: 140 // (160 - 90) * 2
      },
      {
        id: 'si-1-2',
        productId: 'prod-2',
        productName: 'Eco Smooth Glide Gel Pen Set (Pack of 5)',
        sku: 'TK-PEN-02',
        unit: 'pack',
        stockType: 'OWN',
        quantity: 1,
        unitPrice: 75,
        purchaseRate: 40,
        discount: 0,
        lineTotal: 75,
        commissionRate: 0,
        commissionEarned: 0,
        ownerAmount: 0,
        profitOrCostShare: 35
      }
    ],
    subtotal: 395,
    discount: 0,
    total: 395,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    ownSalesTotal: 395,
    commissionSalesTotal: 0,
    commissionEarnedTotal: 0,
    ownerAmountTotal: 0,
    netThinkarooProfit: 175,
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    notes: 'GPay payment received on school terminal',
    createdAt: '2026-09-10T11:20:00Z'
  },
  {
    id: 'sale-2',
    billNumber: 'TK-2026-002',
    date: '2026-09-11',
    customerName: 'Walk-in Student',
    isWalkIn: true,
    items: [
      {
        id: 'si-2-1',
        productId: 'prod-4',
        productName: 'Handcrafted Resin Floral Bookmarks',
        sku: 'TK-ART-04',
        unit: 'pcs',
        stockType: 'COMMISSION',
        quantity: 2,
        unitPrice: 70,
        purchaseRate: 35,
        discount: 0,
        lineTotal: 140,
        commissionRate: 10,
        commissionEarned: 14, // 10% of 140
        ownerAmount: 126,    // 90% to student owner
        profitOrCostShare: 14
      }
    ],
    subtotal: 140,
    discount: 0,
    total: 140,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    ownSalesTotal: 0,
    commissionSalesTotal: 140,
    commissionEarnedTotal: 14,
    ownerAmountTotal: 126,
    netThinkarooProfit: 14,
    internEmail: 'zoya.intern@caliphschool.com',
    internName: 'Zoya Khan',
    createdAt: '2026-09-11T13:45:00Z'
  },
  {
    id: 'sale-3',
    billNumber: 'TK-2026-003',
    date: '2026-09-12',
    customerName: 'Maryam K. (Parent)',
    customerPhone: '9871100223',
    isWalkIn: false,
    items: [
      {
        id: 'si-3-1',
        productId: 'prod-1',
        productName: 'Thinkaroo Premium Hardcover Notebook',
        sku: 'TK-NB-01',
        unit: 'pcs',
        stockType: 'OWN',
        quantity: 3,
        unitPrice: 160,
        purchaseRate: 90,
        discount: 0,
        lineTotal: 480,
        commissionRate: 0,
        commissionEarned: 0,
        ownerAmount: 0,
        profitOrCostShare: 210
      },
      {
        id: 'si-3-2',
        productId: 'prod-4',
        productName: 'Handcrafted Resin Floral Bookmarks',
        sku: 'TK-ART-04',
        unit: 'pcs',
        stockType: 'COMMISSION',
        quantity: 4,
        unitPrice: 70,
        purchaseRate: 35,
        discount: 0,
        lineTotal: 280,
        commissionRate: 10,
        commissionEarned: 28, // 10% of 280
        ownerAmount: 252,    // 90%
        profitOrCostShare: 28
      },
      {
        id: 'si-3-3',
        productId: 'prod-7',
        productName: 'Calligraphy Beginner Starter Set',
        sku: 'TK-ART-07',
        unit: 'set',
        stockType: 'COMMISSION',
        quantity: 1,
        unitPrice: 250,
        purchaseRate: 150,
        discount: 0,
        lineTotal: 250,
        commissionRate: 10,
        commissionEarned: 25, // 10% of 250
        ownerAmount: 225,
        profitOrCostShare: 25
      }
    ],
    subtotal: 1010,
    discount: 10, // Courtesy discount
    total: 1000,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    ownSalesTotal: 480,
    commissionSalesTotal: 530,
    commissionEarnedTotal: 53,
    ownerAmountTotal: 477,
    netThinkarooProfit: 253, // Own profit (210) + Comm earned (53) - discount (10)
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    notes: 'Mixed order: 1 Own Notebook + 2 Commission products. Processed correctly.',
    createdAt: '2026-09-12T11:15:00Z'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-walkin',
    name: 'Walk-in Customer',
    isWalkIn: true,
    totalSpent: 140,
    ordersCount: 1,
    firstVisit: '2026-09-11T13:45:00Z',
    lastVisit: '2026-09-11T13:45:00Z'
  },
  {
    id: 'cust-1',
    name: 'Ayaan Siddiqui (Grade 8)',
    phone: '9845112233',
    isWalkIn: false,
    totalSpent: 395,
    ordersCount: 1,
    firstVisit: '2026-09-10T11:20:00Z',
    lastVisit: '2026-09-10T11:20:00Z'
  },
  {
    id: 'cust-2',
    name: 'Maryam K. (Parent)',
    phone: '9871100223',
    isWalkIn: false,
    totalSpent: 1000,
    ordersCount: 1,
    firstVisit: '2026-09-12T11:15:00Z',
    lastVisit: '2026-09-12T11:15:00Z'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    category: 'Packaging',
    amount: 180,
    date: '2026-09-02',
    note: 'Paper carry bags with Thinkaroo logo stamping',
    recordedByIntern: 'Aarav Patel',
    createdAt: '2026-09-02T12:00:00Z'
  },
  {
    id: 'exp-2',
    category: 'Printing',
    amount: 95,
    date: '2026-09-05',
    note: 'Price tag stickers & barcode labels',
    recordedByIntern: 'Zoya Khan',
    createdAt: '2026-09-05T14:30:00Z'
  },
  {
    id: 'exp-3',
    category: 'Supplies',
    amount: 50,
    date: '2026-09-09',
    note: 'Sellotape and packaging ribbons for gift orders',
    recordedByIntern: 'Rohan Sharma',
    createdAt: '2026-09-09T16:00:00Z'
  }
];

export const initialWastages: Wastage[] = [
  {
    id: 'wst-1',
    productId: 'prod-5',
    productName: 'Precision Metal Geometry Box Set',
    stockType: 'OWN',
    quantity: 1,
    unitCost: 70,
    totalLoss: 70,
    reason: 'Defective',
    date: '2026-09-08',
    note: 'Broken hinge mechanism on tin box during transport',
    recordedByIntern: 'Aarav Patel',
    createdAt: '2026-09-08T15:10:00Z'
  },
  {
    id: 'wst-2',
    productId: 'prod-4',
    productName: 'Handcrafted Resin Floral Bookmarks',
    stockType: 'COMMISSION',
    quantity: 2,
    unitCost: 35,
    totalLoss: 70,
    reason: 'Damaged',
    date: '2026-09-11',
    note: 'Cracked resin piece during display setup',
    recordedByIntern: 'Zoya Khan',
    createdAt: '2026-09-11T16:00:00Z'
  }
];

export const initialMovements: StockMovement[] = [
  {
    id: 'mv-1',
    productId: 'prod-1',
    productName: 'Thinkaroo Premium Hardcover Notebook',
    stockType: 'OWN',
    movementType: 'OWN_PURCHASE',
    quantityDelta: 50,
    quantityAfter: 50,
    referenceId: 'PO-2026-001',
    reason: 'Received initial inventory purchase',
    internEmail: 'admin@caliphschool.com',
    internName: 'Mrs. Fatima',
    timestamp: '2026-08-10T10:00:00Z'
  },
  {
    id: 'mv-2',
    productId: 'prod-4',
    productName: 'Handcrafted Resin Floral Bookmarks',
    stockType: 'COMMISSION',
    movementType: 'COMMISSION_PURCHASE',
    quantityDelta: 30,
    quantityAfter: 30,
    referenceId: 'PO-2026-002',
    reason: 'Received consignment batch from Art Club',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    timestamp: '2026-08-18T14:30:00Z'
  },
  {
    id: 'mv-3',
    productId: 'prod-1',
    productName: 'Thinkaroo Premium Hardcover Notebook',
    stockType: 'OWN',
    movementType: 'SALE',
    quantityDelta: -2,
    quantityAfter: 48,
    referenceId: 'TK-2026-001',
    reason: 'Sold via Bill #TK-2026-001',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    timestamp: '2026-09-10T11:20:00Z'
  },
  {
    id: 'mv-4',
    productId: 'prod-4',
    productName: 'Handcrafted Resin Floral Bookmarks',
    stockType: 'COMMISSION',
    movementType: 'SALE',
    quantityDelta: -2,
    quantityAfter: 28,
    referenceId: 'TK-2026-002',
    reason: 'Sold via Bill #TK-2026-002',
    internEmail: 'zoya.intern@caliphschool.com',
    internName: 'Zoya Khan',
    timestamp: '2026-09-11T13:45:00Z'
  },
  {
    id: 'mv-5',
    productId: 'prod-4',
    productName: 'Handcrafted Resin Floral Bookmarks',
    stockType: 'COMMISSION',
    movementType: 'WASTAGE',
    quantityDelta: -2,
    quantityAfter: 26,
    referenceId: 'wst-2',
    reason: 'Cracked resin piece during display setup',
    internEmail: 'zoya.intern@caliphschool.com',
    internName: 'Zoya Khan',
    timestamp: '2026-09-11T16:00:00Z'
  },
  {
    id: 'mv-6',
    productId: 'prod-1',
    productName: 'Thinkaroo Premium Hardcover Notebook',
    stockType: 'OWN',
    movementType: 'SALE',
    quantityDelta: -3,
    quantityAfter: 45,
    referenceId: 'TK-2026-003',
    reason: 'Sold via Bill #TK-2026-003',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    timestamp: '2026-09-12T11:15:00Z'
  },
  {
    id: 'mv-7',
    productId: 'prod-4',
    productName: 'Handcrafted Resin Floral Bookmarks',
    stockType: 'COMMISSION',
    movementType: 'SALE',
    quantityDelta: -4,
    quantityAfter: 22,
    referenceId: 'TK-2026-003',
    reason: 'Sold via Bill #TK-2026-003',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    timestamp: '2026-09-12T11:15:00Z'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    timestamp: '2026-09-12T11:15:00Z',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    action: 'RECORDED_SALE',
    entityType: 'SALE',
    entityId: 'TK-2026-003',
    details: 'Completed Sale TK-2026-003 for ₹1,000 (Own: ₹480, Commission: ₹530, Comm Earned: ₹53)'
  },
  {
    id: 'act-2',
    timestamp: '2026-09-11T16:00:00Z',
    internEmail: 'zoya.intern@caliphschool.com',
    internName: 'Zoya Khan',
    action: 'RECORDED_WASTAGE',
    entityType: 'WASTAGE',
    entityId: 'wst-2',
    details: 'Logged 2 units wastage for Handcrafted Resin Floral Bookmarks (Commission Stock)'
  },
  {
    id: 'act-3',
    timestamp: '2026-09-11T13:45:00Z',
    internEmail: 'zoya.intern@caliphschool.com',
    internName: 'Zoya Khan',
    action: 'RECORDED_SALE',
    entityType: 'SALE',
    entityId: 'TK-2026-002',
    details: 'Completed Cash Sale TK-2026-002 for ₹140 (Commission Sale)'
  },
  {
    id: 'act-4',
    timestamp: '2026-09-10T11:20:00Z',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    action: 'RECORDED_SALE',
    entityType: 'SALE',
    entityId: 'TK-2026-001',
    details: 'Completed UPI Sale TK-2026-001 for ₹395 (Own Sale)'
  },
  {
    id: 'act-5',
    timestamp: '2026-09-09T16:00:00Z',
    internEmail: 'caliph.student@gmail.com',
    internName: 'Rohan Sharma',
    action: 'ADDED_EXPENSE',
    entityType: 'EXPENSE',
    entityId: 'exp-3',
    details: 'Recorded Supplies expense ₹50 for Sellotape and ribbons'
  },
  {
    id: 'act-6',
    timestamp: '2026-08-25T11:30:00Z',
    internEmail: 'aarav.intern@caliphschool.com',
    internName: 'Aarav Patel',
    action: 'ADDED_PURCHASE',
    entityType: 'PURCHASE',
    entityId: 'PO-2026-004',
    details: 'Received Commission Purchase PO-2026-004 from Caliph Senior Art Guild (₹4,800)'
  },
  {
    id: 'act-7',
    timestamp: '2026-08-20T10:00:00Z',
    internEmail: 'admin@caliphschool.com',
    internName: 'Mrs. Fatima',
    action: 'APPROVED_INTERN',
    entityType: 'INTERN',
    entityId: 'caliph.student@gmail.com',
    details: 'Approved intern Rohan Sharma (caliph.student@gmail.com)'
  }
];
