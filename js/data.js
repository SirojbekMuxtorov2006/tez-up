/**
 * Tez-Up POS - Boshlang'ich ma'lumotlar bazasi
 * Obid Shashlik restorani uchun
 */

const INITIAL_DATA = {
  restaurant: {
    name: "Obid Shashlik",
    tagline: "Milliy taomlar va shashliklar maskani",
    branch: "Bosh filial",
    cashier: "Shavkat Aliyev",
    waiterDefault: "Dilshod",
    phone: "+998 97 611 11 71",
    address: "Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko'chasi 42",
    receiptFooter: "Tashrifingiz uchun rahmat! Yana kutib qolamiz!",
    serviceFeePercent: 10,
    taxPercent: 0,
    currency: "UZS"
  },

  users: [
    { id: "u1", name: "Shavkat Aliyev", role: "Kassir", pin: "1234", avatar: "👨‍💼" },
    { id: "u2", name: "Dilshod", role: "Ofitsiant", pin: "2222", avatar: "🤵" },
    { id: "u3", name: "Admin (Boshqaruv)", role: "Administrator", pin: "7777", avatar: "👑" }
  ],

  security: {
    isLocked: false,
    currentUserId: "u1",
    autoLockMinutes: 5
  },

  zones: [
    { id: "all", name: "Barcha stollar", icon: "grid" },
    { id: "street", name: "Ko'cha (Terrasa)", icon: "sun" },
    { id: "hall", name: "Asosiy Zal", icon: "utensils" },
    { id: "room", name: "Kabinat / Xona", icon: "door-closed" },
    { id: "vip", name: "VIP Zallar", icon: "crown" }
  ],

  tables: [
    // Ko'cha (Terrasa)
    { 
      id: "t1", 
      number: "1", 
      name: "1-stol", 
      zone: "street", 
      capacity: 1, 
      photo: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80",
      shape: "square", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t2", 
      number: "2", 
      name: "2-stol", 
      zone: "street", 
      capacity: 2, 
      photo: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=700&q=80",
      shape: "rect", 
      status: "occupied", 
      order: {
        orderId: "#1008",
        openedAt: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
        waiter: "Shavkat",
        guestCount: 2,
        items: [
          { id: "d1", name: "G'ijdivon shashlik", price: 25000, quantity: 4, note: "Piyozi ko'proq" },
          { id: "d18", name: "Fanta 1.5 L", price: 17000, quantity: 1, note: "Muzdek" },
          { id: "d24", name: "Svejiy salat katta", price: 25000, quantity: 1, note: "" },
          { id: "d11", name: "Non", price: 5000, quantity: 2, note: "Issiq" }
        ],
        status: "preparing"
      }
    },
    { 
      id: "t3", 
      number: "3", 
      name: "3-stol", 
      zone: "street", 
      capacity: 3, 
      photo: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=700&q=80",
      shape: "square", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t4", 
      number: "4", 
      name: "4-stol", 
      zone: "street", 
      capacity: 4, 
      photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
      shape: "rect", 
      status: "ready", 
      order: {
        orderId: "#1009",
        openedAt: new Date(Date.now() - 52 * 60 * 1000).toISOString(),
        waiter: "Dilshod",
        guestCount: 4,
        items: [
          { id: "d4", name: "Mastava", price: 30000, quantity: 3, note: "Qatiqli" },
          { id: "d2", name: "Moloti shashlik", price: 15000, quantity: 6, note: "" },
          { id: "d14", name: "Choy ko'k", price: 5000, quantity: 2, note: "Limon bilan" }
        ],
        status: "ready"
      }
    },
    { 
      id: "t5", 
      number: "5", 
      name: "5-stol", 
      zone: "street", 
      capacity: 5, 
      photo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80",
      shape: "rect-large", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t6", 
      number: "6", 
      name: "6-stol", 
      zone: "street", 
      capacity: 6, 
      photo: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=700&q=80",
      shape: "circle", 
      status: "empty", 
      order: null 
    },
    
    // Asosiy Zal
    { 
      id: "t7", 
      number: "7", 
      name: "7-stol", 
      zone: "hall", 
      capacity: 7, 
      photo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=80",
      shape: "square", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t8", 
      number: "8", 
      name: "8-stol", 
      zone: "hall", 
      capacity: 8, 
      photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80",
      shape: "rect", 
      status: "occupied",
      order: {
        orderId: "#1010",
        openedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        waiter: "Aziz",
        guestCount: 8,
        items: [
          { id: "d7", name: "Vaguri 1kg", price: 260000, quantity: 1, note: "Yumshoq pishsin" },
          { id: "d26", name: "Mujskoy kapriz", price: 30000, quantity: 1, note: "" },
          { id: "d16", name: "Coca cola 1.5 L", price: 17000, quantity: 2, note: "" }
        ],
        status: "preparing"
      }
    },
    { 
      id: "t9", 
      number: "9", 
      name: "9-stol", 
      zone: "hall", 
      capacity: 9, 
      photo: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=700&q=80",
      shape: "rect", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t10", 
      number: "10", 
      name: "10-stol", 
      zone: "hall", 
      capacity: 10, 
      photo: "https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=700&q=80",
      shape: "circle", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t11", 
      number: "11", 
      name: "11-stol", 
      zone: "hall", 
      capacity: 11, 
      photo: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=700&q=80",
      shape: "rect-large", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t12", 
      number: "12", 
      name: "12-stol", 
      zone: "hall", 
      capacity: 12, 
      photo: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=700&q=80",
      shape: "square", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t13", 
      number: "13", 
      name: "13-stol", 
      zone: "hall", 
      capacity: 13, 
      photo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=700&q=80",
      shape: "rect", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t14", 
      number: "14", 
      name: "14-stol", 
      zone: "hall", 
      capacity: 14, 
      photo: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&w=700&q=80",
      shape: "square", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t15", 
      number: "15", 
      name: "15-stol", 
      zone: "hall", 
      capacity: 15, 
      photo: "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=700&q=80",
      shape: "rect", 
      status: "empty", 
      order: null 
    },

    // Xona / Kabinat
    { 
      id: "t16", 
      number: "16", 
      name: "16-stol (Kabinat)", 
      zone: "room", 
      capacity: 16, 
      photo: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=700&q=80",
      shape: "booth", 
      status: "billed",
      order: {
        orderId: "#1006",
        openedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
        waiter: "Shavkat",
        guestCount: 16,
        items: [
          { id: "d2", name: "Moloti shashlik", price: 15000, quantity: 8, note: "" },
          { id: "d15", name: "SUV 1 L", price: 7000, quantity: 2, note: "" },
          { id: "d30", name: "Zinnur", price: 30000, quantity: 1, note: "" }
        ],
        status: "billed"
      }
    },
    { 
      id: "t17", 
      number: "17", 
      name: "17-stol (Kabinat)", 
      zone: "room", 
      capacity: 17, 
      photo: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80",
      shape: "booth", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t18", 
      number: "18", 
      name: "18-stol (Kabinat)", 
      zone: "room", 
      capacity: 18, 
      photo: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=80",
      shape: "booth", 
      status: "empty", 
      order: null 
    },

    // VIP
    { 
      id: "t19", 
      number: "19", 
      name: "19-stol (VIP Oqshom)", 
      zone: "vip", 
      capacity: 19, 
      photo: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=700&q=80",
      shape: "vip-round", 
      status: "empty", 
      order: null 
    },
    { 
      id: "t20", 
      number: "20", 
      name: "20-stol (VIP Sharq)", 
      zone: "vip", 
      capacity: 20, 
      photo: "https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=700&q=80",
      shape: "vip-round", 
      status: "reserved", 
      order: null, 
      reservation: { guest: "Akmal aka", time: "19:00", phone: "+998 90 123 45 67" } 
    }
  ],

  categories: [
    { id: "all", name: "Barchasi", icon: "sparkles", count: 35 },
    { id: "shashlik", name: "Shashliklar", icon: "flame", count: 7 },
    { id: "dishes", name: "Taomlar", icon: "soup", count: 7 },
    { id: "salads", name: "Salatlar", icon: "salad", count: 12 },
    { id: "drinks", name: "Ichimliklar", icon: "glass-water", count: 7 },
    { id: "bread", name: "Non mahsulotlari", icon: "croissant", count: 2 }
  ],

  dishes: [
    // Shashliklar
    {
      id: "d1",
      name: "G'ijdivon shashlik",
      category: "shashlik",
      station: "grill",
      price: 25000,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
      description: "Mayin mol go'shti va qo'y yog'i aralashmasidan tayyorlangan mashhur G'ijdivoncha kabob.",
      weight: "120g",
      prepTime: "15 daq"
    },
    {
      id: "d2",
      name: "Moloti shashlik",
      category: "shashlik",
      station: "grill",
      price: 15000,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      description: "Qiyma go'shtdan maxsus ziravorlar bilan qovurilgan mayin kabob.",
      weight: "90g",
      prepTime: "12 daq"
    },
    {
      id: "d3",
      name: "Dumba shashlik",
      category: "shashlik",
      station: "grill",
      price: 35000,
      image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=600&q=80",
      description: "Qarsildoq qovurilgan nozik qo'y dumbasi kabobi.",
      weight: "110g",
      prepTime: "10 daq"
    },
    {
      id: "d10",
      name: "Dumbalik shashlik",
      category: "shashlik",
      station: "grill",
      price: 17000,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
      description: "Go'sht va dumba navbati bilan terilgan qarsildoq kabob.",
      weight: "100g",
      prepTime: "12 daq"
    },
    {
      id: "d35",
      name: "Tovuq shashlik",
      category: "shashlik",
      station: "grill",
      price: 18000,
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80",
      description: "Maxsus sousda marinadlangan mayin tovuq filesi.",
      weight: "130g",
      prepTime: "12 daq"
    },
    {
      id: "d36",
      name: "Qovurg'a shashlik",
      category: "shashlik",
      station: "grill",
      price: 38000,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      description: "Kaftdek keladigan mayin qo'y qovurg'asi shashligi.",
      weight: "160g",
      prepTime: "18 daq"
    },
    {
      id: "d37",
      name: "Jigar shashlik",
      category: "shashlik",
      station: "grill",
      price: 16000,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
      description: "Yangi mol jigari va dumba pardasida o'ralgan kabob.",
      weight: "110g",
      prepTime: "10 daq"
    },

    // Taomlar
    {
      id: "d4",
      name: "Mastava",
      category: "dishes",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
      description: "Mayda to'g'ralgan go'sht, guruch va sabzavotlar bilan pishirilgan suyuq milliy taom.",
      weight: "400g",
      prepTime: "5 daq"
    },
    {
      id: "d5",
      name: "Tiftel",
      category: "dishes",
      station: "kitchen",
      price: 35000,
      image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
      description: "Mazali go'shtli teftellar, boyitilgan quyuq qayla va sabzavotlar bilan.",
      weight: "350g",
      prepTime: "10 daq"
    },
    {
      id: "d6",
      name: "Tushonka",
      category: "dishes",
      station: "kitchen",
      price: 40000,
      image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80",
      description: "O'z sharbatida dimlangan mayin mol go'shti.",
      weight: "300g",
      prepTime: "5 daq"
    },
    {
      id: "d7",
      name: "Vaguri 1kg",
      category: "dishes",
      station: "kitchen",
      price: 260000,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
      description: "Buxorocha usulda qozonda qarsildoq qilib qovurilgan qo'y go'shti.",
      weight: "1000g",
      prepTime: "25 daq"
    },
    {
      id: "d8",
      name: "Bulyon",
      category: "dishes",
      station: "kitchen",
      price: 5000,
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=80",
      description: "Toza, xushbo'y go'sht suvi, ko'katlar bilan birga.",
      weight: "250ml",
      prepTime: "3 daq"
    },
    {
      id: "d9",
      name: "Kartoshka fri",
      category: "dishes",
      station: "kitchen",
      price: 15000,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
      description: "Tillarang qovurilgan qarsildoq kartoshka somonchalari.",
      weight: "150g",
      prepTime: "8 daq"
    },
    {
      id: "d38",
      name: "Sho'rva",
      category: "dishes",
      station: "kitchen",
      price: 28000,
      image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80",
      description: "Qo'y go'shti, no'xat va yirik sabzavotlar bilan pishirilgan to'yimli sho'rva.",
      weight: "450g",
      prepTime: "5 daq"
    },

    // Salatlar
    {
      id: "d24",
      name: "Svejiy salat katta",
      category: "salads",
      station: "kitchen",
      price: 25000,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      description: "Pomidor, bodring, yangi ko'katlar va piyoz aralashmasi (Katta porsiya).",
      weight: "350g",
      prepTime: "5 daq"
    },
    {
      id: "d25",
      name: "Svejiy salat mayda",
      category: "salads",
      station: "kitchen",
      price: 20000,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      description: "Yangi sabzavotlar nozik qilib to'g'ralgan salat.",
      weight: "250g",
      prepTime: "5 daq"
    },
    {
      id: "d26",
      name: "Mujskoy kapriz",
      category: "salads",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      description: "Qaynatilgan mol go'shti, pishloq, tuxum va mayonez bilan to'yimli salat.",
      weight: "200g",
      prepTime: "7 daq"
    },
    {
      id: "d27",
      name: "Majnuntol",
      category: "salads",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
      description: "Qaynatilgan til, go'sht, tuzlangan bodring va maxsus sous.",
      weight: "200g",
      prepTime: "7 daq"
    },
    {
      id: "d28",
      name: "Myasnoy xe",
      category: "salads",
      station: "kitchen",
      price: 35000,
      image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=600&q=80",
      description: "Koreyscha uslubdagi achchiq marinadlangan mol go'shti.",
      weight: "180g",
      prepTime: "5 daq"
    },
    {
      id: "d29",
      name: "Fransuzkiy salat",
      category: "salads",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      description: "Lavlagi, olma, sabzi, go'sht va qarsildoq kartoshka somonlari.",
      weight: "220g",
      prepTime: "7 daq"
    },
    {
      id: "d30",
      name: "Zinnur",
      category: "salads",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      description: "Tovuq filesi, bodring, makkajo'xori va mayonez bilan mayin salat.",
      weight: "200g",
      prepTime: "5 daq"
    },
    {
      id: "d31",
      name: "Zagadka",
      category: "salads",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      description: "Tuxum quymoqlari, mol go'shti va ziravorlar bilan sirli retsept.",
      weight: "200g",
      prepTime: "7 daq"
    },
    {
      id: "d32",
      name: "Azia salati",
      category: "salads",
      station: "kitchen",
      price: 30000,
      image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
      description: "Sharqona ziravorlar va sarimsoqli maxsus achchiq bodring salati.",
      weight: "200g",
      prepTime: "5 daq"
    },
    {
      id: "d33",
      name: "Chakki qatiq",
      category: "salads",
      station: "kitchen",
      price: 5000,
      image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
      description: "Haqiqiy tog' suzmasi, rayhon va yalpiz sepilgan.",
      weight: "150g",
      prepTime: "2 daq"
    },
    {
      id: "d34",
      name: "Limon",
      category: "salads",
      station: "kitchen",
      price: 10000,
      image: "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80",
      description: "Yangi shirin limon parraklari, choy yoki taom uchun.",
      weight: "100g",
      prepTime: "2 daq"
    },

    // Ichimliklar
    {
      id: "d13",
      name: "Sok bliss",
      category: "drinks",
      station: "bar",
      price: 17000,
      image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
      description: "Tabiiy mevali Bliss sharbati (1 Litr).",
      weight: "1 L",
      prepTime: "1 daq"
    },
    {
      id: "d14",
      name: "Choy ko'k",
      category: "drinks",
      station: "bar",
      price: 5000,
      image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
      description: "Xushbo'y ko'k choy choynakda, qand bilan birga.",
      weight: "1 choynak",
      prepTime: "3 daq"
    },
    {
      id: "d15",
      name: "SUV 1 L",
      category: "drinks",
      station: "bar",
      price: 7000,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
      description: "Toza gazsiz ichimlik suvi.",
      weight: "1 L",
      prepTime: "1 daq"
    },
    {
      id: "d16",
      name: "Coca cola 1.5 L",
      category: "drinks",
      station: "bar",
      price: 17000,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
      description: "Klassik Coca-Cola 1.5 litr.",
      weight: "1.5 L",
      prepTime: "1 daq"
    },
    {
      id: "d17",
      name: "Coca cola 0.5 L",
      category: "drinks",
      station: "bar",
      price: 8000,
      image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
      description: "Muzdek Coca-Cola 0.5 litr.",
      weight: "0.5 L",
      prepTime: "1 daq"
    },
    {
      id: "d18",
      name: "Fanta 1.5 L",
      category: "drinks",
      station: "bar",
      price: 17000,
      image: "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=600&q=80",
      description: "Apelsin ta'mli gazlangan Fanta 1.5 litr.",
      weight: "1.5 L",
      prepTime: "1 daq"
    },
    {
      id: "d19",
      name: "Chortoq 0.5 L",
      category: "drinks",
      station: "bar",
      price: 13000,
      image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
      description: "Shifobaxsh mineral Chortoq suvi shisha idishda.",
      weight: "0.5 L",
      prepTime: "1 daq"
    },

    // Non mahsulotlari
    {
      id: "d11",
      name: "Tandir Non",
      category: "bread",
      station: "kitchen",
      price: 5000,
      image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
      description: "Issiq tandirdan uzilgan sedana sepilgan non.",
      weight: "300g",
      prepTime: "1 daq"
    },
    {
      id: "d12",
      name: "Non 0.5 (Yarimta)",
      category: "bread",
      station: "kitchen",
      price: 3000,
      image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
      description: "Yarimta tandir non.",
      weight: "150g",
      prepTime: "1 daq"
    }
  ],

  // Cheklar arxivi
  receipts: [
    {
      id: "rc-1008",
      receiptNumber: "1008",
      tableId: "t2",
      tableName: "2-stol",
      zoneName: "Ko'cha (Terrasa)",
      type: "table", // table, takeaway, delivery
      waiter: "Shavkat",
      cashier: "Shavkat Aliyev",
      paymentMethod: "naqd", // naqd, plastik, qr
      subtotal: 147000,
      serviceFee: 14700,
      tax: 0,
      total: 161700,
      paidAmount: 170000,
      changeAmount: 8300,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      items: [
        { name: "G'ijdivon shashlik", price: 25000, quantity: 4, sum: 100000 },
        { name: "Fanta 1.5 L", price: 17000, quantity: 1, sum: 17000 },
        { name: "Svejiy salat katta", price: 25000, quantity: 1, sum: 25000 },
        { name: "Tandir Non", price: 5000, quantity: 1, sum: 5000 }
      ],
      status: "paid"
    },
    {
      id: "rc-1007",
      receiptNumber: "1007",
      tableId: "t16",
      tableName: "1-Xona",
      zoneName: "Kabinat / Xona",
      type: "table",
      waiter: "Dilshod",
      cashier: "Shavkat Aliyev",
      paymentMethod: "plastik",
      subtotal: 195000,
      serviceFee: 19500,
      tax: 0,
      total: 214500,
      paidAmount: 214500,
      changeAmount: 0,
      createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      items: [
        { name: "Moloti shashlik", price: 15000, quantity: 8, sum: 120000 },
        { name: "Mujskoy kapriz", price: 30000, quantity: 1, sum: 30000 },
        { name: "Coca cola 1.5 L", price: 17000, quantity: 2, sum: 34000 },
        { name: "Tandir Non", price: 5000, quantity: 2, sum: 10000 }
      ],
      status: "paid"
    },
    {
      id: "rc-1006",
      receiptNumber: "1006",
      tableId: "takeaway-1",
      tableName: "Olib ketish #104",
      zoneName: "Takeaway",
      type: "takeaway",
      waiter: "Kassa",
      cashier: "Shavkat Aliyev",
      paymentMethod: "qr",
      subtotal: 80000,
      serviceFee: 0,
      tax: 0,
      total: 80000,
      paidAmount: 80000,
      changeAmount: 0,
      createdAt: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
      items: [
        { name: "G'ijdivon shashlik", price: 25000, quantity: 2, sum: 50000 },
        { name: "Kartoshka fri", price: 15000, quantity: 2, sum: 30000 }
      ],
      status: "paid"
    }
  ],

  // Smena hisoboti
  shift: {
    isOpen: true,
    openedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    cashier: "Shavkat Aliyev",
    startingCash: 500000,
    totalOrders: 18,
    totalRevenue: 2845000,
    cashRevenue: 1650000,
    cardRevenue: 980000,
    qrRevenue: 215000
  },

  // Printer sozlamalari
  printers: {
    kassa: { name: "Xprinter XP-80 (USB)", enabled: true, cutPaper: true },
    kitchen: { name: "Bixolon SRP-350 (LAN 192.168.1.101)", enabled: true, cutPaper: true },
    grill: { name: "Xprinter XP-80C (LAN 192.168.1.102)", enabled: true, cutPaper: true },
    bar: { name: "Epson TM-T20III (LAN 192.168.1.103)", enabled: true, cutPaper: true }
  }
};
