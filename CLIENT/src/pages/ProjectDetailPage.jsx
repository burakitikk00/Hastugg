import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiChevronLeft,
    FiChevronRight,
    FiArrowLeft,
    FiMaximize2,
    FiX,
    FiLayers,
    FiCheckCircle,
    FiClock,
    FiSend
} from 'react-icons/fi'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import publicService from '../services/publicService'
import './ProjectDetailPage.css'

const ProjectDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('projects')

    // Slider state - autoplay kaldırıldı (manuel kontrollü, sıfır takılma)
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true)
                const projectData = await publicService.getProjectById(id)
                setProject(projectData)
                setError(null)
            } catch (err) {
                console.error('Proje yüklenirken hata:', err)
                if (err.isRateLimit) {
                    setError({
                        type: 'rate_limit',
                        message: 'Sunucu şu an çok yoğun. Lütfen kısa bir süre bekleyip tekrar deneyiniz.'
                    })
                } else {
                    setError({
                        type: 'general',
                        message: 'Proje bilgileri yüklenirken bir hata oluştu.'
                    })
                }
            } finally {
                setLoading(false)
            }
        }

        fetchProject()
        window.scrollTo(0, 0)
    }, [id])

    // Proje görsellerini tarayıcı önbelleğine önceden yükle (Preload)
    useEffect(() => {
        if (project && project.images && project.images.length > 0) {
            project.images.forEach(img => {
                const preloadImg = new Image()
                preloadImg.src = publicService.getImageURL(img)
            })
        }
    }, [project])

    // Manuel görsel geçiş fonksiyonları
    const nextImage = useCallback(() => {
        if (!project || !project.images || project.images.length <= 1) return
        setCurrentImageIndex(prev =>
            prev === project.images.length - 1 ? 0 : prev + 1
        )
    }, [project])

    const prevImage = useCallback(() => {
        if (!project || !project.images || project.images.length <= 1) return
        setCurrentImageIndex(prev =>
            prev === 0 ? project.images.length - 1 : prev - 1
        )
    }, [project])

    // Klavye ile görsel navigasyonu ve Lightbox ESC kontrolü
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                prevImage()
            } else if (e.key === 'ArrowRight') {
                nextImage()
            } else if (e.key === 'Escape' && isLightboxOpen) {
                setIsLightboxOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [prevImage, nextImage, isLightboxOpen])

    const openLightbox = () => {
        setIsLightboxOpen(true)
    }

    const closeLightbox = () => {
        setIsLightboxOpen(false)
    }

    const getStatusText = (status) => {
        const s = (status || '').toLowerCase()
        if (s.includes('complete') || s === 'tamamlandı') return 'Tamamlandı'
        if (s.includes('progress') || s === 'devam ediyor' || s === 'inprogress') return 'Devam Ediyor'
        if (s.includes('plan')) return 'Planlama Aşamasında'
        return status || 'Portföy Projesi'
    }

    // Açıklama metnindeki teknik özellikleri (Konum:, Mimari: vb.) parse eden yardımcı
    const parseProjectDescription = (desc) => {
        if (!desc) return { specs: [], narrative: [] }
        const lines = desc.split('\n').map(l => l.trim()).filter(Boolean)
        const specs = []
        const narrative = []

        lines.forEach(line => {
            const colonIdx = line.indexOf(':')
            if (colonIdx > 0 && colonIdx < 30) {
                const label = line.slice(0, colonIdx).trim()
                const value = line.slice(colonIdx + 1).trim()
                if (value.length > 0) {
                    specs.push({ label, value })
                    return
                }
            }
            narrative.push(line)
        })

        return { specs, narrative }
    }

    if (loading) {
        return (
            <div className="project-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="project-detail-main">
                    <div className="loading-container">
                        <div className="blueprint-loading-frame">
                            <div className="loading-spinner"></div>
                            <span className="loading-blueprint-code">Yükleniyor...</span>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !project) {
        const isRateLimit = error?.type === 'rate_limit'
        return (
            <div className="project-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="project-detail-main">
                    <div className="error-container">
                        <span className="error-badge">HATA</span>
                        <h2>{isRateLimit ? 'Sunucu Yoğunluğu' : 'Proje Kaydı Bulunamadı'}</h2>
                        <p>{error?.message || 'İstediğiniz proje detaylarına şu anda ulaşılamıyor.'}</p>
                        <div className="error-actions">
                            {isRateLimit ? (
                                <button onClick={() => window.location.reload()} className="action-btn-primary">
                                    Yeniden Dene
                                </button>
                            ) : (
                                <button onClick={() => navigate('/#projeler')} className="action-btn-primary">
                                    <FiArrowLeft />
                                    <span>Tüm Projelere Dön</span>
                                </button>
                            )}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const images = project.images || []
    const isCompleted = (project.status || '').toLowerCase().includes('complete')
    const { specs, narrative } = parseProjectDescription(project.description)

    return (
        <div className="project-detail-page">
            <Header activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="project-detail-main">
                {/* Üst Navigasyon */}
                <div className="project-top-nav">
                    <button
                        onClick={() => navigate('/#projeler')}
                        className="back-nav-button"
                        aria-label="Tüm projelere dön"
                    >
                        <FiArrowLeft className="back-icon" />
                        <span>Projeler Portföyüne Dön</span>
                    </button>
                </div>

                {/* Görsel Galerisi & Slider Bölümü */}
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="image-slider-section"
                    >
                        <div className="slider-container">
                            {/* Önceki ve Sonraki Butonları - İçindeki oklar tam ortalı SVG */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        className="slider-nav prev"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            prevImage()
                                        }}
                                        aria-label="Önceki görsel"
                                    >
                                        <FiChevronLeft className="nav-arrow-icon" />
                                    </button>
                                    <button
                                        type="button"
                                        className="slider-nav next"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            nextImage()
                                        }}
                                        aria-label="Sonraki görsel"
                                    >
                                        <FiChevronRight className="nav-arrow-icon" />
                                    </button>
                                </>
                            )}

                            {/* Donanım Hızlandırmalı Kesintisiz Kayar Ray (GPU Hardware Track) */}
                            <div
                                className="slider-track-container"
                                onClick={openLightbox}
                                role="button"
                                tabIndex={0}
                                aria-label="Görseli tam ekran büyüt"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        openLightbox()
                                    }
                                }}
                            >
                                <div
                                    className="slider-track"
                                    style={{
                                        transform: `translateX(-${currentImageIndex * 100}%)`
                                    }}
                                >
                                    {images.map((img, idx) => (
                                        <div key={idx} className="slider-slide">
                                            <img
                                                src={publicService.getImageURL(img)}
                                                alt={`${project.title} - Görsel ${idx + 1}`}
                                                className="slider-image"
                                                loading={idx === 0 ? "eager" : "lazy"}
                                                decoding="async"
                                                draggable={false}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Tam Ekran İpucu */}
                                <div className="fullscreen-hint">
                                    <FiMaximize2 className="fullscreen-icon" />
                                    <span>Tam Ekran İncele</span>
                                </div>
                            </div>

                            {/* Görsel İndikatör Noktaları */}
                            {images.length > 1 && (
                                <div className="slider-indicators">
                                    {images.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            aria-label={`Görsel ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Görsel Sayaç Rozeti */}
                            {images.length > 1 && (
                                <div className="image-counter">
                                    <span className="counter-current">{String(currentImageIndex + 1).padStart(2, '0')}</span>
                                    <span className="counter-separator">/</span>
                                    <span className="counter-total">{String(images.length).padStart(2, '0')}</span>
                                </div>
                            )}
                        </div>

                        {/* Tüm Görseller Listesi / Thumbnail Strip - Tam Ortalı */}
                        {images.length > 1 && (
                            <div className="thumbnail-strip-wrapper">
                                <div className="thumbnail-strip">
                                    {images.map((img, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                            aria-label={`Görsel ${index + 1}'e geç`}
                                        >
                                            <img
                                                src={publicService.getImageURL(img)}
                                                alt={`Küçük Görsel ${index + 1}`}
                                                className="thumbnail-image"
                                                loading="eager"
                                                draggable={false}
                                            />
                                            {index === currentImageIndex && (
                                                <span className="thumbnail-active-indicator" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Proje Bilgi ve Detay Kartı */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="project-info-section"
                >
                    {/* Proje Başlığı ve Durum Rozeti */}
                    <div className="project-info-header">
                        <div className="project-title-group">
                            <h1 className="project-title">{project.title}</h1>
                        </div>

                        <div className="project-status-wrapper">
                            <span className={`status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                                {isCompleted ? <FiCheckCircle className="status-icon" /> : <FiClock className="status-icon" />}
                                {getStatusText(project.status)}
                            </span>
                        </div>
                    </div>

                    {/* Yapısal Özellikler Izgarası (Varsa) */}
                    {specs.length > 0 && (
                        <div className="project-specs-grid">
                            {specs.map((item, idx) => (
                                <div key={idx} className="spec-card">
                                    <span className="spec-label">{item.label}</span>
                                    <span className="spec-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Proje Detay Metni */}
                    {narrative.length > 0 && (
                        <div className="project-narrative-section">
                            <h2 className="section-subtitle">Proje Açıklaması</h2>
                            <div className="narrative-content">
                                {narrative.map((par, i) => (
                                    <p key={i} className="narrative-paragraph">{par}</p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* İlgili Hizmetler */}
                    {project.services && project.services.length > 0 && (
                        <div className="related-services-section">
                            <div className="services-header">
                                <FiLayers className="services-icon" />
                                <h3 className="services-title">Uygulanan Uzmanlık Alanları</h3>
                            </div>
                            <div className="services-tags">
                                {project.services.map((service, index) => (
                                    <button
                                        key={service.id || index}
                                        type="button"
                                        className="service-tag"
                                        onClick={() => navigate(`/hizmet/${service.id}`)}
                                        title={`${service.service} detaylarını görüntüle`}
                                    >
                                        <span>{service.service}</span>
                                        <FiChevronRight className="tag-chevron" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Proje İletişim & Teklif CTA */}
                    <div className="project-inquiry-cta">
                        <div className="cta-text-wrapper">
                            <h3 className="cta-headline">Benzer Bir Proje Hayata Geçirmek İster misiniz?</h3>
                            <p className="cta-subline">
                                Hastuğ İnşaat & Mimarlık teknik kadrosuyla projenize özel statik hesaplama, mimari çizim ve anahtar teslim uygulama teklifi alın.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/#iletisim')}
                            className="cta-contact-button"
                        >
                            <span>Hemen Teklif Alın</span>
                            <FiSend className="cta-icon" />
                        </button>
                    </div>
                </motion.div>
            </main>

            <Footer />

            {/* Tam Ekran Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="lightbox-overlay"
                        onClick={closeLightbox}
                    >
                        <button
                            type="button"
                            className="lightbox-close"
                            onClick={closeLightbox}
                            aria-label="Kapat"
                        >
                            <FiX className="lightbox-close-icon" />
                        </button>

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="lightbox-nav prev"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        prevImage()
                                    }}
                                    aria-label="Önceki görsel"
                                >
                                    <FiChevronLeft className="lightbox-nav-icon" />
                                </button>
                                <button
                                    type="button"
                                    className="lightbox-nav next"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        nextImage()
                                    }}
                                    aria-label="Sonraki görsel"
                                >
                                    <FiChevronRight className="lightbox-nav-icon" />
                                </button>
                            </>
                        )}

                        <div
                            className="lightbox-image-container"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                key={currentImageIndex}
                                src={publicService.getImageURL(images[currentImageIndex])}
                                alt={`${project.title} - Tam Ekran Görsel ${currentImageIndex + 1}`}
                                className="lightbox-image"
                            />
                        </div>

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
