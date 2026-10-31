// Ekip Rolleri, Hazır Pozisyonlar ve Uzmanlık Eşleşmeleri
// Veritabanı tablosu gerektirmeyen, ön yüz ve admin panelinde tam uyumlu çalışan rol matrisi

export const ROLE_CATEGORIES = [
  {
    id: 'muhendis',
    label: 'Mühendislik & Statik',
    shortLabel: 'Mühendis',
    badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    description: 'Statik hesap, zemin mekaniği ve yapısal modelleme uzmanları',
    defaultTitle: 'İnşaat Mühendisi',
    suggestedTitles: [
      'İnşaat Mühendisi & Statik Proje Uzmanı',
      'Statik Hesap & Deprem Mühendisi',
      'BIM & Yapısal Modelleme Mühendisi',
      'Geoteknik & Zemin Mühendisi',
      'Saha & Uygulama Mühendisi',
      'İnşaat Mühendisi & Kurucu Ortak'
    ],
    skills: [
      'Statik Analiz',
      'Deprem Mühendisliği',
      'BIM Modelleme',
      'Betonarme & Çelik Tasarım'
    ]
  },
  {
    id: 'mimar',
    label: 'Mimarlık & Tasarım',
    shortLabel: 'Mimar',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    description: 'Estetik konsept, 3D görselleştirme ve ruhsat projeleri',
    defaultTitle: 'Baş Mimar',
    suggestedTitles: [
      'Baş Mimar & Tasarım Direktörü',
      'Konsept Mimari & 3D Tasarım Uzmanı',
      'İç Mimar & Mekan Tasarımcısı',
      'Uygulama & Ruhsat Projesi Mimarı',
      'Restorasyon & Koruma Mimarı'
    ],
    skills: [
      'Konsept Tasarım',
      '3D Görselleştirme',
      'İç Mimari & Detay',
      'Ruhsat Projesi & İmar'
    ]
  },
  {
    id: 'usta',
    label: 'Usta & Saha Kadrosu',
    shortLabel: 'Usta / Zanaatkar',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    description: 'Kalıp, demir, kaba yapı, ince sıva ve montaj saha ustaları',
    defaultTitle: 'Kalıp & Donatı Ustabaşısı',
    suggestedTitles: [
      'Kalıp & Donatı Ustabaşısı',
      'Kaba Yapı & Betonarme Ustası',
      'İnce İşçilik & Sıva/Kaplama Ustası',
      'Çelik Konstrüksiyon Montaj Ustası',
      'Mekanik & Tesisat Şefi',
      'Taş & Zemin Kaplama Ustası'
    ],
    skills: [
      'Kaba Yapı & Kalıp',
      'Donatı & Çelik Montajı',
      'İnce İşçilik & Kaplama',
      'Saha Güvenliği & Uygulama'
    ]
  },
  {
    id: 'yonetim',
    label: 'Proje & Şantiye Yönetimi',
    shortLabel: 'Yönetim / Koordinatör',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    description: 'Şantiye sevk, metraj, kalite kontrol ve süreç yöneticileri',
    defaultTitle: 'Proje & Şantiye Koordinatörü',
    suggestedTitles: [
      'Proje & Şantiye Koordinatörü',
      'Şantiye Şefi & Saha Yöneticisi',
      'Maliyet & Hakediş Uzmanı',
      'Kalite Güvence & Denetim Sorumlusu'
    ],
    skills: [
      'Saha Yönetimi',
      'Kalite Güvencesi',
      'Statik Denetim',
      'Metraj & Hakediş'
    ]
  },
  {
    id: 'ozel',
    label: 'Özel / Diğer Unvan',
    shortLabel: 'Özel Unvan',
    badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    description: 'Serbest metinle unvan ve uzmanlık belirleme seçeneği',
    defaultTitle: '',
    suggestedTitles: [],
    skills: [
      'Yapı Teknolojileri',
      'Teknik Danışmanlık',
      'Projelendirme'
    ]
  }
];

// Pozisyon metnine göre ilgili kategori ID'sini tespit eder
export const detectRoleCategory = (position = '') => {
  if (!position) return 'muhendis';
  const pos = position.toLocaleLowerCase('tr-TR');

  if (
    pos.includes('usta') ||
    pos.includes('kalıp') ||
    pos.includes('kalip') ||
    pos.includes('demir') ||
    pos.includes('sıva') ||
    pos.includes('siva') ||
    pos.includes('boya') ||
    pos.includes('montaj') ||
    pos.includes('donatı') ||
    pos.includes('donati') ||
    pos.includes('zanaatkar') ||
    pos.includes('kaplama') ||
    pos.includes('tesisat')
  ) {
    return 'usta';
  }

  if (
    pos.includes('mühendis') ||
    pos.includes('muhendis') ||
    pos.includes('statik') ||
    pos.includes('deprem') ||
    pos.includes('bim') ||
    pos.includes('geoteknik')
  ) {
    return 'muhendis';
  }

  if (
    pos.includes('mimar') ||
    pos.includes('tasarım') ||
    pos.includes('tasarim') ||
    pos.includes('iç mimar') ||
    pos.includes('ic mimar') ||
    pos.includes('konsept') ||
    pos.includes('restorasyon') ||
    pos.includes('rölöve') ||
    pos.includes('rolove')
  ) {
    return 'mimar';
  }

  if (
    pos.includes('şantiye') ||
    pos.includes('santiye') ||
    pos.includes('koordinatör') ||
    pos.includes('koordinator') ||
    pos.includes('proje') ||
    pos.includes('yönetici') ||
    pos.includes('yonetici') ||
    pos.includes('müdür') ||
    pos.includes('mudur') ||
    pos.includes('denetim') ||
    pos.includes('hakediş') ||
    pos.includes('hakedis')
  ) {
    return 'yonetim';
  }

  return 'ozel';
};

// Pozisyon metninden eşleşen beceri / uzmanlık etiketlerini döndürür
export const getTeamDisciplines = (position = '') => {
  const categoryId = detectRoleCategory(position);
  const found = ROLE_CATEGORIES.find((c) => c.id === categoryId);
  if (found && found.skills && found.skills.length > 0) {
    return found.skills;
  }
  return ['Mimari Projelendirme', 'Statik Güvenlik', 'Yapı Teknolojisi'];
};

// Pozisyon için rozet rengi ve kategori bilgisini döndürür
export const getRoleMeta = (position = '') => {
  const categoryId = detectRoleCategory(position);
  return ROLE_CATEGORIES.find((c) => c.id === categoryId) || ROLE_CATEGORIES[0];
};
