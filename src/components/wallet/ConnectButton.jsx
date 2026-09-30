import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../../context/WalletContext';
import { FaCheck, FaCopy, FaExternalLinkAlt, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa';
import { SiEthereum } from 'react-icons/si';

export default function ConnectButton({ className = '' }) {
  const {
    account,
    formattedAddress,
    networkName,
    balance,
    isConnecting,
    isConnected,
    isAuthenticated,
    connectWallet,
    disconnectWallet,
    error,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => connectWallet(false)}
          disabled={isConnecting}
          className={`btn ${className}`}
        >
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
        {error && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-red-50 text-red-700 text-xs rounded-lg p-2 border border-red-200 shadow-lg z-50">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Connected Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-secondary-50 hover:bg-secondary-100 border border-secondary-200 py-1.5 px-3 rounded-full text-sm font-medium text-secondary-800 transition-colors shadow-sm"
      >
        <span className="flex items-center space-x-1 text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full text-xs font-semibold">
          <SiEthereum className="text-primary-600" />
          <span>{balance} ETH</span>
        </span>
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-mono text-xs">{formattedAddress}</span>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 divide-y divide-secondary-100 z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2">
            <p className="text-xs text-secondary-500 font-medium uppercase tracking-wider">Connected Account</p>
            <p className="font-mono text-xs font-semibold text-secondary-900 break-all mt-1 bg-secondary-50 p-2 rounded border border-secondary-100">
              {account}
            </p>
            <div className="flex items-center justify-between mt-2 pt-1 text-xs">
              <span className="text-secondary-500">Network</span>
              <span className="font-medium text-primary-600 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-600 mr-1.5" />
                {networkName || 'Ethereum'}
              </span>
            </div>
            {isAuthenticated && (
              <div className="flex items-center justify-between mt-1 text-xs text-green-600">
                <span className="flex items-center"><FaShieldAlt className="mr-1" /> Session</span>
                <span className="font-semibold">Verified SIWE</span>
              </div>
            )}
          </div>

          <div className="py-1">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              <span className="flex items-center">
                <FaCopy className="mr-2 text-secondary-400" />
                Copy Address
              </span>
              {copied && <span className="text-xs text-green-600 flex items-center"><FaCheck className="mr-1" /> Copied!</span>}
            </button>

            <a
              href={`https://sepolia.etherscan.io/address/${account}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 hover:text-primary-600 rounded-lg transition-colors"
            >
              <FaExternalLinkAlt className="mr-2 text-secondary-400" />
              View on Explorer
            </a>

            {!isAuthenticated && (
              <button
                onClick={() => connectWallet(true)}
                className="w-full flex items-center px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <FaShieldAlt className="mr-2 text-primary-500" />
                Authenticate Session (Sign)
              </button>
            )}
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                disconnectWallet();
                setIsOpen(false);
              }}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <FaSignOutAlt className="mr-2 text-red-400" />
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
