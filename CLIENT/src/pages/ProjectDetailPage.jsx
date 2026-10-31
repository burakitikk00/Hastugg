import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FiChevronLeft,
    FiChevronRight,
    FiChevronDown,
    FiChevronUp,
    FiArrowLeft,
    FiMaximize2,
    FiX,
    FiLayers,
    FiCheckCircle,
    FiClock,
    FiSend,
    FiMapPin,
    FiPhone,
    FiMail,
    FiExternalLink,
    FiCalendar,
    FiCheck,
    FiShield
} from 'react-icons/fi'
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
} from 'react-icons/fa6'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import publicService from '../services/publicService'
import { getHighlightIcon, getTransportationIcon } from '../utils/projectIcons'
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics'
import './ProjectDetailPage.css'
import '../components/sections/Contact.css'

const ProjectDetailPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { trackEvent } = useGoogleAnalytics()

    const [project, setProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeSection, setActiveSection] = useState('projects')

    // Slider ve Lightbox state
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isNarrativeExpanded, setIsNarrativeExpanded] = useState(false)

    // İletişim / Teklif Terminali Formu state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        message: '',
        kvkkConsent: false
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitStatus, setSubmitStatus] = useState(null) // 'success' | 'error' | null
    const [statusMessage, setStatusMessage] = useState('')

    // DB'den dinamik iletişim bilgileri
    const [contactData, setContactData] = useState({
        address: '',
        phone: '',
        email: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        mapEmbedUrl: ''
    })
    const contactInfo = contactData
    const [workingHours, setWorkingHours] = useState([
        'Pazartesi - Cuma: 10:00 - 18:00',
        'Cumartesi: 10:00 - 15:00',
        'Pazar: Randevu ile'
    ])

    // İletişim bilgilerini veritabanından getir
    useEffect(() => {
        const fetchContact = async () => {
            try {
                const data = await publicService.getContact()
                if (Array.isArray(data) && data.length > 0) {
                    const c = data[0]
                    setContactData({
                        address: c.address || '',
                        phone: c.phone || '',
                        email: c.email || '',
                        facebook: c.facebook || '',
                        twitter: c.twitter || '',
                        instagram: c.instagram || '',
                        linkedin: c.linkedin || '',
                        mapEmbedUrl: c.mapEmbedUrl || ''
                    })
                }

                // Admin çalışma saatleri
                const storedHours = localStorage.getItem('workingHours')
                if (storedHours && typeof storedHours === 'string') {
                    const lines = storedHours.split(/\r?\n/).filter(l => l.trim().length > 0)
                    if (lines.length > 0) setWorkingHours(lines)
                }
            } catch (err) {
                console.error('İletişim bilgileri DB\'den yüklenemedi:', err)
            }
        }
        fetchContact()
    }, [])

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

    // Görsel Slider Navigasyonu
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

    // Klavye kontrolü
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

    const openLightbox = () => setIsLightboxOpen(true)
    const closeLightbox = () => setIsLightboxOpen(false)

    // Durum metni ve stili
    const getStatusText = (status) => {
        const s = (status || '').toLowerCase()
        if (s.includes('complete') || s === 'tamamlandı') return 'Tamamlandı'
        if (s.includes('progress') || s === 'devam ediyor' || s === 'inprogress') return 'Devam Ediyor'
        if (s.includes('plan')) return 'Planlama Aşamasında'
        return status || 'Portföy Projesi'
    }

    const scrollToInquiry = () => {
        const el = document.getElementById('proje-teklif')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    // İletişim Formu Input Değişimi
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        if (submitStatus) {
            setSubmitStatus(null)
            setStatusMessage('')
        }
    }

    // İletişim Formu Gönderimi
    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.kvkkConsent) {
            setSubmitStatus('error')
            setStatusMessage('Lütfen devam etmek için KVKK İletişim Aydınlatma Metni\'ni okuyup onaylayınız.')
            return
        }

        setIsSubmitting(true)
        setSubmitStatus(null)
        setStatusMessage('')

        const projectName = project?.title || 'Proje'
        const fullMessage = `[PROJE BİLGİ & TEKLİF TALEBİ: ${projectName}]\n${formData.message || `${projectName} projemizin mimari detayları ve şartnameleri hakkında bilgi almak istiyorum.`}`

        try {
            const result = await publicService.submitContact({
                firstName: formData.firstName,
                lastName: formData.lastName,
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                message: fullMessage,
                kvkkConsent: formData.kvkkConsent
            })

            setSubmitStatus('success')
            setStatusMessage(result.message || 'Talebiniz başarıyla kaydedildi. Mimari ekibimiz en kısa sürede size dönüş yapacaktır.')
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                message: '',
                kvkkConsent: false
            })

            if (trackEvent) {
                trackEvent('form_submit', 'project_inquiry', projectName, 1)
            }
        } catch (err) {
            console.error('Proje talep formu gönderim hatası:', err)
            setSubmitStatus('error')
            setStatusMessage(err.message || 'Talebiniz gönderilirken bir hata oluştu. Lütfen doğrudan telefon veya e-posta ile iletişime geçiniz.')
        } finally {
            setIsSubmitting(false)
        }
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
                                <button onClick={() => navigate('/#projects')} className="action-btn-primary">
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
    const isCompleted = (project.status || '').toLowerCase().includes('complete') || (project.status || '') === 'Tamamlandı'

    // Alan Biçimlendirme Yardımcısı (örn: 18500 -> 18.500 m²)
    const formatArea = (val) => {
        if (!val) return ''
        const str = String(val).trim()
        const digitsOnly = str.replace(/\D/g, '')
        if (digitsOnly.length > 0) {
            return `${Number(digitsOnly).toLocaleString('tr-TR')} m²`
        }
        return str
    }

    // Dizi alanlarını güvenli parse etme
    const parseProjectArray = (val) => {
        if (Array.isArray(val)) return val
        if (typeof val === 'string' && val.trim()) {
            try {
                const parsed = JSON.parse(val)
                if (Array.isArray(parsed)) return parsed
            } catch (e) {
                return []
            }
        }
        return []
    }

    // Google Maps Embed Iframe URL'sini temizle ve ayıkla (kullanıcı komple iframe kodu veya tırnaklı metin yapıştırsa dahi)
    const cleanMapEmbedUrl = (raw) => {
        if (!raw) return null
        let url = String(raw).trim()
        if (!url) return null
        if (url.startsWith('<iframe')) {
            const match = url.match(/src=["']([^"']+)["']/i)
            if (match && match[1]) url = match[1]
        }
        if (url.includes('"')) {
            url = url.split('"')[0]
        }
        if (url.includes("'")) {
            url = url.split("'")[0]
        }
        url = url.trim()
        return url && url.startsWith('http') ? url : null
    }

    // Öne Çıkan Özellikler - SADECE veritabanında girilenler gösterilir; girilmediyse bölüm gizlenir
    const rawHighlights = parseProjectArray(project.highlights)
    const highlights = rawHighlights.filter(h => h && (h.title?.trim() || h.description?.trim()))

    // Konum ve Ulaşım Noktaları - Sadece girildiyse gösterilir
    const rawTransportation = parseProjectArray(project.transportation)
    const transportation = rawTransportation.filter(t => t && (t.title?.trim() || t.description?.trim()))

    // Harita Bilgisi - SADECE harita alanlarına veri girilmişse oluşturulur (genel proje konumu harita yerine geçmez!)
    const directEmbedUrl = cleanMapEmbedUrl(project.map_embed_url)
    const hasMapAddress = Boolean(project.map_address?.trim())
    const mapEmbedSrc = directEmbedUrl || (hasMapAddress ? `https://maps.google.com/maps?q=${encodeURIComponent(project.map_address.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed` : null)

    // Haritaya bir veri girilmemişse harita alanı kullanıcıya kesinlikle görünmeyecek
    const hasMap = Boolean(mapEmbedSrc)
    const hasTransit = transportation.length > 0
    const showLocationSection = hasMap || hasTransit

    // Proje Açıklaması Paragrafları - Sadece girilmişse gösterilir
    const narrativeParagraphs = project.description
        ? project.description.split('\n').map(p => p.trim()).filter(Boolean)
        : []

    // Hızlı Özet Çubuğu için SADECE girilmiş olan alanlar
    const keyFacts = [
        project.category?.trim() && { label: 'Kategori', value: project.category, isMono: false },
        project.location?.trim() && { label: 'Konum', value: project.location, isMono: false },
        project.total_area 
            ? { label: 'Toplam İnşaat Alanı', value: formatArea(project.total_area), isMono: true }
            : (project.land_area ? { label: 'Arsa Alanı', value: formatArea(project.land_area), isMono: true } : null),
        project.delivery_date?.trim() && { label: 'Teslim Tarihi', value: project.delivery_date, isMono: true }
    ].filter(Boolean)

    const showKeyFactsBar = keyFacts.length > 1 || (keyFacts.length === 1 && keyFacts[0].label !== 'Kategori')

    return (
        <div className="project-detail-page">
            <Header activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="project-detail-main">
                {/* 1. Üst Navigasyon & Breadcrumb & Aksiyon Başlığı */}
                <div className="project-top-nav">
                    <button
                        onClick={() => navigate('/#projects')}
                        className="back-nav-button"
                        aria-label="Tüm projelere dön"
                    >
                        <FiArrowLeft className="back-icon" />
                        <span className="back-btn-text-full">Projeler Portföyüne Dön</span>
                        <span className="back-btn-text-short">Projeler</span>
                    </button>

                    <div className="breadcrumb-nav">
                        <span 
                            onClick={() => navigate('/#projects')}
                            style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
                            className="breadcrumb-cat"
                            title="Tüm projelere git"
                        >
                            Projeler
                        </span>
                        {project.category && (
                            <>
                                <span className="breadcrumb-sep">/</span>
                                <span className="breadcrumb-cat">{project.category}</span>
                            </>
                        )}
                        <span className="breadcrumb-sep breadcrumb-sep-current">/</span>
                        <span className="breadcrumb-current">{project.title}</span>
                    </div>
                </div>

                {/* 2. Proje Başlık & Durum Rozeti & Hızlı CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="project-hero-header"
                >
                    <div className="hero-header-left">
                        <div className="status-badge-container">
                            <span className={`blueprint-status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                                <span className="status-pulse-dot"></span>
                                {isCompleted ? (
                                    <>Tamamlandı {project.delivery_date ? `(${project.delivery_date} Teslim)` : ''}</>
                                ) : (
                                    <>Devam Ediyor {project.delivery_date ? `(${project.delivery_date} Hedef)` : ''}</>
                                )}
                            </span>
                            {project.category && (
                                <span className="category-pill-tag">
                                    {project.category}
                                </span>
                            )}
                        </div>

                        <h1 className="project-main-title">{project.title}</h1>

                        {project.location && (
                            <p className="project-location-subline">
                                <FiMapPin className="pin-icon" />
                                <span>{project.location}</span>
                            </p>
                        )}
                    </div>

                    <div className="hero-header-right">
                        <button
                            type="button"
                            onClick={scrollToInquiry}
                            className="btn-quick-inquiry"
                        >
                            <FiSend className="btn-icon" />
                            <span>Proje Hakkında Bilgi Al</span>
                        </button>
                    </div>
                </motion.div>

                {/* 3. Hızlı Özet Çubuğu (Key Facts Bar) - Sadece anlamlı girilen alanlar gösterilir */}
                {showKeyFactsBar && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="key-facts-bar"
                        style={{
                            gridTemplateColumns: `repeat(${Math.min(keyFacts.length, 4)}, minmax(0, 1fr))`
                        }}
                    >
                        {keyFacts.map((fact, fIdx) => (
                            <div key={fIdx} className="key-fact-col">
                                <span className="fact-label">{fact.label}</span>
                                <span className={`fact-value ${fact.isMono ? 'mono-val' : ''}`}>{fact.value}</span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 4. Donanım Hızlandırmalı Görsel Galerisi & Slider */}
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                        className="image-slider-section"
                    >
                        <div className="slider-container">
                            {/* Önceki ve Sonraki Butonları */}
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

                            {/* GPU Hızlandırmalı Ray */}
                            <div
                                className="slider-track-container"
                                onClick={openLightbox}
                                role="button"
                                tabIndex={0}
                                aria-label="Görseli tam ekran büyüt"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') openLightbox()
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
                                                alt={`${project.title} - Mimari Görsel ${idx + 1}`}
                                                className="slider-image"
                                                loading={idx === 0 ? "eager" : "lazy"}
                                                decoding="async"
                                                draggable={false}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="fullscreen-hint">
                                    <FiMaximize2 className="fullscreen-icon" />
                                    <span>Tam Ekran İncele</span>
                                </div>
                            </div>

                            {/* Görsel Sayaç Rozeti */}
                            {images.length > 1 && (
                                <div className="image-counter">
                                    <span className="counter-current">{String(currentImageIndex + 1).padStart(2, '0')}</span>
                                    <span className="counter-separator">/</span>
                                    <span className="counter-total">{String(images.length).padStart(2, '0')}</span>
                                </div>
                            )}
                        </div>

                        {/* Küçük Görseller Rayı (Centered Thumbnail Strip) */}
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

                {/* 5. Proje Hakkında & Proje Künyesi Grid */}
                <section className="project-narrative-spec-grid">
                    {/* Sol Kolon: Mimari Anlatım */}
                    <div className="narrative-col">
                        <div className="section-title-wrap">
                            <span className="blueprint-tag">PROJE HAKKINDA</span>
                            <h2 className="section-main-heading">
                                Sürdürülebilir ve Yaşam Odaklı Mimari Tasarım
                            </h2>
                        </div>

                        <div className="narrative-text-flow">
                            {(isNarrativeExpanded || narrativeParagraphs.length <= 2
                                ? narrativeParagraphs
                                : narrativeParagraphs.slice(0, 2)
                            ).map((paragraph, pIdx) => (
                                <p key={pIdx} className="narrative-p">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {narrativeParagraphs.length > 2 && (
                            <button
                                type="button"
                                onClick={() => setIsNarrativeExpanded(!isNarrativeExpanded)}
                                className="btn-toggle-narrative"
                            >
                                <span>{isNarrativeExpanded ? 'Daha Az Göster' : `Devamını Oku (${narrativeParagraphs.length - 2} Paragraf daha)`}</span>
                                {isNarrativeExpanded ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                        )}

                        {/* İlgili Hizmetler & Uzmanlık Etiketleri */}
                        {project.services && project.services.length > 0 && (
                            <div className="project-services-block">
                                <div className="block-header">
                                    <FiLayers className="block-icon" />
                                    <h4 className="block-title">Uygulanan Uzmanlık Alanları</h4>
                                </div>
                                <div className="services-tag-list">
                                    {project.services.map((service, sIdx) => (
                                        <button
                                            key={service.id || sIdx}
                                            type="button"
                                            className="spec-service-chip"
                                            onClick={() => navigate(`/hizmet/${service.id}`)}
                                            title={`${service.service} detayını incele`}
                                        >
                                            <span>{service.service}</span>
                                            <FiChevronRight className="chip-chevron" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sağ Kolon: Proje Künyesi (Temel Teknik Bilgiler Kartı) */}
                    <div className="spec-card-col">
                        <div className="project-spec-card">
                            <div className="spec-card-header">
                                <span className="blueprint-tag">PROJE KÜNYESİ</span>
                                <h3 className="spec-card-title">Temel Bilgiler</h3>
                            </div>

                            <div className="spec-rows-list">
                                {project.client?.trim() && (
                                    <div className="spec-row">
                                        <span className="row-label">İşveren / Yatırımcı</span>
                                        <span className="row-value">{project.client}</span>
                                    </div>
                                )}

                                {project.location?.trim() && (
                                    <div className="spec-row">
                                        <span className="row-label">Lokasyon</span>
                                        <span className="row-value">{project.location}</span>
                                    </div>
                                )}

                                {project.category?.trim() && (
                                    <div className="spec-row">
                                        <span className="row-label">Proje Tipi</span>
                                        <span className="row-value">{project.category}</span>
                                    </div>
                                )}

                                {project.land_area && (
                                    <div className="spec-row">
                                        <span className="row-label">Arsa Alanı</span>
                                        <span className="row-value mono-val">{formatArea(project.land_area)}</span>
                                    </div>
                                )}

                                {project.total_area && (
                                    <div className="spec-row">
                                        <span className="row-label">Toplam İnşaat Alanı</span>
                                        <span className="row-value mono-val">{formatArea(project.total_area)}</span>
                                    </div>
                                )}

                                {project.services && project.services.length > 0 && (
                                    <div className="spec-row">
                                        <span className="row-label">Hizmet Kapsamı</span>
                                        <span className="row-value">
                                            {project.services.map(s => s.service).join(', ')}
                                        </span>
                                    </div>
                                )}

                                {project.delivery_date?.trim() && (
                                    <div className="spec-row">
                                        <span className="row-label">Teslim Tarihi</span>
                                        <span className="row-value mono-val">{project.delivery_date}</span>
                                    </div>
                                )}

                                {project.project_year?.trim() && (
                                    <div className="spec-row">
                                        <span className="row-label">Proje Dönemi</span>
                                        <span className="row-value mono-val">{project.project_year}</span>
                                    </div>
                                )}

                                <div className="spec-row">
                                    <span className="row-label">Durum</span>
                                    <span className="row-value status-indicator">
                                        <span className={`dot ${isCompleted ? 'green' : 'amber'}`}></span>
                                        {getStatusText(project.status)}
                                    </span>
                                </div>
                            </div>

                            <div className="spec-card-action">
                                <button
                                    type="button"
                                    onClick={scrollToInquiry}
                                    className="btn-spec-inquiry"
                                >
                                    <FiSend className="icon" />
                                    <span>Bu Proje Hakkında Görüşün</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Öne Çıkan Özellikler (Highlights Grid) - Sadece veri varsa gösterilir */}
                {highlights.length > 0 && (
                    <section className="project-highlights-section">
                        <div className="section-title-wrap">
                            <span className="blueprint-tag">MİMARİ NİTELİKLER</span>
                            <h2 className="section-main-heading">Öne Çıkan Özellikler</h2>
                            <p className="section-lead-text">
                                Projenin kullanıcı konforunu, estetik algısını ve yapısal güvenliğini en üst düzeye çıkaran mimari detaylar.
                            </p>
                        </div>

                        <div className="highlights-grid">
                            {highlights.map((item, hIdx) => {
                                const IconComponent = getHighlightIcon(item.icon)
                                return (
                                    <div key={item.id || hIdx} className="highlight-card">
                                        <div className="highlight-icon-wrap">
                                            <IconComponent className="h-icon" />
                                        </div>
                                        <div className="highlight-text-wrap">
                                            <h3 className="highlight-title">{item.title}</h3>
                                            <p className="highlight-desc">{item.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* 7. Konum ve Ulaşım Kolaylığı - Sadece veri varsa gösterilir */}
                {showLocationSection && (
                    <section className="project-location-section">
                        <div className="section-title-wrap">
                            <span className="blueprint-tag">LOKASYON & ÇEVRE</span>
                            <h2 className="section-main-heading">Konum ve Ulaşım Kolaylığı</h2>
                            <p className="section-lead-text">
                                Merkezi arterlere doğrudan bağlantı noktasıyla şehir içi erişimi kolaylaştıran konum avantajı.
                            </p>
                        </div>

                        <div className={`location-grid ${!hasTransit ? 'single-col' : !hasMap ? 'single-col' : ''}`}>
                            {/* Harita Kolonu - Sadece harita verisi girilmişse görünür */}
                            {hasMap && mapEmbedSrc && (
                                <div className="map-view-card">
                                    <div className="map-iframe-container">
                                        <iframe
                                            src={mapEmbedSrc}
                                            title={`${project.title} Konumu`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Ulaşım Noktaları Kolonu */}
                            {hasTransit && (
                                <div className="transit-points-card">
                                    <h3 className="transit-card-title">Ulaşım Noktaları</h3>

                                    <div className="transit-list">
                                        {transportation.map((trans, tIdx) => {
                                            const TransIcon = getTransportationIcon(trans.icon)
                                            return (
                                                <div key={trans.id || tIdx} className="transit-item">
                                                    <div className="transit-icon-box">
                                                        <TransIcon className="t-icon" />
                                                    </div>
                                                    <div className="transit-info">
                                                        <h4 className="transit-name">{trans.title}</h4>
                                                        {trans.description?.trim() && (
                                                            <span className="transit-distance">{trans.description}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {(project.map_address?.trim() || project.location?.trim()) && (
                                        <div className="transit-card-footer">
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.map_address?.trim() || project.location?.trim())}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-open-maps"
                                            >
                                                <FiExternalLink className="maps-icon" />
                                                <span>Google Haritalar'da Görüntüle</span>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                )}
                {/* 8. Proje İletişim & Talep Formu (CONTACT HUD) */}
                <section id="proje-teklif" className="contact-section-container project-inquiry-section" aria-label="Proje Teklif ve İletişim">
                    {/* Arka Plan Mimari Işıma */}
                    <div className="contact-ambient-glow" aria-hidden="true" />

                    <div className="contact-inner-wrapper">
                        {/* Üst Başlık & Açıklama */}
                        <div className="contact-top-bar">
                            <h2 className="contact-main-title">
                                {project.title} İçin Bilgi ve Teklif Alın
                            </h2>
                            <p className="contact-subtext">
                                "{project.title}" projemizin mimari detayları, kat planları veya benzeri taahhüt talepleriniz için formu doldurabilir ya da teknik ekibimizle doğrudan iletişime geçebilirsiniz.
                            </p>
                        </div>

                        <div className="contact-grid-layout">
                            {/* Sol Kolon: Mimari Teklif Terminali (contact-terminal-card) */}
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
                                            <label htmlFor="project-contact-firstName" className="form-field-label">
                                                Adınız *
                                            </label>
                                            <input
                                                id="project-contact-firstName"
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
                                            <label htmlFor="project-contact-lastName" className="form-field-label">
                                                Soyadınız *
                                            </label>
                                            <input
                                                id="project-contact-lastName"
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
                                            <label htmlFor="project-contact-email" className="form-field-label">
                                                E-posta Adresiniz *
                                            </label>
                                            <input
                                                id="project-contact-email"
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
                                            <label htmlFor="project-contact-phone" className="form-field-label">
                                                Telefon Numaranız *
                                            </label>
                                            <input
                                                id="project-contact-phone"
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
                                        <label htmlFor="project-contact-message" className="form-field-label">
                                            Proje Açıklaması & Teknik İhtiyaçlarınız *
                                        </label>
                                        <textarea
                                            id="project-contact-message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder={`"${project.title}" projesi hakkında bilgi almak istediğiniz kat planı, teknik şartname veya randevu talebinizi yazınız...`}
                                            rows={4}
                                            className="terminal-textarea"
                                            required
                                        />
                                    </div>

                                    {/* KVKK Aydınlatma & Açık Rıza Onay Kutusu */}
                                    <div className="contact-kvkk-group">
                                        <label className="kvkk-checkbox-label">
                                            <input
                                                id="project-contact-kvkkConsent"
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
                                        {contactData.address && (
                                            <li className="coordinate-item">
                                                <div className="coordinate-icon-box">
                                                    <FaLocationDot size={15} />
                                                </div>
                                                <div className="coordinate-content">
                                                    <span className="coordinate-label">GENEL MERKEZ ADRESİ</span>
                                                    <span className="coordinate-value">{contactData.address}</span>
                                                </div>
                                            </li>
                                        )}

                                        {contactData.phone && (
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
                                        )}

                                        {contactData.email && (
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
                                        )}
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

                                    {contactData.mapEmbedUrl && (
                                        <div className="map-embed-wrapper">
                                            <iframe
                                                src={contactData.mapEmbedUrl}
                                                title="Hastuğ İnşaat Genel Merkez"
                                                loading="lazy"
                                                className="map-iframe"
                                                allowFullScreen=""
                                                referrerPolicy="no-referrer-when-downgrade"
                                            />
                                            <div className="map-glass-border" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
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
