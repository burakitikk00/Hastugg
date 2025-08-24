import { useState, useEffect } from 'react'
import {
  Header,
  Footer,
  Hero,
  About,
  Services,
  Projects,
  Team,
  Contact
} from './components'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'projects', 'team', 'contact']
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
  }

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <Hero />
      <About />
      <Services />
      <Projects />
      <Team />
      <Contact />
      <Footer />
    </div>
  )
}

export default App
