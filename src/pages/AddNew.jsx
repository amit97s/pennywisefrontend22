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
      user.name.toLowerCase() === formData.name.toLowerCase() &&
      user.category === formData.category &&
      user.group === formData.group
    );
    if (isDuplicate) {
      alert('An account with these details already exists!');
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
        // Refresh the users list after successful deletion
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-3">Manage Accounts</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 col gap-3">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold mb-3">Add New Account</h2>
          <form className="space-y-2" onSubmit={handleSubmit}>
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
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="cash-in-hand">Cash in Hand</option>
                <option value="liabilities">Liabilities</option>
                <option value="assets">Assets</option>
                <option value="bank">Bank</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              + Add Account
            </button>
          </form>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold">Accounts List</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search accounts..."
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading accounts...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500">
              No accounts found
            </div>
          ) : (
            <div className="overflow-x-hidden max-h-[22rem] overflow-y-auto">
              <table className="w-full divide-y divide-gray-200">
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
                    <tr key={user._id || index}>
                      <td className="px-4 py-3 whitespace-normal break-words">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-normal break-words">
                        <div className="text-sm text-gray-500">{user.category}</div>
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
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddNew;