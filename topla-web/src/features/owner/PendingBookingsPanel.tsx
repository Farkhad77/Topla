/**
 * SİLİNMİŞ FUNKSİYA — owner tərəfindən booking təsdiqi ləğv edilib.
 * Yeni bookinqlər backend-də dərhal Confirmed yaranır və vaxtı bitəndə
 * background job onları Completed statusuna keçirir; ona görə "gözləyən
 * bronlar" paneli artıq mövcud deyil. Fayl köhnə importlar qırılmasın deyə
 * boş saxlanılıb — istənilən vaxt tam silmək olar.
 */
export {}
