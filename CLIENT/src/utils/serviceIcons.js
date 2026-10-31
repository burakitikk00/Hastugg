import {
  FiCompass,
  FiTool,
  FiHome,
  FiShield,
  FiLayers,
  FiCpu,
  FiFileText,
  FiClipboard,
  FiActivity,
  FiCheckCircle,
  FiImage,
  FiSun,
  FiTrendingUp,
  FiAward,
  FiMapPin,
  FiBox
} from 'react-icons/fi';

export const SERVICE_ICONS = {
  compass: {
    key: 'compass',
    label: 'Mimari Tasarım & Projelendirme',
    icon: FiCompass
  },
  tool: {
    key: 'tool',
    label: 'Şantiye & Saha Uygulaması',
    icon: FiTool
  },
  home: {
    key: 'home',
    label: 'Konut & Villa İnşaatı',
    icon: FiHome
  },
  shield: {
    key: 'shield',
    label: 'Statik Güvenlik & Deprem Dayanımı',
    icon: FiShield
  },
  layers: {
    key: 'layers',
    label: 'BIM & Çizim Paftaları',
    icon: FiLayers
  },
  cpu: {
    key: 'cpu',
    label: 'Akıllı Yapı & Mühendislik Teknolojisi',
    icon: FiCpu
  },
  'file-text': {
    key: 'file-text',
    label: 'Raporlama & Ruhsat Dosyası',
    icon: FiFileText
  },
  clipboard: {
    key: 'clipboard',
    label: 'Metraj, Keşif & Hakediş',
    icon: FiClipboard
  },
  activity: {
    key: 'activity',
    label: 'Dinamik Analiz & Risk Tespiti',
    icon: FiActivity
  },
  'check-circle': {
    key: 'check-circle',
    label: 'TSE & Kalite Onayı',
    icon: FiCheckCircle
  },
  image: {
    key: 'image',
    label: '3D Render & Görselleştirme',
    icon: FiImage
  },
  sun: {
    key: 'sun',
    label: 'Sürdürülebilirlik & Enerji Verimliliği',
    icon: FiSun
  },
  'trending-up': {
    key: 'trending-up',
    label: 'Kentsel Dönüşüm & Değer Artışı',
    icon: FiTrendingUp
  },
  award: {
    key: 'award',
    label: 'Mimari Standart & Ödül',
    icon: FiAward
  },
  'map-pin': {
    key: 'map-pin',
    label: 'Konum & Saha Keşfi',
    icon: FiMapPin
  },
  box: {
    key: 'box',
    label: 'Malzeme & Modüler Sistemler',
    icon: FiBox
  }
};

export const SERVICE_ICON_OPTIONS = Object.values(SERVICE_ICONS);

export const getServiceIcon = (key) => {
  if (!key) return FiCompass;
  const normalized = String(key).toLowerCase().trim();
  return SERVICE_ICONS[normalized]?.icon || FiCompass;
};
