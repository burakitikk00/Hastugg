import {
    FaShieldAlt,
    FaGem,
    FaAward,
    FaDraftingCompass,
    FaCube,
    FaRulerCombined,
    FaCity,
    FaLeaf,
    FaHandshake,
    FaHardHat,
    FaCogs,
    FaCertificate
} from 'react-icons/fa';

/**
 * Hastugg Construction - Özgün Mimari Vektör İkon Haritası
 * Yapay zeka ve standart emojilerden arındırılmış, mühendislik ve lüks estetiğine uygun vektör ikonlar.
 */
export const ARCHITECTURAL_ICON_MAP = {
    shield: {
        id: 'shield',
        title: 'Statik & Deprem Güvenilirliği',
        shortName: 'Güvenilirlik',
        icon: FaShieldAlt
    },
    gem: {
        id: 'gem',
        title: 'Lüks & Birinci Sınıf Malzeme',
        shortName: 'Kalite',
        icon: FaGem
    },
    award: {
        id: 'award',
        title: '15+ Yıllık Mimari Ustalık',
        shortName: 'Deneyim',
        icon: FaAward
    },
    city: {
        id: 'city',
        title: 'Prestijli Proje Portföyü',
        shortName: '+100 Proje',
        icon: FaCity
    },
    compass: {
        id: 'compass',
        title: 'Özgün Mimari Çizim & Projelendirme',
        shortName: 'Tasarım',
        icon: FaDraftingCompass
    },
    ruler: {
        id: 'ruler',
        title: 'Milimetrik Mühendislik Toleransı',
        shortName: 'Hassasiyet',
        icon: FaRulerCombined
    },
    cube: {
        id: 'cube',
        title: '3D Yapısal Modelleme & Statik',
        shortName: 'Modelleme',
        icon: FaCube
    },
    hardhat: {
        id: 'hardhat',
        title: 'Şantiye Disiplini & İş Güvenliği',
        shortName: 'Disiplin',
        icon: FaHardHat
    },
    handshake: {
        id: 'handshake',
        title: 'Şeffaf Sözleşme & Güven Ortaklığı',
        shortName: 'Şeffaflık',
        icon: FaHandshake
    },
    leaf: {
        id: 'leaf',
        title: 'Sürdürülebilir & Yeşil Yapı Standartları',
        shortName: 'Sürdürülebilirlik',
        icon: FaLeaf
    },
    cogs: {
        id: 'cogs',
        title: 'İleri İnşaat Teknolojileri',
        shortName: 'Teknoloji',
        icon: FaCogs
    },
    certificate: {
        id: 'certificate',
        title: 'TSE & ISO 9001 Kalite Taahhüdü',
        shortName: 'Sertifikasyon',
        icon: FaCertificate
    }
};

export const AVAILABLE_ADMIN_ICONS = Object.values(ARCHITECTURAL_ICON_MAP);

/**
 * Gelen ikon kodu veya özellik başlığına göre en uygun mimari vektör ikonu çözer.
 * Veritabanında eski emoji veya metin kalsa dahi kusursuz vektör ikon döndürür.
 */
export function getArchitecturalIcon(iconIdentifier, featureTitle = '') {
    if (!iconIdentifier && !featureTitle) {
        return FaDraftingCompass;
    }

    const cleanId = String(iconIdentifier || '').trim().toLowerCase();
    const cleanTitle = String(featureTitle || '').trim().toLowerCase();

    // 1. Doğrudan ID eşleşmesi
    if (ARCHITECTURAL_ICON_MAP[cleanId]) {
        return ARCHITECTURAL_ICON_MAP[cleanId].icon;
    }

    // 2. Başlık ve eski emojilere göre akıllı semantik haritalama
    if (cleanTitle.includes('kalite') || cleanId.includes('💎') || cleanId.includes('gem')) {
        return FaGem;
    }
    if (cleanTitle.includes('güven') || cleanTitle.includes('guven') || cleanId.includes('🛡️') || cleanId.includes('shield')) {
        return FaShieldAlt;
    }
    if (cleanTitle.includes('deneyim') || cleanTitle.includes('tecrübe') || cleanId.includes('🏆') || cleanId.includes('award') || cleanId.includes('⭐')) {
        return FaAward;
    }
    if (cleanTitle.includes('proje') || cleanTitle.includes('100') || cleanId.includes('🏗️') || cleanId.includes('city')) {
        return FaCity;
    }
    if (cleanTitle.includes('çizim') || cleanTitle.includes('tasarım') || cleanId.includes('📐')) {
        return FaDraftingCompass;
    }
    if (cleanTitle.includes('ölçü') || cleanTitle.includes('hassasiyet') || cleanId.includes('📏')) {
        return FaRulerCombined;
    }
    if (cleanTitle.includes('çevre') || cleanTitle.includes('yeşil') || cleanId.includes('🌱')) {
        return FaLeaf;
    }

    // Fallback: Mimari pusula
    return FaDraftingCompass;
}
