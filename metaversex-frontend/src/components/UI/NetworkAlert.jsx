import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const NetworkAlert = ({ message, networkName }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="bg-amber-900/50 border-b border-amber-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="text-amber-400 text-lg flex-shrink-0" />
            <div className="text-amber-200 text-sm">
              <span className="font-medium">{message}</span>
              {networkName && (
                <span className="ml-1 text-amber-300">
                  (Currently on: <span className="font-mono">{networkName}</span>)
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-amber-400 hover:text-amber-300 transition-colors"
            aria-label="Dismiss"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkAlert; 