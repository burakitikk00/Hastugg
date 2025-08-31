import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import publicService from '../../services/publicService'
import './Team.css'

const Team = () => {
    const [teamMembers, setTeamMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                setLoading(true)
                const data = await publicService.getTeam()
                setTeamMembers(data)
                setError(null)
            } catch (err) {
                console.error('Team verileri yüklenirken hata:', err)
                setError('Ekip bilgileri yüklenirken bir hata oluştu')
                // Fallback veriler
                setTeamMembers([
                    {
                        id: 1,
                        namesurname: 'John Touch',
                        position: 'ENGINEERING OFFICER',
                        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                    },
                    {
                        id: 2,
                        namesurname: 'Tony Draxler',
                        position: 'MARKETING MANAGER',
                        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                    },
                    {
                        id: 3,
                        namesurname: 'Richard Keaton',
                        position: 'TECHNOLOGY OFFICER',
                        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                    },
                    {
                        id: 4,
                        namesurname: 'Ali Koçeller',
                        position: 'FIELD OFFICER',
                        url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                    }
                ])
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
        // Varsayılan resim
        return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
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
                                <img
                                    src={getImageUrl(member)}
                                    alt={member.namesurname}
                                    className="member-image"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
                                    }}
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
