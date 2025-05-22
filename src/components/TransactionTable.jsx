import React, { useState } from 'react';

const TransactionTable = ({ transactions, type, onDelete }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(transactions.map(t => t.vnNo || t._id));
      setSelectAll(true);
    } else {
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows(prev => {
      if (prev.includes(id)) {
        return prev.filter(rowId => rowId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDelete = () => {
    if (selectedRows.length > 0 && onDelete) {
      onDelete(selectedRows);
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  return (
    <div className="bg-white shadow-sm overflow-x-auto mt-2"  style={{ maxHeight: '256px',minHeight:'256px' }}>
      {selectedRows.length > 0 && (
        <div className="p-2 bg-gray-50 border-b">
          <button 
            onClick={handleDelete}
            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
          >
            Delete Selected
          </button>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200 border-2">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left">
              <input 
                type="checkbox" 
                className="rounded border-gray-300"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Voucher No</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Narration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 ">
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-2 text-sm text-center text-gray-500">
                No transactions to display
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <tr key={transaction.vnNo || index}>
                <td className="px-3 py-2">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300"
                    checked={selectedRows.includes(transaction.vnNo || transaction._id)}
                    onChange={() => handleSelectRow(transaction.vnNo || transaction._id)}
                  />
                </td>
                <td className="px-3 py-2 text-sm">{formatDate(transaction.date)}</td>
                <td className="px-3 py-2 text-sm">{transaction.vnNo}</td>
                <td className="px-3 py-2 text-sm">{transaction.account}</td>
                <td className="px-3 py-2 text-sm">{transaction.amount}</td>
                <td className="px-3 py-2 text-sm">{transaction.expenses}</td>
                <td className="px-3 py-2 text-sm">{transaction.narration}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;