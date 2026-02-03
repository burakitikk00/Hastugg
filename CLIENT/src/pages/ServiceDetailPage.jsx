import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import LoadingImage from '../components/common/LoadingImage'
import publicService from '../services/publicService'
import './ServiceDetailPage.css'

const ServiceDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [service, setService] = useState(null)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('services')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Hizmet bilgisini getir
                const serviceData = await publicService.getServiceById(id)
                setService(serviceData)

                // Tüm projeleri getir ve bu hizmete ait olanları filtrele
                const allProjects = await publicService.getProjects()
                const filteredProjects = allProjects.filter(project => {
                    if (!project.service_ids) return false

                    let serviceIds = project.service_ids
                    if (typeof serviceIds === 'string') {
                        try {
                            serviceIds = JSON.parse(serviceIds)
                        } catch {
                            return false
                        }
                    }

                    return Array.isArray(serviceIds) && serviceIds.includes(Number(id))
                })

                setProjects(filteredProjects)
                setError(null)
            } catch (err) {
                console.error('Veri yüklenirken hata:', err)
                setError('Hizmet bilgileri yüklenirken bir hata oluştu.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()

        // Sayfa yüklendiğinde en üste scroll
        window.scrollTo(0, 0)
    }, [id])

    const handleProjectClick = (projectId) => {
        navigate(`/proje/${projectId}`)
    }

    const handleBackClick = () => {
        navigate(-1) // Önceki sayfaya dön
    }

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
            <div className="service-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="service-detail-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !service) {
        return (
            <div className="service-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="service-detail-main">
                    <div className="error-container">
                        <h2>Hata</h2>
                        <p>{error || 'Hizmet bulunamadı.'}</p>
                        <button onClick={handleBackClick} className="back-button">
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="service-detail-page">
            <Header activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="service-detail-main">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="back-nav-button"
                    onClick={handleBackClick}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Geri
                </motion.button>

                {/* Service Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="service-header-section"
                >
                    <div className="service-header-content">
                        <div className="service-header-image">
                            <LoadingImage
                                src={service.url ? publicService.getImageURL(service.url) : null}
                                alt={service.service}
                                className="service-main-image"
                                blurWhileLoading={true}
                                showLoadingSpinner={true}
                            />
                        </div>
                        <div className="service-header-info">
                            <h1 className="service-title">{service.service}</h1>
                            <p className="service-description">{service.description}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Projects Section */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="service-projects-section"
                >
                    <h2 className="projects-section-title">
                        {service.service} Projeleri
                    </h2>

                    {projects.length > 0 ? (
                        <div className="projects-grid">
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="project-card"
                                >
                                    <div className="project-image-container">
                                        <LoadingImage
                                            src={publicService.getImageURL(project.url)}
                                            alt={project.title}
                                            className="project-thumbnail"
                                            fallbackSrc="/api/placeholder/400/300"
                                            blurWhileLoading={true}
                                            showLoadingSpinner={true}
                                        />

                                        <div className="project-status-badge">
                                            <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                                                {getStatusText(project.status)}
                                            </span>
                                        </div>

                                        <div className="project-overlay">
                                            <div className="overlay-content">
                                                <h3 className="overlay-title">{project.title}</h3>
                                                <p className="overlay-description">
                                                    {project.description && project.description.length > 120
                                                        ? `${project.description.substring(0, 120)}...`
                                                        : project.description
                                                    }
                                                </p>
                                                <button
                                                    className="overlay-button"
                                                    onClick={() => handleProjectClick(project.id)}
                                                >
                                                    DETAYLAR
                                                </button>
                                            </div>
                                        </div>

                                        <div className="project-name-overlay">
                                            <h3 className="project-name">{project.title}</h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-projects">
                            <p>Bu hizmet için henüz proje bulunmamaktadır.</p>
                        </div>
                    )}
                </motion.section>
            </main>

            <Footer />
        </div>
    )
}

export default ServiceDetailPage
