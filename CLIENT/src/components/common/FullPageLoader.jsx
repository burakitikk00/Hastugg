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
const FullPageLoader = ({ isHeroReady = false, isDataReady = false, onComplete }) => {
    // isReady: Hero verileri ve görselleri tam olarak hazır olduğunda true olur
    const isReady = isHeroReady || isDataReady;

    // Aşamalar: 'typing' | 'converging' | 'logo' | 'exiting'
    const [stage, setStage] = useState('typing');
    const [progress, setProgress] = useState(18);
    const [statusLabel, setStatusLabel] = useState('MİMARİ PROJE HAZIRLANIYOR');

    // Sayfa arkasında kaydırmayı kitle
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    // 1. Akıllı Aşama Geçişleri: Tipografi -> Odak -> Logo Genesis
    useEffect(() => {
        // Tipografiden merkeze odaklanma aşamasına geçiş
        const t1 = setTimeout(() => {
            setStage('converging');
            setProgress(prev => Math.max(prev, 45));
            setStatusLabel('ODAK HİZALANIYOR');
        }, 1000);

        // Odaktan mimari logo filizlenme aşamasına geçiş
        const t2 = setTimeout(() => {
            setStage('logo');
            setProgress(prev => Math.max(prev, 72));
            setStatusLabel('STATİK SİSTEMLER YÜKLENİYOR');
        }, 1750);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // 2. Akıllı Mekanizma: Hero hazır olana kadar bekle, hazır olduğunda kusursuz açılış yap
    useEffect(() => {
        // Eğer logo aşamasına ulaşıldıysa ve Hero hazırsa -> Kapanışı başlat
        if (stage === 'logo' && isReady) {
            setProgress(100);
            setStatusLabel('MİMARİ VİZYON AKTİF • SİSTEM HAZIR');

            // Logo tam ışıltısını verdikten sonra pürüzsüz çıkış
            const exitTimer = setTimeout(() => {
                setStage('exiting');
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 550);
            }, 450);

            return () => clearTimeout(exitTimer);
        }

        // Eğer logo aşamasındayız ama Hero verileri henüz gelmediyse:
        // Asla rastgele kapatma! Canlı mimari durum güncellemeleriyle ekranı diri tut.
        if (stage === 'logo' && !isReady) {
            const statusSteps = [
                { p: 78, label: 'HERO VE METRİKLER EŞİTLENİYOR' },
                { p: 84, label: 'GÖRSEL SİSTEMLER HAZIRLANIYOR' },
                { p: 89, label: 'SON STATİK KONTROLLER YAPILIYOR' }
            ];
            let stepIdx = 0;

            const interval = setInterval(() => {
                if (stepIdx < statusSteps.length) {
                    setProgress(statusSteps[stepIdx].p);
                    setStatusLabel(statusSteps[stepIdx].label);
                    stepIdx++;
                } else {
                    // Hafif nefes alma ilerlemesi (maksimum %92'de bekler)
                    setProgress(prev => (prev < 92 ? prev + 1 : prev));
                }
            }, 600);

            return () => clearInterval(interval);
        }
    }, [stage, isReady, onComplete]);

    // 3. Failsafe (Güvenlik Koruması): Sunucu veya ağ aşırı gecikirse (8.5 sn) kullanıcıyı kilitleme
    useEffect(() => {
        const failsafe = setTimeout(() => {
            if (stage !== 'exiting') {
                setProgress(100);
                setStatusLabel('SİSTEM HAZIR');
                setStage('exiting');
                setTimeout(() => {
                    if (onComplete) onComplete();
                }, 550);
            }
        }, 8500);

        return () => clearTimeout(failsafe);
    }, [stage, onComplete]);

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
