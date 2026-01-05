import { useState, useEffect } from 'react';
import './App.css';
import Scanner from './components/Scanner';
import Admin from './components/Admin';
import LogTable from './components/LogTable';
import { Parser } from '@json2csv/plainjs';
import WorkReport from './components/WorkReport';

function App() {
  const [scans, setScans] = useState([]);
  const [message, setMessage] = useState("Scan your code...");
  const [stats, setStats] = useState({ totalScans: 0, presentEmployees: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [reports, setReports] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAdmin, setIsAdmin] = useState(false);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = [2024, 2025, 2026];
  const [adminPin, setAdminPin] = useState("");
  const ADMIN_PASSWORD = "1234";

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logs');
      const data = await response.json();
      console.log("Stiglo logova iz baze:", data.length);
      setScans(data);
    } catch (err) {
      console.error("Error loading logs:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };
  const fetchReports = async () => {
    const res = await fetch(`http://localhost:5001/api/reports?month=${selectedMonth}&year=${selectedYear}`);
    const data = await res.json();
    console.log("DEBUG: Podaci koji su stigli:", data);
    setReports(data);
  };
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedMonth, selectedYear]);

  const handleScan = async (code) => {
    try {
      const response = await fetch('http://localhost:5001/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode: code })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        setScans(prevScans => [data.data, ...prevScans]);
        fetchStats();
        
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio blocked"));
        setTimeout(() => setMessage("Scan your code..."), 3000);
      } else {
        if (!data.isDuplicate) {
          setMessage(`⚠️ ${data.message}`);
          setTimeout(() => setMessage("Scan your code..."), 3000);
        }
      }
    } catch (error) {
      setMessage("❌ Server is unreachable.");
    }
  };

  const clearHistory = async () => {
    if (window.confirm("Are you sure you want to clear all attendance logs?")) {
      try {
        const response = await fetch('http://localhost:5001/api/logs', { method: 'DELETE' });
        const data = await response.json();
        if (data.success) {
          setScans([]);
          fetchStats();
          setMessage("History cleared successfully.");
        }
      } catch (err) {
        alert("Error clearing history.");
      }
    }
  };

  // Logic for filtering scans by the selected date
  const filteredScans = scans.filter(scan => {
    const scanDate = new Date(scan.timestamp).toISOString().split('T')[0];
    return scanDate === selectedDate;
  });

  const downloadCSV = () => {
    try {
      const fields = [
        { label: 'Date', value: (row) => new Date(row.timestamp).toLocaleDateString('en-GB') },
        { label: 'User', value: 'qrCode' },
        { label: 'Time', value: (row) => new Date(row.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) },
        { label: 'Status', value: 'type' }
      ];
      
      const parser = new Parser({ fields });
      const csv = parser.parse(filteredScans);

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${selectedDate}.csv`);
      link.click();
    } catch (err) {
      console.error("CSV Export Error:", err);
    }
  };

  const downloadMonthlyCSV = () => {
  if (!reports || reports.length === 0) {
    alert("Table is empty. Please wait for data to load or check if the month/year are correct.");
    return;
  }

  try {
    const fields = [
      { label: 'Employee', value: 'user' },
      { label: 'Total Time', value: 'duration' },
      { label: 'Decimal Hours', value: 'totalHours' }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(reports);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = `Report_${months[selectedMonth - 1]}_${selectedYear}.csv`;
    link.setAttribute('download', fileName);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("Export successful for:", fileName);
  } catch (err) {
    console.error("Export failed:", err);
  }
};

  const handleAdminAccess = () => {
  if (isAdmin) {
    setIsAdmin(false);
    setAdminPin(""); 
  } else {
    const enteredPin = prompt("Enter Admin PIN:");
    if (enteredPin === ADMIN_PASSWORD) {
      setIsAdmin(true);
    } else if (enteredPin !== null) {
      alert("Incorrect PIN!");
    }
  }
};
  return (
    <div className="app-container">
      <nav className="main-nav">
        <button 
          onClick={handleAdminAccess}
          className="nav-toggle"
        >
          {isAdmin ? "⬅ Back to Scanner" : "Admin"}
        </button>
      </nav>

      {!isAdmin ? (
        <div className="kiosk-mode">
          <h1>Welcome to Attendance System</h1>
          <div className="stats-container">
            <div className="stat-card">
              <h4>Total Scans Today</h4>
              <p className="stat-number">{stats.totalScans}</p>
            </div>
            <div className="stat-card">
              <h4>Present Employees</h4>
              <p className="stat-number">{stats.presentEmployees}</p>
            </div>
          </div>
          
          <Scanner onScan={handleScan} message={message} />
        </div>
      ) : (
        <div className="admin-panel animate-in">
          <h2>Admin Dashboard</h2>
          
          <section className="admin-section-box">
            <h3>Daily Logs & Export</h3>
            <div className="filter-container">
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
              <button onClick={downloadCSV} className="admin-button btn-download">
                📥 Download Daily CSV
              </button>
            </div>
            <LogTable scans={filteredScans} />
          </section>

          <section className="admin-section-box">
            <h3>Payroll / Monthly Summary</h3>
            <div className="month-filter-container">
              <label>Select Month:</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="month-select"
              >
                {months.map((m, i) => (
                  <option key={i+1} value={i+1}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="year-select"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <button onClick={downloadMonthlyCSV} className="admin-button btn-download">
                📥 Export Monthly Summary
              </button>
            </div>
            <WorkReport reports={reports} />
          </section>

          <Admin onScan={handleScan} />

          <div className="reset-container">
            <button onClick={clearHistory} className="admin-button btn-reset">
              Clear All History (Danger)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;