const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// POST /bills - Create a new Bill
router.post('/', (req, res) => {
    console.log("📥 Received Billing Request:", req.body); // <--- DEBUG LOG

    const { cashier_id, total_amount, items } = req.body;

    // Validation: Check if we have the data we need
    if (!cashier_id || !total_amount || !items || items.length === 0) {
        return res.status(400).json({ 
            message: "Missing Data! Need cashier_id, total_amount, and items." 
        });
    }

    // 1. Insert into 'bills' table first
    const billSql = "INSERT INTO bills (cashier_id, total_amount) VALUES (?, ?)";
    
    db.query(billSql, [cashier_id, total_amount], (err, result) => {
        if (err) {
            console.error("❌ Error saving Bill Header:", err);
            return res.status(500).json(err);
        }

        const newBillId = result.insertId; 

        // 2. Prepare data for 'bill_items'
        const billItemsData = items.map(item => [
            newBillId, 
            item.item_id, 
            item.quantity, 
            item.rate, 
            item.subtotal
        ]);

        // 3. Bulk Insert items
        const itemsSql = "INSERT INTO bill_items (bill_id, item_id, quantity, rate, subtotal) VALUES ?";
        
        db.query(itemsSql, [billItemsData], (err, result) => {
            if (err) {
                console.error("❌ Error saving Bill Items:", err);
                return res.status(500).json(err);
            }
            
            console.log("✅ Bill Saved! ID:", newBillId);
            res.json({ 
                message: "Bill generated successfully!", 
                bill_id: newBillId 
            });
        });
    });
});

router.get('/', (req, res) => {
    const sql = "SELECT * FROM bills ORDER BY created_at DESC";
    db.query(sql, (err, data) => {
        if (err) return res.json(err);
        return res.json(data);
    });
});

// GET /bills/:id - Fetch a single bill with its items
router.get('/:id', (req, res) => {
    const billId = req.params.id;

    // 1. Get Bill Header
    const billSql = "SELECT * FROM bills WHERE id = ?";
    
    db.query(billSql, [billId], (err, billResult) => {
        if (err) return res.status(500).json(err);
        if (billResult.length === 0) return res.status(404).json({ message: "Bill not found" });

        const bill = billResult[0];

        // 2. Get Bill Items (Joined with Item names)
        const itemsSql = `
            SELECT bi.*, i.name 
            FROM bill_items bi 
            JOIN items i ON bi.item_id = i.id 
            WHERE bi.bill_id = ?
        `;

        db.query(itemsSql, [billId], (err, itemsResult) => {
            if (err) return res.status(500).json(err);
            
            // Return combined data
            res.json({ ...bill, items: itemsResult });
        });
    });
});

module.exports = router;