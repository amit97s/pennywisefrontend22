import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionTable from '../components/TransactionTable';
import TransactionForm from '../components/TransactionForm';
import DateRangeFilter from '../components/DateRangeFilter';
import API_BASE_URL from '../config/api';

const Home = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [debitTransactions, setDebitTransactions] = useState([]);
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const [creditForm, setCreditForm] = useState({
    receivedFrom: '', narration: '', amount: '', expenses: ''
  });
  const [debitForm, setDebitForm] = useState({
    paidTo: '', narration: '', amount: '', expenses: ''
  });
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeInput, setActiveInput] = useState(null);
  const [currentVnNo, setCurrentVnNo] = useState(1);
  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          // Find the highest vnNo and add 1
          const maxVnNo = Math.max(...data.map(t => parseInt(t.vnNo)));
          setCurrentVnNo(maxVnNo + 1);
        }
        if (data[0]?.creditEntry) {
          const credit = data.map(t => ({
            ...t.creditEntry,
            date: t.date,
            vnNo: t.vnNo,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          }));
          const debit = data.map(t => ({
            ...t.debitEntry,
            date: t.date,
            vnNo: t.vnNo,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt
          }));
          setCreditTransactions(credit);
          setDebitTransactions(debit);
        } else {
          const credit = data.filter(t => t.type === 'credit');
          const debit = data.filter(t => t.type === 'debit');
          setCreditTransactions(credit);
          setDebitTransactions(debit);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };
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
  const handleInputChange = (formType, e) => {
    const { name, value } = e.target;
    if (formType === 'credit') {
      setCreditForm(prev => ({ ...prev, [name]: value }));
      if (name === 'receivedFrom') {
        handleUserSearch(value);
        setActiveInput('credit');
      }
      if (name === 'amount' || name === 'expenses') {
        const creditAmount = name === 'amount' ? Number(value) : Number(creditForm.amount) || 0;
        const expenses = name === 'expenses' ? Number(value) : Number(creditForm.expenses) || 0;
        const totalDebit = creditAmount + expenses;
        setDebitForm(prev => ({ ...prev, amount: totalDebit.toString() }));
      }
    } else {
      if (name === 'paidTo') {
        setDebitForm(prev => ({ ...prev, [name]: value }));
        handleUserSearch(value);
        setActiveInput('debit');
      } else if (name === 'expenses') {
        const baseAmount = Number(creditForm.amount) + Number(creditForm.expenses) || 0;
        const newExpenses = Number(value) || 0;
        const finalAmount = baseAmount - newExpenses;
        
        setDebitForm(prev => ({
          ...prev,
          expenses: value,
          amount: finalAmount.toString()
        }));
      } else {
        setDebitForm(prev => ({ ...prev, [name]: value }));
      }
    }
  };
  const handleUserSearch = (searchTerm) => {
    if (searchTerm.trim() === '') {
      setUserSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filteredUsers = Array.from(new Set(
      users
        .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(user => user)
    ));
    setUserSuggestions(filteredUsers);
    setShowSuggestions(true);
  };
  const handleUserSelect = (user) => {
    if (activeInput === 'credit') {
      setCreditForm(prev => ({ ...prev, receivedFrom: user.name }));
    } else {
      setDebitForm(prev => ({ ...prev, paidTo: user.name }));
    }
    setShowSuggestions(false);
  };
  const handleAddNewUser = (name) => {
    navigate('/add-new', { state: { initialName: name } });
  };
  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setCurrentDate(selectedDate);
  };
  const handleSubmit = async () => {
    try {
      setIsLoading(true); // Add loading state before fetch
      const vnNo = currentVnNo;
      if (creditForm.amount && debitForm.amount) {
        const combinedTransaction = {
          date: currentDate, // Add this line
          creditAccount: {
            account: creditForm.receivedFrom.trim() || 'N/A',
            amount: Number(creditForm.amount),
            expenses: Number(creditForm.expenses) || 0,
            narration: creditForm.narration.trim() || 'N/A',
            type: 'credit'
          },
          debitAccount: {
            account: debitForm.paidTo.trim() || 'N/A',
            amount: Number(debitForm.amount),
            expenses: Number(debitForm.expenses) || 0,
            narration: debitForm.narration.trim() || 'N/A',
            type: 'debit'
          },
          vnNo
        };
  
        const response = await fetch(`${API_BASE_URL}/api/transactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(combinedTransaction),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save transaction');
        }
  
        setCreditForm({
          receivedFrom: '',
          narration: '',
          amount: '',
          expenses: ''
        });
        setDebitForm({
          paidTo: '',
          narration: '',
          amount: '',
          expenses: ''
        });
  
        setCurrentVnNo(prev => prev + 1);
        await fetchTransactions();
        setIsLoading(false); // Clear loading state after completion
      } else {
        alert('Please fill in the required fields: Amount');
      }
    } catch (error) {
      setIsLoading(false); // Don't forget to clear loading state on error
      console.error('Error submitting transaction:', error);
      alert('Failed to save transaction. Please try again.');
    }
  };
  const handleDelete = async (selectedIds) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete transactions');
      }

      await fetchTransactions();
    } catch (error) {
      console.error('Error deleting transactions:', error);
      alert('Failed to delete transactions. Please try again.');
    }
  };
  const [filteredCreditTransactions, setFilteredCreditTransactions] = useState([]);
  const [filteredDebitTransactions, setFilteredDebitTransactions] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      const filteredCredit = creditTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      
      const filteredDebit = debitTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      
      setFilteredCreditTransactions(filteredCredit);
      setFilteredDebitTransactions(filteredDebit);
    } else {
      setFilteredCreditTransactions(creditTransactions);
      setFilteredDebitTransactions(debitTransactions);
    }
  }, [dateRange, creditTransactions, debitTransactions]);

  const handleDateRangeDisplay = ({ startDate, endDate }) => {
    setDateRange({ startDate, endDate });
  };
  const handleEnterPress = (formType, currentField) => {
    const creditFields = ['date', 'receivedFrom', 'narration', 'amount', 'expenses'];
    const debitFields = ['paidTo', 'narration', 'amount', 'expenses'];
    
    const fields = formType === 'credit' ? creditFields : debitFields;
    const currentIndex = fields.indexOf(currentField);
    
    if (currentIndex === -1) return;
    
    if (formType === 'debit' && currentField === 'expenses') {
      handleSubmit();
      return;
    }
    
    if (formType === 'credit' && currentField === 'expenses') {
      const debitInput = document.querySelector(`input[name="paidTo"]`);
      if (debitInput) debitInput.focus();
      return;
    }
    
    const nextField = fields[currentIndex + 1];
    if (nextField) {
      const nextInput = document.querySelector(`input[name="${nextField}"]`);
      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-3">
      <DateRangeFilter onDisplay={handleDateRangeDisplay} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        {isLoading ? (
          <div className="col-span-2 flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <TransactionTable 
              transactions={filteredCreditTransactions} 
              type="credit"
              onDelete={handleDelete}
            />
            <TransactionTable 
              transactions={filteredDebitTransactions} 
              type="debit"
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Credit Entry</h2>
          <TransactionForm
            type="credit"
            formData={creditForm}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onInputChange={handleInputChange}
            onEnterPress={handleEnterPress}
            showSuggestions={showSuggestions && activeInput === 'credit'}
            userSuggestions={userSuggestions}
            onUserSelect={handleUserSelect}
            onAddNewUser={handleAddNewUser}
          />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Debit Entry</h2>
          <TransactionForm
            type="debit"
            formData={debitForm}
            currentDate={currentDate}
            onDateChange={handleDateChange}
            onInputChange={handleInputChange}
            onEnterPress={handleEnterPress}
            showSuggestions={showSuggestions && activeInput === 'debit'}
            userSuggestions={userSuggestions}
            onUserSelect={handleUserSelect}
            onAddNewUser={handleAddNewUser}
          />
          <div className="mt-4">
            <button 
              onClick={handleSubmit} 
              className="px-8 w-full py-2.5 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 font-medium" >
              Add Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
