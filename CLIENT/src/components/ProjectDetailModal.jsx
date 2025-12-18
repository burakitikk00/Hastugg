import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingImage from './common/LoadingImage'
import publicService from '../services/publicService'
import './ProjectDetailModal.css'

const ProjectDetailModal = ({ isOpen, onClose, project, onBackToProjects, getStatusText }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    // Modal açıldığında body scroll'u kapat
    useEffect(() => {
        if (isOpen || isLightboxOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, isLightboxOpen])

    if (!project) return null

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === project.images.length - 1 ? 0 : prev + 1
        )
    }

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? project.images.length - 1 : prev - 1
        )
    }

    const openLightbox = () => {
        setIsLightboxOpen(true)
    }

    const closeLightbox = () => {
        setIsLightboxOpen(false)
    }

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="project-detail-modal-overlay"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="project-detail-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="modal-header">
                                {onBackToProjects && (
                                    <button
                                        className="back-button"
                                        onClick={onBackToProjects}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Geri
                                    </button>
                                )}
                                <button
                                    className="close-button"
                                    onClick={onClose}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Project Content */}
                            <div className="project-content">
                                {/* Image Gallery */}
                                <div className="image-gallery">
                                    <button
                                        className="gallery-nav prev"
                                        onClick={prevImage}
                                        disabled={project.images.length <= 1}
                                    >
                                        ‹
                                    </button>

                                    <div className="image-container" onClick={openLightbox}>
                                        <LoadingImage
                                            src={publicService.getImageURL(project.images[currentImageIndex])}
                                            alt={`${project.title} - Resim ${currentImageIndex + 1}`}
                                            className="project-image"
                                            fallbackSrc="/api/placeholder/400/300"
                                            blurWhileLoading={true}
                                            showLoadingSpinner={true}
                                        />
                                        <div className="fullscreen-hint">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M8 3H5C3.89543 3 3 3.89543 3 5V8M21 8V5C21 3.89543 20.1046 3 19 3H16M16 21H19C20.1046 21 21 20.1046 21 19V16M3 16V19C3 20.1046 3.89543 21 5 21H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>

                                    <button
                                        className="gallery-nav next"
                                        onClick={nextImage}
                                        disabled={project.images.length <= 1}
                                    >
                                        ›
                                    </button>
                                </div>

                                {/* Image Indicators */}
                                {project.images.length > 1 && (
                                    <div className="image-indicators">
                                        {project.images.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                onClick={() => setCurrentImageIndex(index)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Project Info */}
                                <div className="project-info">
                                    <div className="info-header">
                                        <h2 className="project-title">{project.title}</h2>
                                        <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                                            {getStatusText ? getStatusText(project.status) : project.status}
                                        </span>
                                    </div>
                                    <p className="project-description">{project.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {isLightboxOpen && (
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
                        <button
                            className="lightbox-nav prev"
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            disabled={project.images.length <= 1}
                        >
                            ‹
                        </button>
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={publicService.getImageURL(project.images[currentImageIndex])}
                            alt={`${project.title} - Resim ${currentImageIndex + 1}`}
                            className="lightbox-image"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="lightbox-nav next"
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            disabled={project.images.length <= 1}
                        >
                            ›
                        </button>
                        {project.images.length > 1 && (
                            <div className="lightbox-counter">
                                {currentImageIndex + 1} / {project.images.length}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default ProjectDetailModal
