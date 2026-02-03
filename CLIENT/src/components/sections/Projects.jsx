import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingImage from '../common/LoadingImage'
import publicService from '../../services/publicService'
import logger from '../../utils/logger'
import './Projects.css'

const Projects = () => {
    const navigate = useNavigate()
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
                logger.error('Projeler yüklenirken hata:', err)
                setError('Projeler yüklenirken bir hata oluştu.')
            } finally {
                setLoading(false)
            }
        }

        fetchProjects()
    }, [])

    const handleProjectClick = (project) => {
        navigate(`/proje/${project.id}`)
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
                                    <LoadingImage
                                        src={publicService.getImageURL(project.url)}
                                        alt={project.name || project.title}
                                        className="project-image"
                                        fallbackSrc="/api/placeholder/400/300"
                                        blurWhileLoading={true}
                                        showLoadingSpinner={true}
                                    />

                                    <div className="project-status-badge">
                                        <span className={`status-badge ${(project.status || '').toLowerCase().replace(' ', '_')}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                    </div>

                                    <div className="project-overlay">
                                        <div className="overlay-content">
                                            <h3 className="overlay-title">{project.name || project.title}</h3>
                                            <button
                                                className="overlay-button"
                                                onClick={() => handleProjectClick(project)}
                                            >
                                                DETAYLAR
                                            </button>
                                        </div>
                                    </div>

                                    <div className="project-name-overlay">
                                        <h3 className="project-name">{project.name || project.title}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Projects
