import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import './Hero.css'

const Hero = () => {
    const contactInfo = [
        {
            icon: FaMapMarkerAlt,
            title: 'Lokasyon',
            info: 'Adres Bilgisi Caddesi .1234 Sokak .',
            subInfo: 'Ankara/Türkiye'
        },
        {
            icon: FaPhone,
            title: 'Telefon',
            info: '0216 555 55 000'
        },
        {
            icon: FaEnvelope,
            title: 'E-Posta',
            info: 'bilgi@hastugg.com'
        }
    ]

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
                        Siz İsteyin, Biz İnşa Edelim
                    </h1>
                    <p className="hero-description">
                        Profesyonel ekibimizle isteğinizi birebir yerine getiriyoruz. Hemen teklif alabilirsiniz.
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
                                <item.icon className="contact-icon" />
                                <div className="contact-text">
                                    <p className="contact-title">{item.title}</p>
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
