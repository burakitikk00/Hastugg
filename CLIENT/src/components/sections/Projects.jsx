import { useState } from 'react'
import { motion } from 'framer-motion'
import ProjectDetailModal from '../ProjectDetailModal'
import './Projects.css'

const Projects = () => {
    const [selectedProject, setSelectedProject] = useState(null)
    const [showProjectDetail, setShowProjectDetail] = useState(false)

    const projects = [
        {
            title: 'Modern Villa Projesi',
            description: 'İstanbul\'da 500m² alan üzerine kurulu modern villa tasarımı. Açık plan, geniş pencereler ve sürdürülebilir malzeme kullanımı ile öne çıkan proje. Proje kapsamında 3 yatak odası, 2 banyo, geniş oturma alanı ve bahçe tasarımı bulunmaktadır.',
            status: 'Completed',
            images: [
                'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
            ]
        },
        {
            title: 'Ofis Binası Renovasyonu',
            description: 'Eski ofis binasının modern iş yerine dönüştürülmesi. Enerji verimliliği ve çalışan konforu ön planda tutularak yapılan yenileme. Açık ofis konsepti, toplantı odaları ve dinlenme alanları eklenmiştir.',
            status: 'In Progress',
            images: [
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
                'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800'
            ]
        },
        {
            title: 'Rezidans Projesi Uygulama',
            description: '200 dairelik rezidans projesinin saha uygulama takibi. Kalite kontrol, zaman yönetimi ve maliyet optimizasyonu ile başarıyla tamamlandı. Proje 18 ay sürmüş ve tüm standartlara uygun şekilde teslim edilmiştir.',
            status: 'Completed',
            images: [
                'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800'
            ]
        },
        {
            title: 'Mantolama Uygulaması',
            description: 'Eski binada enerji tasarrufu için mantolama uygulaması. Isı yalıtımı ve dış cephe yenileme ile bina performansı artırıldı. %40 enerji tasarrufu sağlanmıştır.',
            status: 'Completed',
            images: [
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
                'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'
            ]
        },
        {
            title: 'Site Peyzaj Projesi',
            description: 'Büyük site için kapsamlı peyzaj tasarımı. Yeşil alanlar, yürüyüş yolları ve dinlenme alanları ile yaşanabilir çevre oluşturuldu. 5000m² yeşil alan tasarlanmıştır.',
            status: 'In Progress',
            images: [
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'
            ]
        },
        {
            title: 'Endüstriyel Tesis',
            description: '5000m² endüstriyel tesis projesi. Modern üretim hatları, güvenlik sistemleri ve çevre dostu teknolojiler kullanılarak tasarlandı. Proje tamamlanma aşamasındadır.',
            status: 'In Progress',
            images: [
                'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
                'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800'
            ]
        }
    ]

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
                return 'Tamamlandı'
            case 'In Progress':
                return 'Devam Ediyor'
            case 'Planned':
                return 'Planlandı'
            case 'On Hold':
                return 'Beklemede'
            default:
                return status
        }
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
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="project-card"
                            >
                                <div className="project-image-container">
                                    <img
                                        src={project.images[0]}
                                        alt={project.title}
                                        className="project-image"
                                    />
                                    <div className="project-status">
                                        <span className={`status-badge ${project.status.toLowerCase()}`}>
                                            {getStatusText(project.status)}
                                        </span>
                                    </div>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-name">{project.title}</h3>
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
            />
        </>
    )
}

export default Projects
