import React from 'react';
import { Plus } from 'lucide-react';

const UserSearchInput = ({ 
  label,
  name,
  value,
  onChange,
  showSuggestions,
  userSuggestions,
  onUserSelect,
  onAddNewUser,
  placeholder = "Type to search accounts"
}) => {
  // Predefined options based on input type
  const predefinedOptions = {
    receivedFrom: ['Cash', 'Bank'],
    paidTo: ['Cash', 'Bank']
  };

  // Filter predefined options based on input value
  const filteredPredefinedOptions = value
    ? (predefinedOptions[name] || []).filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      )
    : [];

  // Create a Set of existing user names in lowercase for case-insensitive comparison
  const existingUserNames = new Set(
    userSuggestions.map(user => user.name.toLowerCase())
  );

  // Filter out predefined options that already exist in user suggestions (case-insensitive)
  const uniquePredefinedOptions = filteredPredefinedOptions.filter(
    option => !existingUserNames.has(option.toLowerCase())
  );

  // Combine filtered predefined options with user suggestions
  const allSuggestions = [
    ...uniquePredefinedOptions.map(option => ({ _id: option, name: option })),
    ...userSuggestions
  ];

  // Remove duplicates based on case-insensitive name comparison
  const uniqueSuggestions = allSuggestions.filter((item, index, self) =>
    index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className="border rounded px-3 py-1 w-full"
      />
      {showSuggestions && uniqueSuggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
          {uniqueSuggestions.map(item => (
            <div
              key={item._id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onUserSelect(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      )}
      {showSuggestions && uniqueSuggestions.length === 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 p-2 flex items-center justify-between">
          <span className="text-red-500">No such user. Want to add new?</span>
          <button
            onClick={() => onAddNewUser(value)}
            className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;