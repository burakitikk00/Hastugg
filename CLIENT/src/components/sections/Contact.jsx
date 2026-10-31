import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaLocationDot,
    FaPhone,
    FaEnvelope,
    FaClock,
    FaPaperPlane,
    FaCheck,
    FaCircleExclamation,
    FaLinkedinIn,
    FaInstagram,
    FaXTwitter,
    FaFacebookF
} from 'react-icons/fa6';
import publicService from '../../services/publicService';
import { useGoogleAnalytics } from '../../hooks/useGoogleAnalytics';
import logger from '../../utils/logger';
import './Contact.css';

const Contact = () => {
    const { trackEvent } = useGoogleAnalytics();
    const [contactData, setContactData] = useState({
        address: '',
        phone: '',
        email: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        mapEmbedUrl: ''
    });

    // Form Durumu
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        kvkkConsent: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
    const [statusMessage, setStatusMessage] = useState('');

    const [workingHours, setWorkingHours] = useState([
        'Pazartesi - Cuma: 10:00 - 18:00',
        'Cumartesi: 10:00 - 15:00',
        'Pazar: Randevu ile'
    ]);

    // Backend'den iletişim bilgilerini al
    useEffect(() => {
        let isMounted = true;

        const fetchContact = async () => {
            try {
                const data = await publicService.getContact();
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    const c = data[0];
                    setContactData({
                        address: c.address || '',
                        phone: c.phone || '',
                        email: c.email || '',
                        facebook: c.facebook || '',
                        twitter: c.twitter || '',
                        instagram: c.instagram || '',
                        linkedin: c.linkedin || '',
                        mapEmbedUrl: c.mapEmbedUrl || ''
                    });
                }
            } catch (err) {
                logger.warn('İletişim bilgileri yüklenirken hata:', err?.message);
            }
        };

        fetchContact();

        // Admin çalışma saatleri
        const storedHours = localStorage.getItem('workingHours');
        if (storedHours && typeof storedHours === 'string') {
            const lines = storedHours.split(/\r?\n/).filter(l => l.trim().length > 0);
            if (lines.length > 0) setWorkingHours(lines);
        }

        return () => {
            isMounted = false;
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (submitStatus) {
            setSubmitStatus(null);
            setStatusMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.kvkkConsent) {
            setSubmitStatus('error');
            setStatusMessage('Lütfen devam etmek için KVKK İletişim Aydınlatma Metni\'ni okuyup onaylayınız.');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);
        setStatusMessage('');

        try {
            const result = await publicService.submitContact(formData);
            setSubmitStatus('success');
            setStatusMessage(result.message || 'Mesajınız başarıyla kaydedildi. En kısa sürede size dönüş yapacağız.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                message: '',
                kvkkConsent: false
            });

            trackEvent('form_submit', 'contact', 'contact_form', 1);
        } catch (error) {
            logger.error('İletişim formu gönderim hatası:', error);
            setSubmitStatus('error');
            setStatusMessage(error.message || 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="contact-section-container" aria-label="İletişim">
            {/* Arka Plan Mimari Işıma */}
            <div className="contact-ambient-glow" aria-hidden="true" />

            <div className="contact-inner-wrapper">
                {/* Üst Başlık & Açıklama */}
                <div className="contact-top-bar">
                    <h2 className="contact-main-title">
                        İletişim & Mimari Teklif Talebi
                    </h2>
                    <p className="contact-subtext">
                        Hayalinizdeki konut, restorasyon veya ticari gayrimenkul projesi için statik mühendislik ve mimari danışmanlık brifingi başlatın.
                    </p>
                </div>

                <div className="contact-grid-layout">
                    {/* Sol Kolon: Mimari Teklif Terminali (Inquiry Form) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="contact-terminal-card"
                    >
                        <div className="terminal-header">
                            <h3 className="terminal-title">Proje Detaylarınızı İletin</h3>
                            <p className="terminal-subtext">
                                Statik mühendislerimiz ve mimarlarımız talebinizi inceleyerek en geç 24 saat içinde fizibilite dönüşü sağlayacaktır.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="contact-terminal-form" noValidate>
                            {/* İsim & Soyisim Satırı */}
                            <div className="form-input-row">
                                <div className="form-field-group">
                                    <label htmlFor="contact-firstName" className="form-field-label">
                                        Adınız *
                                    </label>
                                    <input
                                        id="contact-firstName"
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Örn: Ahmet"
                                        className="terminal-input"
                                        required
                                        autoComplete="given-name"
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label htmlFor="contact-lastName" className="form-field-label">
                                        Soyadınız *
                                    </label>
                                    <input
                                        id="contact-lastName"
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Örn: Yılmaz"
                                        className="terminal-input"
                                        required
                                        autoComplete="family-name"
                                    />
                                </div>
                            </div>

                            {/* E-posta & Telefon Satırı */}
                            <div className="form-input-row">
                                <div className="form-field-group">
                                    <label htmlFor="contact-email" className="form-field-label">
                                        E-posta Adresiniz *
                                    </label>
                                    <input
                                        id="contact-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="ahmet@example.com"
                                        className="terminal-input"
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="form-field-group">
                                    <label htmlFor="contact-phone" className="form-field-label">
                                        Telefon Numaranız *
                                    </label>
                                    <input
                                        id="contact-phone"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+90 (5XX) XXX XX XX"
                                        className="terminal-input"
                                        required
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            {/* Proje Mesajı & Detayları */}
                            <div className="form-field-group">
                                <label htmlFor="contact-message" className="form-field-label">
                                    Proje Açıklaması & Teknik İhtiyaçlarınız *
                                </label>
                                <textarea
                                    id="contact-message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    placeholder="Projenizin konumu, arsa/yapı metrekaresi, hedeflenen başlangıç tarihi ve mimari beklentilerinizi yazınız..."
                                    rows={4}
                                    className="terminal-textarea"
                                    required
                                />
                            </div>

                            {/* KVKK Aydınlatma & Açık Rıza Onay Kutusu */}
                            <div className="contact-kvkk-group">
                                <label className="kvkk-checkbox-label">
                                    <input
                                        id="contact-kvkkConsent"
                                        type="checkbox"
                                        name="kvkkConsent"
                                        checked={formData.kvkkConsent}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setFormData(prev => ({ ...prev, kvkkConsent: checked }));
                                            if (submitStatus === 'error') {
                                                setSubmitStatus(null);
                                                setStatusMessage('');
                                            }
                                        }}
                                        required
                                        className="kvkk-checkbox-native"
                                    />
                                    <span className={`kvkk-checkbox-visual ${formData.kvkkConsent ? 'checked' : ''}`} aria-hidden="true">
                                        {formData.kvkkConsent && <FaCheck size={9} />}
                                    </span>
                                    <span className="kvkk-text-content">
                                        Kişisel verilerimin,{' '}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                window.dispatchEvent(
                                                    new CustomEvent('hastug_open_legal_modal', { detail: { tab: 'iletisim' } })
                                                );
                                            }}
                                            className="kvkk-modal-trigger-btn"
                                        >
                                            İletişim Formu Aydınlatma Metni
                                        </button>
                                        {' '}kapsamında işlenmesini ve tarafımla iletişime geçilmesini kabul ediyorum. *
                                    </span>
                                </label>
                            </div>

                            {/* Geribildirim HUD Kartı */}
                            {submitStatus === 'success' && (
                                <div className="form-status-alert success" role="alert">
                                    <FaCheck className="status-icon" size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            {submitStatus === 'error' && (
                                <div className="form-status-alert error" role="alert">
                                    <FaCircleExclamation className="status-icon" size={16} />
                                    <span>{statusMessage}</span>
                                </div>
                            )}

                            {/* Gönderim Butonu & SLA Notu */}
                            <div className="form-action-group">
                                <button
                                    type="submit"
                                    className="terminal-submit-btn"
                                    disabled={isSubmitting}
                                >
                                    <span>{isSubmitting ? 'İLETİLİYOR...' : 'MİMARİ BRİFİNGİ GÖNDER'}</span>
                                    <FaPaperPlane size={13} />
                                </button>

                                <span className="terminal-sla-note">
                                    24 SAATTE DÖNÜŞ // GİZLİLİK GÜVENCESİ
                                </span>
                            </div>
                        </form>
                    </motion.div>

                    {/* Sağ Kolon: Genel Merkez & Koordinatlar (Headquarters HUD) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        viewport={{ once: true }}
                        className="contact-info-column"
                    >
                        {/* İletişim Kanalları Kartı */}
                        <div className="headquarters-info-card">
                            <div className="info-card-header">
                                <h3 className="info-card-title">Merkez Ofis & İletişim</h3>
                            </div>

                            <ul className="coordinates-list">
                                <li className="coordinate-item">
                                    <div className="coordinate-icon-box">
                                        <FaLocationDot size={15} />
                                    </div>
                                    <div className="coordinate-content">
                                        <span className="coordinate-label">GENEL MERKEZ ADRESİ</span>
                                        <span className="coordinate-value">{contactData.address}</span>
                                    </div>
                                </li>

                                <li className="coordinate-item">
                                    <div className="coordinate-icon-box">
                                        <FaPhone size={14} />
                                    </div>
                                    <div className="coordinate-content">
                                        <span className="coordinate-label">TELEFON HATTI</span>
                                        <a href={`tel:${contactData.phone.replace(/\s+/g, '')}`} className="coordinate-link">
                                            {contactData.phone}
                                        </a>
                                    </div>
                                </li>

                                <li className="coordinate-item">
                                    <div className="coordinate-icon-box">
                                        <FaEnvelope size={14} />
                                    </div>
                                    <div className="coordinate-content">
                                        <span className="coordinate-label">KURUMSAL E-POSTA</span>
                                        <a href={`mailto:${contactData.email}`} className="coordinate-link">
                                            {contactData.email}
                                        </a>
                                    </div>
                                </li>
                            </ul>

                            {/* Sosyal Medya İkonları */}
                            <div className="contact-socials-row" aria-label="Sosyal Medya Kanalları">
                                {contactData.linkedin && (
                                    <a
                                        href={contactData.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-social-btn"
                                        aria-label="Hastuğ İnşaat LinkedIn"
                                    >
                                        <FaLinkedinIn size={14} />
                                    </a>
                                )}
                                {contactData.instagram && (
                                    <a
                                        href={contactData.instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-social-btn"
                                        aria-label="Hastuğ İnşaat Instagram"
                                    >
                                        <FaInstagram size={14} />
                                    </a>
                                )}
                                {contactData.twitter && (
                                    <a
                                        href={contactData.twitter}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-social-btn"
                                        aria-label="Hastuğ İnşaat X"
                                    >
                                        <FaXTwitter size={14} />
                                    </a>
                                )}
                                {contactData.facebook && (
                                    <a
                                        href={contactData.facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contact-social-btn"
                                        aria-label="Hastuğ İnşaat Facebook"
                                    >
                                        <FaFacebookF size={14} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Çalışma Saatleri & Harita */}
                        <div className="headquarters-map-card">
                            <div className="hours-row">
                                <div className="hours-icon-box">
                                    <FaClock size={14} />
                                </div>
                                <div className="hours-content">
                                    <span className="coordinate-label">ÇALIŞMA SAATLERİ</span>
                                    <div className="hours-tags">
                                        {workingHours.map((hour, idx) => (
                                            <span key={idx} className="hour-badge">
                                                {hour}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Koyu Mod Google Maps Bezel */}
                            <div className="map-embed-wrapper">
                                {contactData.mapEmbedUrl ? (
                                    <iframe
                                        src={contactData.mapEmbedUrl}
                                        title="Hastuğ İnşaat Merkez Ofis Haritası"
                                        className="map-iframe"
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[280px] flex items-center justify-center text-slate-500 text-xs font-mono tracking-wider">
                                        HARİTA YÜKLENİYOR...
                                    </div>
                                )}
                                <div className="map-glass-border" aria-hidden="true" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
