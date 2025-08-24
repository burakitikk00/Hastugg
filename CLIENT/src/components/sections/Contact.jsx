import { motion } from 'framer-motion'
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa'
import './Contact.css'

const Contact = () => {
    const contactInfo = [
        {
            icon: FaMapMarkerAlt,
            title: 'Adres',
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
            title: 'E-posta',
            info: 'bilgi@hastugg.com'
        }
    ]

    const workingHours = [
        'P.Tesi - Cuma: 10:00 - 18:00',
        'C.Tesi: 10:00 - 15:00',
        'Pazar: Kapalı'
    ]

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
