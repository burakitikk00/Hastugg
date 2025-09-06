-- Contact Messages tablosu oluştur
CREATE TABLE ContactMessages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    first_name NVARCHAR(100) NOT NULL,
    last_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    is_read BIT DEFAULT 0,
    is_sent BIT DEFAULT 0
);

-- Index'ler ekle
CREATE INDEX IX_ContactMessages_CreatedAt ON ContactMessages(created_at);
CREATE INDEX IX_ContactMessages_IsRead ON ContactMessages(is_read);
CREATE INDEX IX_ContactMessages_IsSent ON ContactMessages(is_sent);
