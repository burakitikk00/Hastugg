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
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import LoadingImage from '../components/common/LoadingImage';
import publicService from '../services/publicService';
import { getServiceIcon } from '../utils/serviceIcons';
import './ServiceDetailPage.css';

const ServiceDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [service, setService] = useState(null);
    const [allServices, setAllServices] = useState([]);
    const [projects, setProjects] = useState([]);
    const [contactInfo, setContactInfo] = useState({ phone: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('services');

    // SSS Accordion state
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    // Hizmet Teklif Formu state
    const [inquiryForm, setInquiryForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    });
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState('');

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

                // İletişim bilgilerini getir
                const contactData = await publicService.getContact();
                if (Array.isArray(contactData) && contactData.length > 0) {
                    setContactInfo({
                        phone: contactData[0].phone || '',
                        email: contactData[0].email || ''
                    });
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

    // Teklif Formu Gönderimi
    const handleInquiryChange = (e) => {
        const { name, value } = e.target;
        setInquiryForm(prev => ({ ...prev, [name]: value }));
    };

    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);
        setFormError('');

        const nameParts = (inquiryForm.name || '').trim().split(' ');
        const firstName = nameParts[0] || 'Ziyaretçi';
        const lastName = nameParts.slice(1).join(' ') || '-';

        const fullMessage = `[HİZMET DANIŞMANLIK & TEKLİF TALEBİ: ${service?.service || 'Genel Hizmet'}]\n${inquiryForm.message || 'Hizmet kapsamı ve uygulama süreci hakkında teknik bilgi almak istiyorum.'}`;

        try {
            await publicService.submitContact({
                first_name: firstName,
                last_name: lastName,
                email: inquiryForm.email,
                phone: inquiryForm.phone,
                message: fullMessage
            });
            setFormSuccess(true);
            setInquiryForm({ name: '', email: '', phone: '', message: '' });
        } catch (err) {
            console.error('Teklif formu hatası:', err);
            setFormError('Talebiniz gönderilirken bir hata oluştu. Lütfen doğrudan telefon veya e-posta ile iletişime geçiniz.');
        } finally {
            setFormSubmitting(false);
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
                            <span className="service-stamp-badge">
                                <span className="stamp-pulse-dot" />
                                {service.stamp || 'A+ MİMARİ STANDART'}
                            </span>
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

                        {contactInfo.phone && (
                            <a
                                href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`}
                                className="btn-service-call"
                                title="Doğrudan Danışmanlık Hattı"
                            >
                                <FiPhone className="btn-icon" />
                                <span>{contactInfo.phone}</span>
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
                            <div className="blueprint-overlay-meta">
                                <span className="bp-meta-code">HASTUGG // {service.stamp || 'SPEC-STD'}</span>
                                <span className="bp-meta-status">DOĞRULANMIŞ HİZMET KAPSAMI</span>
                            </div>
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

                {/* 9. DOĞRUDAN HİZMET DANIŞMANLIK & TEKLİF FORMU */}
                <section id="hizmet-teklif" className="service-inquiry-section">
                    <div className="inquiry-container">
                        <div className="inquiry-header">
                            <span className="blueprint-tag">MİMARİ DANIŞMANLIK & İLETİŞİM</span>
                            <h2 className="inquiry-title">
                                {service.service} İçin Teklif Alın
                            </h2>
                            <p className="inquiry-sub">
                                Arsanız veya mevcut yapınız için ihtiyaç duyduğunuz mühendislik ve mimari çözümleri birlikte planlayalım. Formu doldurduğunuzda teknik ekibimiz 24 saat içinde sizinle iletişime geçer.
                            </p>
                        </div>

                        {formSuccess ? (
                            <div className="inquiry-success-box">
                                <FiCheckCircle className="success-icon" />
                                <h3>Talebiniz Alındı</h3>
                                <p>Teklif talebiniz mimari danışmanımıza başarıyla iletildi. En kısa sürede sizinle irtibata geçilecektir.</p>
                                <button
                                    type="button"
                                    onClick={() => setFormSuccess(false)}
                                    className="btn-new-inquiry"
                                >
                                    Yeni Mesaj Gönder
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleInquirySubmit} className="inquiry-form-grid">
                                {formError && (
                                    <div className="inquiry-error-msg">{formError}</div>
                                )}

                                <div className="form-group">
                                    <label>Ad Soyad *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={inquiryForm.name}
                                        onChange={handleInquiryChange}
                                        placeholder="Adınız ve Soyadınız"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Telefon Numarası *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={inquiryForm.phone}
                                        onChange={handleInquiryChange}
                                        placeholder="05XX XXX XX XX"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>E-posta Adresi *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={inquiryForm.email}
                                        onChange={handleInquiryChange}
                                        placeholder="ornek@alanadi.com"
                                        required
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <label>Proje / Talep Detayları</label>
                                    <textarea
                                        name="message"
                                        value={inquiryForm.message}
                                        onChange={handleInquiryChange}
                                        rows={4}
                                        placeholder={`Arsanızın konumu, imar durumu veya ${service.service} kapsamındaki beklentileriniz...`}
                                    />
                                </div>

                                <div className="form-group full-width">
                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="btn-submit-inquiry"
                                    >
                                        <FiSend />
                                        <span>{formSubmitting ? 'Gönderiliyor...' : 'Teklif Talebini İlet'}</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </section>

                {/* 10. DİĞER HİZMETLERİMİZİ KEŞFEDİN */}
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
            </main>

            <Footer />
        </div>
    );
};

export default ServiceDetailPage;
