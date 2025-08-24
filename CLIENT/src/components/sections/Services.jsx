import { useState } from 'react'
import { motion } from 'framer-motion'
import ServiceProjectsModal from '../ServiceProjectsModal'
import './Services.css'

const Services = () => {
    const [selectedService, setSelectedService] = useState(null)
    const [showServiceProjects, setShowServiceProjects] = useState(false)

    const services = [
        {
            title: 'Mimari ve Yapı Projeleri',
            description: 'Uygulama projeleri, kat planları, kesit ve görünüş çizimleri, yapısal sistem çözümleri, malzeme detayı geliştirme, teklif dosyası hazırlama, 3D modelleme ve render alma hizmetleri.',
            icon: '🏢'
        },
        {
            title: 'Saha Uygulama ve Takip',
            description: 'Saha uygulama takibi, keşif–metraj çalışmaları, hakediş düzenleme ve tüm uygulama aşamalarında mühendislik ilkelerine bağlı titiz çalışma.',
            icon: '🛠️'
        },
        {
            title: 'Dış Cephe ve İzolasyon',
            description: 'Dış cephe kaplama, mantolama ve izolasyon uygulamalarında teknik doğruluk ve görsel başarı odaklı çözümler.',
            icon: '🏘️'
        },
        {
            title: 'Peyzaj Tasarımı',
            description: 'Estetik beklentileri fonksiyonel gereksinimlerle buluşturan, çevreye değer katan peyzaj tasarımı ve uygulamaları.',
            icon: '🌳'
        }
    ]

    // Örnek proje verileri - gerçek uygulamada API'den gelecek
    const getProjectsForService = (serviceTitle) => {
        const projects = {
            'Mimari ve Yapı Projeleri': [
                {
                    title: 'Modern Villa Projesi',
                    description: 'İstanbul\'da 500m² alan üzerine kurulu modern villa tasarımı. Açık plan, geniş pencereler ve sürdürülebilir malzeme kullanımı ile öne çıkan proje.',
                    status: 'Completed',
                    images: [
                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
                    ]
                },
                {
                    title: 'Ofis Binası Renovasyonu',
                    description: 'Eski ofis binasının modern iş yerine dönüştürülmesi. Enerji verimliliği ve çalışan konforu ön planda tutularak yapılan yenileme.',
                    status: 'In Progress',
                    images: [
                        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
                        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
                    ]
                }
            ],
            'Saha Uygulama ve Takip': [
                {
                    title: 'Rezidans Projesi Uygulama',
                    description: '200 dairelik rezidans projesinin saha uygulama takibi. Kalite kontrol, zaman yönetimi ve maliyet optimizasyonu ile başarıyla tamamlandı.',
                    status: 'Completed',
                    images: [
                        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
                        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
                    ]
                }
            ],
            'Dış Cephe ve İzolasyon': [
                {
                    title: 'Mantolama Uygulaması',
                    description: 'Eski binada enerji tasarrufu için mantolama uygulaması. Isı yalıtımı ve dış cephe yenileme ile bina performansı artırıldı.',
                    status: 'Completed',
                    images: [
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
                    ]
                }
            ],
            'Peyzaj Tasarımı': [
                {
                    title: 'Site Peyzaj Projesi',
                    description: 'Büyük site için kapsamlı peyzaj tasarımı. Yeşil alanlar, yürüyüş yolları ve dinlenme alanları ile yaşanabilir çevre oluşturuldu.',
                    status: 'In Progress',
                    images: [
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
                    ]
                }
            ]
        }
        return projects[serviceTitle] || []
    }

    const handleServiceClick = (service) => {
        setSelectedService(service)
        setShowServiceProjects(true)
    }

    const handleCloseModal = () => {
        setShowServiceProjects(false)
        setSelectedService(null)
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
                                <div className="service-icon">{service.icon}</div>
                                <h3 className="service-title">{service.title}</h3>
                                <p className="service-description">{service.description}</p>
                                <button
                                    className="service-button"
                                    onClick={() => handleServiceClick(service)}
                                >
                                    DETAYLAR
                                </button>
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
                projects={selectedService ? getProjectsForService(selectedService.title) : []}
            />
        </>
    )
}

export default Services
