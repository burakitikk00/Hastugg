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

const SPLASH_SESSION_KEY = 'hastug_splash_shown';

const HERO_BG_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2160&q=85';

// Hero mimari arka plan görselini tarayıcı önbelleğine önceden çek
const preloadHeroImage = (src) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve();
    const img = new Image();
    img.src = src;
    if (img.complete) {
      resolve();
    } else {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Hata durumunda bile süreci tıkamaz
    }
  });
};

function MainApp() {
  const hasSeenSplash = typeof window !== 'undefined' && sessionStorage.getItem(SPLASH_SESSION_KEY) === 'true';

  const [activeSection, setActiveSection] = useState('home');
  const [heroData, setHeroData] = useState(() => publicService.getCache('hero'));
  const [contactData, setContactData] = useState(() => publicService.getCache('contact'));
  const [isHeroReady, setIsHeroReady] = useState(false);
  const [showLoader, setShowLoader] = useState(!hasSeenSplash);
  const [loadRemainingSections, setLoadRemainingSections] = useState(hasSeenSplash);
  const { trackEvent, trackPageView, analyticsSettings, consentStatus } = useGoogleAnalytics();
  const location = useLocation();

  const handleLoaderComplete = () => {
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, 'true');
    } catch (e) {
      console.warn('SessionStorage yazma hatası:', e);
    }
    setShowLoader(false);
    setLoadRemainingSections(true);
  };

  const handleHeroReady = () => {
    setIsHeroReady(true);
  };

  // 1. Akıllı Kritik Yol: Hero verisi + İletişim HUD + Mimari Görsel birlikte hazır olmadan loader kalkmaz
  // 2. Kademeli Arka Plan Yüklemesi: Hero hazır olduğu an diğer bölümleri sırayla çek
  useEffect(() => {
    let isMounted = true;

    const loadCriticalViewport = async () => {
      try {
        const [heroRes, contactRes] = await Promise.allSettled([
          publicService.getHero(),
          publicService.getContact(),
          preloadHeroImage(HERO_BG_IMAGE)
        ]);

        if (isMounted) {
          if (heroRes.status === 'fulfilled' && heroRes.value) {
            setHeroData(heroRes.value);
          }
          if (contactRes.status === 'fulfilled' && contactRes.value) {
            setContactData(contactRes.value);
          }
        }
      } catch (err) {
        console.warn('Hero verisi yükleme uyarısı:', err);
      } finally {
        if (isMounted) {
          // Hero verileri ve görseli çözümlendi -> Loader'a hazır sinyali ver
          setIsHeroReady(true);
        }
      }

      // Hero hazırlandığı an alt bölümleri arka planda sırayla çekmeye başla
      if (isMounted) {
        setLoadRemainingSections(true);
      }

      try {
        // 1. Sırada: Hakkımızda
        await publicService.getAbout();

        // 2. Sırada: Hizmetlerimiz
        await publicService.getServices();

        // 3. Sırada: Projeler Portföyü
        await publicService.getProjects();

        // 4. Sırada: Uzman Ekip
        await publicService.getTeam();
      } catch (seqErr) {
        console.warn('Kademeli arka plan veri yükleme uyarısı:', seqErr);
      }
    };

    loadCriticalViewport();

    // Güvenlik koruması: Sunucu aşırı gecikse dahi ekranın sonsuza kadar donmasını önler (7.5 sn)
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsHeroReady(true);
        setLoadRemainingSections(true);
      }
    }, 7500);

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
          isHeroReady={isHeroReady}
          onComplete={handleLoaderComplete}
        />
      )}
      <Header
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      <Hero
        initialHero={heroData}
        initialContact={contactData}
        onReady={handleHeroReady}
      />
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
