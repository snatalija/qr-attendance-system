import { useState, useEffect } from 'react';
import './App.css';
import Scanner from './components/Scanner';
import Admin from './components/Admin';
import LogTable from './components/LogTable';
import { Parser } from '@json2csv/plainjs';

function App() {
  const [scans, setScans] = useState([]);
  const [message, setMessage] = useState("Scan your code...");
  const [stats, setStats] = useState({ totalScans: 0, presentEmployees: 0 });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logs');
      const data = await response.json();
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

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

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

  return (
    <div className="app-container">
      <h1>Attendance Tracking System</h1>
      
      <div className="stats-container">
        <div className="stat-card">
          <h4>Total Scans Today</h4>
          <p className="stat-number">{stats.totalScans}</p>
        </div>
        <div className="stat-card">
          <h4>Currently Present</h4>
          <p className="stat-number">{stats.presentEmployees}</p>
        </div>
      </div>
      
      <Scanner onScan={handleScan} message={message} />
      
      <div className="filter-container">
        <div className="date-picker-group">
          <label>View Day:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
        <button onClick={downloadCSV} className="admin-button btn-download">
          📥 Export This Day (CSV)
        </button>
      </div>

      <LogTable scans={filteredScans} />

      <Admin />
      
      <div className="reset-container">
        <button onClick={clearHistory} className="admin-button btn-reset">
          Clear All History (Danger)
        </button>
      </div>
    </div>
  );
}

export default App;