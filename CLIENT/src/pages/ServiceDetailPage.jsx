import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiSend,
    FiPhone,
    FiMail,
    FiLayers,
    FiClock,
    FiCheckCircle,
    FiHelpCircle,
    FiChevronDown,
    FiChevronUp,
    FiArrowRight,
    FiShield,
    FiFileText,
    FiCompass,
    FiCheck,
    FiImage
} from 'react-icons/fi';
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
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingImage from '../components/common/LoadingImage';
import publicService from '../services/publicService';
import { getServiceIcon } from '../utils/serviceIcons';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import './ServiceDetailPage.css';
import '../components/sections/Contact.css';

const ServiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { trackEvent } = useGoogleAnalytics();

    const [service, setService] = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [projects, setProjects] = useState([]);
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
    const contactInfo = contactData;
    const [workingHours, setWorkingHours] = useState([
        'Pazartesi - Cuma: 10:00 - 18:00',
        'Cumartesi: 10:00 - 15:00',
        'Pazar: Randevu ile'
    ]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('services');

    // SSS Accordion state
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    // Hizmet İletişim / Teklif Terminali Formu state
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Hizmet bilgisini getir
                const serviceData = await publicService.getServiceById(id);
                setService(serviceData);

                // Tüm hizmetleri getir (Gezinti için)
                const servicesList = await publicService.getServices();
                setAllServices(Array.isArray(servicesList) ? servicesList : []);

                // Tüm projeleri getir ve bu hizmete ait olanları filtrele
                const allProjects = await publicService.getProjects();
                const filteredProjects = (Array.isArray(allProjects) ? allProjects : []).filter(project => {
                    if (!project.service_ids) return false;
                    let serviceIds = project.service_ids;
                    if (typeof serviceIds === 'string') {
                        try {
                            serviceIds = JSON.parse(serviceIds);
                        } catch {
                            return false;
                        }
                    }
                    return Array.isArray(serviceIds) && serviceIds.map(Number).includes(Number(id));
                });
                setProjects(filteredProjects);

                // İletişim ve merkez ofis bilgilerini getir
                const contactRes = await publicService.getContact();
                if (Array.isArray(contactRes) && contactRes.length > 0) {
                    const c = contactRes[0];
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

                // Admin çalışma saatleri
                const storedHours = localStorage.getItem('workingHours');
                if (storedHours && typeof storedHours === 'string') {
                    const lines = storedHours.split(/\r?\n/).filter(l => l.trim().length > 0);
                    if (lines.length > 0) setWorkingHours(lines);
                }

                setError(null);
            } catch (err) {
                console.error('Hizmet verisi yüklenirken hata:', err);
                if (err.isRateLimit) {
                    setError({
                        type: 'rate_limit',
                        message: 'Sunucu şu an çok yoğun. Lütfen kısa bir süre sonra tekrar deneyiniz.'
                    });
                } else {
                    setError({
                        type: 'general',
                        message: 'İstediğiniz hizmet bilgisi yüklenirken bir hata oluştu veya hizmet bulunamadı.'
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleProjectClick = (projectId) => {
        navigate(`/proje/${projectId}`);
    };

    const scrollToInquiry = () => {
        const el = document.getElementById('hizmet-teklif');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // İletişim Formu Input Değişimi
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        if (submitStatus) {
            setSubmitStatus(null);
            setStatusMessage('');
        }
    };

    // İletişim Formu Gönderimi
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.kvkkConsent) {
            setSubmitStatus('error');
            setStatusMessage("Lütfen devam etmek için İletişim Formu Aydınlatma Metni'ni okuyup onaylayınız.");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);
        setStatusMessage('');

        const serviceName = service?.service || service?.title || 'Hizmet';
        const fullMessage = `[HİZMET DANIŞMANLIK & TEKLİF TALEBİ: ${serviceName}]\n${formData.message || `${serviceName} kapsamında fizibilite ve teknik danışmanlık talep ediyorum.`}`;

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
            });

            setSubmitStatus('success');
            setStatusMessage(result.message || 'Talebiniz başarıyla kaydedildi. Teknik ekibimiz en kısa sürede sizinle iletişime geçecektir.');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                message: '',
                kvkkConsent: false
            });

            if (trackEvent) {
                trackEvent('form_submit', 'service_inquiry', serviceName, 1);
            }
        } catch (err) {
            console.error('Hizmet teklif formu hatası:', err);
            setSubmitStatus('error');
            setStatusMessage(err.message || 'Talebiniz gönderilirken bir hata oluştu. Lütfen doğrudan telefon veya e-posta ile iletişime geçiniz.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleFaq = (index) => {
        setOpenFaqIndex(prev => prev === index ? -1 : index);
    };

    if (loading) {
        return (
            <div className="service-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="service-detail-main">
                    <div className="service-loading-container">
                        <div className="service-blueprint-spinner"></div>
                        <span className="service-loading-code">HİZMET DÖKÜMÜ YÜKLENİYOR...</span>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !service) {
        const isRateLimit = error?.type === 'rate_limit';
        return (
            <div className="service-detail-page">
                <Header activeSection={activeSection} onSectionChange={setActiveSection} />
                <main className="service-detail-main">
                    <div className="service-error-container">
                        <span className="service-error-badge">KAYIT BULUNAMADI</span>
                        <h2>{isRateLimit ? 'Sunucu Yoğunluğu' : 'Hizmet Bilgisine Ulaşılamadı'}</h2>
                        <p>{error?.message || 'İncelemek istediğiniz hizmet kaydı silinmiş veya yayından kaldırılmış olabilir.'}</p>
                        <div className="service-error-actions">
                            <button onClick={() => navigate('/#services')} className="btn-service-back">
                                <FiArrowLeft />
                                <span>Tüm Hizmetlerimize Dön</span>
                            </button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // JSONB alanlarını güvenli şekilde parse et
    const scopeTags = Array.isArray(service.scope_tags) ? service.scope_tags : [];
    const deliverables = Array.isArray(service.deliverables) ? service.deliverables : [];
    const processSteps = Array.isArray(service.process_steps) ? service.process_steps : [];
    const features = Array.isArray(service.features) ? service.features : [];
    const faqs = Array.isArray(service.faqs) ? service.faqs : [];

    const ServiceIcon = getServiceIcon(service.icon);

    // Kapsamlı metin paragrafları
    const narrativeText = service.detailed_description || service.description || '';
    const narrativeParagraphs = narrativeText
        .split('\n')
        .map(p => p.trim())
        .filter(Boolean);

    // Diğer hizmetler (Bu hizmet hariç)
    const otherServices = allServices.filter(s => Number(s.id) !== Number(service.id));

    return (
        <div className="service-detail-page">
            <Header activeSection={activeSection} onSectionChange={setActiveSection} />

            <main className="service-detail-main">
                {/* 1. ÜST NAVİGASYON & BREADCRUMB */}
                <div className="service-top-nav">
                    <button
                        onClick={() => navigate('/#services')}
                        className="service-back-button"
                        aria-label="Tüm hizmetlere dön"
                    >
                        <FiArrowLeft className="back-icon" />
                        <span>Hizmetlerimize Dön</span>
                    </button>

                    <nav className="service-breadcrumbs" aria-label="Sayfa Konumu">
                        <span onClick={() => navigate('/')} className="crumb-link">Anasayfa</span>
                        <span className="crumb-sep">/</span>
                        <span onClick={() => navigate('/#services')} className="crumb-link">Hizmetlerimiz</span>
                        {service.category && (
                            <>
                                <span className="crumb-sep">/</span>
                                <span className="crumb-cat">{service.category}</span>
                            </>
                        )}
                        <span className="crumb-sep">/</span>
                        <span className="crumb-current">{service.service}</span>
                    </nav>
                </div>

                {/* 2. HERO BÖLÜMÜ (BAŞLIK, ETİKETLER & AKSİYONLAR) */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="service-hero-header"
                >
                    <div className="hero-header-left">
                        <div className="service-badge-strip">
                            {service.stamp && (
                                <span className="service-stamp-badge">
                                    <span className="stamp-pulse-dot" />
                                    {service.stamp}
                                </span>
                            )}
                            {service.category && (
                                <span className="service-category-tag">
                                    {service.category}
                                </span>
                            )}
                        </div>

                        <h1 className="service-main-title">{service.service}</h1>

                        <p className="service-summary-lead">
                            {service.short_description || service.description}
                        </p>
                    </div>

                    <div className="hero-header-right">
                        <button
                            type="button"
                            onClick={scrollToInquiry}
                            className="btn-service-inquiry"
                        >
                            <FiSend className="btn-icon" />
                            <span>Hizmet Teklifi Al</span>
                        </button>

                        {contactData.phone && (
                            <a
                                href={`tel:${contactData.phone.replace(/\s+/g, '')}`}
                                className="btn-service-call"
                                title="Doğrudan Danışmanlık Hattı"
                            >
                                <FiPhone className="btn-icon" />
                                <span>{contactData.phone}</span>
                            </a>
                        )}
                    </div>
                </motion.section>

                {/* 3. KEY FACTS / MİMARİ MATRİS ŞERİDİ */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="service-matrix-bar"
                >
                    <div className="matrix-item">
                        <span className="matrix-label">HİZMET KATEGORİSİ</span>
                        <span className="matrix-value">{service.category || 'Mimarlık & Mühendislik'}</span>
                    </div>
                    <div className="matrix-item">
                        <span className="matrix-label">SÜREÇ ADIMI</span>
                        <span className="matrix-value font-mono">{processSteps.length > 0 ? `${processSteps.length} Aşama` : '5 Aşamalı'}</span>
                    </div>
                    <div className="matrix-item">
                        <span className="matrix-label">RESMİ ÇIKTILAR</span>
                        <span className="matrix-value font-mono">{deliverables.length > 0 ? `${deliverables.length} Teslimat` : 'Tam Set'}</span>
                    </div>
                    <div className="matrix-item">
                        <span className="matrix-label">İLİŞKİLİ PROJE</span>
                        <span className="matrix-value font-mono">{projects.length > 0 ? `${projects.length} Proje` : 'Portfolyoda'}</span>
                    </div>
                </motion.div>

                {/* 4. ANA GÖRSEL & DETAYLI AÇIKLAMA (İKİ KOLONLU MİMARİ GRID) */}
                <section className="service-overview-section">
                    <div className="overview-image-col">
                        <div className="service-cover-frame">
                            <LoadingImage
                                src={service.url ? publicService.getImageURL(service.url) : null}
                                alt={service.service}
                                className="service-cover-image"
                                blurWhileLoading={true}
                                showLoadingSpinner={true}
                            />

                        </div>

                        {/* Kapsam Etiketleri (Scope Tags) */}
                        {scopeTags.length > 0 && (
                            <div className="service-tags-box">
                                <span className="tags-box-label">TEKNİK KAPSAM ETİKETLERİ:</span>
                                <div className="service-tags-cloud">
                                    {scopeTags.map((tag, idx) => (
                                        <span key={idx} className="scope-tag-pill">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="overview-content-col">
                        <div className="blueprint-section-badge">
                            <span className="bp-badge-text">METODOLOJİ & STANDARTLAR</span>
                        </div>

                        <h2 className="overview-heading">Hizmet Kapsamı & Mimari Yaklaşımımız</h2>

                        <div className="overview-paragraphs">
                            {narrativeParagraphs.map((para, idx) => (
                                <p key={idx} className="overview-para">
                                    {para}
                                </p>
                            ))}
                        </div>

                        {/* Teknik Üstünlükler (Features) */}
                        {features.length > 0 && (
                            <div className="service-features-list">
                                {features.map((feat, fIdx) => (
                                    <div key={fIdx} className="service-feature-card">
                                        <div className="feature-icon-box">
                                            <FiCheckCircle className="feat-icon" />
                                        </div>
                                        <div className="feature-text">
                                            <h4 className="feature-title">{feat.title}</h4>
                                            <p className="feature-desc">{feat.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. AŞAMA AŞAMA İŞ AKIŞI YOL HARİTASI (PROCESS ROADMAP) */}
                {processSteps.length > 0 && (
                    <section className="service-process-section">
                        <div className="section-header-centered">
                            <span className="blueprint-tag">ÇALIŞMA DİSİPLİNİ</span>
                            <h2 className="section-main-heading">5 Aşamalı Mühendislik Metodolojisi</h2>
                            <p className="section-sub-desc">
                                Projelerimizde şeffaflık, zamanında teslim ve mevzuat uyumu için uyguladığımız kronolojik süreç adımları.
                            </p>
                        </div>

                        <div className="process-steps-grid">
                            {processSteps.map((step, idx) => (
                                <div key={idx} className="process-step-card">
                                    <div className="step-header">
                                        <span className="step-number">0{step.step || idx + 1}</span>
                                        {step.duration && (
                                            <span className="step-duration">{step.duration}</span>
                                        )}
                                    </div>
                                    <h3 className="step-title">{step.title}</h3>
                                    <p className="step-desc">{step.description}</p>
                                    <div className="step-corner-mark" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 6. TESLİM EDİLEN BELGELER VE ÇIKTILAR (DELIVERABLES GRID) */}
                {deliverables.length > 0 && (
                    <section className="service-deliverables-section">
                        <div className="section-header-centered">
                            <span className="blueprint-tag">PROJE ÇIKTILARI</span>
                            <h2 className="section-main-heading">Hizmet Kapsamında Teslim Edilenler</h2>
                            <p className="section-sub-desc">
                                Süreç tamamlandığında işverene ve ilgili resmi kurumlara teslim edilen onaylı döküman seti.
                            </p>
                        </div>

                        <div className="deliverables-grid">
                            {deliverables.map((deliv, dIdx) => (
                                <div key={dIdx} className="deliverable-card">
                                    <div className="deliv-icon-wrapper">
                                        <FiFileText size={22} />
                                    </div>
                                    <div className="deliv-body">
                                        <h3 className="deliv-title">{deliv.title}</h3>
                                        <p className="deliv-desc">{deliv.description}</p>
                                    </div>
                                    <div className="deliv-status-pill">
                                        <FiCheck size={11} />
                                        <span>EKSİKSİZ TESLİMAT</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* 7. İLGİLİ PROJELER VİTRİNİ (RELATED PROJECTS) */}
                {projects.length > 0 && (
                    <section className="service-projects-section">
                        <div className="section-header-left">
                            <span className="blueprint-tag">UYGULAMA REFERANSLARI</span>
                            <h2 className="section-main-heading">
                                {service.service} Projelerimiz
                            </h2>
                            <p className="section-sub-desc">
                                Bu hizmet disiplini kapsamında tamamlanan ve devam eden seçkin portfolyo çalışmalarımız.
                            </p>
                        </div>

                        <div className="service-projects-grid">
                            {projects.map((proj, pIdx) => {
                                const isCompleted = (proj.status || '').toLowerCase().includes('complete') || proj.status === 'Tamamlandı';
                                return (
                                    <motion.div
                                        key={proj.id || pIdx}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: pIdx * 0.08 }}
                                        className="service-project-card"
                                        onClick={() => handleProjectClick(proj.id)}
                                    >
                                        <div className="proj-thumb-frame">
                                            <LoadingImage
                                                src={publicService.getImageURL(proj.url)}
                                                alt={proj.title}
                                                className="proj-thumbnail"
                                                blurWhileLoading={true}
                                                showLoadingSpinner={false}
                                            />
                                            <span className={`proj-status-badge ${isCompleted ? 'completed' : 'in-progress'}`}>
                                                {isCompleted ? 'Tamamlandı' : 'Devam Ediyor'}
                                            </span>
                                        </div>

                                        <div className="proj-info">
                                            {proj.category && (
                                                <span className="proj-category">{proj.category}</span>
                                            )}
                                            <h3 className="proj-title">{proj.title}</h3>
                                            {proj.location && (
                                                <p className="proj-location">{proj.location}</p>
                                            )}
                                            <div className="proj-action-link">
                                                <span>Projeyi İncele</span>
                                                <FiArrowRight />
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 8. SIKÇA SORULAN SORULAR (FAQS ACCORDION) */}
                {faqs.length > 0 && (
                    <section className="service-faqs-section">
                        <div className="section-header-centered">
                            <span className="blueprint-tag">MERAK EDİLENLER</span>
                            <h2 className="section-main-heading">Sıkça Sorulan Sorular</h2>
                            <p className="section-sub-desc">
                                {service.service} süreci hakkında işverenlerimizin en çok yönelttiği sorular ve yanıtları.
                            </p>
                        </div>

                        <div className="faqs-accordion-container">
                            {faqs.map((faq, fIdx) => {
                                const isOpen = openFaqIndex === fIdx;
                                return (
                                    <div key={fIdx} className={`faq-accordion-item ${isOpen ? 'active' : ''}`}>
                                        <button
                                            type="button"
                                            onClick={() => toggleFaq(fIdx)}
                                            className="faq-question-btn"
                                            aria-expanded={isOpen}
                                        >
                                            <span className="faq-question-text">{faq.question}</span>
                                            <span className="faq-toggle-icon">
                                                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
                                            </span>
                                        </button>

                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.25 }}
                                                    className="faq-answer-wrapper"
                                                >
                                                    <p className="faq-answer-text">{faq.answer}</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 9. DİĞER HİZMETLERİMİZİ KEŞFEDİN */}
                {otherServices.length > 0 && (
                    <section className="other-services-section">
                        <div className="section-header-left">
                            <span className="blueprint-tag">PORTFOLYO KAPSAMI</span>
                            <h2 className="section-main-heading">Diğer Hizmet Kalemlerimiz</h2>
                        </div>

                        <div className="other-services-grid">
                            {otherServices.map((other, oIdx) => {
                                const OtherIcon = getServiceIcon(other.icon);
                                return (
                                    <div
                                        key={other.id || oIdx}
                                        className="other-service-card"
                                        onClick={() => {
                                            navigate(`/hizmet/${other.id}`);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                    >
                                        <div className="other-card-top">
                                            <div className="other-icon-wrap">
                                                <OtherIcon size={20} />
                                            </div>
                                            <span className="other-cat">{other.category || 'Mimarlık'}</span>
                                        </div>
                                        <h3 className="other-title">{other.service}</h3>
                                        <p className="other-desc">
                                            {other.short_description || other.description}
                                        </p>
                                        <div className="other-link">
                                            <span>İncele</span>
                                            <FiArrowRight />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 10. DOĞRUDAN HİZMET DANIŞMANLIK & TEKLİF FORMU (CONTACT HUD) - EN ALT */}
                <section id="hizmet-teklif" className="contact-section-container service-inquiry-section" aria-label="Hizmet Teklif ve İletişim">
                    {/* Arka Plan Mimari Işıma */}
                    <div className="contact-ambient-glow" aria-hidden="true" />

                    <div className="contact-inner-wrapper">
                        {/* Üst Başlık & Açıklama */}
                        <div className="contact-top-bar">
                            <h2 className="contact-main-title">
                                {service.service || service.title} İçin Bilgi ve Teklif Alın
                            </h2>
                            <p className="contact-subtext">
                                "{service.service || service.title}" hizmetimizin mimari detayları, teknik şartnameleri veya benzeri taahhüt talepleriniz için formu doldurabilir ya da teknik ekibimizle doğrudan iletişime geçebilirsiniz.
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
                                    <h3 className="terminal-title">Hizmet Brifinginizi İletin</h3>
                                    <p className="terminal-subtext">
                                        Uzman mühendislerimiz ve mimarlarımız talebinizi inceleyerek en geç 24 saat içinde fizibilite dönüşü sağlayacaktır.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="contact-terminal-form" noValidate>
                                    {/* İsim & Soyisim Satırı */}
                                    <div className="form-input-row">
                                        <div className="form-field-group">
                                            <label htmlFor="service-contact-firstName" className="form-field-label">
                                                Adınız *
                                            </label>
                                            <input
                                                id="service-contact-firstName"
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
                                            <label htmlFor="service-contact-lastName" className="form-field-label">
                                                Soyadınız *
                                            </label>
                                            <input
                                                id="service-contact-lastName"
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
                                            <label htmlFor="service-contact-email" className="form-field-label">
                                                E-posta Adresiniz *
                                            </label>
                                            <input
                                                id="service-contact-email"
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
                                            <label htmlFor="service-contact-phone" className="form-field-label">
                                                Telefon Numaranız *
                                            </label>
                                            <input
                                                id="service-contact-phone"
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
                                        <label htmlFor="service-contact-message" className="form-field-label">
                                            Proje Açıklaması & Teknik İhtiyaçlarınız *
                                        </label>
                                        <textarea
                                            id="service-contact-message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder={`"${service.service || service.title}" hizmeti kapsamında yapı/arsa durumu, lokasyon, tahmini metrekare ve teknik beklentilerinizi yazınız...`}
                                            rows={4}
                                            className="terminal-textarea"
                                            required
                                        />
                                    </div>

                                    {/* KVKK Aydınlatma & Açık Rıza Onay Kutusu */}
                                    <div className="contact-kvkk-group">
                                        <label className="kvkk-checkbox-label">
                                            <input
                                                id="service-contact-kvkkConsent"
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
        </div>
    );
};

export default ServiceDetailPage;
