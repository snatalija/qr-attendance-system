import { useState } from 'react';

function Admin() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [file, setFile] = useState(null); // State za fajl slike

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !code) return alert("Please fill in both fields!");

    // Koristimo FormData umesto običnog JSON-a jer šaljemo fajl
    const formData = new FormData();
    formData.append('fullName', name);
    formData.append('qrCode', code);
    if (file) {
      formData.append('image', file);
    }

    try {
      const response = await fetch('http://localhost:5001/api/employees', {
        method: 'POST',
        // OVDE NE IDE HEADERS (Content-Type), browser sam postavlja multipart/form-data
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert("Employee registered successfully!");
        // Resetovanje forme
        setName("");
        setCode("");
        setFile(null);
        // Resetovanje input polja za fajl vizuelno
        e.target.reset();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Server is not responding.");
    }
  };

  return (
    <section className="admin-section-box">
      <h3>Register New Employee</h3>
      <form onSubmit={handleSubmit} className="employee-form">
        
        <div className="form-group">
          <label>Full Name</label>
          <input 
            className="admin-input" 
            type="text"
            placeholder="e.g. Natalija Simonovic" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label>QR Code / ID</label>
          <input 
            className="admin-input" 
            type="text"
            placeholder="Scan or type ID" 
            value={code} 
            onChange={(e) => setCode(e.target.value)} 
          />
        </div>

        <div className="form-group">
          <label>Profile Image</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files[0])}
            style={{ padding: '8px 0' }}
          />
        </div>

        <button type="submit" className="btn-save-employee">
          Save Employee
        </button>
      </form>
    </section>
  );
}

export default Admin;