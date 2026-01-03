import { useState, useEffect } from 'react'
import './App.css'
import Scanner from './components/Scanner'
import Admin from './components/Admin'
import LogTable from './components/LogTable'

function App() {
  const [scans, setScans] = useState([]);
  const [message, setMessage] = useState("Scan your code...");
  const [stats, setStats] = useState({ totalScans: 0, presentEmployees: 0 });

  // 1. Fetch all activity logs from the database
  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/logs');
      const data = await response.json();
      setScans(data);
    } catch (err) {
      console.error("Error loading logs:", err);
    }
  };

  // 2. Fetch daily statistics (Total scans & present employees)
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, []);

  // 3. Handle new QR scan
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
        setScans(prevScans => [data.data, ...prevScans]); // Add new scan to table
        fetchStats(); // Update dashboard cards immediately
        
        // Success Sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(e => console.log("Audio playback blocked"));
      } else {
        if (!data.isDuplicate) {
          setMessage(`⚠️ ${data.message}`);
        } else {
          console.log("Dupli sken je ignorisan na frontendu.");
        }
      }
    } catch (error) {
      setMessage("❌ Server is unreachable.");
    }
  };
  // 4. Delete all logs (Reset Database)
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

  return (
    <div className="app-container">
      <h1>Attendance Tracking System</h1>
      
      {/* Dashboard Stats */}
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
      
      {/* Scanner Component */}
      <Scanner onScan={handleScan} message={message} />
      
      <h3>Recent Activity:</h3>
      {/* Table Component */}
      <LogTable scans={scans} />

      {/* Admin Section */}
      <Admin />
      
      {/* Reset Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={clearHistory}
          className="admin-button" 
          style={{ background: '#e74c3c' }}
        >
          Clear Daily History (Reset)
        </button>
      </div>
    </div>
  );
}

export default App;