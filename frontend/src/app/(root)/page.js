<div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-colors duration-300 group hover:shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <FaUniversity className="text-purple-600" />
                </div>
                <span className="font-semibold text-gray-700">IFSC Code</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono text-gray-800">{bankingInfo.ifscCode}</span>
                <button
                  onClick={() => copyToClipboard(bankingInfo.ifscCode, 'IFSC Code')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    copiedField === 'IFSC Code' 
                      ? 'bg-green-100 text-green-600' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <MdContentCopy />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Branch: {bankingInfo.branchCode}</p>
            </div>
          </div>

          {/* Branch Information */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 animate-in fade-in-50 duration-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FaUniversity className="text-orange-600" />
              </div>
              <span className="font-semibold text-gray-700">Branch Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700 font-medium">{bankingInfo.branchName}</p>
                <p className="text-sm text-gray-500">Branch Code: {bankingInfo.branchCode}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Use these details for fund transfers, NEFT, RTGS
                </p>
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  All details are verified and secure
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};