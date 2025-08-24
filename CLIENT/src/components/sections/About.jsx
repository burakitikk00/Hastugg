import { motion } from 'framer-motion'
import './About.css'

const About = () => {
    // Hizmetler, açıklamadaki ana başlıklara göre bölündü
    const features = [
        {
            title: 'Kalite ve Güven',
            description: 'Tüm projelerimizde en yüksek kalite standartlarını benimser, güvenilir ve şeffaf bir iş anlayışıyla hareket ederiz. Müşterilerimizin memnuniyetini ve güvenini her şeyin önünde tutarız.',
            icon: '✅'
        },
        {
            title: 'Yenilikçi Çözümler',
            description: 'Sürekli gelişen teknolojileri ve modern inşaat yöntemlerini takip ederek, projelerimize yenilikçi ve sürdürülebilir çözümler entegre ederiz.',
            icon: '💡'
        },
        {
            title: 'Sürdürülebilirlik',
            description: 'Çevreye duyarlı malzeme ve uygulamalarla, gelecek nesillere yaşanabilir alanlar bırakmayı hedefleriz. Sürdürülebilirlik, tüm süreçlerimizin merkezindedir.',
            icon: '🌱'
        },
        {
            title: 'Uzman Kadro',
            description: 'Alanında deneyimli ve uzman ekibimizle, her projede titiz mühendislik ve estetik bakış açısını bir araya getiririz.',
            icon: '👷‍♂️'
        }
    ]

    return (
        <section id="about" className="about">
            <div className="about-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="about-header"
                >
                    <h2 className="about-title">
                        Hakkımızda
                    </h2>
                    <p className="about-description">
                        Hastuğ, mühendislik ve estetik anlayışını birleştirerek; fonksiyonel, dayanıklı ve çağdaş yaşam alanları inşa eden yenilikçi bir inşaat firmasıdır. Kalite, güven ve sürdürülebilirlik ilkeleriyle, her projede teknik doğruluk ve müşteri memnuniyetini ön planda tutar.
                    </p>
                </motion.div>

                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="feature-card"
                        >
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default About
