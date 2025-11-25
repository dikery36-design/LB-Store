const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// <--- ADD THIS: Import your new routes
const itemRoutes = require('./routes/itemRoutes');
const billRoutes = require('./routes/billRoutes'); 

const app = express();
app.use(cors());
// Increase payload limit to handle large base64-encoded images (default is 100kb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// <--- ADD THIS: Tell the app to use the routes when someone goes to '/items'
app.use('/items', itemRoutes);
app.use('/bills', billRoutes);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to MySQL Database successfully!');
});

app.get('/', (req, res) => {
    res.send("Backend is working!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});