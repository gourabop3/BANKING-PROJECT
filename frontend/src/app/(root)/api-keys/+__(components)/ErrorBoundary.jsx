"use client";
import React from 'react';
import { FaExclamationTriangle, FaRefresh } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('API Keys Section Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaExclamationTriangle className="text-2xl text-yellow-600" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Something went wrong
              </h2>
              
              <p className="text-gray-600 mb-6 text-sm">
                There was an error loading the API Keys section. This might be due to a temporary issue.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FaRefresh className="text-sm" />
                  Refresh Page
                </button>
                
                <button
                  onClick={() => this.setState({ hasError: false, error: null })}
                  className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Troubleshooting:</p>
                <ul className="text-xs text-gray-600 text-left space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Clear browser cache and cookies</li>
                  <li>• Try logging out and back in</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;