import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import hastugLogo from '../../assets/hastuglogo.png'
import './Header.css'

const Header = ({ activeSection, onSectionChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    const scrollToSection = (sectionId) => {
        // Eğer ana sayfada değilsek, önce ana sayfaya git
        if (location.pathname !== '/') {
            navigate('/')
            // Sayfa yüklendikten sonra scroll yap
            setTimeout(() => {
                const element = document.getElementById(sectionId)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' })
                }
                if (onSectionChange) onSectionChange(sectionId)
            }, 150)
        } else {
            // Ana sayfadaysak direkt scroll yap
            const element = document.getElementById(sectionId)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
                if (onSectionChange) onSectionChange(sectionId)
            }
        }
        setIsMenuOpen(false)
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
                    >
                        <img
                            src={hastugLogo}
                            alt="Hastugg Logo"
                            className="logo-image"
                        />
                        <span className="logo-text">Hastuğ İnşaat</span>
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


                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className="mobile-menu-button"
                    >
                        {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
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
                    </div>
                </motion.div>
            </div>
        </header>
    )
}

export default Header
