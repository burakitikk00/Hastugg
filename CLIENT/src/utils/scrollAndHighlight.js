/**
 * Impeccable Scroll & Highlight Utility
 * 
 * Bir eleman eklendiğinde veya düzenleme alanı açıldığında;
 * 1. O DOM elemanına yumuşak ve akıllı bir kaydırma (smooth scroll) yapar.
 * 2. Elemanı belirli bir süre boyunca (varsayılan ~3.2 saniye) zarif ve dikkat çekici bir
 *    ışık/halka (amber glow) efektiyle belirgin tutar.
 * 3. Responsive (mobil, tablet, masaüstü) ekranlarda sabit barların altına girmemesi için
 *    dikeyde merkezleme (block: 'center') veya üst pay bırakır.
 * 4. İsteğe bağlı olarak eklenen elemandaki ilk giriş alanına (input/textarea) odaklanır.
 */

export const scrollToAndHighlight = (target, options = {}) => {
  const {
    delay = 80,
    duration = 3200,
    block = 'center',
    focusInput = false,
    className = 'impeccable-highlight-pulse'
  } = options;

  if (typeof window === 'undefined') return;

  setTimeout(() => {
    let el = null;
    if (typeof target === 'string') {
      el = document.getElementById(target);
      if (!el && !target.startsWith('#')) {
        el = document.querySelector(target);
      }
    } else if (target instanceof HTMLElement) {
      el = target;
    }

    if (!el) return;

    // Smooth scroll (center dikey pozisyonu sabit header/nav barlara takılmayı engeller)
    try {
      el.scrollIntoView({
        behavior: 'smooth',
        block: block,
        inline: 'nearest'
      });
    } catch {
      el.scrollIntoView();
    }

    // Animasyonu tetikle (mevcut varsa sıfırlayıp yeniden başlat)
    el.classList.remove(className);
    // Reflow tetikleme
    void el.offsetWidth;
    el.classList.add(className);

    // İsteğe bağlı ilk input alanına odaklanma (kullanıcı hemen yazabilsin)
    if (focusInput) {
      setTimeout(() => {
        const input = el.querySelector(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        );
        if (input && typeof input.focus === 'function') {
          input.focus({ preventScroll: true });
        }
      }, 150);
    }

    // Belirlenen süre sonunda efekti temizle
    const timer = setTimeout(() => {
      if (el) {
        el.classList.remove(className);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, delay);
};

export default scrollToAndHighlight;
