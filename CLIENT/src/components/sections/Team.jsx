import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import LoadingImage from '../common/LoadingImage'
import publicService from '../../services/publicService'
import logger from '../../utils/logger'
import './Team.css'

const Team = () => {
    const [teamMembers, setTeamMembers] = useState(publicService.getCachedTeam() || [])
    const [loading, setLoading] = useState(!publicService.getCachedTeam())
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                setLoading(true)
                const data = await publicService.getTeam()
                setTeamMembers(data)
                setError(null)
            } catch (err) {
                logger.error('Team verileri yüklenirken hata:', err)
                setError('Ekip bilgileri yüklenirken bir hata oluştu')
                setTeamMembers([])
            } finally {
                setLoading(false)
            }
        }

        fetchTeamMembers()
    }, [])

    // Resim URL'ini al
    const getImageUrl = (member) => {
        if (member.url) {
            return publicService.getImageURL(member.url)
        }
        return null
    }

    if (loading) {
        return (
            <section id="team" className="team">
                <div className="team-container">
                    <div className="team-header">
                        <h2 className="team-title">PROFESYONEL EKİP</h2>
                        <p className="team-description">BİZİMLE TANIŞIN</p>
                    </div>
                    <div className="team-grid">
                        {[1, 2, 3, 4].map((index) => (
                            <div key={index} className="team-card">
                                <div className="member-image-container">
                                    <div className="member-image-placeholder">
                                        <div className="animate-pulse bg-gray-300 h-full w-full"></div>
                                    </div>
                                </div>
                                <div className="member-info">
                                    <div className="animate-pulse bg-gray-300 h-6 w-3/4 mx-auto mb-2 rounded"></div>
                                    <div className="animate-pulse bg-gray-200 h-4 w-1/2 mx-auto rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Hata durumunda veya veri yoksa
    if (teamMembers.length === 0) {
        return (
            <section id="team" className="team">
                <div className="team-container">
                    <div className="team-header">
                        <h2 className="team-title">PROFESYONEL EKİP</h2>
                        <p className="team-description">BİZİMLE TANIŞIN</p>
                    </div>
                    <div className="team-grid">
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                            <p>Ekip bilgileri yükleniyor...</p>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id="team" className="team">
            <div className="team-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="team-header"
                >
                    <h2 className="team-title">
                        PROFESYONEL EKİP
                    </h2>
                    <p className="team-description">
                        BİZİMLE TANIŞIN
                    </p>
                </motion.div>

                {error && (
                    <div className="text-center text-red-600 mb-4">
                        {error}
                    </div>
                )}

                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={member.id || index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="team-card"
                        >
                            <div className="member-image-container">
                                <LoadingImage
                                    src={getImageUrl(member)}
                                    alt={member.namesurname}
                                    className="member-image"
                                    blurWhileLoading={true}
                                    showLoadingSpinner={true}
                                />
                            </div>
                            <div className="member-info">
                                <h3 className="member-name">{member.namesurname}</h3>
                                <p className="member-position">{member.position}</p>
                                {member.LinkedIn && (
                                    <a
                                        href={member.LinkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="member-linkedin"
                                    >
                                        LinkedIn
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Team
