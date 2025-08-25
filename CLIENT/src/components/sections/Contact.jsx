import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import publicService from '../../services/publicService'
import './Contact.css'

const Contact = () => {
    const [contactInfo, setContactInfo] = useState([
        {
            icon: FaMapMarkerAlt,
            title: 'Adres',
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
            title: 'E-posta',
            info: 'Yükleniyor...'
        }
    ])

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const data = await publicService.getContact()
                if (data && data.length > 0) {
                    const contact = data[0] // İlk contact kaydını al
                    setContactInfo([
                        {
                            icon: FaMapMarkerAlt,
                            title: 'Adres',
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
                            title: 'E-posta',
                            info: contact.email || 'E-posta bilgisi bulunamadı'
                        }
                    ])
                    setSocialLinks({
                        facebook: contact.facebook || '',
                        twitter: contact.twitter || '',
                        instagram: contact.instagram || '',
                        linkedin: contact.linkedin || ''
                    })
                }
            } catch (error) {
                console.error('Contact bilgileri getirilemedi:', error)
            }
        }

        fetchContactInfo()
    }, [])

    const [workingHours, setWorkingHours] = useState([
        'P.Tesi - Cuma: 10:00 - 18:00',
        'C.Tesi: 10:00 - 15:00',
        'Pazar: Kapalı'
    ])

    // Admin tarafından localStorage'a yazılan çalışma saatlerini oku
    useEffect(() => {
        const hours = localStorage.getItem('workingHours');
        if (hours && typeof hours === 'string') {
            const lines = hours.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length > 0) setWorkingHours(lines);
        }
    }, [])

    const [socialLinks, setSocialLinks] = useState({ facebook: '', twitter: '', instagram: '', linkedin: '' })

    return (
        <section id="contact" className="contact">
            <div className="contact-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="contact-header"
                >
                    <h2 className="contact-title">
                        İLETİŞİM
                    </h2>
                    <p className="contact-description">
                        Projeleriniz için bizimle iletişime geçin
                    </p>
                </motion.div>

                <div className="contact-content">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="contact-form-container"
                    >
                        <h3 className="form-title">İLETİŞİM FORMU</h3>
                        <form className="contact-form">
                            <div className="form-row">
                                <input
                                    type="text"
                                    placeholder="Adınız"
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    placeholder="Soyadınız"
                                    className="form-input"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="E-posta Adresiniz"
                                className="form-input"
                            />
                            <input
                                type="tel"
                                placeholder="Telefon Numaranız"
                                className="form-input"
                            />
                            <textarea
                                placeholder="Proje Detaylarınız"
                                rows="4"
                                className="form-textarea"
                            ></textarea>
                            <button type="submit" className="form-submit">
                                İLETİŞİM FORMU
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="contact-info-container"
                    >
                        <div className="info-card">
                            <h3 className="info-title">İletişim Bilgileri</h3>
                            <div className="info-list">
                                {contactInfo.map((item, index) => (
                                    <div key={index} className="info-item">
                                        <item.icon className="info-icon" />
                                        <div className="info-content">
                                            <p className="info-label">{item.title}</p>
                                            <p className="info-text">{item.info}</p>
                                            {item.subInfo && <p className="info-sub-text">{item.subInfo}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Sosyal Linkler: sadece link varsa göster */}
                            <div className="social-links" style={{ marginTop: '12px', display: 'flex', gap: '20px', fontSize: '2rem', justifyContent: 'flex-end' }}>
                                {socialLinks.facebook && (
                                    <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="social-link"><FaFacebook /></a>
                                )}
                                {socialLinks.twitter && (
                                    <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="social-link"><FaTwitter /></a>
                                )}
                                {socialLinks.instagram && (
                                    <a href={socialLinks.instagram} target="_blank" rel="noreferrer" className="social-link"><FaInstagram /></a>
                                )}
                                {socialLinks.linkedin && (
                                    <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="social-link"><FaLinkedin /></a>
                                )}
                            </div>
                        </div>

                        <div className="info-card">
                            <h3 className="info-title">Çalışma Saatleri</h3>
                            <div className="hours-list">
                                {workingHours.map((hour, index) => (
                                    <p key={index} className="hour-item">{hour}</p>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default Contact
