import { useState, useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Hero from './components/sections/Hero';
import FullPageLoader from './components/common/FullPageLoader';
import publicService from './services/publicService';
import { useGoogleAnalytics } from './hooks/useGoogleAnalytics';

// Alt bölümleri tembel (lazy) yükleme: İlk açılışta yalnızca Header + Hero + FullPageLoader yüklensin!
const About = lazy(() => import('./components/sections/About'));
const Services = lazy(() => import('./components/sections/Services'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Team = lazy(() => import('./components/sections/Team'));
const Contact = lazy(() => import('./components/sections/Contact'));
const Footer = lazy(() => import('./components/layout/Footer'));

function MainApp() {
  const [activeSection, setActiveSection] = useState('home');
  const [isDataReady, setIsDataReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [loadRemainingSections, setLoadRemainingSections] = useState(false);
  const { trackEvent, trackPageView, analyticsSettings, consentStatus } = useGoogleAnalytics();
  const location = useLocation();

  // 1. Kritik Yol: Yalnızca ilk görünen Hero & Contact verisini bekle
  // 2. Kademeli Arka Plan Yüklemesi: Sayfa açılırken diğer bölümleri sırayla çek
  useEffect(() => {
    let isMounted = true;

    const loadCriticalPathAndSequence = async () => {
      try {
        // İlk olarak yalnızca ilk viewport için zorunlu olan Hero ve İletişim HUD'ı çek
        await Promise.allSettled([
          publicService.getHero(),
          publicService.getContact()
        ]);
      } catch (err) {
        console.warn('Hero verisi yükleme uyarısı:', err);
      } finally {
        if (isMounted) {
          // Hero hazır olduğu an loader'ın sayfayı açmasına izin ver
          setIsDataReady(true);
        }
      }

      // Hero açılmaya başladığı an alt bölümleri arka planda sırayla çekmeye başla
      if (isMounted) {
        setLoadRemainingSections(true);
      }

      try {
        // 1. Sırada: Hemen altındaki Hakkımızda
        await publicService.getAbout();

        // 2. Sırada: Hizmetlerimiz
        await publicService.getServices();

        // 3. Sırada: Projeler Portföyü (Görselleri ve detayları)
        await publicService.getProjects();

        // 4. Sırada: Uzman Ekip
        await publicService.getTeam();
      } catch (seqErr) {
        console.warn('Kademeli arka plan veri yükleme uyarısı:', seqErr);
      }
    };

    loadCriticalPathAndSequence();

    // Güvenlik zaman aşımı: Backend yavaş kalsa bile kullanıcıyı asla sonsuz bekletme (maks 4.5 sn)
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsDataReady(true);
        setLoadRemainingSections(true);
      }
    }, 4500);

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // Hash veya yönlendirme olduğunda ilgili bölüme akıcı geçiş yap
  useEffect(() => {
    const hash = location.hash || window.location.hash;
    if (!hash) return;

    const rawId = hash.replace(/^#/, '').toLowerCase();
    const targetMap = {
      'projeler': 'projects',
      'proje': 'projects',
      'projects': 'projects',
      'hizmetler': 'services',
      'hizmet': 'services',
      'services': 'services',
      'kurumsal': 'about',
      'hakkimizda': 'about',
      'about': 'about',
      'ekibimiz': 'team',
      'ekip': 'team',
      'team': 'team',
      'iletisim': 'contact',
      'contact': 'contact',
      'home': 'home',
      'anasayfa': 'home'
    };

    const targetId = targetMap[rawId] || rawId;

    // İçerik ve DOM yüklemesini bekleyen güvenli kaydırma mekanizması
    let attempts = 0;
    const maxAttempts = 8;
    const scrollToTarget = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        });
        setActiveSection(targetId);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(scrollToTarget, 100);
      }
    };

    const timer = setTimeout(scrollToTarget, 80);
    return () => clearTimeout(timer);
  }, [location.hash]);

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

    // Google Analytics ile sayfa görüntüleme takibi (yalnızca onay verilip kaydedilmişse)
    if (analyticsSettings.is_active && consentStatus === 'accepted') {
      trackPageView(`/${sectionId}`);
      trackEvent('page_view', 'navigation', sectionId);
    }
  };

  // Sayfa yüklendiğinde veya çerez tercihi kaydedildiğinde ana sayfa görüntülemesini takip et
  useEffect(() => {
    if (analyticsSettings.is_active && consentStatus === 'accepted') {
      trackPageView('/');
      trackEvent('page_view', 'navigation', 'home');
    }
  }, [analyticsSettings.is_active, consentStatus]);



  return (
    <div className="app">
      {showLoader && (
        <FullPageLoader
          isDataReady={isDataReady}
          onComplete={() => setShowLoader(false)}
        />
      )}
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <Hero />
      {loadRemainingSections && (
        <Suspense fallback={null}>
          <About />
          <Services />
          <Projects />
          <Team />
          <Contact />
          <Footer />
        </Suspense>
      )}
    </div>
  );
}

export default MainApp;
