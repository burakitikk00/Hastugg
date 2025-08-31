import { motion } from 'framer-motion'
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import hastugLogo from '../../assets/hastuglogo.png'
import './Footer.css'
import { useEffect, useState } from 'react'
import publicService from '../../services/publicService'

const Footer = () => {
  const [contact, setContact] = useState({ address: '', phone: '', email: '' })
  const [socialLinks, setSocialLinks] = useState({ instagram: '', facebook: '', twitter: '', linkedin: '' })
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // İletişim bilgilerini yükle
        const contactData = await publicService.getContact()
        if (contactData && contactData.length > 0) {
          const c = contactData[0]
          setContact({ address: c.address || '', phone: c.phone || '', email: c.email || '' })
          setSocialLinks({
            instagram: c.instagram || '',
            facebook: c.facebook || '',
            twitter: c.twitter || '',
            linkedin: c.linkedin || ''
          })
        }

        // Hizmetleri yükle
        const servicesData = await publicService.getServices()
        console.log('Footer\'da yüklenen hizmetler:', servicesData)
        setServices(servicesData)
      } catch (error) {
        console.error('Footer verileri yüklenirken hata:', error)
        // Hata durumunda varsayılan hizmetler
        setServices([
          { service: 'Mimari ve Yapı Projeleri', id: 1 },
          { service: 'Saha Uygulama ve Takip', id: 2 },
          { service: 'Dış Cephe ve İzolasyon', id: 3 },
          { service: 'Peyzaj Tasarımı', id: 4 }
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const quickLinks = [
    { name: 'Hakkımızda', id: 'about' },
    { name: 'Hizmetler', id: 'services' },
    { name: 'Projeler', id: 'projects' },
    { name: 'Ekibimiz', id: 'team' },
    { name: 'İletişim', id: 'contact' }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Hizmete tıklandığında yapılacak işlem
  const handleServiceClick = (service) => {
    // Önce hizmetler bölümüne git
    scrollToSection('services')
    
    // Kısa bir gecikme sonrası modal'ı açmak için global event tetikle
    setTimeout(() => {
      // Custom event ile Services bileşenine bildir
      const event = new CustomEvent('openServiceModal', { 
        detail: { service: service } 
      })
      window.dispatchEvent(event)
    }, 1000) // Scroll tamamlandıktan sonra modal aç
  }

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <img
                src={hastugLogo}
                alt="Hastugg Logo"
                className="footer-logo-image"
              />
              <span className="footer-logo-text">Hastugg</span>
            </div>
            <p className="footer-description">
              Siz İsteyin, Biz İnşa Edelim. Profesyonel ekibimizle kaliteli projeler.
            </p>
            <div className="social-links">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} className="social-link" target="_blank" rel="noopener noreferrer"><FaInstagram size={20} /></a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} className="social-link" target="_blank" rel="noopener noreferrer"><FaFacebook size={20} /></a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} className="social-link" target="_blank" rel="noopener noreferrer"><FaTwitter size={20} /></a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} className="social-link" target="_blank" rel="noopener noreferrer"><FaLinkedin size={20} /></a>
              )}
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">BAĞLANTILAR</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="footer-link"
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">HİZMETLER</h4>
            <ul className="footer-links">
              {loading ? (
                // Loading durumunda skeleton göster
                [1, 2, 3, 4].map((i) => (
                  <li key={i}>
                    <div className="footer-link-skeleton"></div>
                  </li>
                ))
              ) : (
                services.map((service, index) => (
                  <li key={service.id || index}>
                    <button
                      onClick={() => handleServiceClick(service)}
                      className="footer-link"
                    >
                      {service.service}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">İLETİŞİM</h4>
            <div className="footer-contact">
              {contact.address && (<p>{contact.address}</p>)}
              {contact.phone && (<p>{contact.phone}</p>)}
              {contact.email && (<p>{contact.email}</p>)}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 Hastugg. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
