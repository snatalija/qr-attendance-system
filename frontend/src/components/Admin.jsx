import { useState } from 'react';

function Admin() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) return alert("Please fill in both fields!");

    const response = await fetch('http://localhost:5001/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: name, qrCode: code })
    });
    
    const data = await response.json();
    if (data.success) {
      alert("Employee registered!");
      setName(""); setCode("");
    }
  };

  return (
    <div className="admin-section">
      <h3>Register New Employee</h3>
      <form onSubmit={handleSubmit} className="admin-form">
        <input className="admin-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="admin-input" placeholder="Scan QR to Assign" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="admin-button">Save Employee</button>
      </form>
    </div>
  );
}

export default Admin;