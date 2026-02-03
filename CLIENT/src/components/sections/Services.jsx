import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingImage from '../common/LoadingImage'
import publicService from '../../services/publicService'
import logger from '../../utils/logger'
import './Services.css'

const Services = () => {
    const navigate = useNavigate()
    const [services, setServices] = useState(publicService.getCachedServices() || [])
    const [loading, setLoading] = useState(!publicService.getCachedServices())

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesData = await publicService.getServices()
                setServices(servicesData)
            } catch (error) {
                logger.error('Hizmetler yüklenirken hata:', error)
                // Hata durumunda boş array kullan - sabit veriler gösterme
                setServices([])
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    const handleServiceClick = (service) => {
        navigate(`/hizmet/${service.id}`)
    }

    // Status çevirisi için fonksiyon
    const getStatusText = (status) => {
        switch (status) {
            case 'Completed':
            case 'completed':
                return 'Tamamlandı'
            case 'In Progress':
            case 'in_progress':
            case 'inprogress':
                return 'Devam Ediyor'
            case 'Planned':
            case 'planned':
                return 'Planlandı'
            case 'On Hold':
            case 'on_hold':
            case 'onhold':
                return 'Beklemede'
            default:
                return status
        }
    }

    if (loading) {
        return (
            <section id="services" className="services">
                <div className="services-container">
                    <div className="services-header">
                        <h2 className="services-title">HİZMETLERİMİZ</h2>
                        <p className="services-description">
                            Konutlar ve Sektörler İçin Yüksek Kaliteli İnşaat Çözümleri!
                        </p>
                    </div>
                    <div className="services-grid">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="service-card skeleton">
                                <div className="service-icon skeleton-icon"></div>
                                <div className="service-title skeleton-title"></div>
                                <div className="service-button skeleton-button"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Hata durumunda veya veri yoksa
    if (services.length === 0) {
        return (
            <section id="services" className="services">
                <div className="services-container">
                    <div className="services-header">
                        <h2 className="services-title">HİZMETLERİMİZ</h2>
                        <p className="services-description">
                            Konutlar ve Sektörler İçin Yüksek Kaliteli İnşaat Çözümleri!
                        </p>
                    </div>
                    <div className="services-grid">
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>Hizmetler yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            <section id="services" className="services">
                <div className="services-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="services-header"
                    >
                        <h2 className="services-title">
                            HİZMETLERİMİZ
                        </h2>
                        <p className="services-description">
                            Konutlar ve Sektörler İçin Yüksek Kaliteli İnşaat Çözümleri!
                        </p>
                    </motion.div>

                    <div className="services-grid">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="service-card"
                            >
                                <div className="service-image-container">
                                    <LoadingImage
                                        src={service.url ? publicService.getImageURL(service.url) : null}
                                        alt={service.service}
                                        className="service-image"
                                        blurWhileLoading={true}
                                        showLoadingSpinner={true}
                                    />

                                    <div className="service-overlay">
                                        <div className="overlay-content">
                                            <h3 className="overlay-title">{service.service}</h3>
                                            <p className="overlay-description">{service.description}</p>
                                            <button
                                                className="overlay-button"
                                                onClick={() => handleServiceClick(service)}
                                            >
                                                DETAYLAR
                                            </button>
                                        </div>
                                    </div>

                                    <div className="service-name-overlay">
                                        <h3 className="service-name">{service.service}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Services
