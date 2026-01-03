import { useState, useRef, useEffect } from 'react';

function Scanner({ onScan, message }) {
  const [qrInput, setQrInput] = useState("");
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQrInput(value);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (value.length > 5) {
        onScan(value);
        setQrInput(""); // Resetuje polje nakon slanja
      }
    }, 600);
  };

  return (
    <div className="scanner-section">
      <h2 className={`status-message ${message.includes('Welcome') ? 'status-success' : ''}`}>
        {message}
      </h2>
      <form onSubmit={(e) => { e.preventDefault(); onScan(qrInput); setQrInput(""); }}>
        <input
          ref={inputRef}
          className="scan-input"
          value={qrInput}
          onChange={handleInputChange}
          placeholder="Scan your QR code here..."
          onBlur={(e) => {
            if (!e.relatedTarget || e.relatedTarget.tagName !== 'INPUT') {
               setTimeout(() => inputRef.current?.focus(), 100);
            }
          }}
        />
      </form>
    </div>
  );
}

export default Scanner;