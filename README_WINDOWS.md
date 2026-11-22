# Tez-Up POS v2.5 Pro - Windows & Offline/Online Yo'riqnomasi

Ushbu ilova restoran va kafelar uchun to'liq **Offline va Online** rejimda ishlaydigan professional POS tizimidir.

---

## 1. Windows tizimida darhol ishga tushirish (Hech narsa o'rnatmasdan)
- Papka ichidagi **`run_windows.bat`** faylini 2 marta bosing.
- Ilova avtomatik tarzda to'liq ekranda (Kiosk Desktop rejimida) ochiladi.
- Yoki to'g'ridan-to'g'ri **`index.html`** faylini ixtiyoriy brauzerda (Chrome, Edge) ochishingiz mumkin.

---

## 2. Windows EXE Build (O'rnatuvchi yoki Portable .exe yaratish)

### Variant A: Electron Builder orqali EXE yaratish
Node.js o'rnatilgan Windows kompyuterda terminalni ochib, quyidagi buyruqlarni yozing:

```bash
# 1. Kutubxonalarni o'rnatish
npm install

# 2. Portable (o'rnatmasdan darhol ochiluvchi) .exe yaratish:
npm run build:portable

# 3. Yoki to'liq Setup o'rnatuvchi .exe yaratish:
npm run build
```
Natijada **`dist/`** papkasida **`Tez-Up POS Setup.exe`** yoki **`Tez-Up POS.exe`** fayllari paydo bo'ladi.

### Variant B: Inno Setup orqali Setup.exe yaratish
Loyiha ichida **`build_installer.iss`** fayli tayyorlab qo'yilgan:
1. [Inno Setup](https://jrsoftware.org/isdl.php) dasturini oching.
2. `build_installer.iss` faylini ochib, **Compile (F9)** tugmasini bosing.
3. Natijada `dist/TezUp_POS_Setup.exe` o'rnatuvchi fayli hosil bo'ladi.

---

## 3. Offline va Online ishlash mexanizmi
- **Offline (Internet yo'q):**
  - Ilova Service Worker (`sw.js`) orqali barcha fayllarni kompyuter xotirasiga keshlagan.
  - Internet umuman bo'lmagan taqdirda ham ilova 100% tezlikda ishlaydi.
  - Barcha buyurtmalar, stollar holati, hisob-kitoblar va cheklar `localStorage` va brauzer lokal bazasida saqlanadi.
  - Headerdagi **`Offline` / `Online`** nishonini bosib, tarmoq holatini simulyatsiya qilishingiz va tekshirishingiz mumkin.
- **Online (Internet ulanganda):**
  - Internet ulanganda tizim avtomatik tarzda ma'lumotlarni bulutga sinxronlaydi va xabar beradi.

---

## 4. Xavfsizlik va PIN Kod / Parol Tizimi
Kassa xavfsizligini ta'minlash uchun ilovaga 4 xonali PIN kodli qulflash tizimi qo'shildi:

- **Standart Kassir PIN kodi:** `1234` (Shavkat Aliyev)
- **Ofitsiant PIN kodi:** `2222` (Dilshod)
- **Administrator PIN kodi:** `7777` (Admin)

### Qulflash xususiyatlari:
- **Tezkor qulflash:** Yuqori o'ng burchakdagi **`🔒` (Qulflash)** tugmasini bosing.
- **Avtomatik qulflash:** Agar kassir kompyuterni 5 daqiqa davomida tegmasdan qoldirsa, tizim avtomatik ravishda qulflanadi.
