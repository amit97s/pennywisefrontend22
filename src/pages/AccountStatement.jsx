import { Calendar, Search, FileSpreadsheet, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const AccountStatement = () => {
  const location = useLocation();
  const { userId, userName: initialUserName } = location.state || {};
  const [transactions, setTransactions] = useState([]);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalDebit, setTotalDebit] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [userCategory, setUserCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState(initialUserName);
  useEffect(() => {
    fetchUsers();
  }, []);
  useEffect(() => {
    if (userName) {
      fetchTransactions();
      fetchUserDetails();
    }
  }, [userName]);
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  const handleUserSelect = (selectedUser) => {
    setUserName(selectedUser.name);
    setSearchTerm('');
  };
  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const users = await response.json();
        const currentUser = users.find(user => user.name === userName);
        if (currentUser) {
          setOpeningBalance(Number(currentUser.amount));
          setUserCategory(currentUser.category);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };
  const calculateBalance = () => {
    if (userCategory === 'debtor') {
      return openingBalance + totalDebit - totalCredit;
    } else {
      return openingBalance + totalCredit - totalDebit;
    }
  };
  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        const userTransactions = data.filter(t => 
          t.creditEntry.account === userName || t.debitEntry.account === userName
        );
        setTransactions(userTransactions);
        let creditTotal = 0;
        let debitTotal = 0;
        userTransactions.forEach(t => {
          if (t.creditEntry.account === userName) {
            creditTotal += Number(t.creditEntry.amount);
          }
          if (t.debitEntry.account === userName) {
            debitTotal += Number(t.debitEntry.amount);
          }
        });
        
        setTotalCredit(creditTotal);
        setTotalDebit(debitTotal);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };
  const filteredUsers = searchTerm
    ? users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
const  exportToExcel = () => {
    const element = document.getElementById('account-statement-table');
    const wb = XLSX.utils.table_to_book(element);
    XLSX.writeFile(wb, 'account_statement.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Account Statement - ${userName}`, 14, 20);
    doc.setFontSize(12);
    doc.text(`Opening Balance: ₹${openingBalance.toFixed(2)}`, 14, 35);
    doc.text(`Total Entries: ${transactions.length}`, 14, 45);
    doc.text(`Total Debit: ₹${totalDebit.toFixed(2)}`, 14, 55);
    doc.text(`Total Credit: ₹${totalCredit.toFixed(2)}`, 14, 65);
    doc.text(`Balance Amount: ₹${calculateBalance().toFixed(2)}`, 14, 75);
    const tableData = transactions.map(transaction => {
      const isCredit = transaction.creditEntry.account === userName;
      const entry = isCredit ? transaction.creditEntry : transaction.debitEntry;
      const otherAccount = isCredit ? transaction.debitEntry.account : transaction.creditEntry.account;
      return [
        new Date(transaction.date).toLocaleDateString(),
        transaction.vnNo,
        isCredit ? 'Credit' : 'Debit',
        otherAccount,
        `₹${entry.amount}`,
        `₹${entry.expenses || 0}`,
        entry.narration
      ];
    });
    doc.autoTable({
      startY: 85,
      head: [['Date', 'VN No', 'Type', 'Account', 'Amount', 'Expenses', 'Narration']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [75, 75, 75] }
    });
    doc.save(`${userName}_account_statement.pdf`);
  };
  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-yellow-500">
          <Calendar className="h-6 w-6" />
        </span>
        Account Statement {userName ? `- ${userName}` : ''}
      </h1>
      <div className="mb-6 relative">
        <div className="flex items-center border rounded-lg bg-white p-2 shadow-sm">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full outline-none text-sm"
          />
        </div>
        {searchTerm && filteredUsers.length > 0 && (
          <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {user.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {userName && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <h3 className="text-sm font-medium text-gray-500">Opening Balance</h3>
              <p className="text-xl font-bold">₹{openingBalance.toFixed(2)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Entries</h3>
              <p className="text-xl font-bold">{transactions.length}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Debit</h3>
              <p className="text-xl font-bold">₹{totalDebit.toFixed(2)}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm text-center">
              <h3 className="text-sm font-medium text-gray-500">Total Credit</h3>
              <p className="text-xl font-bold">₹{totalCredit.toFixed(2)}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm text-center">
              <h3 className="text-sm font-medium text-gray-500">Balance Amount</h3>
              <p className="text-xl font-bold">₹{calculateBalance().toFixed(2)}</p>
            </div>
            
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VN No</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Narration</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => {
                        const isCredit = transaction.creditEntry.account === userName;
                        const entry = isCredit ? transaction.creditEntry : transaction.debitEntry;
                        const otherAccount = isCredit ? transaction.debitEntry.account : transaction.creditEntry.account;
                        return (
                          <tr key={transaction._id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{transaction.vnNo}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {isCredit ? 'Credit' : 'Debit'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{otherAccount}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{entry.amount}</td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{entry.expenses || 0}</td>
                            <td className="px-3 py-2 text-sm text-gray-500 truncate max-w-xs">{entry.narration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                </div>
                
              </div>
              
            </div>
            
            
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
              >
                <FileSpreadsheet className="h-5 w-5" />
                Export to Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
              >
                <FileText className="h-5 w-5" />
                Print to PDF
              </button>
            </div>
        </>
      )}
    </div>
  );
};

export default AccountStatement;
