const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

// Load environment variables
const RPC_URL = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const CHAIN_ID = parseInt(process.env.CHAIN_ID || '11155111', 10); // Sepolia default

// Deployed or placeholder contract addresses
const REAL_ESTATE_ADDRESS = process.env.REAL_ESTATE_ADDRESS || '0x627306090abaB3A6e1400e9345bC60c78a8BEf57';
const ESCROW_ADDRESS = process.env.ESCROW_ADDRESS || '0xf17f52151EbEF6C7334FAD080c5704D77216b732';

// Operator / Relayer Private Key (optional for server-relayed transactions)
const OPERATOR_PRIVATE_KEY = process.env.OPERATOR_PRIVATE_KEY || null;

// Load ABIs safely
const loadAbi = (contractName) => {
  try {
    const abiPath = path.resolve(__dirname, `../../contracts/abis/${contractName}.json`);
    if (fs.existsSync(abiPath)) {
      return JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    }
  } catch (err) {
    console.warn(`Could not load ABI from contracts/abis/${contractName}.json: ${err.message}`);
  }
  return [];
};

const RealEstateABI = loadAbi('RealEstate');
const EscrowABI = loadAbi('Escrow');

// Initialize ethers provider with static network to prevent hanging network auto-detection
let provider;
try {
  provider = new ethers.providers.StaticJsonRpcProvider(RPC_URL, {
    name: 'sepolia',
    chainId: CHAIN_ID,
  });
} catch (error) {
  console.warn(`Fallback to default provider: ${error.message}`);
  provider = ethers.getDefaultProvider('sepolia');
}

// Initialize operator wallet if key is configured
let operatorWallet = null;
if (OPERATOR_PRIVATE_KEY) {
  try {
    operatorWallet = new ethers.Wallet(OPERATOR_PRIVATE_KEY, provider);
  } catch (err) {
    console.warn(`Failed to initialize operator wallet: ${err.message}`);
  }
}

module.exports = {
  RPC_URL,
  CHAIN_ID,
  REAL_ESTATE_ADDRESS,
  ESCROW_ADDRESS,
  RealEstateABI,
  EscrowABI,
  provider,
  operatorWallet,
  ethers,
};
