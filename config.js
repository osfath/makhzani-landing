// إعدادات موقع مخزني — عدّلها ثم ادفع (push) لتظهر التغييرات.
window.MAKHZANI_CONFIG = {
  // رقم واتساب لاستقبال الطلبات (صيغة دولية بلا + أو 00). 009647771418929 → 9647771418929
  whatsapp: "9647771418929",

  // مصدر «الكمية المتبقية» — Google Sheet منشور على الويب:
  //   الجدول → ملف → مشاركة → النشر على الويب → انشر.
  //   الرابط يكون: https://docs.google.com/spreadsheets/d/e/<PUB_ID>/pubhtml
  //   ضع الـ <PUB_ID> (يبدأ بـ 2PACX-) أدناه.
  //   يجب أن يحوي الجدول عمودين على الأقل: SKU | Quantity (استورد stock-template.csv).
  //   الموقع يقرأ الكميات حيّاً كـ CSV ويحدّثها دورياً — أي تعديل يظهر تلقائياً.
  sheetPubId:
    "2PACX-1vQQYEboIZSz7a24hIV6pKe2-yCpG1S1fvTMkTzOzUwRcaV_vQVOBwWqtNn2ZLjyy9_wAtp4m5npnFpi",
  sheetGid: "", // اختياري: معرّف التبويب (gid) إن لم تكن الورقة الأولى
  stockRefreshMs: 90000, // إعادة الجلب كل 90 ثانية (تحديث تلقائي بلا إعادة تحميل)
};
