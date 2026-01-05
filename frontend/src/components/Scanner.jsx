import { useState, useRef, useEffect } from 'react';

function Scanner({ onScan, message }) {
  const [qrInput, setQrInput] = useState("");
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQrInput(value);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      if (value.length > 2) { 
        onScan(value);
        setQrInput(""); 
      }
    }, 600);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (qrInput.trim()) {
      onScan(qrInput);
      setQrInput("");
    }
  };

  return (
    <div className="scanner-section">
      <h2 className={`status-message ${message.includes('✅') ? 'status-success' : ''}`}>
        {message}
      </h2>
      
      <form onSubmit={handleFormSubmit}>
        <input
          ref={inputRef}
          className="scan-input"
          value={qrInput}
          onChange={handleInputChange}
          placeholder="Scan your QR code here..."
          autoComplete="off"
          onBlur={(e) => {
            const nextFocus = e.relatedTarget?.tagName;
            
            if (
              nextFocus === 'SELECT' || 
              nextFocus === 'BUTTON' || 
              nextFocus === 'INPUT' || 
              nextFocus === 'OPTION'
            ) {
              return;
            }

            setTimeout(() => {
              if (inputRef.current) inputRef.current.focus();
            }, 150);
          }}
        />
      </form>
      <p className="scanner-hint">Scanner is active. Keep this field ready.</p>
    </div>
  );
}

export default Scanner;