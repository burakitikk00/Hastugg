import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import { getArchitecturalIcon } from '../../utils/architecturalIcons';
import './About.css';

const About = () => {
    const [data, setData] = useState({
        mainTitle: '',
        mainDescription: '',
        features: []
    });

    useEffect(() => {
        let isMounted = true;

        const fetchAboutData = async () => {
            try {
                const response = await publicService.getAbout();
                if (isMounted && response) {
                    setData({
                        mainTitle: response.mainTitle || response.maintitle || '',
                        mainDescription: response.mainDescription || response.maindescription || '',
                        features: (response.features && Array.isArray(response.features)) 
                            ? response.features 
                            : []
                    });
                }
            } catch (error) {
                logger.warn('About verileri getirilirken hata:', error?.message);
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
        : [];

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

                      
                    </motion.div>

                    {/* Sağ Kolon: Mimari Nitelikler Bento Matrisi */}
                    <div className="about-features-col">
                        <div className="features-matrix-grid">
                            {data.features.map((feature, index) => {
                                const IconComponent = getArchitecturalIcon(feature.icon, feature.feature);

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
                                        className="feature-bento-card"
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
                                                MİMARİ NİTELİK
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
