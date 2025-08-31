import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ServiceProjectsModal from '../ServiceProjectsModal'
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
                console.log('Yüklenen services:', servicesData);
                setServices(servicesData)
            } catch (error) {
                console.error('Hizmetler yüklenirken hata:', error)
                // Hata durumunda varsayılan verileri kullan
                setServices([
                    {
                        service: 'Mimari ve Yapı Projeleri',
                        description: 'Uygulama projeleri, kat planları, kesit ve görünüş çizimleri, yapısal sistem çözümleri, malzeme detayı geliştirme, teklif dosyası hazırlama, 3D modelleme ve render alma hizmetleri.',
                        url: null
                    },
                    {
                        service: 'Saha Uygulama ve Takip',
                        description: 'Saha uygulama takibi, keşif–metraj çalışmaları, hakediş düzenleme ve tüm uygulama aşamalarında mühendislik ilkelerine bağlı titiz çalışma.',
                        url: null
                    },
                    {
                        service: 'Dış Cephe ve İzolasyon',
                        description: 'Dış cephe kaplama, mantolama ve izolasyon uygulamalarında teknik doğruluk ve görsel başarı odaklı çözümler.',
                        url: null
                    },
                    {
                        service: 'Peyzaj Tasarımı',
                        description: 'Estetik beklentileri fonksiyonel gereksinimlerle buluşturan, çevreye değer katan peyzaj tasarımı ve uygulamaları.',
                        url: null
                    }
                ])
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
                console.log('Tüm projeler yüklendi:', projectsData)
                setAllProjects(projectsData)
            } catch (error) {
                console.error('Projeler yüklenirken hata:', error)
            }
        }

        fetchAllProjects()
    }, [])

    // Hizmete göre projeleri filtrele
    const getProjectsForService = (serviceTitle) => {
        console.log('Filtreleme için hizmet:', serviceTitle)
        console.log('Mevcut projeler:', allProjects)
        
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
        
        console.log('Filtrelenmiş projeler:', filteredProjects)
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
                                    <img 
                                        src={service.url ? `http://localhost:5000${service.url}` : 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop'} 
                                        alt={service.service}
                                        className="service-image"
                                        onError={(e) => {
                                            console.error('Görsel yüklenemedi:', e.target.src);
                                            e.target.src = 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop';
                                        }}
                                        onLoad={() => console.log('Görsel başarıyla yüklendi:', service.service)}
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
