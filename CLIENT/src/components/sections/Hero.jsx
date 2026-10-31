import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaArrowRight } from 'react-icons/fa';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import './Hero.css';

// Varsayılan / Anında Yüklenen Mimari İçerikler (Backend gecikse bile sıfır bekleme)
const DEFAULT_HERO = {
    mainTitle: 'Hayalinizdeki Yapıları Kusursuz İşçilikle Gerçeğe Dönüştürüyoruz',
    subheading: 'Modern mimari vizyon, ileri statik mühendislik ve şeffaf süreç yönetimiyle konut ve ticari yaşam alanlarınızı geleceğe taşıyoruz.'
};

const DEFAULT_CONTACT = {
    address: 'Bağdat Caddesi No:142, Kadıköy / İstanbul',
    phone: '+90 (216) 450 80 90',
    email: 'info@hastug.com'
};

// Sabit Mimari Mühendislik Metrikleri (The Blueprint Metrics)
const ARCHITECTURAL_METRICS = [
    { value: '150+', label: 'Tamamlanan Prestij Projesi' },
    { value: '%100', label: 'Statik & Deprem Güvencesi' },
    { value: '15+', label: 'Yıllık Mimari Deneyim' },
    { value: 'A+', label: 'Enerji & Malzeme Kalitesi' }
];

const Hero = () => {
    // İlk render anında doğrudan varsayılan içerikle başlar (kullanıcıya bekleme çarkı göstermez)
    const [heroData, setHeroData] = useState(DEFAULT_HERO);
    const [contactData, setContactData] = useState(DEFAULT_CONTACT);

    useEffect(() => {
        let isMounted = true;

        const fetchDynamicData = async () => {
            try {
                // 1. Değişebilir Hero Verilerini Getir
                const heroResponse = await publicService.getHero();
                if (isMounted && heroResponse) {
                    const fetchedTitle = heroResponse.mainTitle || heroResponse.maintitle;
                    const fetchedSubheading = heroResponse.subheading;

                    if (fetchedTitle || fetchedSubheading) {
                        setHeroData(prev => ({
                            mainTitle: fetchedTitle || prev.mainTitle,
                            subheading: fetchedSubheading || prev.subheading
                        }));
                    }
                }

                // 2. Değişebilir İletişim Verilerini Getir
                const contactResponse = await publicService.getContact();
                if (isMounted && contactResponse && contactResponse.length > 0) {
                    const contact = contactResponse[0];
                    setContactData({
                        address: contact.address || DEFAULT_CONTACT.address,
                        phone: contact.phone || DEFAULT_CONTACT.phone,
                        email: contact.email || DEFAULT_CONTACT.email
                    });
                }
            } catch (error) {
                // Backend gecikse veya hata verse dahi varsayılan kaliteli içerikler kesintisiz görünür
                logger.warn('Backend verisi beklenirken varsayılan mimari içerikler devrede:', error?.message);
            }
        };

        fetchDynamicData();

        return () => {
            isMounted = false;
        };
    }, []);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Dinamik başlıkta vurgulu ayrım yapma (varsa mimarlık/inşaat ayrımı)
    const renderTitle = (rawTitle) => {
        if (!rawTitle) return DEFAULT_HERO.mainTitle;
        return rawTitle;
    };

    return (
        <section id="home" className="hero" aria-label="Ana Karşılama">
            {/* Arka Plan Mimari Kanvas & Blueprint Izgara */}
            <div className="hero-background-canvas" aria-hidden="true">
                <div className="hero-photo-layer" />
                <div className="hero-gradient-overlay" />
                <div className="hero-datum-line" />
            </div>

            {/* Ana İçerik Gövdesi */}
            <div className="hero-main-container">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="hero-content-wrap"
                >
                    {/* Dinamik Başlık (Veritabanından gelir / Fallback hazır) */}
                    <h1 className="hero-title">
                        {renderTitle(heroData.mainTitle)}
                    </h1>

                    {/* Dinamik Alt Açıklama (Veritabanından gelir / Fallback hazır) */}
                    <p className="hero-description">
                        {heroData.subheading}
                    </p>

                    {/* Sabit Eyleme Çağrı Butonları (CTA) */}
                    <div className="hero-cta-group">
                        <button
                            type="button"
                            className="hero-btn-primary"
                            onClick={() => scrollToSection('contact')}
                        >
                            <span>PROJENİZ İÇİN TEKLİF ALIN</span>
                            <FaArrowRight size={14} />
                        </button>
                        
                        <button
                            type="button"
                            className="hero-btn-ghost"
                            onClick={() => scrollToSection('projects')}
                        >
                            <span>PORTFÖYÜ İNCELE</span>
                        </button>
                    </div>

                    {/* Sabit Mimari Güvence Metrikleri (The Blueprint Metrics) */}
                    <div className="hero-metrics-grid">
                        {ARCHITECTURAL_METRICS.map((metric, idx) => (
                            <div key={idx} className="metric-item">
                                <span className="metric-value">
                                    {metric.value}
                                </span>
                                <span className="metric-label">
                                    {metric.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Alt Şerit: Canlı İletişim HUD Paneli (Veritabanından çekilir, dinamiktir) */}
            <footer className="hero-contact-hud">
                <div className="hero-hud-container">
                    <div className="hero-hud-grid">
                        {/* Lokasyon */}
                        <div 
                            className="hud-item clickable"
                            onClick={() => scrollToSection('contact')}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="hud-icon-box" aria-hidden="true">
                                <FaMapMarkerAlt />
                            </div>
                            <div className="hud-text">
                                <span className="hud-label">MERKEZ OFİS</span>
                                <span className="hud-value" title={contactData.address}>
                                    {contactData.address}
                                </span>
                            </div>
                        </div>

                        {/* Telefon */}
                        <a 
                            href={`tel:${contactData.phone?.replace(/[^+\d]/g, '')}`} 
                            className="hud-item clickable"
                        >
                            <div className="hud-icon-box" aria-hidden="true">
                                <FaPhoneAlt />
                            </div>
                            <div className="hud-text">
                                <span className="hud-label">DANIŞMA HATTI</span>
                                <span className="hud-value">{contactData.phone}</span>
                            </div>
                        </a>

                        {/* E-Posta */}
                        <a 
                            href={`mailto:${contactData.email}`} 
                            className="hud-item clickable"
                        >
                            <div className="hud-icon-box" aria-hidden="true">
                                <FaEnvelope />
                            </div>
                            <div className="hud-text">
                                <span className="hud-label">MİMARİ TEKLİF</span>
                                <span className="hud-value">{contactData.email}</span>
                            </div>
                        </a>
                    </div>
                </div>
            </footer>
        </section>
    );
};

export default Hero;
