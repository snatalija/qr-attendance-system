import React from 'react';

function LogTable({ scans }) {
  return (
    <div className="table-container">
      <table className="scans-table">
        <thead>
          <tr>
            <th>User / QR Code</th>
            <th>Timestamp</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan, index) => (
            <tr key={scan._id || index} className={index === 0 ? "newest-row" : ""}>
              <td>{scan.qrCode}</td>
              <td>{new Date(scan.timestamp).toLocaleString('sr-RS')}</td>
              <td>
                <span className={`status-badge ${scan.type}`}>
                  {scan.type === 'IN' ? '🟢 Check-In' : '🔴 Check-Out'}
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