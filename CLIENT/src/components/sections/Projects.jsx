import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaArrowLeft, FaImages } from 'react-icons/fa';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import './Projects.css';

const Projects = () => {
    const navigate = useNavigate();
    const reelContainerRef = useRef(null);
    const cardRefs = useRef([]);

    const [projects, setProjects] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [activeIndex, setActiveIndex] = useState(0);

    // Backend verilerini yükle
    useEffect(() => {
        let isMounted = true;

        const fetchProjects = async () => {
            try {
                const data = await publicService.getProjects();
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    const resolved = data.map((item) => {
                        const mainUrl = item.url 
                            ? publicService.getImageURL(item.url) 
                            : (item.images && item.images.length > 0 ? publicService.getImageURL(item.images[0]) : '');

                        return {
                            ...item,
                            url: mainUrl
                        };
                    });
                    setProjects(resolved);
                }
            } catch (err) {
                logger.warn('Projeler yüklenirken hata:', err?.message);
            }
        };

        fetchProjects();

        return () => {
            isMounted = false;
        };
    }, []);

    // Filtreleme
    const filteredProjects = projects.filter(project => {
        if (selectedFilter === 'all') return true;
        const normalized = (project.status || '').toLowerCase().replace(/[\s_]/g, '');
        if (selectedFilter === 'completed') {
            return normalized === 'completed' || normalized === 'tamamlandı';
        }
        if (selectedFilter === 'in_progress') {
            return normalized === 'inprogress' || normalized === 'devamediyor';
        }
        return true;
    });

    // İstenen karta dikey sayfayı sarsmadan tam ortalanarak kaydırma
    const scrollToIndex = useCallback((index) => {
        if (index < 0 || index >= filteredProjects.length) return;
        setActiveIndex(index);

        const container = reelContainerRef.current;
        const targetCard = cardRefs.current[index];
        if (container && targetCard) {
            const cardLeft = targetCard.offsetLeft;
            const cardWidth = targetCard.offsetWidth;
            const containerWidth = container.offsetWidth;
            const targetScrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);

            container.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: 'smooth'
            });
        }
    }, [filteredProjects.length]);

    // Filtre değişince aktif kartı sıfırla ve başa kaydır
    const handleFilterChange = (filter) => {
        setSelectedFilter(filter);
        setActiveIndex(0);
        if (reelContainerRef.current) {
            reelContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
    };

    // Navigasyon butonları
    const handlePrev = () => {
        if (activeIndex > 0) {
            scrollToIndex(activeIndex - 1);
        }
    };

    const handleNext = () => {
        if (activeIndex < filteredProjects.length - 1) {
            scrollToIndex(activeIndex + 1);
        }
    };

    // Elle kaydırmada aktif kartı tespit et
    const handleReelScroll = () => {
        if (!reelContainerRef.current) return;
        const container = reelContainerRef.current;
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.left + containerRect.width / 2;

        let closestIndex = activeIndex;
        let minDistance = Infinity;

        cardRefs.current.forEach((card, idx) => {
            if (!card) return;
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(containerCenter - cardCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = idx;
            }
        });

        if (closestIndex !== activeIndex && closestIndex >= 0 && closestIndex < filteredProjects.length) {
            setActiveIndex(closestIndex);
        }
    };

    const handleProjectClick = (projectId) => {
        if (projectId) {
            navigate(`/proje/${projectId}`);
        }
    };

    const getStatusLabel = (status) => {
        const norm = (status || '').toLowerCase().replace(/[\s_]/g, '');
        if (norm === 'completed' || norm === 'tamamlandı') {
            return { text: 'TAMAMLANDI', className: 'completed' };
        }
        return { text: 'DEVAM EDİYOR', className: 'in_progress' };
    };

    return (
        <section id="projects" className="projects-section-container" aria-label="Projelerimiz">
            {/* Arka Plan Mimari Işıma */}
            <div className="projects-ambient-glow" aria-hidden="true" />

            <div className="projects-inner-wrapper">
                {/* Üst Başlık & Kontrol Çubuğu */}
                <div className="projects-top-bar">
                    <div className="projects-header-info">
                        <h2 className="projects-main-title">
                            Seçkin Projelerimiz & Mimari Portföy
                        </h2>
                        <p className="projects-subtext">
                            Statik mühendislik güvencesiyle hayata geçirdiğimiz lüks konut, restorasyon ve ticari mimari eserler.
                        </p>
                    </div>

                    {/* Filtreleme ve Navigasyon Düğmeleri */}
                    <div className="projects-controls">
                        <div className="projects-filter-group" role="tablist" aria-label="Proje filtreleri">
                            <button
                                type="button"
                                onClick={() => handleFilterChange('all')}
                                className={`filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                                role="tab"
                                aria-selected={selectedFilter === 'all'}
                            >
                                TÜMÜ ({projects.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('completed')}
                                className={`filter-btn ${selectedFilter === 'completed' ? 'active' : ''}`}
                                role="tab"
                                aria-selected={selectedFilter === 'completed'}
                            >
                                TAMAMLANDI
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilterChange('in_progress')}
                                className={`filter-btn ${selectedFilter === 'in_progress' ? 'active' : ''}`}
                                role="tab"
                                aria-selected={selectedFilter === 'in_progress'}
                            >
                                DEVAM EDİYOR
                            </button>
                        </div>

                        {/* Navigasyon Ok Butonları */}
                        <div className="projects-arrow-nav">
                            <button
                                type="button"
                                onClick={handlePrev}
                                className="arrow-nav-btn"
                                aria-label="Önceki Proje"
                                disabled={activeIndex === 0}
                            >
                                <FaArrowLeft size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="arrow-nav-btn"
                                aria-label="Sonraki Proje"
                                disabled={activeIndex >= filteredProjects.length - 1}
                            >
                                <FaArrowRight size={13} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Yatay Vitrin Şeridi (Reel Viewport) */}
                <div
                    ref={reelContainerRef}
                    onScroll={handleReelScroll}
                    className="projects-reel-viewport"
                    tabIndex={0}
                    role="region"
                    aria-label="Projeler listesi"
                >
                    <div className="projects-reel-track">
                        {projects.length === 0 ? (
                            [1, 2].map((sk) => (
                                <article
                                    key={`sk-${sk}`}
                                    className="panoramic-project-card animate-pulse"
                                    style={{ opacity: 0.5, border: '1px dashed rgba(197, 168, 128, 0.25)' }}
                                >
                                    <div className="project-card-visual" style={{ background: '#0a0f1d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: 'rgba(197, 168, 128, 0.5)', fontSize: '0.7rem', letterSpacing: '0.2em', fontFamily: 'monospace' }}>
                                            MİMARİ PORTFÖY SENKRONİZE EDİLİYOR...
                                        </span>
                                    </div>
                                    <div className="project-card-body">
                                        <div style={{ height: '20px', width: '60%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '12px' }} />
                                        <div style={{ height: '14px', width: '90%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }} />
                                    </div>
                                </article>
                            ))
                        ) : (
                            filteredProjects.map((project, index) => {
                            const statusInfo = getStatusLabel(project.status);
                            const imageCount = project.images?.length || 4;
                            const isActive = index === activeIndex;

                            return (
                                <article
                                    key={project.id || index}
                                    ref={(el) => (cardRefs.current[index] = el)}
                                    onClick={() => handleProjectClick(project.id)}
                                    className={`panoramic-project-card ${isActive ? 'is-active' : ''}`}
                                    aria-labelledby={`project-title-${project.id}`}
                                >
                                    {/* Proje Görseli */}
                                    <div className="project-card-visual">
                                        <img
                                            src={project.url || undefined}
                                            alt={project.title}
                                            className="project-cover-img"
                                            loading="lazy"
                                        />
                                        <div className="project-visual-gradient" aria-hidden="true" />

                                        {/* Durum Rozeti */}
                                        <div className={`project-status-pill ${statusInfo.className}`}>
                                            <span className="status-pulse-dot" aria-hidden="true" />
                                            <span>{statusInfo.text}</span>
                                        </div>

                                        {/* Galeri Görsel Sayacı */}
                                        <div className="project-gallery-badge">
                                            <FaImages size={12} />
                                            <span>{imageCount} FOTOĞRAF</span>
                                        </div>
                                    </div>

                                    {/* Proje Bilgileri */}
                                    <div className="project-card-body">
                                        <div>
                                            <h3 id={`project-title-${project.id}`} className="project-card-title">
                                                {project.title}
                                            </h3>

                                            <p className="project-card-desc">
                                                {project.description || 'Modern mimari çizimler ve yüksek statik mühendislik güvencesiyle inşa edilen prestij projesi.'}
                                            </p>
                                        </div>

                                        {/* Kart Tabanı: Aksiyon Butonu */}
                                        <div className="project-card-footer">
                                            <span className="project-explore-link">
                                                <span>PROJEYİ DETAYLI İNCELE</span>
                                                <FaArrowRight size={12} />
                                            </span>

                                            <span className="project-index-indicator">
                                                0{index + 1} / 0{filteredProjects.length}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        }))}
                    </div>
                </div>

                {/* Alt Sayfalama & Mimari Sayaç Çubuğu */}
                <div className="projects-pagination-bar">
                    <div className="projects-dots-group" role="tablist" aria-label="Proje slaytları">
                        {filteredProjects.map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => scrollToIndex(idx)}
                                className={`project-dot-btn ${idx === activeIndex ? 'active' : ''}`}
                                aria-label={`Proje ${idx + 1}`}
                                role="tab"
                                aria-selected={idx === activeIndex}
                            />
                        ))}
                    </div>

                    <div className="projects-counter-badge">
                        PROJE 0{activeIndex + 1} // 0{filteredProjects.length}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Projects;
