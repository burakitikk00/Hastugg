import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import publicService from '../../services/publicService'
import './Hero.css'

const Hero = () => {
    const [heroData, setHeroData] = useState({
        title: 'Siz İsteyin, Biz İnşa Edelim',
        subtitle: 'Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.'
    });

    const [contactInfo, setContactInfo] = useState([
        {
            icon: FaMapMarkerAlt,
            title: 'Lokasyon',
            info: 'Yükleniyor...',
            subInfo: ''
        },
        {
            icon: FaPhone,
            title: 'Telefon',
            info: 'Yükleniyor...'
        },
        {
            icon: FaEnvelope,
            title: 'E-Posta',
            info: 'Yükleniyor...'
        }
    ])

    useEffect(() => {
        const fetchData = async () => {
            try {
                // LocalStorage'dan hero verilerini yükle
                const savedHero = localStorage.getItem('heroData');
                if (savedHero) {
                    const parsedHero = JSON.parse(savedHero);
                    setHeroData(parsedHero);
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
                console.error('Veriler getirilemedi:', error)
            }
        }

        fetchData()

        // LocalStorage'dan gelen güncellemeleri dinle
        const handleHeroUpdate = (event) => {
            setHeroData(event.detail);
        };

        window.addEventListener('heroDataUpdated', handleHeroUpdate);

        return () => {
            window.removeEventListener('heroDataUpdated', handleHeroUpdate);
        };
    }, [])

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
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
                    <h1 className="hero-title">
                        {heroData.title}
                    </h1>
                    <p className="hero-description">
                        {heroData.subtitle}
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
        </section>
    )
}

export default Hero
