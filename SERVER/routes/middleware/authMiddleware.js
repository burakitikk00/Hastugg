
const jwt = require('jsonwebtoken');
// Not: SECRET_KEY'i adminRoutes'tan buraya taşımak veya
// merkezi bir config dosyasında tutmak daha iyi bir pratiktir.
const SECRET_KEY = 'your_super_secret_and_long_key_that_no_one_can_guess'; 

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