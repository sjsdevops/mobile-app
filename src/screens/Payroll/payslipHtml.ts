import type { EmployeeSalary } from '../../services/payrollService';

// App logo encoded as a simple SVG school icon (placeholder until replaced)
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56">
  <rect width="56" height="56" rx="12" fill="#144FCC"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="26" font-family="Arial" font-weight="bold" fill="white">SJ</text>
</svg>`;

function fmt(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function fmtMonth(month: string): string {
    const [y, m] = month.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function generatePayslipHtml(salary: EmployeeSalary): string {
    const logoDataUri = `data:image/svg+xml;base64,${btoa(LOGO_SVG)}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Payslip - ${fmtMonth(salary.salary_month)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f4f6fb; color: #1f2937; }
  .page { max-width: 680px; margin: 0 auto; background: #fff; }

  /* Header */
  .header { background: linear-gradient(135deg, #144FCC 0%, #1e3a8a 100%); padding: 28px 32px; display: flex; align-items: center; gap: 18px; }
  .header img { width: 56px; height: 56px; border-radius: 12px; }
  .header-text { flex: 1; }
  .header-text h1 { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
  .header-text p { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }
  .slip-badge { background: rgba(255,255,255,0.15); border-radius: 8px; padding: 8px 16px; text-align: right; }
  .slip-badge span { display: block; font-size: 11px; color: rgba(255,255,255,0.7); }
  .slip-badge strong { display: block; font-size: 15px; font-weight: 700; color: #fff; margin-top: 2px; }

  /* Employee info */
  .info-bar { background: #f8faff; border-bottom: 1px solid #e5e7eb; padding: 18px 32px; display: flex; gap: 32px; flex-wrap: wrap; }
  .info-item label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-item span { display: block; font-size: 14px; font-weight: 600; color: #111827; margin-top: 2px; }

  /* Pay period */
  .period-bar { padding: 12px 32px; background: #eff6ff; border-bottom: 1px solid #dbeafe; font-size: 13px; color: #1d4ed8; font-weight: 500; }

  /* Summary strip */
  .summary { display: flex; padding: 20px 32px; gap: 0; border-bottom: 1px solid #e5e7eb; }
  .summary-item { flex: 1; text-align: center; border-right: 1px solid #e5e7eb; }
  .summary-item:last-child { border-right: none; }
  .summary-item .label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .summary-item .value { font-size: 18px; font-weight: 700; color: #111827; margin-top: 4px; }
  .summary-item .value.green { color: #059669; }
  .summary-item .value.red { color: #dc2626; }

  /* Earnings / Deductions tables */
  .section { padding: 0 32px; margin-top: 24px; }
  .section h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: #374151; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px solid #f3f4f6; }
  td { padding: 10px 4px; font-size: 13px; }
  td:last-child { text-align: right; font-weight: 600; }
  .total-row td { font-weight: 700; font-size: 14px; background: #f9fafb; border-top: 2px solid #e5e7eb; }

  /* Net salary */
  .net-bar { margin: 24px 32px 32px; background: linear-gradient(135deg, #144FCC, #1e3a8a); border-radius: 16px; padding: 22px 28px; display: flex; justify-content: space-between; align-items: center; }
  .net-bar .net-label { font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 500; }
  .net-bar .net-amount { font-size: 26px; font-weight: 800; color: #fff; }

  /* Footer */
  .footer { text-align: center; font-size: 11px; color: #9ca3af; padding: 12px 32px 28px; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <img src="${logoDataUri}" alt="Logo"/>
    <div class="header-text">
      <h1>Sree Jayam School</h1>
      <p>Employee Payslip</p>
    </div>
    <div class="slip-badge">
      <span>Salary Month</span>
      <strong>${fmtMonth(salary.salary_month)}</strong>
    </div>
  </div>

  <!-- Employee Info -->
  <div class="info-bar">
    <div class="info-item">
      <label>Employee Name</label>
      <span>${salary.staff_name || '—'}</span>
    </div>
    <div class="info-item">
      <label>Days Worked</label>
      <span>${salary.nod} days</span>
    </div>
    <div class="info-item">
      <label>Generated On</label>
      <span>${fmtDate(salary.generated_at)}</span>
    </div>
  </div>

  <!-- Pay Period -->
  <div class="period-bar">
    📅 Pay Period: ${fmtDate(salary.period_start)} — ${fmtDate(salary.period_end)}
  </div>

  <!-- Summary Strip -->
  <div class="summary">
    <div class="summary-item">
      <div class="label">Gross Pay</div>
      <div class="value green">${fmt(salary.gross)}</div>
    </div>
    <div class="summary-item">
      <div class="label">Total Deductions</div>
      <div class="value red">${fmt(salary.total_deduct)}</div>
    </div>
    <div class="summary-item">
      <div class="label">LOP Days</div>
      <div class="value">${salary.lop > 0 ? fmt(salary.lop) : '0'}</div>
    </div>
  </div>

  <!-- Earnings -->
  <div class="section">
    <h2>Earnings</h2>
    <table>
      <tr><td>Basic Pay</td><td>${fmt(salary.basic_pay)}</td></tr>
      <tr><td>House Rent Allowance (HRA)</td><td>${fmt(salary.hra)}</td></tr>
      <tr><td>Per Day Rate × ${salary.nod} days</td><td>${fmt(salary.sal_per_day)} × ${salary.nod}</td></tr>
      <tr class="total-row"><td>Total Gross</td><td>${fmt(salary.gross)}</td></tr>
    </table>
  </div>

  <!-- Deductions -->
  <div class="section" style="margin-top:20px; margin-bottom: 0;">
    <h2>Deductions</h2>
    <table>
      <tr><td>Provident Fund (PF)${!salary.is_pf_applicable ? ' <span style="color:#9ca3af;font-size:11px">(Not applicable)</span>' : ''}</td><td>${fmt(salary.pf)}</td></tr>
      <tr><td>ESI${!salary.is_esi_applicable ? ' <span style="color:#9ca3af;font-size:11px">(Not applicable)</span>' : ''}</td><td>${fmt(salary.esi)}</td></tr>
      <tr><td>Loss of Pay (LOP)</td><td>${fmt(salary.lop)}</td></tr>
      <tr class="total-row"><td>Total Deductions</td><td>${fmt(salary.total_deduct)}</td></tr>
    </table>
  </div>

  <!-- Net Salary -->
  <div class="net-bar">
    <div class="net-label">Net Take-Home Salary</div>
    <div class="net-amount">${fmt(salary.net_salary)}</div>
  </div>

  <div class="footer">This is a system-generated payslip. No signature required.</div>

</div>
</body>
</html>`;
}
