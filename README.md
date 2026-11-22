# Tez-Up POS - Professional Restaurant Management System

Zamonaviy restoranlar, kafelar va choyxonalar uchun mo'ljallangan professional **Tez-Up POS (v2.5 Pro)** dasturi.

![Tez-Up POS](assets/icon.png)

## 🌟 Asosiy Xususiyatlar

- **🎨 Zamonaviy Moviy Dizayn (Royal Blue Theme):**
  - Chiroyli, ko'zga yoqimli zamonaviy ko'k ranglar palitrasi.
  - Jonli statistika: Jami stollar, Bo'sh, Band, Kunlik tushum.

- **🪑 Real Fotosuratli Me'moriy Stollar:**
  - 1-stoldan 20-stolgacha barcha stollarning sig'imlari (1 kishilikdan 20 kishilikgacha).
  - Har bir zona (Ko'cha, Asosiy Zal, Kabinat, VIP Zallar) uchun haqiqiy real restoran fotosuratlari.
  - Jonli holat indikatori (*Bo'sh*, *Band*, *Tayyor*, *Hisobda*, *Bron*), vaqt taymeri va ofitsiant biriktiruvi.

- **🍱 100% Bir Xil O'lchamli Taom Kartochkalari:**
  - Barcha taom rasmlari qat'iy bir xil proporsiyada.
  - Bo'limlar bo'yicha saralash (*Grill*, *Oshxona*, *Bar*), vazn, tayyorlanish vaqti va tezkor savat boshqaruvi.

- **📡 Offline va Online Ishlash (PWA & Service Worker):**
  - Internet bo'lmagan taqdirda ham ilova 100% mustaqil ishlayveradi.
  - Barcha ma'lumotlar lokal xotirada saqlanadi va internet ulanishi bilan serverga avtomatik sinxronlanadi.

- **🔒 Xavfsizlik va PIN Kod / Parol:**
  - 4 xonali PIN kodli qulflash tizimi.
  - Kassir (1234), Ofitsiant (2222), Admin (7777).
  - 5 daqiqalik harakatsizlikda avtomatik qulflash va tezkor qulflash tugmasi.

- **🧾 80mm Termal Chek va Chop Etish:**
  - Standart kassa chek printerlari (Xprinter, Bixolon, Epson) uchun maxsus `@media print` formati.
  - KOT (Kitchen Order Ticket) oshxonaga jo'natish.

- **💻 Windows Desktop & EXE:**
  - Electron va Inno Setup (`build_installer.iss`) orqali Windows `.exe` o'rnatuvchi yoki portable fayllar yaratish imkoniyati.
  - `run_windows.bat` orqali Windows tizimida 1-bosishda ishga tushirish.

---

## 🚀 Ishga tushirish

### Oddiy brauzerda:
`index.html` faylini brauzerda oching yoki lokal server bilan ishga tushiring:
```bash
python3 -m http.server 8080
```

### Windows Desktop:
`run_windows.bat` faylini ikki marta bosing.

---

## 🛠️ Windows EXE Build
```bash
# Kutubxonalarni o'rnatish
npm install

# Standalone Portable .exe yaratish:
npm run build:portable

# O'rnatuvchi Setup.exe yaratish:
npm run build
```

---

© 2026 Tez-Up POS Systems. All rights reserved.
