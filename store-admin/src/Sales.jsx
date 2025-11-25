import React, { useEffect, useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Sales.css';

const API_URL = 'https://store-backend-api-athi.onrender.com/bills';

export default function Sales() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const results = bills.filter(bill => 
      bill.id.toString().includes(searchTerm) || 
      (bill.cashier_id && bill.cashier_id.toString().includes(searchTerm))
    );
    setFilteredBills(results);
  }, [searchTerm, bills]);

  const fetchBills = async () => {
    try {
      const res = await axios.get(API_URL);
      setBills(res.data);
      setFilteredBills(res.data);
      const total = res.data.reduce((sum, bill) => sum + parseFloat(bill.total_amount), 0);
      setTotalRevenue(total);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const generatePDF = async (billId) => {
    try {
      const res = await axios.get(`${API_URL}/${billId}`);
      const { id, created_at, total_amount, items } = res.data;
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("L.B STORE", 105, 20, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Amlarem 793161", 105, 27, { align: "center" });
      
      // Divider line
      doc.setDrawColor(0, 0, 0);
      doc.line(10, 32, 200, 32);
      
      // Bill info
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Bill No: #${id}`, 14, 42);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Date: ${formatDate(created_at)}`, 14, 48);
      
      // Table columns
      const tableColumn = ["Item Name", "Qty", "Rate", "Amount"];
      const tableRows = [];
      
      items.forEach(item => {
        const itemData = [
          item.name || "N/A",
          `${item.quantity || 0} ${item.unit || 'pcs'}`,
          `Rs. ${parseFloat(item.rate || 0).toFixed(2)}`,
          `Rs. ${parseFloat(item.subtotal || 0).toFixed(2)}`
        ];
        tableRows.push(itemData);
      });
      
      // Auto table
      autoTable(doc, {
        startY: 55,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [27, 27, 29],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 10,
          halign: 'left'
        },
        columnStyles: {
          1: { halign: 'center' },
          2: { halign: 'right' },
          3: { halign: 'right' }
        },
        margin: { left: 10, right: 10 }
      });
      
      // Total
      const finalY = doc.lastAutoTable.finalY + 8;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setDrawColor(0, 0, 0);
      doc.line(10, finalY - 2, 200, finalY - 2);
      doc.text(`Total: Rs. ${parseFloat(total_amount || 0).toFixed(2)}`, 195, finalY + 6, { align: "right" });
      doc.line(10, finalY + 10, 200, finalY + 10);
      
      // Footer
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Thank you for shopping with us!", 105, finalY + 20, { align: "center" });
      
      doc.save(`Receipt_Bill_${id}.pdf`);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to generate PDF");
    }
  };

  return (
    <div className="sales-container">
      
      {/* --- STATS ROW (Design JSON: Mixed Dark/Light Cards) --- */}
      <div className="stats-row">
        
        {/* Card 1: Dark Theme (Primary) */}
        <div className="stat-card card-dark">
          <div className="stat-icon-circle">💰</div>
          <div className="stat-details">
             <span className="label">Total Revenue</span>
             <h2 className="value">₹{totalRevenue.toFixed(2)}</h2>
             <span className="change-text positive">↗ +12% from last week</span>
          </div>
        </div>

        {/* Card 2: Light Theme */}
        <div className="stat-card card-light">
          <div className="stat-icon-circle light-icon">🧾</div>
          <div className="stat-details">
             <span className="label">Total Bills</span>
             <h2 className="value">{bills.length}</h2>
             <span className="change-text neutral">- No change</span>
          </div>
        </div>

        {/* Card 3: Light Theme */}
        <div className="stat-card card-light">
          <div className="stat-icon-circle light-icon">📈</div>
          <div className="stat-details">
             <span className="label">Avg. Bill Value</span>
             <h2 className="value">₹{bills.length > 0 ? (totalRevenue / bills.length).toFixed(2) : '0'}</h2>
             <span className="change-text positive">↗ +5%</span>
          </div>
        </div>

      </div>

      {/* --- RECENT TRANSACTIONS TABLE --- */}
      <div className="card-panel transactions-panel">
        <div className="panel-header">
          <h3>Transactions</h3>
          <div className="mini-search">
             <input 
               placeholder="Search Bill ID..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        <div className="table-container">
          <table className="design-table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Date</th>
                <th>Cashier</th>
                <th>Status</th>
                <th style={{textAlign: 'left'}}>Amount</th>
                <th style={{textAlign: 'left'}}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td><span className="id-badge">#{bill.id}</span></td>
                  <td className="text-secondary">{formatDate(bill.created_at)}</td>
                  <td className="font-medium">User {bill.cashier_id}</td>
                  <td><span className="status-badge groceries">Paid</span></td>
                  <td className="text-left font-bold">₹{parseFloat(bill.total_amount).toFixed(2)}</td>
                  <td className="text-center">
                    <button onClick={() => generatePDF(bill.id)} className="icon-btn">
                      📥
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}