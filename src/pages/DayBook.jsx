import { useState, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import API_BASE_URL from '../config/api';

const DayBook = () => {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({
    totalEntries: 0,
    totalDebit: 0,
    debitExpenses: 0,
    totalCredit: 0,
    creditExpenses: 0,
  });
  const printRef = useRef();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        const combinedTransactions = data.map(transaction => ({
          date: transaction.date,
          vnNo: transaction.vnNo,
          receivedFrom: transaction.creditEntry.account,
          paidTo: transaction.debitEntry.account,
          amount: transaction.creditEntry.amount,
          expenses: transaction.creditEntry.expenses || 0,
          narration: transaction.creditEntry.narration
        }));
        const totalEntries = combinedTransactions.length;
        const totalDebit = combinedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        const debitExpenses = combinedTransactions.reduce((sum, t) => sum + (t.expenses || 0), 0);
        const totalCredit = totalDebit;
        const creditExpenses = debitExpenses;
        setTransactions(combinedTransactions);
        setTotals({
          totalEntries,
          totalDebit,
          debitExpenses,
          totalCredit,
          creditExpenses,
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      transactions.map((t) => ({
        Date: formatDate(t.date),
        'Vo No': t.vnNo,
        'Received From': t.receivedFrom,
        'Paid To': t.paidTo,
        Amount: t.amount,
        Expenses: t.expenses,
        Narration: t.narration
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Day Book');
    XLSX.writeFile(workbook, 'DayBook.xlsx');
  };

  const handlePrintPDF = async () => {
    const input = printRef.current;
    if (!input) return;

    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('DayBook.pdf');
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen" ref={printRef}>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-yellow-500">
          <Calendar className="h-6 w-6" />
        </span>
        Day Book
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Entries</h3>
          <p className="text-xl font-bold">{totals.totalEntries}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Debit</h3>
          <p className="text-xl font-bold text-red-500">₹{totals.totalDebit.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Debit Expenses</h3>
          <p className="text-xl font-bold text-red-500">₹{totals.debitExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Total Credit</h3>
          <p className="text-xl font-bold text-green-500">₹{totals.totalCredit.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm text-center">
          <h3 className="text-sm font-medium text-gray-500">Credit Expenses</h3>
          <p className="text-xl font-bold text-green-500">₹{totals.creditExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="text-center text-gray-500 mb-6">
        {transactions.length === 0 ? 'No entries found for the selected criteria' : ''}
      </div>

      {transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <thead>
              <tr>
                {["Date", "Vo No", "Received From", "Paid To", "Amount", "Expenses", "Narration"].map((header, idx) => (
                  <th key={idx} className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{formatDate(t.date)}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{t.vnNo}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{t.receivedFrom}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{t.paidTo}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">₹{t.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">₹{(t.expenses || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{t.narration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <button
          onClick={handleExportExcel}
          className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
        >
          Export to Excel
        </button>
        <button
          onClick={handlePrintPDF}
          className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
        >
          Print to PDF
        </button>
      </div>
    </div>
  );
};

export default DayBook;
