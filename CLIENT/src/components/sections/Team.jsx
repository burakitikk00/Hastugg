import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaLinkedinIn, FaExternalLinkAlt, FaAward } from 'react-icons/fa';
import publicService from '../../services/publicService';
import logger from '../../utils/logger';
import { getTeamDisciplines } from '../../config/teamRoles';
import './Team.css';


// İsimleri Türkçe kurallarına göre Baş Harfi Büyük yapma yardımcısı
const formatName = (name) => {
    if (!name) return '';
    return name
        .trim()
        .toLocaleLowerCase('tr-TR')
        .split(/\s+/)
        .map(word => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
        .join(' ');
};

// 3D Kinetik Tilt Kart Bileşeni
const TeamTiltCard = ({ member, index }) => {
    const cardRef = useRef(null);
    const [tilt, setTilt] = useState({
        rotateX: 0,
        rotateY: 0,
        glareX: 50,
        glareY: 50,
        isHovered: false
    });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // maks -6 ile +6 derece
        const rotateY = ((x - centerX) / centerX) * 6;

        setTilt({
            rotateX,
            rotateY,
            glareX: (x / rect.width) * 100,
            glareY: (y / rect.height) * 100,
            isHovered: true
        });
    };

    const handleMouseLeave = () => {
        setTilt({
            rotateX: 0,
            rotateY: 0,
            glareX: 50,
            glareY: 50,
            isHovered: false
        });
    };

    const formattedName = formatName(member.namesurname);
    const disciplines = getTeamDisciplines(member.position);

    const cardTransform = tilt.isHovered
        ? `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-6px)`
        : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';

    return (
        <motion.article
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ transform: cardTransform }}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true, margin: '-50px' }}
            className="team-tilt-card"
            aria-labelledby={`member-name-${member.id || index}`}
        >
            {/* Dinamik Işık Parıltısı (Specular Glare) */}
            {tilt.isHovered && (
                <div
                    className="team-card-glare"
                    style={{
                        background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(229, 169, 60, 0.16) 0%, transparent 65%)`
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Portre Görsel Alanı */}
            <div className="team-card-visual">
                <img
                    src={member.url || undefined}
                    alt={formattedName}
                    className="team-member-img"
                    loading="lazy"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
                <div className="team-visual-gradient" aria-hidden="true" />
            </div>

            {/* Kart İçerik Gövdesi */}
            <div className="team-card-body">
                <div>
                    <h3 id={`member-name-${member.id || index}`} className="team-member-name">
                        {formattedName}
                    </h3>
                    <p className="team-member-position">
                        {member.position || 'İnşaat Mühendisi & Mimari Danışman'}
                    </p>

                    {/* Uzmanlık Alanları / Çipler */}
                    <div className="team-disciplines-list" aria-label="Uzmanlık Alanları">
                        {disciplines.map((item, idx) => (
                            <span key={idx} className="team-discipline-chip">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Kart Tabanı: LinkedIn Butonu */}
                <div className="team-card-footer">
                    {member.LinkedIn ? (
                        <a
                            href={member.LinkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="team-linkedin-btn"
                            aria-label={`${formattedName} LinkedIn Profili`}
                        >
                            <FaLinkedinIn size={13} />
                            <span>LİNKEDİN PROFİLİ</span>
                            <FaExternalLinkAlt size={10} className="external-icon" />
                        </a>
                    ) : (
                        <div className="team-credential-pill">
                            <FaAward size={13} className="text-[#e5a93c]" />
                            <span>KIDEMLİ STATİK UZMANI</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.article>
    );
};

const Team = () => {
    const [teamMembers, setTeamMembers] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchTeam = async () => {
            try {
                const data = await publicService.getTeam();
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    const resolved = data.map((item) => {
                        const mainUrl = item.url ? publicService.getImageURL(item.url) : '';

                        return {
                            ...item,
                            url: mainUrl
                        };
                    });
                    setTeamMembers(resolved);
                }
            } catch (err) {
                logger.warn('Ekip bilgileri yüklenirken hata:', err?.message);
            }
        };

        fetchTeam();

        return () => {
            isMounted = false;
        };
    }, []);

    // Tek üye varsa özel odaklanmış düzen, birden fazlaysa dengeli grid
    const isSingleMember = teamMembers.length === 1;

    return (
        <section id="team" className="team-section-container" aria-label="Ekibimiz">
            {/* Arka Plan Mimari Işıma */}
            <div className="team-ambient-glow" aria-hidden="true" />

            <div className="team-inner-wrapper">
                {/* Üst Başlık & Mimari Açıklama */}
                <div className="team-top-bar">
                    <h2 className="team-main-title">
                        Mimari Vizyon & Mühendislik Kadromuz
                    </h2>
                    <p className="team-subtext">
                        Estetik tasarımı yüksek statik güvenlik ve yenilikçi yapı dinamikleriyle buluşturan uzman kadromuz.
                    </p>
                </div>

                {/* Ekip Grid / Monolit Düzen */}
                <div className={`team-grid ${isSingleMember ? 'single-member' : ''}`}>
                    {teamMembers.map((member, index) => (
                        <TeamTiltCard
                            key={member.id || index}
                            member={member}
                            index={index}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Team;
