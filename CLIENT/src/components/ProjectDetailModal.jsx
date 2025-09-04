import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingImage from './common/LoadingImage'
import publicService from '../services/publicService'
import './ProjectDetailModal.css'

const ProjectDetailModal = ({ isOpen, onClose, project, onBackToProjects, getStatusText }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

    return (
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
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="project-detail-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="modal-header">
                            <button
                                className="back-button"
                                onClick={onBackToProjects}
                            >
                                ← Geri
                            </button>
                            <button
                                className="close-button"
                                onClick={onClose}
                            >
                                ×
                            </button>
                        </div>

                        {/* Project Content */}
                        <div className="project-content">
                            <div className="project-info">
                                <h2 className="project-title">{project.title}</h2>
                                <p className="project-description">{project.description}</p>
                                <div className="project-status">
                                    <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                                        {getStatusText ? getStatusText(project.status) : project.status}
                                    </span>
                                </div>
                            </div>

                            {/* Image Gallery */}
                            <div className="image-gallery">
                                <button
                                    className="gallery-nav prev"
                                    onClick={prevImage}
                                    disabled={project.images.length <= 1}
                                >
                                    ‹
                                </button>

                                <div className="image-container">
                                    <LoadingImage
                                        src={publicService.getImageURL(project.images[currentImageIndex])}
                                        alt={`${project.title} - Resim ${currentImageIndex + 1}`}
                                        className="project-image"
                                        fallbackSrc="/api/placeholder/400/300"
                                        blurWhileLoading={true}
                                        showLoadingSpinner={true}
                                    />
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
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ProjectDetailModal
