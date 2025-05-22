import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
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

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
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
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Vo No</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Received From</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Paid To</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Expenses</th>
                <th className="px-4 py-2 border-b text-left text-sm font-medium text-gray-500">Narration</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{formatDate(transaction.date)}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{transaction.vnNo}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{transaction.receivedFrom}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{transaction.paidTo}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">₹{transaction.amount.toFixed(2)}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">₹{(transaction.expenses || 0).toFixed(2)}</td>
                  <td className="px-4 py-2 border-b text-sm text-gray-700">{transaction.narration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600">
          Export to Excel
        </button>
        <button className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600">
          Print to PDF
        </button>
      </div>
    </div>
  );
};

export default DayBook;