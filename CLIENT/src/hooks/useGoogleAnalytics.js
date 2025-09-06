import { useEffect, useState } from 'react';
import publicService from '../services/publicService';

export const useGoogleAnalytics = () => {
  const [analyticsSettings, setAnalyticsSettings] = useState({
    measurement_id: null,
    is_active: false
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAnalyticsSettings = async () => {
      try {
        const settings = await publicService.getAnalyticsSettings();
        setAnalyticsSettings(settings);
        
        if (settings.is_active && settings.measurement_id) {
          loadGoogleAnalytics(settings.measurement_id);
        }
      } catch (error) {
        console.error('Analytics ayarları yüklenirken hata:', error);
      }
    };

    loadAnalyticsSettings();
  }, []);

  const loadGoogleAnalytics = (measurementId) => {
    // Google Analytics script'ini dinamik olarak yükle
    if (window.gtag) {
      // Zaten yüklenmişse sadece config'i güncelle
      window.gtag('config', measurementId);
      setIsLoaded(true);
      return;
    }

    // Script'i head'e ekle
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    // gtag fonksiyonunu tanımla
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId);

    script1.onload = () => {
      setIsLoaded(true);
      console.log('Google Analytics yüklendi:', measurementId);
    };

    script1.onerror = () => {
      console.error('Google Analytics yüklenemedi');
    };
  };

  const trackEvent = (action, category, label, value) => {
    if (window.gtag && analyticsSettings.is_active) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };

  const trackPageView = (page_path) => {
    if (window.gtag && analyticsSettings.is_active) {
      window.gtag('config', analyticsSettings.measurement_id, {
        page_path: page_path
      });
    }
  };

  return {
    analyticsSettings,
    isLoaded,
    trackEvent,
    trackPageView
  };
};
