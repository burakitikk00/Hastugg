import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ProjectDetailModal from '../ProjectDetailModal'
import publicService from '../../services/publicService'
import './Projects.css'

const Projects = () => {
    const [selectedProject, setSelectedProject] = useState(null)
    const [showProjectDetail, setShowProjectDetail] = useState(false)
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Projeleri veritabanından çek
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true)
                const data = await publicService.getProjects()
                setProjects(data)
                setError(null)
            } catch (err) {
                console.error('Projeler yüklenirken hata:', err)
                setError('Projeler yüklenirken bir hata oluştu.')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    const handleProjectClick = (project) => {
        setSelectedProject(project)
        setShowProjectDetail(true)
    }

    const handleCloseModal = () => {
        setShowProjectDetail(false)
        setSelectedProject(null)
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

    // Loading state
    if (loading) {
        return (
            <section id="projects" className="projects">
                <div className="projects-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="projects-header"
                    >
                        <h2 className="projects-title">PROJELERİMİZ</h2>
                        <p className="projects-description">
                            Konutlar ve Sektörler İçin Biten Veya Devam Eden Projelerimiz
                        </p>
                    </motion.div>
                    <div className="projects-grid">
                        <div className="loading-message">Projeler yükleniyor...</div>
                    </div>
                </div>
            </section>
        )
    }

    // Error state
    if (error) {
        return (
            <section id="projects" className="projects">
                <div className="projects-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="projects-header"
                    >
                        <h2 className="projects-title">PROJELERİMİZ</h2>
                        <p className="projects-description">
                            Konutlar ve Sektörler İçin Biten Veya Devam Eden Projelerimiz
                        </p>
                    </motion.div>
                    <div className="projects-grid">
                        <div className="error-message">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>
                                Yeniden Yükle
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <>
            <section id="projects" className="projects">
                <div className="projects-container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="projects-header"
                    >
                        <h2 className="projects-title">
                            PROJELERİMİZ
                        </h2>
                        <p className="projects-description">
                            Konutlar ve Sektörler İçin Biten Veya Devam Eden Projelerimiz
                        </p>
                    </motion.div>

                    <div className="projects-grid">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id || index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="project-card"
                            >
                                <div className="project-image-container">
                                    <img
                                        src={publicService.getImageURL(project.url)}
                                        alt={project.name || project.title}
                                        className="project-image"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/400/300'
                                        }}
                                    />
                                    <div className="project-status">
                                        <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-name">{project.name || project.title}</h3>
                                    <button 
                                        className="project-button"
                                        onClick={() => handleProjectClick(project)}
                                    >
                                        Detayları Gör
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Project Detail Modal */}
            <ProjectDetailModal
                isOpen={showProjectDetail}
                onClose={handleCloseModal}
                project={selectedProject}
                onBackToProjects={() => setShowProjectDetail(false)}
                getStatusText={getStatusText}
            />
        </>
    )
}

export default Projects
