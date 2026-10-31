import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import './Services.css';

// Varsayılan / Anında Yüklenen Mimari Hizmetler (Backend gecikse bile sıfır bekleme)
const DEFAULT_SERVICES = [
    {
        id: 11,
        service: 'Mimari Tasarım & Projelendirme',
        description: 'Uygulama projeleri, kat planları, kesit ve görünüş çizimleri, 3D modelleme ve render alma hizmetleri ile konseptten ruhsata eksiksiz mimari projelendirme.',
        url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        tags: ['3D BIM MODELLEME', 'RUHSAT PROJESİ', 'STATİK ÇÖZÜMLER', 'MALZEME DETAYI'],
        stamp: 'A+ MİMARİ STANDART'
    },
    {
        id: 12,
        service: 'Lüks Konut & Villa İnşaatı',
        description: 'Depreme tam dayanıklı ileri statik karkas mühendisliği, modern akıllı ev altyapısı ve birinci sınıf malzeme işçiliği ile anahtar teslim lüks yaşam alanları.',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        tags: ['STATİK GÜVENCE', 'AKILLI YAPI SİSTEMİ', 'BİRİNCİ SINIF İŞÇİLİK', 'ANAHTAR TESLİM'],
        stamp: 'DEPREME TAM GÜVENCE'
    },
    {
        id: 13,
        service: 'Kentsel Dönüşüm & Statik Güçlendirme',
        description: 'Mevcut binaların ileri teknolojiyle deprem risk analizi, zemin etüdü doğrulaması, yapısal güçlendirme projeleri ve güvenli kentsel yenileme taahhüdü.',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
        tags: ['DEPREM RİSK ANALİZİ', 'KARBON LİF GÜÇLENDİRME', 'YASAL SÜREÇ YÖNETİMİ'],
        stamp: 'TSE ONAYLI MÜHENDİSLİK'
    },
    {
        id: 14,
        service: 'Saha Uygulama & Şantiye Denetimi',
        description: 'Saha uygulama takibi, keşif-metraj çalışmaları, hakediş düzenleme ve tüm inşaat aşamalarında milimetrik tolerans denetimi ile şantiye disiplini.',
        url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
        tags: ['MİLİMETRİK DENETİM', 'METRAJ & HAKEDİŞ', 'İŞ GÜVENLİĞİ DİSİPLİNİ'],
        stamp: 'ŞANTİYE GÜVENCESİ'
    }
];

const SCOPE_TAGS_MAP = {
    0: ['3D BIM MODELLEME', 'RUHSAT PROJESİ', 'STATİK ÇÖZÜMLER', 'MALZEME DETAYI'],
    1: ['MİLİMETRİK DENETİM', 'METRAJ & HAKEDİŞ', 'İŞ GÜVENLİĞİ DİSİPLİNİ', 'ANAHTAR TESLİM'],
    2: ['STATİK GÜVENCE', 'DEPREM ANALİZİ', 'BİRİNCİ SINIF İŞÇİLİK'],
    3: ['YASAL SÜREÇ YÖNETİMİ', 'PROJE YÖNETİMİ', 'TSE MÜHENDİSLİK']
};

const STAMP_LIST = [
    'A+ MİMARİ STANDART',
    'ŞANTİYE GÜVENCESİ',
    'DEPREME TAM GÜVENCE',
    'TSE ONAYLI MÜHENDİSLİK'
];

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80'
];

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState(DEFAULT_SERVICES);

    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            try {
                const servicesData = await publicService.getServices();
                if (isMounted && Array.isArray(servicesData) && servicesData.length > 0) {
                    // Veritabanından gelen verileri mimari kart yapısıyla zenginleştir
                    const enriched = servicesData.map((item, index) => {
                        const fallbackImg = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                        const resolvedUrl = item.url ? publicService.getImageURL(item.url) : fallbackImg;
                        const validUrl = (resolvedUrl && !resolvedUrl.includes('placeholder')) ? resolvedUrl : fallbackImg;

                        return {
                            id: item.id || (index + 1),
                            service: item.service || `Hizmet ${index + 1}`,
                            description: item.description || 'Detaylı mimari ve mühendislik hizmet kapsamı.',
                            url: validUrl,
                            tags: SCOPE_TAGS_MAP[index % 4],
                            stamp: STAMP_LIST[index % STAMP_LIST.length]
                        };
                    });

                    setServices(enriched);
                }
            } catch (error) {
                logger.warn('Hizmetler yüklenirken varsayılan içerikler devrede:', error?.message);
            }
        };

        fetchServices();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleServiceClick = (serviceId) => {
        if (serviceId) {
            navigate(`/hizmet/${serviceId}`);
        }
    };

    return (
        <section id="services" className="services" aria-label="Hizmetlerimiz">
            {/* Arka Plan Yumuşak Mimari Işıma */}
            <div className="services-ambient-glow" aria-hidden="true" />

            <div className="services-container">
                {/* Bölüm Başlığı */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    viewport={{ once: true, margin: '-50px' }}
                    className="services-header"
                >
                    <h2 className="services-title">
                        Hizmetlerimiz & Mimari Çözümler
                    </h2>
                    <p className="services-description">
                        Konsept çizimden statik mühendisliğe, kentsel dönüşümden anahtar teslim lüks konut inşasına kadar tüm süreçleri yüksek mühendislik disipliniyle tek merkezden yönetiyoruz.
                    </p>
                </motion.div>

                {/* Üst Üste Binen Lüks Kartlar (Sticky Card Deck) */}
                <div className="services-deck">
                    {services.map((item, index) => {
                        // Her kart için dinamik sticky üst mesafe (z-index katmanlanması)
                        const stickyTop = `calc(6.5rem + ${index * 26}px)`;
                        const zIndexValue = index + 10;

                        return (
                            <motion.article
                                key={item.id || index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ 
                                    duration: 0.8, 
                                    delay: index * 0.08, 
                                    ease: [0.16, 1, 0.3, 1] 
                                }}
                                viewport={{ once: true, margin: '-60px' }}
                                style={{
                                    top: stickyTop,
                                    zIndex: zIndexValue
                                }}
                                className="service-stack-card"
                                aria-labelledby={`service-title-${item.id}`}
                            >
                                <div className="service-card-split">
                                    {/* Sol Taraf: Kapsam ve Metin */}
                                    <div className="service-info-pane">
                                        <div>
                                            <h3 id={`service-title-${item.id}`} className="service-heading">
                                                {item.service}
                                            </h3>

                                            <p className="service-text">
                                                {item.description}
                                            </p>

                                            {/* Teknik Teslimat Etiketleri */}
                                            {item.tags && (
                                                <div className="service-tags-wrap" aria-label="Hizmet kapsamı">
                                                    {item.tags.map((tag, tIdx) => (
                                                        <span key={tIdx} className="service-chip">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Eyleme Çağrı Butonu */}
                                        <button
                                            type="button"
                                            onClick={() => handleServiceClick(item.id)}
                                            className="service-action-btn"
                                            aria-label={`${item.service} hizmet detaylarını inceleyin`}
                                        >
                                            <span>HİZMET KAPSAMINI İNCELE</span>
                                            <FaArrowRight size={13} />
                                        </button>
                                    </div>

                                    {/* Sağ Taraf: Yüksek Çözünürlüklü Mimari Görsel */}
                                    <div className="service-visual-pane">
                                        <img
                                            src={item.url}
                                            alt={item.service}
                                            className="service-showcase-img"
                                            loading="lazy"
                                        />
                                        <div className="service-img-vignette" aria-hidden="true" />
                                        
                                        {/* Görsel Üzerindeki Mimari Mühür */}
                                        <div className="service-stamp-badge">
                                            <FaCheckCircle size={11} />
                                            <span>{item.stamp || 'A+ MİMARİ STANDART'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
