const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER, // SQL Server kullanıcı adı
    password: process.env.DB_PASSWORD, // SQL Server şifresi
    server: process.env.DB_SERVER, // SQL Server adresi
    database: process.env.DB_DATABASE, // Veritabanı adı
    options: {
        encrypt: true, // Azure SQL için true
        trustServerCertificate: true, // SSL sertifikası doğrulamasını atla
        enableArithAbort: true,
        requestTimeout: 30000, // 30 saniye timeout
        connectionTimeout: 30000, // 30 saniye connection timeout
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000
        }
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

