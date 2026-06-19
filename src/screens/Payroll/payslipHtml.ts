import type { EmployeeSalary } from '../../services/payrollService';
import { Asset } from 'expo-asset';

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

function numberToWords(num: number): string {
    if (num === 0) return 'Zero';

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    function convertLessThanThousand(n: number): string {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    }

    const crore = Math.floor(num / 10000000);
    const lakh = Math.floor((num % 10000000) / 100000);
    const thousand = Math.floor((num % 100000) / 1000);
    const remainder = num % 1000;

    let result = '';
    if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
    if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
    if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
    if (remainder > 0) result += convertLessThanThousand(remainder);

    return result.trim() + ' Rupees Only';
}

export function generatePayslipHtml(salary: EmployeeSalary): string {
    // Get the app logo asset URI
    const logoAsset = Asset.fromModule(require('../../../assets/icon.png'));
    const logoUri = logoAsset.uri || 'https://via.placeholder.com/56x56/144FCC/ffffff?text=SJ';
    
    const netAmountInWords = numberToWords(Math.round(salary.net_salary));

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
  .net-bar { margin: 24px 32px 32px; background: linear-gradient(135deg, #144FCC, #1e3a8a); border-radius: 16px; padding: 22px 28px; }
  .net-bar-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .net-bar .net-label { font-size: 14px; color: rgba(255,255,255,0.8); font-weight: 500; }
  .net-bar .net-amount { font-size: 26px; font-weight: 800; color: #fff; }
  .net-bar .net-words { font-size: 12px; color: rgba(255,255,255,0.75); font-style: italic; margin-top: 8px; }

  /* Footer */
  .footer { text-align: center; font-size: 13px; color: #4b5563; padding: 12px 32px 28px; font-weight: 500; }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <img src="${logoUri}" alt="Logo" style="object-fit: cover;"/>
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
  <div class="period-bar" style="display:flex; align-items:center; gap:10px">
  <span>
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" fill ="#144FCC" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="16" height="16"><path d="M0,8v-1C0,4.243,2.243,2,5,2h1V1c0-.552,.447-1,1-1s1,.448,1,1v1h8V1c0-.552,.447-1,1-1s1,.448,1,1v1h1c2.757,0,5,2.243,5,5v1H0Zm24,2v9c0,2.757-2.243,5-5,5H5c-2.757,0-5-2.243-5-5V10H24Zm-12,9c0-.552-.447-1-1-1H6c-.553,0-1,.448-1,1s.447,1,1,1h5c.553,0,1-.448,1-1Zm7-4c0-.552-.447-1-1-1H6c-.553,0-1,.448-1,1s.447,1,1,1h12c.553,0,1-.448,1-1Z"/></svg>
</span>
<p>
    Pay Period: ${fmtDate(salary.period_start)} — ${fmtDate(salary.period_end)}
    <p>
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
    <div class="net-bar-top">
      <div class="net-label">Net Take-Home Salary</div>
      <div class="net-amount">${fmt(salary.net_salary)}</div>
    </div>
    <div class="net-words">${netAmountInWords}</div>
  </div>

  <div class="footer">This is a system-generated payslip. No signature required.</div>

</div>
</body>
</html>`;
}
