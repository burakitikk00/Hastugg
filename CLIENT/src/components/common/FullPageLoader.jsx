import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hastugLogo from '../../assets/hastuglogo.png';
import './FullPageLoader.css';

/**
 * FullPageLoader: Özgün Mimari Yüklenme Deneyimi
 * Sıralama:
 * 1. "HASTUĞ İNŞAAT" yazısı ortaya çıkar.
 * 2. Yazı odaktaki çekirdeğe (merkeze) doğru yoğunlaşarak logonun içine akar.
 * 3. Merkezden Hastuğ mimari logosu filizlenir, hatları oluşur ve ışık taramasıyla netleşir.
 * 4. Veritabanı hazır olduğunda pürüzsüzce ana sayfaya geçilir.
 */
const FullPageLoader = ({ isDataReady = false, onComplete }) => {
    // Aşamalar: 'typing' | 'converging' | 'logo' | 'exiting'
    const [stage, setStage] = useState('typing');
    const [progress, setProgress] = useState(15);
    const [statusLabel, setStatusLabel] = useState('MİMARİ PROJE HAZIRLANIYOR');

    // Sayfa arkasında kaydırmayı kitle
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // 1. Aşama geçiş zamanlayıcıları
    useEffect(() => {
        // 1.1 sn sonra yazıyı merkeze çekme (converging) aşamasına geç
        const t1 = setTimeout(() => {
            setStage('converging');
            setProgress(45);
            setStatusLabel('ODAK HİZALANIYOR');
        }, 1100);

        // 1.9 sn sonra logo oluşma (logo) aşamasına geç
        const t2 = setTimeout(() => {
            setStage('logo');
            setProgress(75);
            setStatusLabel('STATİK SİSTEMLER YÜKLENİYOR');
        }, 1900);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // 2. Veri hazır olduğunda ve logo oluştuktan sonra zarif çıkış kontrolü
    useEffect(() => {
        if (stage === 'logo' && isDataReady) {
            setProgress(100);
            setStatusLabel('SİSTEM HAZIR');

            // Logo tam oluştuktan ve ışık vurduktan sonra çıkışı başlat
            const exitTimer = setTimeout(() => {
                setStage('exiting');
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 600);
            }, 550);

            return () => clearTimeout(exitTimer);
        } else if (stage === 'logo' && !isDataReady) {
            // Veri beklenirken tatlı bir ilerleme hissi ver
            const slowProgress = setInterval(() => {
                setProgress(prev => (prev < 92 ? prev + 3 : prev));
            }, 400);
            return () => clearInterval(slowProgress);
        }
    }, [stage, isDataReady, onComplete]);

    // Kelime parçaları
    const hastugLetters = 'HASTUĞ'.split('');
    const insaatLetters = 'İNŞAAT'.split('');

    return (
        <AnimatePresence>
            {stage !== 'finished' && (
                <motion.div
                    key="fpl-backdrop"
                    className="fpl-backdrop"
                    initial={{ opacity: 1 }}
                    animate={stage === 'exiting' ? { opacity: 0, scale: 1.04, filter: 'blur(8px)' } : { opacity: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    role="alert"
                    aria-live="polite"
                    aria-label="Hastuğ İnşaat Yükleniyor"
                >
                    {/* Arka Plan Blueprint Izgara ve Ambiyans Işığı */}
                    <div className="fpl-grid-layer" aria-hidden="true" />
                    <div className="fpl-ambient-glow" aria-hidden="true" />

                    {/* Dört Köşe Mimari HUD Göstergeleri */}
                    <div className="fpl-hud-corner top-left" aria-hidden="true">
                        <span className="fpl-crosshair" />
                        <span>HASTUĞ &bull; MİMARLIK & MÜHENDİSLİK</span>
                    </div>



                    <div className="fpl-hud-corner bottom-left" aria-hidden="true">
                        <span className="fpl-crosshair" />
                        <span>STATİK STANDART: DEPREM GÜVENLİ</span>
                    </div>

                    <div className="fpl-hud-corner bottom-right" aria-hidden="true">
                        <span>VİZYON &bull; KALİTE</span>
                        <span className="fpl-crosshair" />
                    </div>

                    {/* Ana Sahne Gövdesi */}
                    <div className="fpl-stage-container">
                        {/* ==============================================================
                            AŞAMA 1 & 2: HASTUĞ İNŞAAT YAZISI VE LOGO İÇİNE AKIŞ
                            ============================================================== */}
                        {(stage === 'typing' || stage === 'converging') && (
                            <motion.div
                                className="fpl-text-wrapper"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={
                                    stage === 'converging'
                                        ? {
                                            scale: 0.08,
                                            opacity: 0,
                                            letterSpacing: '-0.1em',
                                            y: 0,
                                            filter: 'blur(6px)'
                                        }
                                        : {
                                            scale: 1,
                                            opacity: 1,
                                            letterSpacing: '0.22em',
                                            y: 0,
                                            filter: 'blur(0px)'
                                        }
                                }
                                transition={
                                    stage === 'converging'
                                        ? { duration: 0.75, ease: [0.7, 0, 0.84, 0] }
                                        : { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
                                }
                            >
                                <div className="fpl-brand-row">
                                    {/* HASTUĞ Harf Harf Akışı */}
                                    <div className="fpl-brand-hastug">
                                        {hastugLetters.map((char, idx) => (
                                            <motion.span
                                                key={`h-${idx}`}
                                                initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                transition={{
                                                    duration: 0.45,
                                                    delay: 0.08 + idx * 0.07,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </div>

                                    {/* İNŞAAT Harf Harf Akışı */}
                                    <div className="fpl-brand-insaat">
                                        {insaatLetters.map((char, idx) => (
                                            <motion.span
                                                key={`i-${idx}`}
                                                initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                                transition={{
                                                    duration: 0.45,
                                                    delay: 0.45 + idx * 0.07,
                                                    ease: [0.16, 1, 0.3, 1]
                                                }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                {char}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* Mimari Lazer Çizgisi */}
                                <motion.div
                                    className="fpl-text-guideline"
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                />

                                <motion.div
                                    className="fpl-sub-concept"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.7 }}
                                >
                                    MİMARLIK &bull; MÜHENDİSLİK &bull; İNŞAAT
                                </motion.div>
                            </motion.div>
                        )}

                        {/* Merkeze Emilen Parçacık Tekilliği (Singularity Core) */}
                        {stage === 'converging' && (
                            <motion.div
                                className="fpl-singularity-core"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 2.8, 1], opacity: [0, 1, 0.8] }}
                                transition={{ duration: 0.75, ease: 'easeOut' }}
                            />
                        )}

                        {/* ==============================================================
                            AŞAMA 3: LOGONUN OLUŞUMU VE ORTAYA ÇIKIŞI
                            ============================================================== */}
                        {(stage === 'logo' || stage === 'exiting') && (
                            <motion.div
                                className="fpl-logo-wrapper"
                                initial={{ scale: 0.25, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                            >
                                {/* Dönen Mimari Pusula Halkası */}
                                <div className="fpl-blueprint-compass" aria-hidden="true" />

                                {/* Oluşan Logo Görseli ve Işık Taraması */}
                                <motion.div
                                    className="fpl-logo-container"
                                    initial={{ filter: 'brightness(2.2) drop-shadow(0 0 45px rgba(255,255,255,0.9))' }}
                                    animate={{ filter: 'brightness(1) drop-shadow(0 0 25px rgba(197, 168, 128, 0.45))' }}
                                    transition={{ duration: 1.1, ease: 'easeOut' }}
                                >
                                    <img
                                        src={hastugLogo}
                                        alt="Hastuğ İnşaat Logo"
                                        className="fpl-logo-img"
                                    />
                                    {/* Çapraz Parlama Taraması */}
                                    <div className="fpl-specular-shimmer" aria-hidden="true" />
                                </motion.div>

                                {/* Logo Altındaki Başlık */}
                                <motion.div
                                    className="fpl-formed-caption"
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <div className="fpl-formed-title">
                                        HASTUĞ <span>İNŞAAT</span>
                                    </div>
                                    <div className="fpl-formed-sub">
                                        MİMARLIK &bull; MÜHENDİSLİK
                                    </div>
                                </motion.div>

                                {/* Mimari Yüklenme Durum Çubuğu */}
                                <motion.div
                                    className="fpl-progress-block"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.35 }}
                                >
                                    <div className="fpl-progress-track">
                                        <div
                                            className="fpl-progress-fill"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <span className="fpl-status-text">
                                        {statusLabel} &bull; %{progress}
                                    </span>
                                </motion.div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullPageLoader;
