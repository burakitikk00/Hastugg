import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import publicService from '../../services/publicService'
import './About.css'

const About = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Veritabanından about verilerini getir
                const aboutResponse = await publicService.getAbout();
                if (aboutResponse) {
                    setData(aboutResponse);
                }
            } catch (error) {
                logger.error('About verileri getirilemedi:', error);
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <section id="about" className="about">
                <div className="about-container">
                    <div className="about-header">
                        <h2 className="about-title">Hakkımızda</h2>
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>İçerik yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (!data) {
        return (
            <section id="about" className="about">
                <div className="about-container">
                    <div className="about-header">
                        <h2 className="about-title">Hakkımızda</h2>
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>İçerik yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="about" className="about">
            <div className="about-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="about-header"
                >
                    <h2 className="about-title">
                        {data.mainTitle || 'Hakkımızda'}
                    </h2>
                    <p className="about-description">
                        {data.mainDescription || 'İçerik yükleniyor...'}
                    </p>
                </motion.div>

                <div className="features-grid">
                    {data.features && data.features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="feature-card"
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.feature}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default About
