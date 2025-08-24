import { motion } from 'framer-motion'
import './Team.css'

const Team = () => {
    const teamMembers = [
        {
            name: 'John Touch',
            position: 'ENGINEERING OFFICER',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Tony Draxler',
            position: 'MARKETING MANAGER',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Richard Keaton',
            position: 'TECHNOLOGY OFFICER',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        },
        {
            name: 'Ali Koçeller',
            position: 'FIELD OFFICER',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
        }
    ]

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

                <div className="team-grid">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="team-card"
                        >
                            <div className="member-image-container">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="member-image"
                                />
                            </div>
                            <div className="member-info">
                                <h3 className="member-name">{member.name}</h3>
                                <p className="member-position">{member.position}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Team
