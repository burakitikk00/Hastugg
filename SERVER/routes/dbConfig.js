const sql = require('mssql');

const config = {
    user: 'LinaButik', // SQL Server kullanıcı adı
    password: 'adminlina', // SQL Server şifresi
    server: 'DESKTOP-8IUA2EP', // SQL Server adresi
    database: 'dbHastug', // Veritabanı adı
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

