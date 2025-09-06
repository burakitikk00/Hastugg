
const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT secret key'i environment variable'dan al
const SECRET_KEY = process.env.JWT_SECRET; 

const verifyToken = (req, res, next) => {
    // 1. İstek başlıklarından token'ı al
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN" formatından sadece TOKEN'ı al

    // 2. Token yoksa hata gönder
    if (token == null) {
        return res.status(401).send('Erişim reddedildi: Token bulunamadı.');
    }

    // 3. Token'ı doğrula
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).send('Geçersiz token.');
        }
        
        // 4. Token geçerliyse, kullanıcı bilgisini isteğe ekle ve devam et
        req.user = user;
        next(); // Her şey yolunda, bir sonraki fonksiyona geç
    });
};

module.exports = verifyToken;