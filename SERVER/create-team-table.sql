-- Team tablosunu oluştur
CREATE TABLE Team (
    id INT IDENTITY(1,1) PRIMARY KEY,
    namesurname NVARCHAR(255) NOT NULL,
    position NVARCHAR(255) NOT NULL,
    url NVARCHAR(MAX) NULL,
    LinkedIn NVARCHAR(500) NULL
);

-- Örnek veriler ekle (isteğe bağlı)
INSERT INTO Team (namesurname, position, LinkedIn) VALUES 
('Ahmet Yılmaz', 'Genel Müdür', 'https://linkedin.com/in/ahmet-yilmaz'),
('Fatma Demir', 'Proje Müdürü', 'https://linkedin.com/in/fatma-demir'),
('Mehmet Kaya', 'Mühendis', 'https://linkedin.com/in/mehmet-kaya'),
('Ayşe Özkan', 'Tasarımcı', 'https://linkedin.com/in/ayse-ozkan');
