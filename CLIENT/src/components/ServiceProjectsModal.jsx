import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectDetailModal from './ProjectDetailModal'
import publicService from '../services/publicService'
import './ServiceProjectsModal.css'

const ServiceProjectsModal = ({ isOpen, onClose, service, projects, getStatusText }) => {
    const [selectedProject, setSelectedProject] = useState(null)
    const [showProjectDetail, setShowProjectDetail] = useState(false)

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
                                                    <img 
                                                        src={publicService.getImageURL(project.url)}
                                                        alt={project.title}
                                                        className="project-thumbnail"
                                                        onError={(e) => {
                                                            e.target.src = '/api/placeholder/400/300'
                                                        }}
                                                    />
                                                    <div className="project-overlay">
                                                        <button 
                                                            className="view-details-btn"
                                                            onClick={() => handleProjectClick(project)}
                                                        >
                                                            Detayları Gör
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="project-info">
                                                    <h3 className="project-title">{project.title}</h3>
                                                    <p className="project-description">
                                                        {project.description.length > 100 
                                                            ? `${project.description.substring(0, 100)}...` 
                                                            : project.description
                                                        }
                                                    </p>
                                                    <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                                                        {getStatusText ? getStatusText(project.status) : project.status}
                                                    </span>
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
