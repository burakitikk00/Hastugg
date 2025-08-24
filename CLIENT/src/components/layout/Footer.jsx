import { motion } from 'framer-motion'
import { FaInstagram, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'
import hastugLogo from '../../assets/hastuglogo.png'
import './Footer.css'

const Footer = () => {
  const socialLinks = [
    { icon: FaInstagram, href: '#' },
    { icon: FaFacebook, href: '#' },
    { icon: FaTwitter, href: '#' },
    { icon: FaLinkedin, href: '#' }
  ]

  const quickLinks = [
    { name: 'Hakkımızda', id: 'about' },
    { name: 'Hizmetler', id: 'services' },
    { name: 'Projeler', id: 'projects' },
    { name: 'Ekibimiz', id: 'team' },
    { name: 'İletişim', id: 'contact' }
  ]

  const services = [
    { name: 'Mimari Proje', id: 'services' },
    { name: 'İç Mekan Tasarım', id: 'services' },
    { name: 'Malzeme Tedarik', id: 'services' },
    { name: 'Şantiye Kontrol', id: 'services' }
  ]

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
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
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon size={20} />
                </a>
              ))}
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
              {services.map((service, index) => (
                <li key={index}>
                  <button
                    onClick={() => scrollToSection(service.id)}
                    className="footer-link"
                  >
                    {service.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-title">İLETİŞİM</h4>
            <div className="footer-contact">
              <p>Adres Bilgisi Caddesi .1234 Sokak .<br />Ankara/Türkiye</p>
              <p>0216 555 55 000</p>
              <p>bilgi@hastugg.com</p>
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
