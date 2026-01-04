import React from 'react';

function LogTable({ scans }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false // Da bi bilo 15:00, a ne 3:00 PM
    });
  };

  return (
    <div className="table-container">
      <table className="scans-table">
        <thead>
          <tr>
            <th>User / QR Code</th>
            <th>Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, index) => (
            <tr key={scan._id || index} className={index === 0 ? "newest-row" : ""}>
              <td className="user-name">{scan.qrCode}</td>
              <td className="timestamp-cell">{formatTime(scan.timestamp)}</td>
              <td>
                <span className={`status-badge ${scan.type === 'IN' ? 'status-in' : 'status-out'}`}>
                  {scan.type === 'IN' ? '● Check-In' : '● Check-Out'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LogTable;