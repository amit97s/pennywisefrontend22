import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const TrialBalance = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [openingBalances, setOpeningBalances] = useState({});

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateUserBalance = (userName, category) => {
    let creditTotal = 0;
    let debitTotal = 0;
    const openingBalance = openingBalances[userName] || 0;

    transactions.forEach(t => {
      if (t.creditEntry.account === userName) {
        creditTotal += Number(t.creditEntry.amount);
      }
      if (t.debitEntry.account === userName) {
        debitTotal += Number(t.debitEntry.amount);
      }
    });

    if (category === 'debtor') {
      return openingBalance + debitTotal - creditTotal;
    } else {
      return openingBalance + creditTotal - debitTotal;
    }
  };

  const fetchUsers = async () => {
    try {
      // Update in fetchUsers
      const response = await fetch(`${API_BASE_URL}/api/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        
        const balances = {};
        data.forEach(user => {
          balances[user.name] = Number(user.amount);
        });
        setOpeningBalances(balances);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserClick = (user) => {
    navigate('/account-statement', { state: { userId: user._id, userName: user.name } });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const creditUsers = filteredUsers.filter(user => user.category === 'creditor');
  const debitUsers = filteredUsers.filter(user => user.category === 'debtor');

  const totalCredit = creditUsers.reduce((sum, user) => sum + Number(user.amount), 0);
  const totalDebit = debitUsers.reduce((sum, user) => sum + Number(user.amount), 0);

  const calculateExpenses = () => {
    const expenses = transactions.reduce((acc, t) => {
      return {
        creditExpenses: acc.creditExpenses + (Number(t.creditEntry.expenses) || 0),
        debitExpenses: acc.debitExpenses + (Number(t.debitEntry.expenses) || 0)
      };
    }, { creditExpenses: 0, debitExpenses: 0 });
    
    return expenses;
  };

  const { creditExpenses, debitExpenses } = calculateExpenses();

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by account name..."
            className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <div className="mb-4 grid grid-cols-2">
            <h3 className="text-sm font-medium text-gray-500">Account</h3>
            <h3 className="text-sm font-medium text-gray-500 text-right">Amount</h3>
          </div>
          <div className="h-64 overflow-y-auto">
            <div className="grid grid-cols-2 mb-4 border-b border-red-200 pb-2">
              <span className="text-sm font-medium text-gray-500">Expenses</span>
              <span className="text-sm font-medium text-gray-500 text-right">₹{creditExpenses.toFixed(2)}</span>
            </div>
            {creditUsers.map((user) => (
              <div 
                key={user._id} 
                className="grid grid-cols-2 mb-2 cursor-pointer hover:bg-red-100" 
                onClick={() => handleUserClick(user)}
              >
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-sm text-gray-700 text-right">₹{user.amount}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-red-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-500">Total Credit</h3>
            <div className="text-right">
              {/* <p className="text-sm font-medium text-gray-500">₹{totalCredit.toFixed(2)}</p> */}
              {/* <p className="text-sm font-medium text-gray-500">Expenses: ₹{creditExpenses.toFixed(2)}</p> */}
              <p className="text-sm font-bold text-red-500">₹{totalCredit.toFixed(2)} CR</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-lg shadow-sm p-4">
          <div className="mb-4 grid grid-cols-2">
            <h3 className="text-sm font-medium text-gray-500">Account</h3>
            <h3 className="text-sm font-medium text-gray-500 text-right">Amount</h3>
          </div>
          <div className="h-64 overflow-y-auto">
            <div className="grid grid-cols-2 mb-4 border-b border-green-200 pb-2">
              <span className="text-sm font-medium text-gray-500">Expenses</span>
              <span className="text-sm font-medium text-gray-500 text-right">₹{debitExpenses.toFixed(2)}</span>
            </div>
            {debitUsers.map((user) => (
              <div 
                key={user._id} 
                className="grid grid-cols-2 mb-2 cursor-pointer hover:bg-green-100" 
                onClick={() => handleUserClick(user)}
              >
                <span className="text-sm text-gray-700">{user.name}</span>
                <span className="text-sm text-gray-700 text-right">₹{calculateUserBalance(user.name, 'debtor').toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center border-t border-green-200 pt-4 mt-4">
            <h3 className="text-sm font-medium text-gray-500">Total Debit</h3>
            <div className="text-right">
              {/* <p className="text-sm font-medium text-gray-500">₹{debitUsers.reduce((sum, user) => sum + calculateUserBalance(user.name), 0).toFixed(2)}</p> */}
              <p className="text-sm font-bold text-green-500">₹{debitUsers.reduce((sum, user) => sum + calculateUserBalance(user.name), 0).toFixed(2)} DR</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBalance;
