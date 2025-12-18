import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectDetailModal from './ProjectDetailModal'
import LoadingImage from './common/LoadingImage'
import publicService from '../services/publicService'
import './ServiceProjectsModal.css'

const ServiceProjectsModal = ({ isOpen, onClose, service, projects, getStatusText }) => {
    const [selectedProject, setSelectedProject] = useState(null)
    const [showProjectDetail, setShowProjectDetail] = useState(false)

    // Modal açıldığında body scroll'u kapat
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        // Cleanup
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    const handleProjectClick = (project) => {
        setSelectedProject(project)
        setShowProjectDetail(true)
    }

    const handleBackToProjects = () => {
        setShowProjectDetail(false)
        setSelectedProject(null)
    }

    const handleCloseModal = () => {
        setShowProjectDetail(false)
        setSelectedProject(null)
        onClose()
    }

    if (!service) return null

    return (
        <>
            <AnimatePresence>
                {isOpen && !showProjectDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="service-projects-modal-overlay"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="service-projects-modal"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="modal-header">
                                <h2 className="modal-title">{service.service} Projeleri</h2>
                                <button
                                    className="close-button"
                                    onClick={onClose}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Projects List */}
                            <div className="projects-content">
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
                                                            {getStatusText ? getStatusText(project.status) : project.status}
                                                        </span>
                                                    </div>

                                                    <div className="project-overlay">
                                                        <div className="overlay-content">
                                                            <h3 className="overlay-title">{project.title}</h3>
                                                            <p className="overlay-description">
                                                                {project.description.length > 120
                                                                    ? `${project.description.substring(0, 120)}...`
                                                                    : project.description
                                                                }
                                                            </p>
                                                            <button
                                                                className="overlay-button"
                                                                onClick={() => handleProjectClick(project)}
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
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Project Detail Modal */}
            <ProjectDetailModal
                isOpen={showProjectDetail}
                onClose={handleCloseModal}
                project={selectedProject}
                onBackToProjects={handleBackToProjects}
                getStatusText={getStatusText}
            />
        </>
    )
}

export default ServiceProjectsModal
