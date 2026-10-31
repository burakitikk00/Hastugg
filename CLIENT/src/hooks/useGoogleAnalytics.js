import { useEffect, useState } from 'react';
import publicService from '../services/publicService';
import logger from '../utils/logger';

const COOKIE_CONSENT_KEY = 'hastug_cookie_consent';

export const useGoogleAnalytics = () => {
  const [analyticsSettings, setAnalyticsSettings] = useState({
    measurement_id: null,
    is_active: false
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [consentStatus, setConsentStatus] = useState(() => {
    return localStorage.getItem(COOKIE_CONSENT_KEY);
  });

  const loadGoogleAnalytics = (measurementId) => {
    // Sadece ziyaretçi onayı 'accepted' ise scripti yükle
    const currentConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (currentConsent !== 'accepted') {
      return;
    }

    if (window.gtag) {
      window.gtag('config', measurementId);
      setIsLoaded(true);
      return;
    }

    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script1);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId);

    script1.onload = () => {
      setIsLoaded(true);
    };

    script1.onerror = () => {
      logger.error('Google Analytics yüklenemedi');
    };
  };

  useEffect(() => {
    const loadAnalyticsSettings = async () => {
      try {
        const settings = await publicService.getAnalyticsSettings();
        setAnalyticsSettings(settings);

        // Ziyaretçi çerezleri ve oturum takibi direkt başlamaz;
        // Ziyaretçinin onayının kaydedilmesini bekler!
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (settings.is_active && settings.measurement_id && consent === 'accepted') {
          loadGoogleAnalytics(settings.measurement_id);
        }
      } catch (error) {
        logger.error('Analytics ayarları yüklenirken hata:', error);
      }
    };

    loadAnalyticsSettings();

    // Dinleyici: Ziyaretçi çerez tercihini onaylayıp kaydettiğinde hemen yükle
    const handleConsentUpdated = (e) => {
      const newStatus = e.detail || localStorage.getItem(COOKIE_CONSENT_KEY);
      setConsentStatus(newStatus);
      if (newStatus === 'accepted') {
        publicService.getAnalyticsSettings().then((settings) => {
          if (settings.is_active && settings.measurement_id) {
            loadGoogleAnalytics(settings.measurement_id);
          }
        });
      }
    };

    window.addEventListener('hastug_cookie_consent_updated', handleConsentUpdated);
    return () => window.removeEventListener('hastug_cookie_consent_updated', handleConsentUpdated);
  }, []);

  const trackEvent = (action, category, label, value) => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (window.gtag && analyticsSettings.is_active && consent === 'accepted') {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  };

  const trackPageView = (page_path) => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (window.gtag && analyticsSettings.is_active && consent === 'accepted') {
      window.gtag('config', analyticsSettings.measurement_id, {
        page_path: page_path
      });
    }
  };

  return {
    analyticsSettings,
    isLoaded,
    consentStatus,
    trackEvent,
    trackPageView
  };
};

