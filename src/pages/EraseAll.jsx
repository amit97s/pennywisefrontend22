import { Calendar, Trash2, Shield, Database } from 'lucide-react';
const EraseAll = () => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Data Management Center</h1>
        <p className="text-gray-400">
          Securely manage and erase your data with our advanced tools
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-md col-span-2">
          <div className="flex items-center gap-4 mb-4">
            <Trash2 className="h-8 w-8 text-red-500" />
            <div>
              <h2 className="text-xl font-bold">Erase Data</h2>
              <p className="text-gray-400">Select date range to erase</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  className="w-full py-2 px-4 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                End Date
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="dd-mm-yyyy"
                  className="w-full py-2 px-4 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-red-500 focus:border-red-500"
                />
                <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Erase Selected Data
            </button>
            <button className="bg-gray-700 text-gray-300 px-6 py-2 rounded-md hover:bg-gray-600">
              Reset Selection
            </button>
          </div>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="h-8 w-8 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold">Security Info</h2>
              <p className="text-gray-400">
                Your data will be permanently erased using industry-standard
                secure deletion methods.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Database className="h-8 w-8 text-green-500" />
            <div>
              <h2 className="text-xl font-bold">Data Stats</h2>
              <p className="text-gray-400">Total Records: <span className="font-bold">0</span></p>
              <p className="text-gray-400">Size: <span className="font-bold">0 KB</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EraseAll;