import { useState, useEffect } from 'react';
import {
  Header,
  Footer,
  Hero,
  About,
  Services,
  Projects,
  Team,
  Contact
} from './components';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';

function MainApp() {
  const [activeSection, setActiveSection] = useState('home');
  const { trackEvent, trackPageView, analyticsSettings } = useGoogleAnalytics();

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'services', 'projects', 'team', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);

    // Google Analytics ile sayfa görüntüleme takibi
    if (analyticsSettings.is_active) {
      trackPageView(`/${sectionId}`);
      trackEvent('page_view', 'navigation', sectionId);
    }
  };

  // Sayfa yüklendiğinde ana sayfa görüntülemesini takip et
  useEffect(() => {
    if (analyticsSettings.is_active) {
      trackPageView('/');
      trackEvent('page_view', 'navigation', 'home');
    }
  }, [analyticsSettings.is_active]);



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
  );
}

export default MainApp;
