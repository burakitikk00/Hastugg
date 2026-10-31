import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    FaLocationDot,
    FaPhone,
    FaEnvelope,
    FaArrowUp,
    FaLinkedinIn,
    FaInstagram,
    FaXTwitter,
    FaFacebookF
} from 'react-icons/fa6';
import hastugLogo from '../../assets/hastuglogo.png';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import './Footer.css';

// Varsayılan / Anında Yüklenen Mimari Hizmetler (Sıfır bekleme garantisi)
const DEFAULT_FOOTER_SERVICES = [
    { id: 1, service: 'Lüks Konut & Rezidans Projeleri' },
    { id: 2, service: 'Kentsel Dönüşüm & Yapısal Yenileme' },
    { id: 3, service: 'Statik Projelendirme & Deprem Güvenliği' },
    { id: 4, service: 'Tarihi Eser Restorasyonu & Güçlendirme' }
];

const DEFAULT_FOOTER_CONTACT = {
    address: 'İstanbul, Türkiye',
    phone: '+90 545 555 55 55',
    email: 'info@hastug.com',
    instagram: 'https://instagram.com/hastug',
    facebook: 'https://facebook.com/hastug',
    twitter: 'https://twitter.com/hastug',
    linkedin: 'https://linkedin.com/company/hastug'
};

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [contact, setContact] = useState(DEFAULT_FOOTER_CONTACT);
    const [services, setServices] = useState(DEFAULT_FOOTER_SERVICES);

    useEffect(() => {
        let isMounted = true;

        const loadFooterData = async () => {
            try {
                // İletişim bilgilerini yükle
                const contactData = await publicService.getContact();
                if (isMounted && Array.isArray(contactData) && contactData.length > 0) {
                    const c = contactData[0];
                    setContact(prev => ({
                        ...prev,
                        address: c.address || prev.address,
                        phone: c.phone || prev.phone,
                        email: c.email || prev.email,
                        instagram: c.instagram || prev.instagram,
                        facebook: c.facebook || prev.facebook,
                        twitter: c.twitter || prev.twitter,
                        linkedin: c.linkedin || prev.linkedin
                    }));
                }

                // Hizmetleri yükle
                const servicesData = await publicService.getServices();
                if (isMounted && Array.isArray(servicesData) && servicesData.length > 0) {
                    setServices(servicesData);
                }
            } catch (error) {
                logger.warn('Footer verileri yüklenirken varsayılan içerikler devrede:', error?.message);
            }
        };

        loadFooterData();

        return () => {
            isMounted = false;
        };
    }, []);

    const quickLinks = [
        { name: 'Kurumsal & Hakkımızda', id: 'about' },
        { name: 'Hizmetlerimiz', id: 'services' },
        { name: 'Mimari Portföy', id: 'projects' },
        { name: 'Uzman Ekibimiz', id: 'team' },
        { name: 'İletişim & Teklif', id: 'contact' }
    ];

    const scrollToSection = (sectionId) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 150);
        } else {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleServiceClick = (service) => {
        if (service?.id) {
            navigate(`/hizmet/${service.id}`);
        }
    };

    return (
        <footer className="footer-container" aria-label="Sayfa altı bilgileri">
            {/* Arka Plan Mimari Işıma */}
            <div className="footer-ambient-glow" aria-hidden="true" />

            <div className="footer-inner-wrapper">
                {/* Ana İçerik 4 Kolon Grid */}
                <div className="footer-grid">
                    {/* 1. Kolon: Marka & Mimari Vizyon */}
                    <div className="footer-brand-column">
                        <div className="footer-logo-box" onClick={scrollToTop} role="button" tabIndex={0}>
                            <img
                                src={hastugLogo}
                                alt="Hastuğ İnşaat Logo"
                                className="footer-logo-image"
                            />
                            <span className="footer-logo-brand">
                                Hastuğ <span className="text-[#e5a93c]">İnşaat</span>
                            </span>
                        </div>

                        <p className="footer-brand-desc">
                            Estetik vizyonu yüksek statik güvenlik ve yenilikçi yapı dinamikleriyle buluşturan tescilli mimarlık ve inşaat kuruluşu.
                        </p>

                        {/* Sosyal Medya İkonları */}
                        <div className="footer-socials-row" aria-label="Sosyal Medya Kanalları">
                            {contact.linkedin && (
                                <a
                                    href={contact.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-btn"
                                    aria-label="Hastuğ İnşaat LinkedIn"
                                >
                                    <FaLinkedinIn size={13} />
                                </a>
                            )}
                            {contact.instagram && (
                                <a
                                    href={contact.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-btn"
                                    aria-label="Hastuğ İnşaat Instagram"
                                >
                                    <FaInstagram size={13} />
                                </a>
                            )}
                            {contact.twitter && (
                                <a
                                    href={contact.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-btn"
                                    aria-label="Hastuğ İnşaat X"
                                >
                                    <FaXTwitter size={13} />
                                </a>
                            )}
                            {contact.facebook && (
                                <a
                                    href={contact.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-social-btn"
                                    aria-label="Hastuğ İnşaat Facebook"
                                >
                                    <FaFacebookF size={13} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* 2. Kolon: Hızlı Navigasyon */}
                    <div className="footer-nav-column">
                        <h4 className="footer-column-title">HIZLI MENÜ</h4>
                        <ul className="footer-links-list">
                            {quickLinks.map((link) => (
                                <li key={link.id}>
                                    <button
                                        type="button"
                                        onClick={() => scrollToSection(link.id)}
                                        className="footer-nav-link"
                                    >
                                        <span className="footer-link-dot" aria-hidden="true" />
                                        <span>{link.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Kolon: Mimari Hizmetler */}
                    <div className="footer-services-column">
                        <h4 className="footer-column-title">UZMANLIKLARIMIZ</h4>
                        <ul className="footer-links-list">
                            {services.slice(0, 5).map((service, index) => (
                                <li key={service.id || index}>
                                    <button
                                        type="button"
                                        onClick={() => handleServiceClick(service)}
                                        className="footer-nav-link"
                                    >
                                        <span className="footer-link-dot" aria-hidden="true" />
                                        <span>{service.service}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Kolon: Genel Merkez Koordinatları */}
                    <div className="footer-contact-column">
                        <h4 className="footer-column-title">GENEL MERKEZ</h4>
                        <ul className="footer-contact-list">
                            <li className="footer-contact-item">
                                <FaLocationDot size={14} className="footer-contact-icon" />
                                <span>{contact.address}</span>
                            </li>
                            <li className="footer-contact-item">
                                <FaPhone size={13} className="footer-contact-icon" />
                                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="footer-contact-link">
                                    {contact.phone}
                                </a>
                            </li>
                            <li className="footer-contact-item">
                                <FaEnvelope size={13} className="footer-contact-icon" />
                                <a href={`mailto:${contact.email}`} className="footer-contact-link">
                                    {contact.email}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Alt Künye & Başa Dön Çubuğu */}
                <div className="footer-bottom-bar">
                    <p className="footer-copyright-text">
                        &copy; {new Date().getFullYear()} Hastuğ İnşaat & Mimarlık. Tüm hakları saklıdır.
                    </p>


                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="footer-back-to-top"
                        aria-label="Sayfanın Başına Dön"
                    >
                        <span>BAŞA DÖN</span>
                        <FaArrowUp size={12} />
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
