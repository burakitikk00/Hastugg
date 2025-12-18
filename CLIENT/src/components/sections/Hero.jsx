import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import publicService from '../../services/publicService'
import './Hero.css'

const Hero = () => {
    const [heroData, setHeroData] = useState(null);
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Veritabanından hero verilerini getir
                const heroResponse = await publicService.getHero();
                if (heroResponse) {
                    setHeroData(heroResponse);
                }

                // Contact bilgilerini getir
                const contactResponse = await publicService.getContact();
                if (contactResponse && contactResponse.length > 0) {
                    const contact = contactResponse[0];
                    setContactInfo([
                        {
                            icon: FaMapMarkerAlt,
                            title: 'Lokasyon',
                            info: contact.address || 'Adres bilgisi bulunamadı',
                            subInfo: ''
                        },
                        {
                            icon: FaPhone,
                            title: 'Telefon',
                            info: contact.phone || 'Telefon bilgisi bulunamadı'
                        },
                        {
                            icon: FaEnvelope,
                            title: 'E-Posta',
                            info: contact.email || 'E-posta bilgisi bulunamadı'
                        }
                    ])
                }
            } catch (error) {
                logger.error('Veriler getirilemedi:', error)
                setHeroData(null);
                setContactInfo(null);
            } finally {
                setLoading(false);
            }
        }

        fetchData()
    }, [])

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    if (loading || !heroData) {
        return (
            <section id="home" className="hero">
                <div className="hero-background">
                    <div className="hero-overlay"></div>
                </div>

                <div className="hero-content">
                    <div className="hero-text">
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>İçerik yükleniyor...</p>
                        </div>
                    </div>
                </div>

                {/* Contact Info Overlay */}
                <div className="contact-overlay">
                    <div className="contact-container">
                        <div className="contact-grid">
                            <div className="loading-message">
                                <div className="loading-spinner"></div>
                                <p>İletişim bilgileri yükleniyor...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="home" className="hero">
            <div className="hero-background">
                <div className="hero-overlay"></div>
            </div>

            <div className="hero-content">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="hero-text"
                >
                    <h3 className="hero-title">
                        {heroData.mainTitle || 'Siz İsteyin, Biz İnşa Edelim'}
                    </h3>
                    <p className="hero-description">
                        {heroData.subheading || 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.'}
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="hero-button-primary"
                            onClick={() => scrollToSection('contact')}
                        >
                            İLETİŞİM FORMU
                        </button>
                        <button
                            className="hero-button-secondary"
                            onClick={() => scrollToSection('projects')}
                        >
                            PROJELERİMİZİ İNCELEYİN
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Contact Info Overlay */}
            {contactInfo && (
                <div className="contact-overlay">
                    <div className="contact-container">
                        <div className="contact-grid">
                            {contactInfo.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="contact-item"
                                >
                                    
                                    <div className="contact-text">
                                        <p className="contact-title">{item.title}</p>
                                        <item.icon className="contact-icon" />
                                        <p className="contact-info">{item.info}</p>
                                        {item.subInfo && <p className="contact-sub-info">{item.subInfo}</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Hero
