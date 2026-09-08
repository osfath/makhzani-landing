# مخزني — صفحة الهبوط (Landing)

صفحة هبوط ثابتة (Static) تعرض كتالوج علب وفوارغ التغليف. لا تحتاج خادماً — HTML/CSS/JS
خالص، جاهزة للنشر على **GitHub Pages**.

## المحتوى

```
landing/
├── index.html          ← الصفحة
├── styles.css          ← نظام التصميم (فخامة تحريرية دافئة، RTL)
├── app.js              ← بناء الفئات/الكتالوج + التصفية + الكشف عند التمرير
├── products.js         ← بيانات 34 صنفاً (مولّدة من الكودات المنهجية والصور)
├── assets/products/    ← صور المنتجات (16 صورة)
└── .nojekyll           ← يمنع Jekyll من تجاهل الملفات (مهم على Pages)
```

## معاينة محلية

افتح `index.html` مباشرةً في المتصفّح (يعمل من `file://` لأن البيانات مضمّنة، بلا fetch).
أو شغّل خادماً بسيطاً:

```bash
cd landing
python -m http.server 8000   # ثم افتح http://localhost:8000
```

## النشر على GitHub Pages

### الخيار الموصى به — مستودع مستقل للتسويق
يُبقي سورس التطبيق خاصاً وينشر التسويق وحده:

```bash
cd landing
git init -b main
git add .
git commit -m "Makhzani landing page"
gh repo create makhzani-landing --public --source=. --push
# فعّل الصفحات:
gh api -X POST repos/:owner/makhzani-landing/pages -f build_type=legacy \
  -f 'source[branch]=main' -f 'source[path]=/'
```
أو يدوياً: على GitHub → Settings → Pages → Source: Deploy from a branch →
Branch: `main` / `(root)` → Save. سيصبح الرابط `https://<user>.github.io/makhzani-landing/`.

### خيار بديل — مجلد `/docs` في مستودع قائم
انسخ محتوى `landing/` إلى `docs/` في المستودع، ثم Settings → Pages → Branch:
`main` / `/docs`.

## تحديث الكتالوج

بيانات المنتجات في `products.js` (`window.PRODUCTS`). لإضافة/تعديل صنف: عدّل المصفوفة
مباشرةً (name, sku, cat, catName, type, size, color, cap, img)، وضع الصورة في
`assets/products/`. الفئات المدعومة: `spray` (بخاخات) · `bottle` (بطلات) ·
`cup` (كبّات) · `glass` (زجاجيات).

## ملاحظات
- الخطوط من Google Fonts (Markazi Text · Tajawal · Cormorant Garamond · IBM Plex Mono).
- الهيدر/بيانات التواصل placeholder — تُستبدل بترويسة الشركة الرسمية لاحقاً.
