const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
require('dotenv').config();

// Create a dedicated connection pool for this route
// (Ideally, we move this to a shared config file later, but this works for now)
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// 1. GET ALL ITEMS (Fetch list for the App)
router.get('/', (req, res) => {
    const sql = "SELECT * FROM items";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// 2. ADD A NEW ITEM (For Admin to add stock)
router.post('/', (req, res) => {
    // We expect the frontend to send: name, rate, unit, category, image (optional URL or base64)
    const sql = "INSERT INTO items (`name`, `rate`, `unit`, `category`, `image`) VALUES (?)";
    const values = [
        req.body.name,
        req.body.rate,
        req.body.unit,
        req.body.category,
        req.body.image || null  // Image can be null if not provided
    ];

    db.query(sql, [values], (err, data) => {
        if (err) return res.json(err);
        return res.json({ message: "Item added successfully!", id: data.insertId });
    });
});

// 3. UPDATE ITEM (For Admin to update any attribute of an item)
router.put('/:id', (req, res) => {
    // Update any or all fields for an item
    const { name, rate, unit, category, image } = req.body;
    
    let updateFields = [];
    let values = [];
    
    if (name !== undefined) {
        updateFields.push('`name` = ?');
        values.push(name);
    }
    if (rate !== undefined) {
        updateFields.push('`rate` = ?');
        values.push(rate);
    }
    if (unit !== undefined) {
        updateFields.push('`unit` = ?');
        values.push(unit);
    }
    if (category !== undefined) {
        updateFields.push('`category` = ?');
        values.push(category);
    }
    if (image !== undefined) {
        updateFields.push('`image` = ?');
        values.push(image || null);
    }
    
    if (updateFields.length === 0) {
        return res.json({ message: "No fields to update" });
    }
    
    values.push(req.params.id);
    const sql = `UPDATE items SET ${updateFields.join(', ')} WHERE \`id\` = ?`;
    
    db.query(sql, values, (err, data) => {
        if (err) return res.json(err);
        return res.json({ message: "Item updated successfully!" });
    });
});

// 4. DELETE ITEM (For Admin to remove stock)
router.delete('/:id', (req, res) => {
    const sql = "DELETE FROM items WHERE id = ?";
    const id = req.params.id;

    db.query(sql, [id], (err, data) => {
        if (err) return res.json(err);
        return res.json({ message: "Item deleted successfully!" });
    });
});

module.exports = router;