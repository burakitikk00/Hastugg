import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaInstagram, FaFacebook, FaTwitter, FaLinkedin, FaMap } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import publicService from '../../services/publicService'
import API_CONFIG from '../../config/api'
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics'
import logger from '../../utils/logger'
import './Contact.css'

const Contact = () => {
    const [contactInfo, setContactInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const { trackEvent } = useGoogleAnalytics()



    // Form state'i
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null

    // Form input değişikliklerini handle et
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    // Form submit işlemi
    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitStatus(null)

        try {
            // Backend'e gönder (nodemailer ile)
            const response = await fetch(`${API_CONFIG.API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                setSubmitStatus('success')
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    message: ''
                })
                
                // Google Analytics ile form gönderimini takip et
                trackEvent('form_submit', 'contact', 'contact_form', 1)
            } else {
                const errorData = await response.json()
                logger.error('Backend hatası:', errorData)
                setSubmitStatus('error')
            }
        } catch (error) {
            logger.error('Form gönderimi hatası:', error)
            setSubmitStatus('error')
        } finally {
            setIsSubmitting(false)
        }
    }

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
                logger.error('Contact bilgileri getirilemedi:', error)
                setContactInfo(null)
            } finally {
                setLoading(false)
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



    if (loading || !contactInfo) {
        return (
            <section id="contact" className="contact">
                <div className="contact-container">
                    <div className="contact-header">
                        <h2 className="contact-title">İLETİŞİM</h2>
                        <p className="contact-description">Projeleriniz için bizimle iletişime geçin</p>
                    </div>
                    <div className="contact-content">
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>İletişim bilgileri yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

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
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Adınız"
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Soyadınız"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="E-posta Adresiniz"
                                className="form-input"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Telefon Numaranız"
                                className="form-input"
                                required
                            />
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Proje Detaylarınız"
                                rows="4"
                                className="form-textarea"
                                required
                            ></textarea>
                            
                            {/* Status mesajları */}
                            {submitStatus === 'success' && (
                                <div className="success-message">
                                    Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.
                                </div>
                            )}
                            {submitStatus === 'error' && (
                                <div className="error-message">
                                    Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className="form-submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'GÖNDERİLİYOR...' : 'İLETİŞİM FORMU'}
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

                            {/* Harita Bölümü */}
                            <div className="map-section" style={{ marginTop: '20px' }}>
                                <div 
                                    className="map-container"
                                    style={{
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        height: '300px',
                                        background: '#f9fafb'
                                    }}
                                >
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d96367.57945231683!2d29.056833771775768!3d40.99271593126424!3m2!1i1024!2i768!4f13.1!5e0!3m2!1str!2str!4v1756399286094!5m2!1str!2str"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
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
