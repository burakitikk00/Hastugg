import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import { getArchitecturalIcon } from '../../utils/architecturalIcons';
import './About.css';

// Varsayılan / Anında Yüklenen Mimari Hakkımızda İçeriği (Sunucu gecikse dahi sıfır bekleme)
const DEFAULT_ABOUT = {
    mainTitle: 'Mühendislik Bilimini Mimari Sanatla Buluşturuyoruz',
    mainDescription: `Hastuğ İnşaat olarak; adımızdan aldığımız güç ve sektördeki tecrübemizle, sadece binalar değil, güvenli ve huzurlu gelecekler inşa etmek üzere yola çıktık.

İsmimizdeki "Has" kelimesinden gelen özgünlüğü ve "Tuğ" kelimesinin temsil ettiği liderlik vizyonunu, imza attığımız her projeye yansıtıyoruz. İnşaat sektöründe sağlamlık, estetik ve fonksiyonelliği bir araya getirerek, şehrin silüetine değer katan yapılar üretiyoruz.

Temel ilkemiz; mühendislik bilimini sanatla buluşturmak ve müşterilerimize standartların ötesinde bir yaşam kalitesi sunmaktır. Çevreye duyarlı, modern teknolojilerle donatılmış ve yatırım değeri yüksek projelerimizle geleceğin temelini atıyoruz.`,
    features: [
        {
            id: 1,
            feature: 'Kalite Standartları',
            description: 'Avrupa normlarına uygun birinci sınıf yapı malzemeleri ve kusursuz işçilik detayları.',
            icon: 'gem'
        },
        {
            id: 2,
            feature: 'Statik Güvenilirlik',
            description: 'İleri zemin etüdü ve deprem mühendisliği simülasyonlarıyla tavizsiz statik güvenlik.',
            icon: 'shield'
        },
        {
            id: 3,
            feature: '15+ Yıllık Tecrübe',
            description: 'Konut, villa ve restorasyon projelerinde saha tecrübesine dayalı uzman mimari kadro.',
            icon: 'award'
        },
        {
            id: 4,
            feature: '+100 Tamamlanan Proje',
            description: 'Zamanında anahtar teslim garantisi ve şeffaf sözleşme yönetimiyle kanıtlanmış referanslar.',
            icon: 'city'
        }
    ]
};

const About = () => {
    const [data, setData] = useState(DEFAULT_ABOUT);
    const [activeCardIndex, setActiveCardIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchAboutData = async () => {
            try {
                const response = await publicService.getAbout();
                if (isMounted && response) {
                    setData({
                        mainTitle: response.mainTitle || response.maintitle || DEFAULT_ABOUT.mainTitle,
                        mainDescription: response.mainDescription || response.maindescription || DEFAULT_ABOUT.mainDescription,
                        features: (response.features && response.features.length > 0) 
                            ? response.features 
                            : DEFAULT_ABOUT.features
                    });
                }
            } catch (error) {
                logger.warn('About verileri getirilirken varsayılan mimari içerikler devrede:', error?.message);
            }
        };

        fetchAboutData();

        return () => {
            isMounted = false;
        };
    }, []);

    // Metin paragraflarını temiz ve ritmik bölümlere ayırma
    const paragraphs = data.mainDescription
        ? data.mainDescription.split('\n\n').filter(p => p.trim().length > 0)
        : [DEFAULT_ABOUT.mainDescription];

    return (
        <section id="about" className="about" aria-label="Hakkımızda">
            {/* Arka Plan Yumuşak Mimari Işıma */}
            <div className="about-ambient-glow" aria-hidden="true" />

            <div className="about-container">
                <div className="about-layout-grid">
                    {/* Sol Kolon: Mimari Hikaye ve Vizyon */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                        viewport={{ once: true, margin: '-50px' }}
                        className="about-story-col"
                    >
                        <h2 className="about-main-title">
                            {data.mainTitle}
                        </h2>

                        <div className="about-paragraphs">
                            {paragraphs.map((paragraph, idx) => (
                                <p key={idx} className="about-p">
                                    {paragraph.trim()}
                                </p>
                            ))}
                        </div>

                        {/* Kurumsal Felsefe Vurgu Kartı */}
                        <div className="about-quote-box">
                            <p className="about-quote-text">
                                &ldquo;İsmimizdeki &lsquo;Has&rsquo; kelimesinden gelen özgünlüğü ve &lsquo;Tuğ&rsquo; kelimesinin temsil ettiği liderlik vizyonunu, imza attığımız her projeye yansıtıyoruz.&rdquo;
                            </p>
                            <span className="about-quote-author">
                                Hastuğ İnşaat &bull; Kurumsal İlke
                            </span>
                        </div>

                        {/* Mühendislik Taahhüt Etiketleri */}
                        <div className="about-trust-badges">
                            <div className="trust-badge-item">
                                <span className="trust-badge-dot" />
                                <span>ISO 9001:2015 STATİK STANDARDI</span>
                            </div>
                            <div className="trust-badge-item">
                                <span className="trust-badge-dot" />
                                <span>MİMARİ DANIŞMANLIK & ANAHTAR TESLİM</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sağ Kolon: Etkileşimli Mimari Nitelikler Bento Matrisi */}
                    <div className="about-features-col">
                        <div className="features-matrix-grid">
                            {data.features.map((feature, index) => {
                                const IconComponent = getArchitecturalIcon(feature.icon, feature.feature);
                                const isActive = activeCardIndex === index;

                                return (
                                    <motion.div
                                        key={feature.id || index}
                                        initial={{ opacity: 0, y: 25 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.6, 
                                            delay: index * 0.1, 
                                            ease: [0.16, 1, 0.3, 1] 
                                        }}
                                        viewport={{ once: true, margin: '-30px' }}
                                        whileHover={{ y: -6, scale: 1.015 }}
                                        onClick={() => setActiveCardIndex(index)}
                                        className={`feature-bento-card ${isActive ? 'active' : ''}`}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={feature.feature}
                                    >
                                        <div>
                                            <div className="feature-card-header">
                                                <div className="feature-icon-wrapper" aria-hidden="true">
                                                    <IconComponent />
                                                </div>
                                            </div>

                                            <h3 className="feature-title">
                                                {feature.feature}
                                            </h3>

                                            <p className="feature-description">
                                                {feature.description}
                                            </p>
                                        </div>

                                        <div className="feature-card-footer">
                                            <span className="feature-status-label">
                                                {isActive ? 'MİMARİ ODAK' : 'İNCELE'}
                                            </span>
                                            <div className="feature-corner-indicator" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
