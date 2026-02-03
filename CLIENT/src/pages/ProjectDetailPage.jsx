import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import LoadingImage from '../components/common/LoadingImage'
import publicService from '../services/publicService'
import './ProjectDetailPage.css'

const ProjectDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('projects')

    // Slider state
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true)
                const projectData = await publicService.getProjectById(id)
                setProject(projectData)
                setError(null)
            } catch (err) {
                console.error('Proje yüklenirken hata:', err)
                setError('Proje bilgileri yüklenirken bir hata oluştu.')
            } finally {
                setLoading(false)
            }
        }

        fetchProject()

        // Sayfa yüklendiğinde en üste scroll
        window.scrollTo(0, 0)
    }, [id])

    // Auto slide - 2 saniyede bir geçiş
    useEffect(() => {
        if (!project || !project.images || project.images.length <= 1 || isPaused || isLightboxOpen) {
            return
        }

        const interval = setInterval(() => {
            setCurrentImageIndex(prev =>
                prev === project.images.length - 1 ? 0 : prev + 1
            )
        }, 2000)

        return () => clearInterval(interval)
    }, [project, isPaused, isLightboxOpen])

    const nextImage = useCallback(() => {
        if (!project || !project.images) return
        setCurrentImageIndex(prev =>
            prev === project.images.length - 1 ? 0 : prev + 1
        )
    }, [project])

    const prevImage = useCallback(() => {
        if (!project || !project.images) return
        setCurrentImageIndex(prev =>
            prev === 0 ? project.images.length - 1 : prev - 1
        )
    }, [project])

    const handleBackClick = () => {
        navigate('/#projects') // Ana sayfaya dön ve Projeler bölümüne scroll yap
    }

    const openLightbox = () => {
        setIsLightboxOpen(true)
    }

    const closeLightbox = () => {
        setIsLightboxOpen(false)
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
            <div className="project-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="project-detail-main">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Yükleniyor...</p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="project-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="project-detail-main">
                    <div className="error-container">
                        <h2>Hata</h2>
                        <p>{error || 'Proje bulunamadı.'}</p>
                        <button onClick={handleHomeClick} className="back-button">
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const images = project.images || []

    return (
        <div className="project-detail-page">
            <Header activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="project-detail-main">
                {/* Navigation Button */}
                <div className="nav-buttons">
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
                </div>

                {/* Image Slider Section */}
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="image-slider-section"
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        <div className="slider-container">
                            {/* Navigation Arrows */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        className="slider-nav prev"
                                        onClick={prevImage}
                                        aria-label="Önceki görsel"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        className="slider-nav next"
                                        onClick={nextImage}
                                        aria-label="Sonraki görsel"
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            {/* Main Image */}
                            <div className="slider-image-wrapper" onClick={openLightbox}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="slider-image-container"
                                    >
                                        <LoadingImage
                                            src={publicService.getImageURL(images[currentImageIndex])}
                                            alt={`${project.title} - Görsel ${currentImageIndex + 1}`}
                                            className="slider-image"
                                            blurWhileLoading={true}
                                            showLoadingSpinner={true}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                                <div className="fullscreen-hint">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span>Tam ekran görüntüle</span>
                                </div>
                            </div>

                            {/* Image Indicators */}
                            {images.length > 1 && (
                                <div className="slider-indicators">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            aria-label={`Görsel ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Image Counter */}
                            {images.length > 1 && (
                                <div className="image-counter">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            )}

                            {/* Auto-play indicator */}
                            {images.length > 1 && (
                                <div className={`autoplay-indicator ${isPaused ? 'paused' : ''}`}>
                                    {isPaused ? '⏸' : '▶'}
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Strip */}
                        {images.length > 1 && (
                            <div className="thumbnail-strip">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    >
                                        <LoadingImage
                                            src={publicService.getImageURL(img)}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="thumbnail-image"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Project Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="project-info-section"
                >
                    <div className="project-info-header">
                        <h1 className="project-title">{project.title}</h1>
                        <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                            {getStatusText(project.status)}
                        </span>
                    </div>

                    <div className="project-description">
                        <h2>Proje Hakkında</h2>
                        <p>{project.description}</p>
                    </div>

                    {/* Related Services */}
                    {project.services && project.services.length > 0 && (
                        <div className="related-services">
                            <h3>İlgili Hizmetler</h3>
                            <div className="services-tags">
                                {project.services.map((service, index) => (
                                    <span
                                        key={service.id || index}
                                        className="service-tag"
                                        onClick={() => navigate(`/hizmet/${service.id}`)}
                                    >
                                        {service.service}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </main>

            <Footer />

            {/* Lightbox */}
            <AnimatePresence>
                {isLightboxOpen && images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lightbox-overlay"
                        onClick={closeLightbox}
                    >
                        <button className="lightbox-close" onClick={closeLightbox}>
                            ×
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    className="lightbox-nav prev"
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                >
                                    ‹
                                </button>
                                <button
                                    className="lightbox-nav next"
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                >
                                    ›
                                </button>
                            </>
                        )}

                        <motion.img
                            key={currentImageIndex}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            src={publicService.getImageURL(images[currentImageIndex])}
                            alt={`${project.title} - Görsel ${currentImageIndex + 1}`}
                            className="lightbox-image"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {images.length > 1 && (
                            <div className="lightbox-counter">
                                {currentImageIndex + 1} / {images.length}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ProjectDetailPage
