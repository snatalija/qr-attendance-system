import React from 'react';

function WorkReport({ reports }) {
  return (
    <div className="report-table-container">
      <table className="report-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Total Hours (Text)</th>
            <th>Decimal (for Payroll)</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((report, index) => (
              <tr key={index}>
                <td>{report.user}</td>
                <td>{report.duration}</td>
                <td>{report.totalHours} h</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>No data for this period</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
export default WorkReport;