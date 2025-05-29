import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import API_BASE_URL from '../config/api';

const AddNew = () => {
  const location = useLocation();
  const initialName = location.state?.initialName || '';
  const [formData, setFormData] = useState({
    name: initialName,
    category: 'creditor',
    group: 'cash-in-hand',
    amount: ''
  });
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isDuplicate = users.some(user => 
      user.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (isDuplicate) {
      alert('An account with this name already exists!');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setFormData({
          name: '',
          category: 'creditor',
          group: 'cash-in-hand',
          amount: ''
        });
        fetchUsers();
      } else {
        throw new Error('Failed to add account');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      alert('Failed to add account. Please try again.');
    }
  };

  const fetchUsers = async () => {
    const controller = new AbortController();
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        signal: controller.signal
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
    return () => controller.abort();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-6 text-gray-800">Manage Accounts</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Add New Account Form */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">Add New Account</h2>
          
          <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter name"
                className="w-full py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none appearance-none bg-white"
                  required
                >
                  <option value="creditor">Creditor</option>
                  <option value="debtor">Debtor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="group"
                  value={formData.group}
                  onChange={handleChange}
                  className="w-full py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none appearance-none bg-white"
                  required
                >
                  <option value="cash-in-hand">Cash in Hand</option>
                  <option value="liabilities">Liabilities</option>
                  <option value="assets">Assets</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="w-full py-2.5 pl-8 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <span>+ Add Account</span>
            </button>
          </form>
        </div>
        
        {/* Accounts List */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Accounts List</h2>
            
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search accounts..."
                className="w-full py-2 pl-4 pr-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
              <span className="text-gray-600">Loading accounts...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 font-medium">No accounts found</p>
              <p className="text-gray-400 text-sm mt-1">Add your first account to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 md:-mx-6">
              <div className="inline-block min-w-full px-4 md:px-6">
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user, index) => (
                        <tr key={user._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-normal break-words">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-normal break-words">
                            <span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${
                              user.category === 'creditor' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-normal break-words">
                            <div className="text-sm text-gray-500">{user.group}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="text-sm font-medium text-gray-900">₹{user.amount}</div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="text-red-600 hover:text-red-900 transition-colors duration-150"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddNew;