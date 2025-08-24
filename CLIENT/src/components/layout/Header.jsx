import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBars, FaTimes } from 'react-icons/fa'
import hastugLogo from '../../assets/hastuglogo.png'
import './Header.css'

const Header = ({ activeSection, onSectionChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            onSectionChange(sectionId)
            setIsMenuOpen(false)
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
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mobile-nav"
                    >
                        <div className="mobile-nav-content">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`mobile-nav-button ${activeSection === item.id ? 'active' : ''}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                            <button className="mobile-cta-button">
                                İLETİŞİM FORMU
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </header>
    )
}

export default Header
