# مخزني — صفحة الهبوط (Landing)

صفحة هبوط ثابتة تعرض كتالوج علب وفوارغ التغليف، مع **طلب مباشر عبر واتساب** و**كميات
متوفّرة لحظياً** تُقرأ من Google Sheet. منشورة على GitHub Pages بلا خادم.

## المحتوى

```
landing/
├── index.html          ← الصفحة (هوية اللوجو الرسمية RTL)
├── styles.css          ← نظام التصميم (أحمر #E20000 + فحمي + فاتح)
├── config.js           ← الإعدادات: رقم واتساب + Google Sheet ← عدّلها هنا
├── app.js              ← الكتالوج + السلّة + واتساب + جلب الكميات الحيّة
├── products.js         ← بيانات 34 صنفاً (من الكودات المنهجية والصور)
├── assets/logo.svg         ← اللوجو للخلفيات الفاتحة
├── assets/logo-inverse.svg ← اللوجو للخلفيات الداكنة
├── assets/products/    ← صور المنتجات
├── stock-template.csv  ← قالب تستورده إلى Google Sheet (SKU/Name/Quantity)
└── .nojekyll
```

## 1) رقم واتساب
في `config.js` اضبط `whatsapp` بالصيغة الدولية بلا `+` أو `00`.
الرقم الحالي: `9647771418929` (من 009647771418929). زر «إرسال الطلب عبر واتساب»
يفتح محادثة برسالة تحوي الأصناف والكميات واسم/هاتف العميل.

## 2) الكميات المتوفّرة لحظياً (Google Sheet)
1. أنشئ Google Sheet جديداً، واستورد `stock-template.csv` (File → Import) — يعطيك
   الأعمدة `SKU | Name | Quantity` لكل الأصناف.
2. حدّث عمود `Quantity` بالكميات الحقيقية (سيتحدّث الموقع تلقائياً بعد أي تعديل).
3. Share → «أي شخص لديه الرابط: مُشاهِد».
4. من رابط الجدول انسخ المعرّف: `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`.
5. في `config.js` ضع `sheetId` و`sheetName` (اسم التبويب، افتراضياً `Stock`).

الموقع يقرأ الكميات عبر واجهة gviz (JSON) ويعيد الجلب كل 90 ثانية — أي تعديل في
الجدول يظهر خلال دقيقة بلا إعادة نشر. قبل ضبط `sheetId` تُخفى شارات الكميات تلقائياً.

## 3) النشر / التحديث
المستودع منشور على GitHub Pages. أي تعديل:
```bash
git add . && git commit -m "update" && git push
```
يعيد النشر تلقائياً خلال دقيقة. (ملاحظة: تعديل الكميات في Google Sheet لا يحتاج push
— يتحدّث حيّاً؛ الـ push فقط لتغييرات الكود/المنتجات.)

## معاينة محلية
افتح `index.html` مباشرةً، أو:
```bash
python -m http.server 8000
```

## تحديث الكتالوج
عدّل `products.js` (`window.PRODUCTS`) وأضف الصور في `assets/products/`. الفئات:
`spray` · `bottle` · `cup` · `glass`.

## ملاحظات
- اللوجو والهوية من `VISIDAFAQ.svg` (أحمر #E20000، فحمي #171717/#404040، فاتح #F2F2F2).
- الخطوط: Reem Kufi · Tajawal · IBM Plex Mono (Google Fonts).
