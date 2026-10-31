import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import './Services.css';

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

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchServices = async () => {
            try {
                const servicesData = await publicService.getServices();
                if (isMounted && Array.isArray(servicesData) && servicesData.length > 0) {
                    // Veritabanından gelen verileri mimari kart yapısıyla zenginleştir
                    const enriched = servicesData.map((item, index) => {
                        const resolvedUrl = item.url ? publicService.getImageURL(item.url) : '';
                        const dbTags = Array.isArray(item.scope_tags) && item.scope_tags.length > 0 
                            ? item.scope_tags 
                            : (SCOPE_TAGS_MAP[index % 4] || []);

                        return {
                            id: item.id || (index + 1),
                            service: item.service || `Hizmet ${index + 1}`,
                            description: item.short_description || item.description || '',
                            url: resolvedUrl,
                            tags: dbTags,
                            stamp: item.stamp || STAMP_LIST[index % STAMP_LIST.length] || 'A+ MİMARİ STANDART',
                            category: item.category || 'Mimarlık & Mühendislik'
                        };
                    });

                    setServices(enriched);
                }
            } catch (error) {
                logger.warn('Hizmetler yüklenirken hata:', error?.message);
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

                <div className="services-deck">
                    {services.length === 0 ? (
                        <div
                            className="service-stack-card animate-pulse"
                            style={{
                                minHeight: '260px',
                                background: '#0a0f1d',
                                border: '1px dashed rgba(197, 168, 128, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <span style={{ color: 'rgba(197, 168, 128, 0.5)', fontSize: '0.72rem', letterSpacing: '0.22em', fontFamily: 'monospace' }}>
                                HİZMETLER & MİMARİ ÇÖZÜMLER SENKRONİZE EDİLİYOR...
                            </span>
                        </div>
                    ) : (
                        services.map((item, index) => {
                        // Her kart için dinamik sticky üst mesafe (z-index katmanlanması)
                        const stickyTop = `calc(5.75rem + ${index * 20}px)`;
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
                                            src={item.url || undefined}
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
                    }))}
                </div>
            </div>
        </section>
    );
};

export default Services;
