import {
    FaSun,
    FaTree,
    FaCar,
    FaParking,
    FaDumbbell,
    FaShieldAlt,
    FaSwimmingPool,
    FaLeaf,
    FaHome,
    FaBuilding,
    FaAward,
    FaExpand,
    FaSubway,
    FaPlane,
    FaShoppingBag,
    FaBus,
    FaGraduationCap,
    FaHospital,
    FaWalking,
    FaMapMarkerAlt,
    FaCompass
} from 'react-icons/fa';

/**
 * Proje Öne Çıkan Özellikleri için Küratörlü Vektör İkon Haritası
 */
export const HIGHLIGHT_ICONS = {
    sun: {
        key: 'sun',
        label: 'Doğal Aydınlatma & Güneş Kontrolü',
        shortName: 'Doğal Işık',
        icon: FaSun,
        defaultTitle: 'Doğal Aydınlatma & Cephe Tasarımı',
        defaultDescription: 'Tüm yaşam alanlarında gün ışığını maksimum düzeyde içeri alan akılcı cephe ve pencere optimizasyonu.'
    },
    park: {
        key: 'park',
        label: 'Peyzaj, Bahçe & Yeşil Alanlar',
        shortName: 'Peyzaj & Doğa',
        icon: FaTree,
        defaultTitle: 'Geniş Peyzaj & Botanik Bahçeler',
        defaultDescription: 'Özenle projelendirilmiş yürüyüş yolları, zengin bitki örtüsü ve dinlendirici yeşil sosyal alanlar.'
    },
    car: {
        key: 'car',
        label: 'Kapalı Otopark & Vale Hizmeti',
        shortName: 'Kapalı Otopark',
        icon: FaParking,
        defaultTitle: 'Kapalı Otopark & Şarj İstasyonu',
        defaultDescription: 'Her daireye özel numaralı kapalı araç park alanı ve elektrikli araç şarj istasyonu altyapısı.'
    },
    gym: {
        key: 'gym',
        label: 'Fitness, Spor & Sosyal Tesisler',
        shortName: 'Fitness & Tesis',
        icon: FaDumbbell,
        defaultTitle: 'Fitness & Sağlıklı Yaşam Merkezi',
        defaultDescription: 'En modern ekipmanlarla donatılmış fitness salonu, pilates stüdyosu ve profesyonel spor alanları.'
    },
    shield: {
        key: 'shield',
        label: '7/24 Güvenlik & Akıllı Giriş Sistemi',
        shortName: '7/24 Güvenlik',
        icon: FaShieldAlt,
        defaultTitle: '7/24 Özel Güvenlik & Akıllı Erişim',
        defaultDescription: 'Giriş-çıkış kontrolü, çevre güvenlik kameraları ve daire içi acil durum entegrasyonu.'
    },
    pool: {
        key: 'pool',
        label: 'Yüzme Havuzu, Spa & Dinlenme Alanı',
        shortName: 'Havuz & Spa',
        icon: FaSwimmingPool,
        defaultTitle: 'Açık / Kapalı Yüzme Havuzu & Spa',
        defaultDescription: 'Dört mevsim kullanıma uygun ısıtmalı havuz, jakuzi, sauna ve dinlenme terası olanakları.'
    },
    leaf: {
        key: 'leaf',
        label: 'Sürdürülebilirlik & Enerji Verimliliği',
        shortName: 'Yeşil Enerji',
        icon: FaLeaf,
        defaultTitle: 'Ekolojik Sürdürülebilirlik & Yeşil Enerji',
        defaultDescription: 'Yağmur suyu geri kazanımı, güneş paneli destekli aydınlatma ve yüksek ısı yalıtımı.'
    },
    home: {
        key: 'home',
        label: 'Akıllı Ev Otomasyonu & Altyapı',
        shortName: 'Akıllı Ev',
        icon: FaHome,
        defaultTitle: 'Entegre Akıllı Ev Otomasyonu',
        defaultDescription: 'Mobil cihazlardan aydınlatma, iklimlendirme ve güvenlik sistemlerini yöneten akıllı altyapı.'
    },
    maximize: {
        key: 'maximize',
        label: 'Yüksek Tavan & Ferah İç Mekanlar',
        shortName: 'Ferah Mekan',
        icon: FaExpand,
        defaultTitle: 'Yüksek Tavan & Panoramik Mekanlar',
        defaultDescription: '3.20 metrelik ferah net tavan yüksekliği, geniş cam yüzeyler ve kesintisiz manzara.'
    },
    building: {
        key: 'building',
        label: 'Depreme Dayanıklı Statik Çözüm',
        shortName: 'Güçlü Statik',
        icon: FaBuilding,
        defaultTitle: 'Depreme Dayanıklı Statik & Radye Temel',
        defaultDescription: 'C40/50 sınıfı yüksek dayanımlı beton, derin fore kazık ve son afet yönetmeliğine tam uyum.'
    },
    award: {
        key: 'award',
        label: 'A+ Sınıfı Lüks Malzeme & İşçilik',
        shortName: 'A+ Malzeme',
        icon: FaAward,
        defaultTitle: 'A+ Kalite Mimari Malzeme ve Detaylar',
        defaultDescription: 'İthal seramikler, doğal masif kaplamalar, birinci sınıf armatürler ve kusursuz işçilik.'
    },
    compass: {
        key: 'compass',
        label: 'Özgün ve Zamansız Mimari Çizim',
        shortName: 'Özgün Mimari',
        icon: FaCompass,
        defaultTitle: 'Özgün & Zamansız Mimari Konsept',
        defaultDescription: 'Fonksiyonellik ve estetiğin mükemmel dengesini sunan ödüllü çağdaş mimari konsept.'
    }
};

export const HIGHLIGHT_ICON_OPTIONS = Object.values(HIGHLIGHT_ICONS);

export const getHighlightIcon = (key) => {
    if (!key) return HIGHLIGHT_ICONS.sun.icon;
    const lowerKey = String(key).toLowerCase().trim();
    if (HIGHLIGHT_ICONS[lowerKey]) return HIGHLIGHT_ICONS[lowerKey].icon;

    // Fuzzy matching
    if (lowerKey.includes('ışık') || lowerKey.includes('aydın') || lowerKey.includes('sun')) return FaSun;
    if (lowerKey.includes('yeşil') || lowerKey.includes('park') || lowerKey.includes('bahçe') || lowerKey.includes('ağaç')) return FaTree;
    if (lowerKey.includes('otopark') || lowerKey.includes('araç') || lowerKey.includes('car')) return FaParking;
    if (lowerKey.includes('spor') || lowerKey.includes('fit') || lowerKey.includes('gym')) return FaDumbbell;
    if (lowerKey.includes('güven') || lowerKey.includes('kamera') || lowerKey.includes('shield')) return FaShieldAlt;
    if (lowerKey.includes('havuz') || lowerKey.includes('spa') || lowerKey.includes('pool')) return FaSwimmingPool;
    if (lowerKey.includes('enerji') || lowerKey.includes('leaf') || lowerKey.includes('eko')) return FaLeaf;
    if (lowerKey.includes('ev') || lowerKey.includes('akıllı') || lowerKey.includes('home')) return FaHome;
    if (lowerKey.includes('tavan') || lowerKey.includes('ferah') || lowerKey.includes('alan')) return FaExpand;

    return HIGHLIGHT_ICONS.sun.icon;
};

/**
 * Ulaşım Noktaları için Küratörlü Vektör İkon Haritası
 */
export const TRANSPORTATION_ICONS = {
    subway: {
        key: 'subway',
        label: 'Metro, Tramvay & Raylı Sistem',
        shortName: 'Metro',
        icon: FaSubway,
        defaultTitle: 'Metro & Raylı Sistem İstasyonu',
        defaultDescription: 'Yürüme mesafesinde 3 dakika (250m)'
    },
    car: {
        key: 'car',
        label: 'TEM, E-5 & Ana Arter Bağlantıları',
        shortName: 'Ana Arterler',
        icon: FaCar,
        defaultTitle: 'TEM & E-5 Otoyolu Bağlantısı',
        defaultDescription: 'Ana arterlere ve kavşak noktalarına 3 dakika sürüş mesafesi'
    },
    flight: {
        key: 'flight',
        label: 'Havalimanı Bağlantısı & Ulaşımı',
        shortName: 'Havalimanı',
        icon: FaPlane,
        defaultTitle: 'Uluslararası Havalimanı',
        defaultDescription: 'Kuzey Marmara Otoyolu ile 25 dakika kesintisiz ulaşım'
    },
    mall: {
        key: 'mall',
        label: 'AVM, Çarşı & Sosyal Yaşam Merkezi',
        shortName: 'Sosyal Yaşam',
        icon: FaShoppingBag,
        defaultTitle: 'Alışveriş & Kültür Merkezi',
        defaultDescription: 'Seçkin mağazaların bulunduğu AVM ve yaşam merkezine 5 dakika'
    },
    bus: {
        key: 'bus',
        label: 'Toplu Taşıma & Otobüs Durakları',
        shortName: 'Otobüs / İETT',
        icon: FaBus,
        defaultTitle: 'Toplu Taşıma / Otobüs Durağı',
        defaultDescription: 'Site ana giriş kapısına 50 metre mesafede çok hatlı durak'
    },
    school: {
        key: 'school',
        label: 'Üniversite & Prestijli Okullar',
        shortName: 'Eğitim',
        icon: FaGraduationCap,
        defaultTitle: 'Üniversite & Prestijli Okullar',
        defaultDescription: 'Bölgedeki köklü eğitim kurumlarına ve kampüslere 5-10 dakika'
    },
    hospital: {
        key: 'hospital',
        label: 'Tam Teşekküllü Sağlık Merkezleri',
        shortName: 'Sağlık',
        icon: FaHospital,
        defaultTitle: 'Şehir Hastanesi & Tıp Merkezi',
        defaultDescription: 'Tam teşekküllü devlet ve özel sağlık komplekslerine 7 dakika'
    },
    walk: {
        key: 'walk',
        label: 'Yürüyüş Mesafesi / Sahil Yolu',
        shortName: 'Yürüme Mesafesi',
        icon: FaWalking,
        defaultTitle: 'Sahil Kordonu & Yürüyüş Parkuru',
        defaultDescription: 'Yürüyüş ve bisiklet parkurlarına doğrudan yaya erişimi (4 dk)'
    },
    pin: {
        key: 'pin',
        label: 'Merkezi Şehir Lokasyonu',
        shortName: 'Merkezi Konum',
        icon: FaMapMarkerAlt,
        defaultTitle: 'Merkezi Şehir Lokasyonu',
        defaultDescription: 'Şehrin en değerli iş, finans ve ticaret aksının kalbinde'
    }
};

export const TRANSPORTATION_ICON_OPTIONS = Object.values(TRANSPORTATION_ICONS);

export const getTransportationIcon = (key) => {
    if (!key) return TRANSPORTATION_ICONS.subway.icon;
    const lowerKey = String(key).toLowerCase().trim();
    if (TRANSPORTATION_ICONS[lowerKey]) return TRANSPORTATION_ICONS[lowerKey].icon;

    // Fuzzy matching
    if (lowerKey.includes('metro') || lowerKey.includes('marmaray') || lowerKey.includes('tram')) return FaSubway;
    if (lowerKey.includes('tem') || lowerKey.includes('otoyol') || lowerKey.includes('arter') || lowerKey.includes('araba')) return FaCar;
    if (lowerKey.includes('uçak') || lowerKey.includes('hava') || lowerKey.includes('airport') || lowerKey.includes('flight')) return FaPlane;
    if (lowerKey.includes('avm') || lowerKey.includes('alışveriş') || lowerKey.includes('mall') || lowerKey.includes('market')) return FaShoppingBag;
    if (lowerKey.includes('otobüs') || lowerKey.includes('durak') || lowerKey.includes('bus')) return FaBus;
    if (lowerKey.includes('okul') || lowerKey.includes('kolej') || lowerKey.includes('üniversite')) return FaGraduationCap;
    if (lowerKey.includes('hastane') || lowerKey.includes('sağlık') || lowerKey.includes('klinik')) return FaHospital;
    if (lowerKey.includes('yürü') || lowerKey.includes('sahil') || lowerKey.includes('walk')) return FaWalking;

    return TRANSPORTATION_ICONS.pin.icon;
};
