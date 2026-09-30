import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

const KNOWN_NETWORKS = {
  1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  11155111: { name: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
  5: { name: 'Goerli Testnet', explorer: 'https://goerli.etherscan.io' },
  137: { name: 'Polygon Mainnet', explorer: 'https://polygonscan.com' },
  80001: { name: 'Mumbai Testnet', explorer: 'https://mumbai.polygonscan.com' },
  31337: { name: 'Hardhat Localhost', explorer: '#' },
  1337: { name: 'Ganache Localhost', explorer: '#' },
};

const BACKEND_API_BASE = process.env.REACT_APP_API_URL || '';

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [networkName, setNetworkName] = useState('');
  const [balance, setBalance] = useState('0.0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Helper to format address
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Helper to update balance
  const updateBalance = useCallback(async (currentAccount, currentProvider) => {
    if (!currentAccount || !currentProvider) return;
    try {
      const balWei = await currentProvider.getBalance(currentAccount);
      const balEth = parseFloat(ethers.utils.formatEther(balWei)).toFixed(4);
      setBalance(balEth);
    } catch (err) {
      console.warn('Could not fetch balance:', err);
    }
  }, []);

  // Update Network details
  const updateNetwork = useCallback((netId) => {
    const id = parseInt(netId, 16 || 10);
    setChainId(id);
    const net = KNOWN_NETWORKS[id];
    setNetworkName(net ? net.name : `Chain ID: ${id}`);
  }, []);

  // Optional backend SIWE authentication
  const authenticateWithBackend = async (signerInstance, userAddress) => {
    try {
      // 1. Fetch Nonce Challenge from Backend
      const nonceRes = await fetch(`${BACKEND_API_BASE}/api/contracts/auth/nonce?address=${userAddress}`);
      const nonceData = await nonceRes.json();
      
      if (!nonceData.success || !nonceData.data?.message) {
        console.warn('Backend nonce endpoint did not provide challenge message');
        return;
      }

      // 2. Prompt user to sign the SIWE message via MetaMask
      const signature = await signerInstance.signMessage(nonceData.data.message);

      // 3. Verify signature on backend
      const verifyRes = await fetch(`${BACKEND_API_BASE}/api/contracts/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: userAddress, signature }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        setIsAuthenticated(true);
        if (verifyData.data?.token) {
          localStorage.setItem('rentverse_auth_token', verifyData.data.token);
        }
      }
    } catch (err) {
      console.warn('Backend SIWE authentication skipped or rejected:', err.message);
      setAuthError(err.message);
    }
  };

  // Connect to MetaMask / Injected Provider
  const connectWallet = async (shouldAuthenticate = false) => {
    setError(null);
    setIsConnecting(true);

    if (typeof window === 'undefined' || !window.ethereum) {
      setIsConnecting(false);
      const installMetaMask = window.confirm(
        'MetaMask was not detected in your browser. Would you like to install MetaMask?'
      );
      if (installMetaMask) {
        window.open('https://metamask.io/download/', '_blank');
      }
      setError('MetaMask not installed');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts authorized');
      }

      const selectedAccount = accounts[0];
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      const web3Signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(selectedAccount);
      updateNetwork(network.chainId);
      await updateBalance(selectedAccount, web3Provider);

      localStorage.setItem('rentverse_wallet_connected', 'true');

      if (shouldAuthenticate) {
        await authenticateWithBackend(web3Signer, selectedAccount);
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setNetworkName('');
    setBalance('0.0');
    setIsAuthenticated(false);
    localStorage.removeItem('rentverse_wallet_connected');
    localStorage.removeItem('rentverse_auth_token');
  };

  // Switch network
  const switchNetwork = async (targetChainIdHex = '0xaa36a7') => { // Default to Sepolia
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainIdHex }],
      });
    } catch (switchErr) {
      // If network is not added (error code 4902)
      if (switchErr.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Test Network',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'SEP', decimals: 18 },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addErr) {
          console.error('Failed to add network:', addErr);
        }
      }
    }
  };

  // Auto-reconnect if connected previously
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum && localStorage.getItem('rentverse_wallet_connected') === 'true') {
      const initReconnect = async () => {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            const selectedAccount = accounts[0];
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
            const web3Signer = web3Provider.getSigner();
            const network = await web3Provider.getNetwork();

            setProvider(web3Provider);
            setSigner(web3Signer);
            setAccount(selectedAccount);
            updateNetwork(network.chainId);
            await updateBalance(selectedAccount, web3Provider);
          }
        } catch (err) {
          console.warn('Auto-reconnect failed:', err);
        }
      };
      initReconnect();
    }
  }, [updateBalance, updateNetwork]);

  // Listen for account and chain change events on MetaMask
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        if (provider) {
          setSigner(provider.getSigner());
          updateBalance(accounts[0], provider);
        }
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = (newChainId) => {
      updateNetwork(newChainId);
      if (account && provider) {
        updateBalance(account, provider);
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('disconnect', handleDisconnect);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [account, provider, updateBalance, updateNetwork]);

  const value = {
    account,
    formattedAddress: formatAddress(account),
    chainId,
    networkName,
    balance,
    isConnecting,
    isConnected: !!account,
    isAuthenticated,
    error,
    authError,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    formatAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
