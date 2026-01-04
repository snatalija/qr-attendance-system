import React from 'react';

function WorkReport({ reports }) {
  return (
    <div className="report-container">
      <h3>Work Hours Summary</h3>
      <table className="scans-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Date</th>
            <th>Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index}>
              <td>{report.user}</td>
              <td>{new Date(report.date).toLocaleDateString('en-GB')}</td>
              <td className="duration-cell">{report.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WorkReport;