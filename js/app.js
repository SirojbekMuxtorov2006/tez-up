/**
 * Tez-Up POS - Professional Application Controller
 * Obid Shashlik restorani uchun
 */

class PosApp {
  constructor() {
    this.data = this.loadPersistedData() || INITIAL_DATA;
    this.currentZone = 'all';
    this.activeTableId = null;
    this.activeOrder = null;
    this.currentCategory = 'all';
    this.searchQueryTable = '';
    this.searchQueryDish = '';
    this.sidebarTab = 'takeaway'; // 'takeaway' or 'delivery'

    // To'lov holati
    this.paymentState = {
      method: 'naqd', // 'naqd', 'plastik', 'qr'
      toPay: 0,
      received: 0,
      inputBuffer: '0'
    };

    // Tanlangan chek ko'rinishi
    this.selectedReceiptId = this.data.receipts[0]?.id || null;

    // Tarmoq holati (Offline / Online)
    this.isOnline = navigator.onLine;

    // Xavfsizlik va PIN kod
    this.enteredPin = '';
    this.selectedUserId = this.data.security?.currentUserId || 'u1';
    this.isLocked = this.data.security?.isLocked || false;
    this.inactivityTimer = null;

    // Audio sintezatori (Ovozli effektlar)
    this.initAudioContext();
  }

  /* =========================================================================
     MA'LUMOTLARNI SAQLASH VA YUKLASH (LocalStorage)
     ========================================================================= */
  loadPersistedData() {
    try {
      const stored = localStorage.getItem('tezup_pos_data_v4');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.tables && parsed.tables[0] && parsed.tables[0].capacity === 1) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Storage yuklanmadi:", e);
    }
    return null;
  }

  persistData() {
    try {
      localStorage.setItem('tezup_pos_data_v4', JSON.stringify(this.data));
    } catch (e) {
      console.warn("Storage saqlanmadi:", e);
    }
  }

  /* =========================================================================
     AUDIO EFFEKTLAR (Web Audio API - Nol tashqi kutubxona)
     ========================================================================= */
  initAudioContext() {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audioCtx = null;
    }
  }

  playSound(type = 'click') {
    if (!this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'add') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(780, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554.37, now + 0.08);
        osc.frequency.setValueAtTime(659.25, now + 0.16);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch (e) {
      // Audio xatoligini e'tiborsiz qoldiramiz
    }
  }

  /* =========================================================================
     ILOVA BOSHLANISHI (Init)
     ========================================================================= */
  init() {
    this.renderHeaderInfo();
    this.renderZones();
    this.renderTables();
    this.renderSidebarOrders();
    this.renderCategories();
    this.renderDishes();
    this.setupEventListeners();
    this.initNetwork();
    this.initSecurity();
    this.registerServiceWorker();
  }

  /* =========================================================================
     PWA SERVICE WORKER VA OFFLINE KESH
     ========================================================================= */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('ServiceWorker kesh faollashdi:', reg.scope))
        .catch(err => console.log('ServiceWorker xatosi:', err));
    }
  }

  /* =========================================================================
     ONLINE / OFFLINE TARMOQNI BOSHQARISH
     ========================================================================= */
  initNetwork() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateNetworkStatusUI();
      this.showToast("🌐 Internet ulandi! Barcha buyurtmalar sinxronlashtirildi.", "success");
      this.playSound('success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateNetworkStatusUI();
      this.showToast("📡 Offline rejim: Barcha amallar lokal xotirada saqlanadi.", "warning");
      this.playSound('click');
    });

    this.updateNetworkStatusUI();
  }

  toggleNetworkSimulation() {
    this.playSound('click');
    this.isOnline = !this.isOnline;
    this.updateNetworkStatusUI();
    if (this.isOnline) {
      this.showToast("Online rejim faol: Server bilan aloqa o'rnatildi!", "success");
    } else {
      this.showToast("Offline rejim faol: Lokal ma'lumotlar bazasida ishlash!", "warning");
    }
  }

  updateNetworkStatusUI() {
    const badge = document.getElementById('networkStatusBadge');
    const dot = document.getElementById('networkStatusDot');
    const text = document.getElementById('networkStatusText');
    if (!badge || !dot || !text) return;

    if (this.isOnline) {
      badge.className = 'stat-pill online-badge';
      dot.style.backgroundColor = 'var(--emerald-500)';
      dot.style.boxShadow = '0 0 8px var(--emerald-500)';
      text.textContent = 'Online';
    } else {
      badge.className = 'stat-pill offline-badge';
      dot.style.backgroundColor = 'var(--amber-500)';
      dot.style.boxShadow = '0 0 8px var(--amber-500)';
      text.textContent = 'Offline';
    }
  }

  /* =========================================================================
     XAVFSIZLIK VA PIN KOD (Security PIN Lock Screen)
     ========================================================================= */
  initSecurity() {
    this.renderLockUsers();
    this.resetInactivityTimer();

    window.addEventListener('mousemove', () => this.resetInactivityTimer());
    window.addEventListener('keydown', () => this.resetInactivityTimer());

    if (this.isLocked) {
      this.showLockModal();
    }
  }

  resetInactivityTimer() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    const minutes = this.data.security?.autoLockMinutes || 5;
    this.inactivityTimer = setTimeout(() => {
      if (!this.isLocked) {
        this.lockScreen();
      }
    }, minutes * 60 * 1000);
  }

  lockScreen() {
    this.playSound('click');
    this.isLocked = true;
    this.enteredPin = '';
    this.updatePinDots();
    this.showLockModal();
  }

  showLockModal() {
    const modal = document.getElementById('lockScreenModal');
    if (modal) modal.style.display = 'flex';
  }

  hideLockModal() {
    const modal = document.getElementById('lockScreenModal');
    if (modal) modal.style.display = 'none';
  }

  renderLockUsers() {
    const container = document.getElementById('lockUsersList');
    if (!container || !this.data.users) return;

    container.innerHTML = this.data.users.map(u => `
      <div class="lock-user-chip ${u.id === this.selectedUserId ? 'active' : ''}" onclick="app.selectLockUser('${u.id}')">
        <span class="avatar">${u.avatar || '👨‍🍳'}</span>
        <span>${u.name.split(' ')[0]}</span>
      </div>
    `).join('');
  }

  selectLockUser(userId) {
    this.playSound('click');
    this.selectedUserId = userId;
    this.enteredPin = '';
    this.updatePinDots();
    this.renderLockUsers();
    document.getElementById('pinErrorMessage').textContent = '';
  }

  enterPinDigit(digit) {
    if (this.enteredPin.length >= 4) return;
    this.playSound('click');
    this.enteredPin += digit;
    this.updatePinDots();
    document.getElementById('pinErrorMessage').textContent = '';

    if (this.enteredPin.length === 4) {
      setTimeout(() => this.verifyPin(), 160);
    }
  }

  backspacePinDigit() {
    this.playSound('click');
    this.enteredPin = this.enteredPin.slice(0, -1);
    this.updatePinDots();
    document.getElementById('pinErrorMessage').textContent = '';
  }

  clearPinDigits() {
    this.playSound('click');
    this.enteredPin = '';
    this.updatePinDots();
    document.getElementById('pinErrorMessage').textContent = '';
  }

  updatePinDots() {
    const dots = document.querySelectorAll('#pinDotsDisplay .pin-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('filled', index < this.enteredPin.length);
    });
  }

  verifyPin() {
    const user = this.data.users.find(u => u.id === this.selectedUserId);
    if (user && user.pin === this.enteredPin) {
      this.playSound('success');
      this.isLocked = false;
      this.data.restaurant.cashier = user.name;
      this.persistData();
      this.renderHeaderInfo();
      this.hideLockModal();
      this.showToast(`Xush kelibsiz, ${user.name}!`, "success");
      this.enteredPin = '';
      this.updatePinDots();
    } else {
      this.playSound('click');
      const card = document.querySelector('.lock-screen-card');
      if (card) {
        card.classList.add('shake-animation');
        setTimeout(() => card.classList.remove('shake-animation'), 400);
      }
      document.getElementById('pinErrorMessage').textContent = "Noto'g'ri PIN kod! Qaytadan urinib ko'ring.";
      this.enteredPin = '';
      this.updatePinDots();
    }
  }

  quickUnlock() {
    this.enteredPin = '1234';
    this.selectedUserId = 'u1';
    this.renderLockUsers();
    this.updatePinDots();
    this.verifyPin();
  }

  renderHeaderInfo() {
    const { restaurant, shift } = this.data;
    document.getElementById('headerRestaurantName').textContent = restaurant.name;
    document.getElementById('headerCashierName').textContent = restaurant.cashier;
    
    // Stollar soni va statistikasi
    const totalTables = this.data.tables.length;
    const occupiedTables = this.data.tables.filter(t => t.status !== 'empty').length;
    const freeTables = totalTables - occupiedTables;

    document.getElementById('statTotalTables').textContent = totalTables;
    document.getElementById('statFreeTables').textContent = freeTables;
    document.getElementById('statOccupiedTables').textContent = occupiedTables;
    document.getElementById('statDailyRevenue').textContent = this.formatCurrency(shift.totalRevenue);
    
    // Faol buyurtmalar hisoblagichi
    document.getElementById('activeOrdersBadge').textContent = occupiedTables;
  }

  /* =========================================================================
     ZONALAR VA FILTRLAR (Zonalar render)
     ========================================================================= */
  renderZones() {
    const container = document.getElementById('zonesList');
    if (!container) return;

    container.innerHTML = this.data.zones.map(z => `
      <button class="zone-pill-btn ${this.currentZone === z.id ? 'active' : ''}" onclick="app.setZone('${z.id}')">
        <span>${z.name}</span>
      </button>
    `).join('');
  }

  setZone(zoneId) {
    this.playSound('click');
    this.currentZone = zoneId;
    this.renderZones();
    this.renderTables();
  }

  /* =========================================================================
     ZAMONAVIY STOLLAR RENDERI (Stunning Modern Architecture)
     ========================================================================= */
  renderTables() {
    const container = document.getElementById('tablesGridContainer');
    if (!container) return;

    let tables = this.data.tables;

    // Zona bo'yicha filter
    if (this.currentZone !== 'all') {
      tables = tables.filter(t => t.zone === this.currentZone);
    }

    // Qidiruv bo'yicha filter
    if (this.searchQueryTable) {
      const q = this.searchQueryTable.toLowerCase();
      tables = tables.filter(t => 
        t.number.toLowerCase().includes(q) || 
        t.name.toLowerCase().includes(q) ||
        (t.order && t.order.waiter && t.order.waiter.toLowerCase().includes(q))
      );
    }

    if (tables.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1;" class="empty-state-box">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h4>Hech qanday stol topilmadi</h4>
          <p style="font-size: 0.85rem;">Qidiruv so'zini o'zgartiring yoki boshqa zonani tanlang</p>
        </div>
      `;
      return;
    }

    container.innerHTML = tables.map(table => {
      const isOccupied = table.status !== 'empty';
      const order = table.order;
      const orderSum = order ? order.items.reduce((s, i) => s + (i.price * i.quantity), 0) : 0;
      const itemCount = order ? order.items.reduce((s, i) => s + i.quantity, 0) : 0;
      
      // Status matni va sinfi
      let statusClass = 'status-empty';
      let statusText = "Bo'sh";
      if (table.status === 'occupied') {
        statusClass = 'status-occupied';
        statusText = 'Band';
      } else if (table.status === 'ready') {
        statusClass = 'status-ready';
        statusText = 'Tayyor';
      } else if (table.status === 'billed') {
        statusClass = 'status-billed';
        statusText = 'Hisobda';
      } else if (table.status === 'reserved') {
        statusClass = 'status-reserved';
        statusText = 'Bron';
      }

      // Vaqt hisobi
      let timeText = '0 daq';
      if (order && order.openedAt) {
        const mins = Math.floor((Date.now() - new Date(order.openedAt).getTime()) / (1000 * 60));
        timeText = `${mins} daq`;
      }

      const tablePhoto = table.photo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80';

      return `
        <div class="modern-table-card ${table.status}" onclick="app.openTableOrder('${table.id}')">
          <!-- Haqiqiy Real Stol Rasmi (Uniform Aspect Ratio) -->
          <div class="table-photo-stage">
            <img 
              src="${tablePhoto}" 
              alt="${table.name}" 
              class="table-real-img"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=700&q=80'"
            />
            
            <div class="table-photo-overlay">
              <!-- Yuqori qator: Stol raqami va Status -->
              <div class="table-photo-top-row">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span class="table-number-badge" style="background: rgba(15, 23, 42, 0.8); color: #ffffff; padding: 2px 9px; border-radius: var(--radius-sm); border: 1px solid rgba(255,255,255,0.25); font-size: 0.95rem;">
                    ${table.number}
                  </span>
                  <span class="table-zone-tag" style="background: rgba(15, 23, 42, 0.7); color: #93c5fd; border-color: rgba(147, 197, 253, 0.3);">
                    ${this.getZoneLabel(table.zone)}
                  </span>
                </div>

                <div class="table-status-indicator ${statusClass}" style="backdrop-filter: blur(6px);">
                  <span class="status-dot-pulse"></span>
                  <span>${statusText}</span>
                </div>
              </div>

              <!-- Markaziy qism: Summa yoki Stol ochish -->
              ${isOccupied ? `
                <div class="table-photo-center-badge">
                  <span style="color: #38bdf8; font-weight: 800; font-size: 0.95rem;">${this.formatCurrency(orderSum)}</span>
                  <span style="color: #cbd5e1; font-size: 0.75rem;">(${itemCount} taom)</span>
                </div>
              ` : (table.status === 'reserved' ? `
                <div class="table-photo-center-badge" style="background: rgba(100, 116, 139, 0.85);">
                  <span style="color: #ffffff; font-weight: 700; font-size: 0.8rem;">${table.reservation.guest} (${table.reservation.time})</span>
                </div>
              ` : `
                <div class="table-photo-center-badge" style="background: rgba(16, 185, 129, 0.85); border-color: rgba(255,255,255,0.3);">
                  <span style="color: #ffffff; font-weight: 700; font-size: 0.82rem;">+ Stolni ochish</span>
                </div>
              `)}

              <!-- Pastki qator: Sig'imi va Vaqt -->
              <div class="table-photo-bottom-row">
                <div class="table-photo-tag-pill">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <span>${table.capacity} kishilik</span>
                </div>

                ${isOccupied ? `
                  <div class="table-photo-tag-pill" style="background: rgba(37, 99, 235, 0.6); border-color: rgba(96, 165, 250, 0.5);">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${timeText}</span>
                  </div>
                ` : `
                  <div class="table-photo-tag-pill" style="background: rgba(16, 185, 129, 0.4);">
                    <span>Bo'sh</span>
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Pastki qism: Ofitsiant va Amallar -->
          <div class="table-card-footer">
            <div class="table-waiter-info">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>
              <span>${order ? order.waiter : (table.reservation ? table.reservation.guest : 'Bo\'sh')}</span>
            </div>

            <button class="quick-cash-btn" style="padding: 4px 10px; font-size: 0.75rem;" onclick="event.stopPropagation(); app.openTableOrder('${table.id}')">
              ${isOccupied ? 'Buyurtma' : 'Ochish'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  generateChairsHtml(shape, capacity) {
    if (shape === 'square' || shape === 'circle') {
      return `
        <div class="chair-pad chair-top" style="left: calc(50% - 12px);"></div>
        <div class="chair-pad chair-bottom" style="left: calc(50% - 12px);"></div>
        <div class="chair-pad chair-left" style="top: calc(50% - 12px); left: calc(50% - 54px);"></div>
        <div class="chair-pad chair-right" style="top: calc(50% - 12px); right: calc(50% - 54px);"></div>
      `;
    }

    if (shape === 'rect' || shape === 'rect-large') {
      return `
        <div class="chair-pad chair-top chair-t1"></div>
        <div class="chair-pad chair-top chair-t2"></div>
        <div class="chair-pad chair-bottom chair-b1"></div>
        <div class="chair-pad chair-bottom chair-b2"></div>
        <div class="chair-pad chair-left" style="top: calc(50% - 12px); left: calc(50% - 74px);"></div>
        <div class="chair-pad chair-right" style="top: calc(50% - 12px); right: calc(50% - 74px);"></div>
      `;
    }

    if (shape === 'booth' || shape === 'vip-round') {
      return `
        <div class="chair-pad chair-top" style="width: 70px; left: calc(50% - 35px);"></div>
        <div class="chair-pad chair-bottom" style="width: 70px; left: calc(50% - 35px);"></div>
        <div class="chair-pad chair-left" style="height: 40px; top: calc(50% - 20px); left: calc(50% - 75px);"></div>
        <div class="chair-pad chair-right" style="height: 40px; top: calc(50% - 20px); right: calc(50% - 75px);"></div>
      `;
    }

    return '';
  }

  getZoneLabel(zoneId) {
    const z = this.data.zones.find(x => x.id === zoneId);
    return z ? z.name.split(' ')[0] : 'Zal';
  }

  /* =========================================================================
     O'NG PANEL: OLIB KETISH VA DASTAVKA
     ========================================================================= */
  switchSidebarTab(tab) {
    this.playSound('click');
    this.sidebarTab = tab;
    document.getElementById('tabTakeawayBtn').classList.toggle('active', tab === 'takeaway');
    document.getElementById('tabDeliveryBtn').classList.toggle('active', tab === 'delivery');
    this.renderSidebarOrders();
  }

  renderSidebarOrders() {
    const container = document.getElementById('sidebarOrdersContent');
    if (!container) return;

    const isTakeaway = this.sidebarTab === 'takeaway';
    
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
        <span style="font-size: 0.82rem; font-weight: 700; color: var(--text-muted);">
          ${isTakeaway ? 'Olib ketish (Takeaway)' : 'Yetkazib berish (Dastavka)'}
        </span>
        <button class="quick-cash-btn" style="padding: 4px 10px;" onclick="app.createNewTakeawayOrder('${this.sidebarTab}')">
          + Yangi
        </button>
      </div>

      <div class="empty-state-box" style="height: 200px;">
        <div class="empty-state-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        </div>
        <h4 style="font-size: 0.95rem;">${isTakeaway ? 'Olib ketish buyurtmalari yo\'q' : 'Dastavka buyurtmalari yo\'q'}</h4>
        <p style="font-size: 0.8rem;">Yangi buyurtma qabul qilish uchun yuqoridagi tugmani bosing</p>
      </div>
    `;
  }

  createNewTakeawayOrder(type = 'takeaway') {
    this.playSound('click');
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const newTakeawayTable = {
      id: `takeaway-${Date.now()}`,
      number: type === 'takeaway' ? `Olib ketish #${orderNumber}` : `Dastavka #${orderNumber}`,
      name: type === 'takeaway' ? `Olib ketish #${orderNumber}` : `Dastavka #${orderNumber}`,
      zone: type,
      capacity: 1,
      shape: 'square',
      status: 'occupied',
      order: {
        orderId: `#${orderNumber}`,
        openedAt: new Date().toISOString(),
        waiter: "Kassa",
        guestCount: 1,
        items: [],
        status: 'new'
      }
    };

    this.data.tables.unshift(newTakeawayTable);
    this.openTableOrder(newTakeawayTable.id);
  }

  /* =========================================================================
     BUYURTMA OCHISH VA TAOMLAR MENYUSI (Order Mode)
     ========================================================================= */
  openTableOrder(tableId) {
    this.playSound('click');
    const table = this.data.tables.find(t => t.id === tableId);
    if (!table) return;

    this.activeTableId = tableId;

    // Agar stol bo'sh bo'lsa yangi buyurtma yaratamiz
    if (!table.order) {
      table.order = {
        orderId: `#${Math.floor(1000 + Math.random() * 9000)}`,
        openedAt: new Date().toISOString(),
        waiter: this.data.restaurant.cashier.split(' ')[0],
        guestCount: table.capacity,
        items: [],
        status: 'new'
      };
      table.status = 'occupied';
      this.persistData();
    }

    this.activeOrder = table.order;

    // Ko'rinishlarni almashtiramiz
    document.getElementById('tablesView').style.display = 'none';
    document.getElementById('tableScreenSidebar').style.display = 'none';
    document.getElementById('menuView').style.display = 'flex';

    // Header info
    document.getElementById('menuActiveTableTitle').textContent = `${table.name} (${this.getZoneLabel(table.zone)})`;
    document.getElementById('menuActiveOrderNumber').textContent = `Buyurtma ${this.activeOrder.orderId}`;

    document.getElementById('cartTableName').textContent = table.name;
    document.getElementById('cartOrderIdBadge').textContent = this.activeOrder.orderId;

    this.renderCart();
    this.renderDishes();
    this.renderHeaderInfo();
  }

  backToTables() {
    this.playSound('click');
    document.getElementById('menuView').style.display = 'none';
    document.getElementById('tablesView').style.display = 'flex';
    document.getElementById('tableScreenSidebar').style.display = 'flex';

    this.activeTableId = null;
    this.activeOrder = null;
    this.renderTables();
    this.renderHeaderInfo();
  }

  /* =========================================================================
     KATEGORIYALAR VA TAOMLAR ("rasmlar bir xil bo'lish" qoidasi)
     ========================================================================= */
  renderCategories() {
    const container = document.getElementById('categoryFiltersBar');
    if (!container) return;

    container.innerHTML = this.data.categories.map(c => `
      <button class="cat-filter-btn ${this.currentCategory === c.id ? 'active' : ''}" onclick="app.setCategory('${c.id}')">
        <span>${c.name}</span>
        <span style="font-size: 0.72rem; opacity: 0.75;">(${c.count})</span>
      </button>
    `).join('');
  }

  setCategory(catId) {
    this.playSound('click');
    this.currentCategory = catId;
    this.renderCategories();
    this.renderDishes();
  }

  renderDishes() {
    const container = document.getElementById('dishesGridContainer');
    if (!container) return;

    let dishes = this.data.dishes;

    if (this.currentCategory !== 'all') {
      dishes = dishes.filter(d => d.category === this.currentCategory);
    }

    if (this.searchQueryDish) {
      const q = this.searchQueryDish.toLowerCase();
      dishes = dishes.filter(d => d.name.toLowerCase().includes(q) || d.price.toString().includes(q));
    }

    container.innerHTML = dishes.map(dish => {
      // Savatda bormi?
      const inCartItem = this.activeOrder ? this.activeOrder.items.find(i => i.id === dish.id) : null;
      const qtyInCart = inCartItem ? inCartItem.quantity : 0;

      return `
        <div class="dish-card" onclick="app.addDishToCart('${dish.id}')">
          <!-- 100% BIR XIL KESILGAN VA O'LCHAMLI RASM -->
          <div class="dish-image-wrapper">
            <img 
              src="${dish.image}" 
              alt="${dish.name}" 
              class="dish-image"
              loading="lazy"
              onerror="this.src='https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80'"
            />
            <span class="dish-station-badge ${dish.station}">
              ${dish.station === 'grill' ? 'Grill' : (dish.station === 'kitchen' ? 'Oshxona' : 'Bar')}
            </span>
          </div>

          <!-- Taom ma'lumotlari -->
          <div class="dish-card-body">
            <h4 class="dish-title" title="${dish.name}">${dish.name}</h4>
            <div class="dish-weight-time">
              <span>${dish.weight || '1 por'}</span>
              <span>•</span>
              <span>⏱ ${dish.prepTime || '10 daq'}</span>
            </div>

            <div class="dish-card-bottom">
              <span class="dish-price-text">${this.formatCurrency(dish.price)}</span>
              
              <button class="dish-add-btn" title="Savatga qo'shish" onclick="event.stopPropagation(); app.addDishToCart('${dish.id}')">
                ${qtyInCart > 0 ? `
                  <strong style="color: var(--blue-700);">${qtyInCart}</strong>
                ` : `
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                `}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* =========================================================================
     SAVAT OPERATSIYALARI (Cart)
     ========================================================================= */
  addDishToCart(dishId) {
    if (!this.activeOrder) return;
    this.playSound('add');

    const dish = this.data.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = this.activeOrder.items.find(i => i.id === dishId);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.activeOrder.items.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        quantity: 1,
        note: ""
      });
    }

    this.persistData();
    this.renderCart();
    this.renderDishes();
  }

  updateItemQuantity(dishId, delta) {
    if (!this.activeOrder) return;
    this.playSound('click');

    const item = this.activeOrder.items.find(i => i.id === dishId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.activeOrder.items = this.activeOrder.items.filter(i => i.id !== dishId);
    }

    this.persistData();
    this.renderCart();
    this.renderDishes();
  }

  removeItemFromCart(dishId) {
    if (!this.activeOrder) return;
    this.playSound('click');

    this.activeOrder.items = this.activeOrder.items.filter(i => i.id !== dishId);
    this.persistData();
    this.renderCart();
    this.renderDishes();
  }

  clearCurrentCart() {
    if (!this.activeOrder) return;
    if (confirm("Buyurtmani butunlay tozalashni xohlaysizmi?")) {
      this.playSound('click');
      this.activeOrder.items = [];
      this.persistData();
      this.renderCart();
      this.renderDishes();
    }
  }

  renderCart() {
    const container = document.getElementById('cartItemsList');
    if (!container || !this.activeOrder) return;

    const items = this.activeOrder.items;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box" style="height: 100%;">
          <div class="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          </div>
          <h4>Savat bo'sh</h4>
          <p style="font-size: 0.8rem;">Menyudan taom yoki ichimlik tanlang</p>
        </div>
      `;

      this.updateCartSummary(0);
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="cart-item-row">
        <div class="cart-item-main">
          <span class="cart-item-name">${item.name}</span>
          <button class="cart-item-remove-btn" onclick="app.removeItemFromCart('${item.id}')" title="O'chirish">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>
        </div>
        <div class="cart-item-price-unit">
          ${this.formatCurrency(item.price)} x ${item.quantity}
        </div>

        <div class="cart-item-controls">
          <div class="stepper-group">
            <button class="step-btn" onclick="app.updateItemQuantity('${item.id}', -1)">-</button>
            <span class="step-qty">${item.quantity}</span>
            <button class="step-btn" onclick="app.updateItemQuantity('${item.id}', 1)">+</button>
          </div>

          <span class="cart-item-total">${this.formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    `).join('');

    const subtotal = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    this.updateCartSummary(subtotal);
  }

  updateCartSummary(subtotal) {
    const servicePercent = this.data.restaurant.serviceFeePercent || 0;
    const serviceFee = Math.round(subtotal * (servicePercent / 100));
    const grandTotal = subtotal + serviceFee;

    document.getElementById('cartSubtotalText').textContent = this.formatCurrency(subtotal);
    document.getElementById('cartServicePercent').textContent = servicePercent;
    document.getElementById('cartServiceFeeText').textContent = this.formatCurrency(serviceFee);
    document.getElementById('cartGrandTotalText').textContent = this.formatCurrency(grandTotal);

    this.currentGrandTotal = grandTotal;
  }

  sendToKitchenKOT() {
    if (!this.activeOrder || this.activeOrder.items.length === 0) {
      this.showToast("Savat bo'sh! Taom tanlang.", "warning");
      return;
    }

    this.playSound('success');
    this.activeOrder.status = 'preparing';
    
    // Stol statusini yangilaymiz
    const table = this.data.tables.find(t => t.id === this.activeTableId);
    if (table) table.status = 'occupied';

    this.persistData();
    this.showToast(`Buyurtma ${this.activeOrder.orderId} oshxonaga (KOT) jo'natildi!`, "success");
    this.backToTables();
  }

  saveCartTemporarily() {
    this.playSound('click');
    this.persistData();
    this.showToast("Buyurtma saqlandi!", "success");
    this.backToTables();
  }

  /* =========================================================================
     TO'LOV MODALI VA RAQAMLAR (Payment Modal)
     ========================================================================= */
  openPaymentModal() {
    if (!this.activeOrder || this.activeOrder.items.length === 0) {
      this.showToast("To'lov qilish uchun savatda taom bo'lishi kerak!", "warning");
      return;
    }

    this.playSound('click');
    const table = this.data.tables.find(t => t.id === this.activeTableId);
    document.getElementById('payModalTableSubtitle').textContent = `Stol: ${table ? table.name : 'Stol'}`;

    this.paymentState = {
      method: 'naqd',
      toPay: this.currentGrandTotal,
      received: this.currentGrandTotal,
      inputBuffer: this.currentGrandTotal.toString()
    };

    this.updatePaymentModalUI();
    document.getElementById('paymentModalBackdrop').style.display = 'flex';
  }

  closePaymentModal() {
    this.playSound('click');
    document.getElementById('paymentModalBackdrop').style.display = 'none';
  }

  setPaymentMethod(method) {
    this.playSound('click');
    this.paymentState.method = method;
    document.querySelectorAll('.pay-method-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.method === method);
    });

    if (method === 'plastik' || method === 'qr') {
      this.paymentState.inputBuffer = this.paymentState.toPay.toString();
      this.paymentState.received = this.paymentState.toPay;
    }
    this.updatePaymentModalUI();
  }

  handleNumpadInput(val) {
    this.playSound('click');
    if (this.paymentState.inputBuffer === '0') {
      this.paymentState.inputBuffer = val === '00' ? '0' : val;
    } else {
      this.paymentState.inputBuffer += val;
    }
    this.paymentState.received = parseInt(this.paymentState.inputBuffer, 10) || 0;
    this.updatePaymentModalUI();
  }

  handleNumpadBackspace() {
    this.playSound('click');
    if (this.paymentState.inputBuffer.length <= 1) {
      this.paymentState.inputBuffer = '0';
    } else {
      this.paymentState.inputBuffer = this.paymentState.inputBuffer.slice(0, -1);
    }
    this.paymentState.received = parseInt(this.paymentState.inputBuffer, 10) || 0;
    this.updatePaymentModalUI();
  }

  addQuickCash(amount) {
    this.playSound('click');
    const current = parseInt(this.paymentState.inputBuffer, 10) || 0;
    const next = current + amount;
    this.paymentState.inputBuffer = next.toString();
    this.paymentState.received = next;
    this.updatePaymentModalUI();
  }

  setExactPaymentAmount() {
    this.playSound('click');
    this.paymentState.inputBuffer = this.paymentState.toPay.toString();
    this.paymentState.received = this.paymentState.toPay;
    this.updatePaymentModalUI();
  }

  updatePaymentModalUI() {
    const toPay = this.paymentState.toPay;
    const received = this.paymentState.received;
    const change = Math.max(0, received - toPay);

    document.getElementById('numpadDisplay').textContent = this.formatCurrency(received);
    document.getElementById('payModalToPayText').textContent = this.formatCurrency(toPay);
    document.getElementById('payModalReceivedText').textContent = this.formatCurrency(received);
    document.getElementById('payModalChangeText').textContent = this.formatCurrency(change);
  }

  finalizePaymentAndPrint() {
    if (this.paymentState.received < this.paymentState.toPay) {
      this.showToast("Qabul qilingan summa yetarli emas!", "warning");
      return;
    }

    this.playSound('success');

    const table = this.data.tables.find(t => t.id === this.activeTableId);
    const subtotal = this.activeOrder.items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const serviceFee = Math.round(subtotal * (this.data.restaurant.serviceFeePercent / 100));
    const grandTotal = subtotal + serviceFee;

    // Yangi chek yozamiz
    const newReceipt = {
      id: `rc-${Date.now()}`,
      receiptNumber: this.activeOrder.orderId.replace('#', ''),
      tableId: table ? table.id : 'unknown',
      tableName: table ? table.name : 'Stol',
      zoneName: table ? this.getZoneLabel(table.zone) : 'Zal',
      type: table ? (table.zone.includes('takeaway') ? 'takeaway' : 'table') : 'table',
      waiter: this.activeOrder.waiter || "Shavkat",
      cashier: this.data.restaurant.cashier,
      paymentMethod: this.paymentState.method,
      subtotal: subtotal,
      serviceFee: serviceFee,
      tax: 0,
      total: grandTotal,
      paidAmount: this.paymentState.received,
      changeAmount: Math.max(0, this.paymentState.received - grandTotal),
      createdAt: new Date().toISOString(),
      items: this.activeOrder.items.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        sum: i.price * i.quantity
      })),
      status: 'paid'
    };

    this.data.receipts.unshift(newReceipt);

    // Smena daromadini yangilaymiz
    this.data.shift.totalOrders += 1;
    this.data.shift.totalRevenue += grandTotal;
    if (this.paymentState.method === 'naqd') {
      this.data.shift.cashRevenue += grandTotal;
    } else if (this.paymentState.method === 'plastik') {
      this.data.shift.cardRevenue += grandTotal;
    } else {
      this.data.shift.qrRevenue += grandTotal;
    }

    // Stolni bo'shatamiz
    if (table) {
      table.status = 'empty';
      table.order = null;
    }

    this.persistData();
    this.closePaymentModal();
    this.backToTables();

    // Chop etish xabarnomasi
    this.showToast(`Chek #${newReceipt.receiptNumber} chop etildi (${this.data.printers.kassa.name})`, "success");

    // Chekni ochib ko'rsatamiz
    this.openReceiptsModal(newReceipt.id);
  }

  /* =========================================================================
     CHEKLAR TARIXI VA CHOP ETISH SLIP
     ========================================================================= */
  openReceiptsModal(selectedId = null) {
    this.playSound('click');
    if (selectedId) this.selectedReceiptId = selectedId;
    document.getElementById('receiptsModalBackdrop').style.display = 'flex';
    this.renderReceiptsList();
    this.renderReceiptPreview();
  }

  closeReceiptsModal() {
    this.playSound('click');
    document.getElementById('receiptsModalBackdrop').style.display = 'none';
  }

  renderReceiptsList() {
    const container = document.getElementById('receiptsItemsContainer');
    if (!container) return;

    let receipts = this.data.receipts;
    document.getElementById('receiptsCountBadge').textContent = `${receipts.length} ta chek`;

    container.innerHTML = receipts.map(r => `
      <div class="receipt-item-card ${r.id === this.selectedReceiptId ? 'active' : ''}" onclick="app.selectReceipt('${r.id}')">
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--blue-900);">#${r.receiptNumber} • ${r.tableName}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            ${new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${r.paymentMethod.toUpperCase()}
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 800; color: var(--blue-700);">${this.formatCurrency(r.total)}</div>
          <span style="font-size: 0.72rem; color: var(--emerald-600); font-weight: 700;">To'langan</span>
        </div>
      </div>
    `).join('');
  }

  selectReceipt(id) {
    this.playSound('click');
    this.selectedReceiptId = id;
    this.renderReceiptsList();
    this.renderReceiptPreview();
  }

  renderReceiptPreview() {
    const container = document.getElementById('receiptPreviewContainer');
    if (!container) return;

    const receipt = this.data.receipts.find(r => r.id === this.selectedReceiptId);
    if (!receipt) {
      container.innerHTML = `<div class="empty-state-box">Chek topilmadi</div>`;
      return;
    }

    const { restaurant } = this.data;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <!-- 80mm Termal Chek -->
        <div class="thermal-receipt-paper" id="printableReceiptPaper">
          <div class="receipt-header">
            <h2>${restaurant.name}</h2>
            <div style="font-size: 0.75rem; margin-top: 4px;">${restaurant.address}</div>
            <div style="font-size: 0.75rem;">Tel: ${restaurant.phone}</div>
            <div style="margin-top: 8px; font-weight: 700; font-size: 0.9rem;">CHEK #${receipt.receiptNumber}</div>
            <div style="font-size: 0.75rem;">Sana: ${new Date(receipt.createdAt).toLocaleString()}</div>
            <div style="font-size: 0.75rem;">Stol: ${receipt.tableName} | Ofitsiant: ${receipt.waiter}</div>
          </div>

          <table class="receipt-items-table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th style="text-align: center;">Soni</th>
                <th style="text-align: right;">Summa</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items.map(i => `
                <tr>
                  <td>${i.name}</td>
                  <td style="text-align: center;">${i.quantity}</td>
                  <td style="text-align: right;">${this.formatCurrency(i.sum)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="receipt-total-section">
            <div style="display: flex; justify-content: space-between;">
              <span>Oraliq summa:</span>
              <strong>${this.formatCurrency(receipt.subtotal)}</strong>
            </div>
            ${receipt.serviceFee > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-top: 2px;">
                <span>Xizmat haqi (${restaurant.serviceFeePercent}%):</span>
                <strong>${this.formatCurrency(receipt.serviceFee)}</strong>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800; margin-top: 6px; border-top: 1px dashed #000; padding-top: 4px;">
              <span>JAMI:</span>
              <span>${this.formatCurrency(receipt.total)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 4px; font-size: 0.78rem;">
              <span>To'lov turi:</span>
              <strong style="text-transform: uppercase;">${receipt.paymentMethod}</strong>
            </div>
            ${receipt.changeAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
                <span>Qaytim:</span>
                <strong>${this.formatCurrency(receipt.changeAmount)}</strong>
              </div>
            ` : ''}
          </div>

          <div class="receipt-footer-text">
            <div>${restaurant.receiptFooter}</div>
            <div style="margin-top: 4px; font-size: 0.7rem;">Tez-Up POS tizimi orqali chop etildi</div>
          </div>
        </div>

        <!-- Chek amallari -->
        <div style="display: flex; gap: 12px;">
          <button class="btn-cart-action btn-kot" style="padding: 10px 20px;" onclick="window.print()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            <span>Qayta chop etish</span>
          </button>
        </div>
      </div>
    `;
  }

  /* =========================================================================
     FAOL BUYURTMALAR MONITORI
     ========================================================================= */
  openActiveOrdersModal() {
    this.playSound('click');
    const container = document.getElementById('activeOrdersListContainer');
    const occupied = this.data.tables.filter(t => t.status !== 'empty');

    if (occupied.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h4>Faol buyurtmalar mavjud emas</h4>
        </div>
      `;
    } else {
      container.innerHTML = occupied.map(t => {
        const order = t.order;
        const total = order ? order.items.reduce((s, i) => s + (i.price * i.quantity), 0) : 0;
        return `
          <div style="background: var(--bg-subtle); border-radius: var(--radius-md); padding: 14px; margin-bottom: 12px; border: 1.5px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 800; font-size: 1rem; color: var(--blue-900);">${t.name} • ${order ? order.orderId : ''}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">
                Ofitsiant: ${order ? order.waiter : ''} • Taomlar soni: ${order ? order.items.length : 0} ta
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="font-weight: 800; color: var(--blue-700); font-size: 1.05rem;">${this.formatCurrency(total)}</span>
              <button class="btn-cart-action btn-kot" style="padding: 8px 14px;" onclick="app.closeActiveOrdersModal(); app.openTableOrder('${t.id}')">
                Ochish
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    document.getElementById('activeOrdersModalBackdrop').style.display = 'flex';
  }

  closeActiveOrdersModal() {
    this.playSound('click');
    document.getElementById('activeOrdersModalBackdrop').style.display = 'none';
  }

  /* =========================================================================
     SMENA BOSHQARUVI
     ========================================================================= */
  openShiftModal() {
    this.playSound('click');
    const { shift } = this.data;
    const container = document.getElementById('shiftModalContent');

    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="background: rgba(16, 185, 129, 0.15); color: var(--emerald-600); padding: 5px 14px; border-radius: 9999px; font-weight: 700; font-size: 0.85rem;">
          ● Smena Ochiq
        </span>
        <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 8px;">
          Ochilgan vaqti: ${new Date(shift.openedAt).toLocaleString()}
        </div>
      </div>

      <div class="pay-calculation-card" style="margin-bottom: 20px;">
        <div class="pay-calc-row">
          <span class="label">Kassir:</span>
          <span class="val">${shift.cashier}</span>
        </div>
        <div class="pay-calc-row">
          <span class="label">Boshlang'ich kassa:</span>
          <span class="val">${this.formatCurrency(shift.startingCash)}</span>
        </div>
        <div class="pay-calc-row">
          <span class="label">Buyurtmalar soni:</span>
          <span class="val">${shift.totalOrders} ta</span>
        </div>
        <div class="pay-calc-row">
          <span class="label">Naqd tushum:</span>
          <span class="val" style="color: var(--emerald-600);">${this.formatCurrency(shift.cashRevenue)}</span>
        </div>
        <div class="pay-calc-row">
          <span class="label">Karta tushum:</span>
          <span class="val" style="color: var(--blue-700);">${this.formatCurrency(shift.cardRevenue)}</span>
        </div>
        <div class="pay-calc-row" style="border-top: 1px dashed var(--border-light); padding-top: 8px; margin-top: 4px;">
          <span class="label" style="font-weight: 700;">Umumiy savdo:</span>
          <span class="val" style="font-size: 1.25rem; color: var(--blue-900);">${this.formatCurrency(shift.totalRevenue)}</span>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <button class="btn-cart-action btn-kot" onclick="app.printXReport()">
          X-Hisobot (Oraliq)
        </button>
        <button class="btn-cart-action btn-pay-order" style="background: var(--rose-600); grid-column: span 1;" onclick="app.closeShiftZReport()">
          Z-Hisobot (Smenani yopish)
        </button>
      </div>
    `;

    document.getElementById('shiftModalBackdrop').style.display = 'flex';
  }

  closeShiftModal() {
    this.playSound('click');
    document.getElementById('shiftModalBackdrop').style.display = 'none';
  }

  printXReport() {
    this.showToast("X-Hisobot printerga jo'natildi!", "success");
    this.closeShiftModal();
  }

  closeShiftZReport() {
    if (confirm("Smenani yopish va Z-Hisobot chiqarishni tasdiqlaysizmi?")) {
      this.showToast("Z-Hisobot muvaffaqiyatli chop etildi va smena yopildi!", "success");
      this.closeShiftModal();
    }
  }

  /* =========================================================================
     SOZLAMALAR MODALI
     ========================================================================= */
  openSettingsModal() {
    this.playSound('click');
    const container = document.getElementById('settingsModalContent');
    const { restaurant, printers } = this.data;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <!-- Restoran rekvizitlari -->
        <div style="background: var(--bg-subtle); border-radius: var(--radius-lg); padding: 18px; border: 1.5px solid var(--border-light);">
          <h4 style="margin-bottom: 14px; color: var(--blue-900); font-size: 1rem;">Restoran Rekvizitlari</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <label style="font-size: 0.8rem; font-weight: 600;">Muassasa / Restoran nomi</label>
            <input type="text" class="search-input" id="settingRestName" value="${restaurant.name}" style="background: #fff; padding-left: 14px;">

            <label style="font-size: 0.8rem; font-weight: 600;">Telefon raqami</label>
            <input type="text" class="search-input" id="settingRestPhone" value="${restaurant.phone}" style="background: #fff; padding-left: 14px;">

            <label style="font-size: 0.8rem; font-weight: 600;">Xizmat haqi foizi (%)</label>
            <input type="number" class="search-input" id="settingServiceFee" value="${restaurant.serviceFeePercent}" style="background: #fff; padding-left: 14px;">

            <label style="font-size: 0.8rem; font-weight: 600;">Chek tag yozuvi</label>
            <input type="text" class="search-input" id="settingReceiptFooter" value="${restaurant.receiptFooter}" style="background: #fff; padding-left: 14px;">
          </div>
        </div>

        <!-- Printerlar -->
        <div style="background: var(--bg-subtle); border-radius: var(--radius-lg); padding: 18px; border: 1.5px solid var(--border-light);">
          <h4 style="margin-bottom: 14px; color: var(--blue-900); font-size: 1rem;">Printer Sozlamalari</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; font-weight: 600;">Kassa printeri (Chek uchun)</label>
              <input type="text" class="search-input" value="${printers.kassa.name}" style="background: #fff; padding-left: 14px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 600;">Oshxona printeri (KOT)</label>
              <input type="text" class="search-input" value="${printers.kitchen.name}" style="background: #fff; padding-left: 14px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 600;">Grill / Shashlik printeri</label>
              <input type="text" class="search-input" value="${printers.grill.name}" style="background: #fff; padding-left: 14px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: 600;">Bar printeri</label>
              <input type="text" class="search-input" value="${printers.bar.name}" style="background: #fff; padding-left: 14px;">
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
        <button class="btn-cart-action btn-save-order" style="padding: 10px 24px;" onclick="app.closeSettingsModal()">Bekor qilish</button>
        <button class="btn-cart-action btn-pay-order" style="padding: 10px 30px; grid-column: span 1;" onclick="app.saveSettings()">Saqlash va Sinxronlash</button>
      </div>
    `;

    document.getElementById('settingsModalBackdrop').style.display = 'flex';
  }

  saveSettings() {
    const restName = document.getElementById('settingRestName').value;
    const phone = document.getElementById('settingRestPhone').value;
    const fee = parseInt(document.getElementById('settingServiceFee').value, 10) || 0;
    const footer = document.getElementById('settingReceiptFooter').value;

    this.data.restaurant.name = restName;
    this.data.restaurant.phone = phone;
    this.data.restaurant.serviceFeePercent = fee;
    this.data.restaurant.receiptFooter = footer;

    this.persistData();
    this.renderHeaderInfo();
    this.showToast("Sozlamalar muvaffaqiyatli saqlandi!", "success");
    this.closeSettingsModal();
  }

  closeSettingsModal() {
    this.playSound('click');
    document.getElementById('settingsModalBackdrop').style.display = 'none';
  }

  /* =========================================================================
     QIDIRUV VA FILTERLAR
     ========================================================================= */
  setupEventListeners() {
    // Stol qidiruv
    const tableSearch = document.getElementById('tableSearchInput');
    if (tableSearch) {
      tableSearch.addEventListener('input', (e) => {
        this.searchQueryTable = e.target.value;
        this.renderTables();
      });
    }

    // Taom qidiruv
    const dishSearch = document.getElementById('dishSearchInput');
    if (dishSearch) {
      dishSearch.addEventListener('input', (e) => {
        this.searchQueryDish = e.target.value;
        this.renderDishes();
      });
    }

    // Header tugmalari
    document.getElementById('btnBackToTables')?.addEventListener('click', () => this.backToTables());
    document.getElementById('btnOpenActiveOrders')?.addEventListener('click', () => this.openActiveOrdersModal());
    document.getElementById('btnOpenTakeaway')?.addEventListener('click', () => this.createNewTakeawayOrder('takeaway'));
    document.getElementById('btnOpenReceiptsHistory')?.addEventListener('click', () => this.openReceiptsModal());
    document.getElementById('btnOpenShiftModal')?.addEventListener('click', () => this.openShiftModal());
    document.getElementById('btnOpenSettings')?.addEventListener('click', () => this.openSettingsModal());
  }

  /* =========================================================================
     UTILITALAR (Valyuta formati va Toast)
     ========================================================================= */
  formatCurrency(amount) {
    if (amount === undefined || amount === null) return "0 UZS";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " UZS";
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `pos-toast ${type === 'success' ? 'success' : ''}`;
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Ilovani yuklash
window.addEventListener('DOMContentLoaded', () => {
  window.app = new PosApp();
  window.app.init();
});
