const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const port = 5000;

const db = require('./routes/dbConfig');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Statik dosya servisi - uploads klasöründeki görselleri erişilebilir yap
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    db.testConnection();
});
