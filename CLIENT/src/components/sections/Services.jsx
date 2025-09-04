import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ServiceProjectsModal from '../ServiceProjectsModal'
import LoadingImage from '../common/LoadingImage'
import publicService from '../../services/publicService'
import './Services.css'

const Services = () => {
    const [selectedService, setSelectedService] = useState(null)
    const [showServiceProjects, setShowServiceProjects] = useState(false)
    const [services, setServices] = useState([])
    const [allProjects, setAllProjects] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const servicesData = await publicService.getServices()
                setServices(servicesData)
            } catch (error) {
                console.error('Hizmetler yüklenirken hata:', error)
                // Hata durumunda boş array kullan - sabit veriler gösterme
                setServices([])
            } finally {
                setLoading(false)
            }
        }

        fetchServices()
    }, [])

    // Tüm projeleri çek
    useEffect(() => {
        const fetchAllProjects = async () => {
            try {
                const projectsData = await publicService.getProjects()
                setAllProjects(projectsData)
            } catch (error) {
                console.error('Projeler yüklenirken hata:', error)
            }
        }

        fetchAllProjects()
    }, [])

    // Hizmete göre projeleri filtrele
    const getProjectsForService = (serviceTitle) => {
        // service_ids alanına göre filtreleme yap
        const filteredProjects = allProjects.filter(project => {
            if (!project.service_ids) return false
            
            try {
                const serviceIds = JSON.parse(project.service_ids)
                // Hizmet adına göre eşleştirme yap
                const matchingService = services.find(service => 
                    service.service === serviceTitle
                )
                
                if (matchingService && serviceIds.includes(matchingService.id)) {
                    return true
                }
            } catch (error) {
                console.error('service_ids parse hatası:', error)
            }
            
            return false
        })
        
        return filteredProjects
    }

    const handleServiceClick = (service) => {
        setSelectedService(service)
        setShowServiceProjects(true)
    }

    const handleCloseModal = () => {
        setShowServiceProjects(false)
        setSelectedService(null)
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
                                        src={service.url ? publicService.getImageURL(service.url) : 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'} 
                                        alt={service.service}
                                        className="service-image"
                                        fallbackSrc="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop"
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

            {/* Service Projects Modal */}
            <ServiceProjectsModal
                isOpen={showServiceProjects}
                onClose={handleCloseModal}
                service={selectedService}
                projects={selectedService ? getProjectsForService(selectedService.service) : []}
                getStatusText={getStatusText}
            />
        </>
    )
}

export default Services
