const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER, // SQL Server kullanıcı adı
    password: process.env.DB_PASSWORD, // SQL Server şifresi
    server: process.env.DB_SERVER, // SQL Server adresi
    database: process.env.DB_DATABASE, // Veritabanı adı
    options: {
        encrypt: false, // Windows için false
        trustServerCertificate: true, // SSL sertifikası doğrulamasını atla
        enableArithAbort: true
    },
    port: 1433 // SQL Server varsayılan portu
};

const poolPromise= new sql.ConnectionPool(config)
.connect()
.then(pool => {
    return pool;
})
.catch(err => {
    console.error('Veritabanı bağlantı hatası: ',err);
});

module.exports = {
    config,
    sql,
    poolPromise
}; 

