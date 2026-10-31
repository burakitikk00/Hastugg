-- ==============================================================================
-- Hastugg Hizmetler (Services) & Mimari Veri Mimarisi Tablo Genişletmesi
-- ==============================================================================

-- 1. "Services" Tablosuna Mimari & Mühendislik Detay Sütunları
ALTER TABLE "Services"
ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Mimarlık & Mühendislik',
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS detailed_description TEXT,
ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'compass',
ADD COLUMN IF NOT EXISTS stamp VARCHAR(100) DEFAULT 'A+ MİMARİ STANDART',
ADD COLUMN IF NOT EXISTS scope_tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS process_steps JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Mevcut Kayıtları (ID: 11 & 12) Zengin İçerikle Güncelleme

-- ID 11: Mimari Tasarım & Projelendirme (Mimari ve Yapı)
UPDATE "Services"
SET 
    category = 'Projelendirme & Tasarım',
    icon = 'compass',
    stamp = 'A+ MİMARİ STANDART',
    short_description = COALESCE(short_description, 'Uygulama projeleri, kat planları, kesit ve görünüş çizimleri, 3D modelleme ve render alma hizmetleri ile konseptten ruhsata eksiksiz mimari projelendirme.'),
    detailed_description = COALESCE(detailed_description, 'Hastuğ Mimarlık olarak, estetik vizyonu fonksiyonel mekan kurgusuyla harmanlayan ileri mimari tasarım hizmetleri sunuyoruz. Her yapı projesinde arsa morfolojisi, iklimsel yönelim, doğal ışık kullanımı ve imar yönetmeliklerini titizlikle analiz ediyoruz.\n\nProjelerimiz konsept eskizlerinden başlayarak belediye ruhsat onay paftalarına, şantiye uygulama detaylarından 4K fotogerçekçi görselleştirmelere kadar BIM (Yapı Bilgi Modellemesi) standartlarında sıfır hata prensibiyle üretilir.'),
    scope_tags = '[
        "3D BIM MODELLEME",
        "RUHSAT PROJELERİ",
        "STATİK ÇÖZÜMLER",
        "MALZEME DETAYI",
        "İÇ MEKAN TASARIMI",
        "ENERJİ KİMLİK BELGESİ"
    ]'::jsonb,
    deliverables = '[
        {
            "title": "3D Fotogerçekçi Render & Animasyon",
            "description": "Dış cephe ve iç mekan kurgusunu 4K çözünürlükte yansıtan mimari görselleştirme ve gün ışığı simülasyonları.",
            "icon": "image"
        },
        {
            "title": "Ruhsat & Belediye Onay Paftaları",
            "description": "İlgili belediye ve kamu kurumları onayına esas 1/50 ve 1/100 ölçekli eksiksiz mimari ruhsat projeleri.",
            "icon": "file-text"
        },
        {
            "title": "Uygulama & Detay Çizimleri",
            "description": "Sıva, seramik, cephe kaplama, doğrama ve çatı detaylarını içeren 1/1, 1/5, 1/20 imalat paftaları.",
            "icon": "layers"
        },
        {
            "title": "Keşif-Metraj & Mahal Listesi",
            "description": "Tüm inşaat kalemlerinin metraj cetvelleri, malzeme spesifikasyonları ve birim fiyat maliyet analizleri.",
            "icon": "clipboard"
        }
    ]'::jsonb,
    process_steps = '[
        {
            "step": 1,
            "title": "Ön Keşif & İhtiyaç Programı",
            "description": "Arsa analizi, imar durumu doğrulaması ve işverenin fonksiyonel beklentilerinin teknik programa dönüştürülmesi.",
            "duration": "1. Hafta"
        },
        {
            "step": 2,
            "title": "Konsept Tasarım & Kütle Etüdü",
            "description": "Fonksiyonel kat planı varyasyonları, 3D kütle çalışmaları ve estetik cephe alternatiflerinin hazırlanması.",
            "duration": "2 - 3. Hafta"
        },
        {
            "step": 3,
            "title": "BIM & Mühendislik Koordinasyonu",
            "description": "Statik, mekanik ve elektrik mühendislik disiplinlerinin BIM ortamında çakışmasız entegrasyonu.",
            "duration": "4. Hafta"
        },
        {
            "step": 4,
            "title": "Ruhsat Dosyası & Resmi Onaylar",
            "description": "İlgili belediye, yangın danışmanı ve yapı denetim onay süreçlerinin eksiksiz takibi ve sonuçlandırılması.",
            "duration": "5 - 6. Hafta"
        },
        {
            "step": 5,
            "title": "Şantiye Uygulama Paftaları",
            "description": "Saha ekiplerinin milimetrik imalat yapabilmesi için tüm sistem ve nokta detay çizimlerinin teslimi.",
            "duration": "İnşaat Öncesi"
        }
    ]'::jsonb,
    features = '[
        {
            "title": "BIM & Revit Entegrasyonu",
            "description": "Tüm disiplinler arası çakışmaları sıfıra indiren uluslararası standartta 3D modelleme.",
            "icon": "cpu"
        },
        {
            "title": "İmar & Mevzuat Hakimiyeti",
            "description": "Güncel planlı alanlar imar yönetmeliğine ve yangın standartlarına %100 uyumluluk.",
            "icon": "shield"
        },
        {
            "title": "Yüksek Enerji Verimliliği",
            "description": "Güneş açısı ve yalıtım hesaplarıyla A sınıfı enerji kimliği hedefleyen sürdürülebilir mimari.",
            "icon": "sun"
        }
    ]'::jsonb,
    faqs = '[
        {
            "question": "Ruhsat projesi hazırlık süreci ortalama ne kadar sürer?",
            "answer": "Arsa büyüklüğüne ve projenin karmaşıklığına bağlı olarak konsept tasarımdan ruhsat dosyasının belediyeye sunulmasına kadar geçen süre ortalama 4 ila 6 hafta arasındadır."
        },
        {
            "question": "Statik ve mekanik projeler bu hizmete dahil midir?",
            "answer": "Evet, anahtar teslim mimari projelendirme paketimizde mimari, statik, mekanik ve elektrik tesisat projeleri tam bir koordinasyon içinde tek elden yönetilir."
        },
        {
            "question": "Ruhsat onay sürecini siz mi takip ediyorsunuz?",
            "answer": "Evet. Mimari ruhsat projelerinin belediye onayları, yapı denetim atamaları ve resmi harç hesaplamaları dahil tüm bürokratik süreci uzman ekibimiz yürütür."
        }
    ]'::jsonb,
    display_order = 1
WHERE id = 11;

-- ID 12: Saha Uygulama & Şantiye Denetimi
UPDATE "Services"
SET 
    category = 'Uygulama & Denetim',
    icon = 'tool',
    stamp = 'ŞANTİYE GÜVENCESİ',
    short_description = COALESCE(short_description, 'Saha uygulama takibi, keşif-metraj çalışmaları, hakediş düzenleme ve tüm inşaat aşamalarında mühendislik ilkelerine bağlı titiz şantiye disiplini.'),
    detailed_description = COALESCE(detailed_description, 'Hastuğ Mühendislik olarak, kağıt üzerindeki projelerin sahada milimetrik hassasiyetle gerçeğe dönüşmesini sağlıyoruz. Şantiye yönetimi; malzeme kalitesinin kontrolünden taşeron koordinasyonuna, iş güvenliği protokollerinden hakediş ve metraj disiplinine kadar çok boyutlu bir denetim sürecidir.\n\nŞantiye şeflerimiz ve saha mühendislerimiz, dökülen her metreküp betonu, bağlanan her ton demiri ve uygulanan her yalıtım katmanını TSE ve uluslararası standartlara göre denetler, düzenli raporlar halinde işverene sunar.'),
    scope_tags = '[
        "MİLİMETRİK DENETİM",
        "METRAJ & HAKEDİŞ",
        "İŞ GÜVENLİĞİ PROTOKOLÜ",
        "KALİTE KONTROL RAPORU",
        "BETON & ÇELİK TESTİ",
        "GÜNLÜK ŞANTİYE JURNALİ"
    ]'::jsonb,
    deliverables = '[
        {
            "title": "Haftalık & Aylık Saha İlerleme Raporu",
            "description": "Fotoğraflı, insansız hava aracı (drone) destekli imalat yüzdesi ve zaman çizelgesi raporları.",
            "icon": "file-text"
        },
        {
            "title": "Onaylı Hakediş & Metraj Dosyaları",
            "description": "Taşeron ve tedarikçi imalatlarının fiili ölçümlerle kontrol edilmiş şeffaf hakediş cetvelleri.",
            "icon": "clipboard"
        },
        {
            "title": "Laboratuvar & Dayanım Test Sonuçları",
            "description": "Beton basınç testleri, donatı çekme deneyleri ve su yalıtımı sızdırmazlık tutanakları.",
            "icon": "shield"
        },
        {
            "title": "As-Built (Son Durum) Projeleri",
            "description": "Saha imalatları tamamlandığında yapının fiili tesisat ve taşıyıcı durumunu gösteren güncel paftalar.",
            "icon": "layers"
        }
    ]'::jsonb,
    process_steps = '[
        {
            "step": 1,
            "title": "Şantiye Mobilizasyonu & İş Programı",
            "description": "Saha güvenliğinin kurulması, vinç ve ekipman yerleşimi, kritik yol yöntemine (CPM) göre iş planı hazırlanması.",
            "duration": "1. Hafta"
        },
        {
            "step": 2,
            "title": "Hafriyat & Temel Aplikasyonu",
            "description": "Total station cihazlarıyla harita mühendisliği ölçümü, zemin iyileştirme ve temel betonarme denetimi.",
            "duration": "2 - 4. Hafta"
        },
        {
            "step": 3,
            "title": "Kaba Yapı & Taşıyıcı Sistem Denetimi",
            "description": "Kalıp, donatı aralıkları, paspayı kontrolü ve vibratörlü beton dökümünün anlık mühendislik takibi.",
            "duration": "İnşaat Takvimine Göre"
        },
        {
            "step": 4,
            "title": "İnce İmalatlar & Tesisat Entegrasyonu",
            "description": "Yalıtım, mekanik-elektrik altyapı, şap, sıva ve cephe montajında toleranssız kalite kontrolü.",
            "duration": "İnşaat Takvimine Göre"
        },
        {
            "step": 5,
            "title": "Kabul & İskan (Yapı Kullanma İzni)",
            "description": "Belediye ve ilgili kamu kurumlarıyla yapı kullanım izin belgesi denetimleri ve kesin hesap teslimi.",
            "duration": "Teslim Aşaması"
        }
    ]'::jsonb,
    features = '[
        {
            "title": "Sıfır Toleranslı Kalite Denetimi",
            "description": "Lazerli ölçüm cihazları ve şantiye laboratuvar testleriyle hatasız imalat garantisi.",
            "icon": "check"
        },
        {
            "title": "Şeffaf Bütçe & Hakediş Yönetimi",
            "description": "Her çivinin ve malzemenin faturasıyla metrajını eşleştiren şeffaf maliyet disiplini.",
            "icon": "dollar-sign"
        },
        {
            "title": "İş Sağlığı & Güvenliği Standartları",
            "description": "6331 sayılı İSG kanununa tam uyum ile sıfır kaza hedefli profesyonel saha yönetimi.",
            "icon": "shield"
        }
    ]'::jsonb,
    faqs = '[
        {
            "question": "Saha denetimi haftada kaç gün yapılıyor?",
            "answer": "Projenin büyüklüğüne bağlı olarak tam zamanlı (şantiyede sürekli konuşlu mühendis) veya kritik imalat günlerinde (demir teslimi, beton dökümü vb.) günlük periyodik denetim protokolü uygulanır."
        },
        {
            "question": "Malzeme seçiminde bağımsız mıyız?",
            "answer": "Kesinlikle. Statik ve teknik şartnamelere uygun olmak kaydıyla malzeme markalarını işverenimizle birlikte belirler, tedarikçilerden en avantajlı şantiye fiyatlarını temin ederiz."
        }
    ]'::jsonb,
    display_order = 2
WHERE id = 12;

-- 3. Eksik Temel Hizmetlerin Eklenmesi (Eğer tabloda 4'ten az hizmet varsa)
INSERT INTO "Services" (
    service, 
    category, 
    icon, 
    stamp, 
    url, 
    short_description, 
    detailed_description, 
    scope_tags, 
    deliverables, 
    process_steps, 
    features, 
    faqs, 
    display_order, 
    is_active
)
SELECT 
    'Lüks Konut & Villa İnşaatı',
    'İnşaat & Taahhüt',
    'home',
    'DEPREME TAM GÜVENCE',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    'Depreme tam dayanıklı ileri statik karkas mühendisliği, modern akıllı ev altyapısı ve birinci sınıf malzeme işçiliği ile anahtar teslim lüks yaşam alanları.',
    'Hastuğ İnşaat olarak, mimari estetiği sağlam zeminler üzerine inşa ediyoruz. Özel villa, butik rezidans ve konut projelerinde; modern çizgileri, akıllı ev otomasyonlarını ve enerji verimli yapı kabuklarını buluşturuyoruz.\n\nProjenin temelinden peyzajına, zemin kaplamalarından özel imalat mobilyalarına kadar tüm aşamaları anahtar teslim taahhüt anlayışıyla üstleniyor, sözleşmede taahhüt edilen tarihte eksiksiz teslim ediyoruz.',
    '[
        "STATİK GÜVENCE",
        "AKILLI EV ALTYAPISI",
        "BİRİNCİ SINIF İŞÇİLİK",
        "ANAHTAR TESLİM",
        "SES & ISI YALITIMI",
        "ÖZEL PEYZAJ TASARIMI"
    ]'::jsonb,
    '[
        {
            "title": "Anahtar Teslim Yaşam Alanı",
            "description": "Tüm kaba ve ince imalatları, armatürleri ve iklimlendirme sistemleri tamamlanmış oturuma hazır yapı.",
            "icon": "home"
        },
        {
            "title": "Yapı Garanti & Bakım Sertifikası",
            "description": "Taşıyıcı sistemde 10 yıl, mekanik-yalıtım sistemlerinde 3 yıl kapsamlı garanti sertifikası.",
            "icon": "shield"
        },
        {
            "title": "Akıllı Ev & Otomasyon Dokümantasyonu",
            "description": "Aydınlatma, iklimlendirme, güvenlik kameraları ve bahçe sulama otomasyonu kullanım kılavuzları.",
            "icon": "cpu"
        }
    ]'::jsonb,
    '[
        {
            "step": 1,
            "title": "Zemin Etüdü & Temel Mühendisliği",
            "description": "Sondaj raporlarına göre radye temel ve sismik izolatör altyapısının projelendirilmesi.",
            "duration": "1 - 2. Ay"
        },
        {
            "step": 2,
            "title": "Betonarme / Çelik Karkas İmalatı",
            "description": "C35/45 hazır beton ve B420C nervürlü çelik ile depreme dayanıklı karkas inşası.",
            "duration": "3 - 5. Ay"
        },
        {
            "step": 3,
            "title": "Yalıtım & Çatı Kaplaması",
            "description": "Taşyünü dış cephe mantolaması, membran su yalıtımı ve modern çatı konstrüksiyonu.",
            "duration": "6. Ay"
        },
        {
            "step": 4,
            "title": "İç Mekan & İnce İşçilik",
            "description": "Doğal mermer, lamine parke, gizli aydınlatmalar ve akıllı ev tesisatının çekilmesi.",
            "duration": "7 - 9. Ay"
        },
        {
            "step": 5,
            "title": "Peyzaj & Anahtar Teslim",
            "description": "Yüzme havuzu, çevre aydınlatması, otomatik sulama ve iskan belgesiyle teslimat.",
            "duration": "10. Ay"
        }
    ]'::jsonb,
    '[
        {
            "title": "Deprem Güvenli Statik Karkas",
            "description": "TBDY 2018 yönetmeliğinin üzerinde yüksek mukavemetli C35/45 beton sınıfı.",
            "icon": "shield"
        },
        {
            "title": "A+ Akustik & Isı Yalıtımı",
            "description": "Üç camlı alüminyum doğramalar ve taşyünü mantolama ile maksimum konfor.",
            "icon": "sun"
        }
    ]'::jsonb,
    '[
        {
            "question": "Anahtar teslim bir villa inşaatı ortalama ne kadar sürer?",
            "answer": "Mimari projenin büyüklüğüne ve arazi şartlarına bağlı olarak ortalama bir müstakil villa 8 ila 12 ay arasında tüm çevre düzenlemesiyle birlikte teslim edilir."
        },
        {
            "question": "İç mekan malzeme seçimlerini kendimiz yapabilir miyiz?",
            "answer": "Evet. Mimarlarımızla birlikte zevkinize uygun malzeme showroom gezileri düzenlenir ve 3D önizlemelerle onayladığınız malzemeler uygulanır."
        }
    ]'::jsonb,
    3,
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM "Services" WHERE service = 'Lüks Konut & Villa İnşaatı');

INSERT INTO "Services" (
    service, 
    category, 
    icon, 
    stamp, 
    url, 
    short_description, 
    detailed_description, 
    scope_tags, 
    deliverables, 
    process_steps, 
    features, 
    faqs, 
    display_order, 
    is_active
)
SELECT 
    'Kentsel Dönüşüm & Statik Güçlendirme',
    'Mühendislik & Yenileme',
    'shield',
    'TSE ONAYLI MÜHENDİSLİK',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80',
    'Mevcut binaların ileri teknolojiyle deprem risk analizi, zemin etüdü doğrulaması, yapısal güçlendirme projeleri ve güvenli kentsel yenileme taahhüdü.',
    'Marmara Bölgesi ve deprem kuşağındaki yapılar için can güvenliğini en üst düzeye çıkaran kapsamlı kentsel dönüşüm ve güçlendirme hizmetleri veriyoruz. 6306 sayılı kanun kapsamında binaların risk tespit raporlarının çıkarılmasından, karot numunesi ve donatı taramasına kadar bilimsel metotlarla çalışıyoruz.\n\nEkonomik ve mimari açıdan uygun binalarda karbon lif (CFRP), çelik mantolama ve betonarme perde ilavesiyle bina tahliye edilmeden veya minimum süreyle güçlendirme yaparken; ekonomik ömrünü tamamlamış binalarda kat malikleriyle uzlaşarak sıfırdan modern yaşam alanları inşa ediyoruz.',
    '[
        "DEPREM RİSK ANALİZİ",
        "KAROT & BETON DAYANIM TESTİ",
        "DONATI RÖNTGENİ",
        "KARBON LİF (CFRP) GÜÇLENDİRME",
        "ÇELİK MANTOLAMA",
        "6306 SAYILI YASA DANIŞMANLIĞI"
    ]'::jsonb,
    '[
        {
            "title": "Bina Deprem Performans Raporu",
            "description": "Yapının mevcut deprem ivmelerine karşı davranışını ve hasar seviyesini gösteren resmi statik rapor.",
            "icon": "file-text"
        },
        {
            "title": "Güçlendirme Uygulama Projesi",
            "description": "Kolon-kiriş mantolama, temel bağ kirişleri ve perde duvar detaylarını içeren onaylı proje paftaları.",
            "icon": "layers"
        },
        {
            "title": "Hukuki & Mali Uzlaşma Dosyası",
            "description": "Kat malikleri için şeffaf paylaşım modeli, kira yardımı süreçleri ve noter sözleşmesi taslakları.",
            "icon": "clipboard"
        }
    ]'::jsonb,
    '[
        {
            "step": 1,
            "title": "Saha İncelemesi & Tahribatsız Testler",
            "description": "Ultrasonik beton ölçümü, donatı röntgeni ile paspayı ve paslanma tespiti, mikrometre ölçümleri.",
            "duration": "1. Hafta"
        },
        {
            "step": 2,
            "title": "Karot Alımı & Laboratuvar Analizi",
            "description": "Yapı elemanlarından alınan karot numunelerinin akredite laboratuvarda basınç testine tabi tutulması.",
            "duration": "2. Hafta"
        },
        {
            "step": 3,
            "title": "3D Bilgisayar Simülasyonu",
            "description": "SAP2000 ve ETABS yazılımlarıyla binanın olası 7.5 büyüklüğündeki depreme tepkisinin modellenmesi.",
            "duration": "3. Hafta"
        },
        {
            "step": 4,
            "title": "Dönüşüm / Güçlendirme Kararı & Onay",
            "description": "Bina sakinleriyle toplantı yapılarak güçlendirme veya yeniden yapım maliyet-fayda analizi sunumu.",
            "duration": "4. Hafta"
        },
        {
            "step": 5,
            "title": "İnşaat / Güçlendirme İmalatı",
            "description": "Karbon elyaf sarımı, epoksi enjeksiyonu veya yeni karkas yapımı ile tam güvenliğin sağlanması.",
            "duration": "3 - 8 Ay"
        }
    ]'::jsonb,
    '[
        {
            "title": "Akredite Laboratuvar Testleri",
            "description": "Çevre ve Şehircilik Bakanlığı lisanslı laboratuvarlarda yapılan resmi dayanım testleri.",
            "icon": "check"
        },
        {
            "title": "Hızlı & Karbon Lifli Çözümler",
            "description": "Binayı terk etmeden kolon mukavemetini 3 kata kadar artıran ileri kompozit teknolojileri.",
            "icon": "shield"
        }
    ]'::jsonb,
    '[
        {
            "question": "Güçlendirme mi yoksa kentsel dönüşüm (yeniden yapım) mi daha avantajlıdır?",
            "answer": "Güçlendirme maliyeti yeni bina maliyetinin %40''ını geçmiyorsa ve binanın mimari planı güncel ihtiyaçları karşılıyorsa güçlendirme hem maliyet hem de hız açısından çok daha avantajlıdır."
        },
        {
            "question": "6306 sayılı yasa kapsamında devlet kira yardımından faydalanabilir miyiz?",
            "answer": "Evet. Riskli yapı tespiti onaylanan tüm mülk sahipleri ve kiracılar devletin sunduğu 18 aya varan kira yardımı ve harç muafiyetlerinden yararlanabilir."
        }
    ]'::jsonb,
    4,
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM "Services" WHERE service = 'Kentsel Dönüşüm & Statik Güçlendirme');

-- 4. Performans ve Sorgu İndeksleri
CREATE INDEX IF NOT EXISTS idx_services_is_active ON "Services"(is_active);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON "Services"(display_order);
