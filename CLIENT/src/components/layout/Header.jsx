import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import hastugLogo from '../../assets/hastuglogo.png'
import './Header.css'

const Header = ({ activeSection, onSectionChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1070 && isMenuOpen) {
                setIsMenuOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isMenuOpen])

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    const scrollToSection = (sectionId) => {
        // Önce menüyü kapat
        setIsMenuOpen(false)

        // Eğer ana sayfada değilsek, önce ana sayfaya git
        if (location.pathname !== '/') {
            navigate('/')

            // Sayfa yüklendikten sonra scroll yap
            setTimeout(() => {
                const element = document.getElementById(sectionId)
                if (element) {
                    const headerOffset = 80 // Header yüksekliği kadar pay bırak
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    })
                }
                if (onSectionChange) onSectionChange(sectionId)
            }, 300)
        } else {
            // Ana sayfadaysak, menü kapanma animasyonunu bekle (300ms) sonra scroll yap
            setTimeout(() => {
                const element = document.getElementById(sectionId)
                if (element) {
                    // scrollIntoView bazen mobilde header altında kalabiliyor, elle hesaplama daha güvenli
                    const headerOffset = 80
                    const elementPosition = element.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    })

                    if (onSectionChange) onSectionChange(sectionId)
                }
            }, 350)
        }
    }

    const handleLogoClick = () => {
        setIsMenuOpen(false)
        if (location.pathname !== '/') {
            navigate('/')
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            if (onSectionChange) onSectionChange('home')
        }
    }

    const navigationItems = [
        { id: 'home', label: 'ANASAYFA' },
        { id: 'about', label: 'KURUMSAL' },
        { id: 'services', label: 'HİZMETLERİMİZ' },
        { id: 'projects', label: 'PROJELER' },
        { id: 'team', label: 'EKİBİMİZ' },
        { id: 'contact', label: 'İLETİŞİM' }
    ]

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-content">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="logo-container"
                        onClick={handleLogoClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleLogoClick()
                            }
                        }}
                        aria-label="Hastuğ İnşaat Ana Sayfa"
                    >
                        <img
                            src={hastugLogo}
                            alt="Hastugg Logo"
                            className="logo-image"
                        />
                        <span className="logo-text">Hastuğ <span>İnşaat</span></span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="desktop-nav">
                        {navigationItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`nav-button ${activeSection === item.id ? 'active' : ''}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Header CTA Button */}
                    <button
                        onClick={() => scrollToSection('contact')}
                        className="header-cta-button"
                    >
                        TEKLİF AL
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="mobile-menu-button"
                        aria-label="Menü"
                    >
                        {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <motion.div
                    initial={false}
                    animate={isMenuOpen ? "open" : "closed"}
                    variants={{
                        open: {
                            height: "auto",
                            opacity: 1,
                            transition: {
                                type: "tween",
                                duration: 0.4,
                                ease: "easeOut",
                                staggerChildren: 0.1,
                                delayChildren: 0.1
                            }
                        },
                        closed: {
                            height: 0,
                            opacity: 0,
                            transition: {
                                duration: 0.3,
                                ease: "easeInOut"
                            }
                        }
                    }}
                    className="mobile-nav"
                    style={{ overflow: 'hidden' }}
                >
                    <div className="mobile-nav-content">
                        {navigationItems.map((item) => (
                            <motion.button
                                key={item.id}
                                variants={{
                                    open: { y: 0, opacity: 1 },
                                    closed: { y: -20, opacity: 0 }
                                }}
                                onClick={() => scrollToSection(item.id)}
                                className={`mobile-nav-button ${activeSection === item.id ? 'active' : ''}`}
                            >
                                {item.label}
                            </motion.button>
                        ))}
                        <button
                            onClick={() => scrollToSection('contact')}
                            className="mobile-cta-button"
                        >
                            TEKLİF AL
                        </button>
                    </div>
                </motion.div>
            </div>
        </header>
    )
}

export default Header
