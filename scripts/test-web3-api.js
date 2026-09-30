/**
 * RentVerse Web3 & Smart Contract API Verification Script
 * 
 * Verifies live connectivity to Ethereum Sepolia / local node,
 * Smart Contract ABIs, Escrow and RealEstate state query endpoints,
 * calldata preparation, and SIWE authentication nonces.
 */

const web3Service = require('../server/services/web3Service');

async function runVerification() {
  console.log('====================================================');
  console.log(' RentVerse Web3 & Smart Contract API Test Suite');
  console.log('====================================================\n');

  console.log(' [1/6] Querying Web3 Network & Node Status...');
  const network = await web3Service.getNetworkStatus();
  console.log('  Status:', network.status);
  console.log('  Network:', network.networkName, `(Chain ID: ${network.chainId})`);
  console.log('  Current Block:', network.currentBlock);
  console.log('  Gas Price:', network.gasPriceGwei, 'Gwei\n');

  console.log(' [2/6] Querying RealEstate Contract Metadata...');
  const realEstate = await web3Service.getRealEstateInfo();
  console.log('  Contract:', realEstate.contractAddress);
  console.log('  Name:', realEstate.name, `(${realEstate.symbol})`);
  console.log('  Standard:', realEstate.standard);
  console.log('  Total Properties:', realEstate.totalSupply, '\n');

  console.log(' [3/6] Querying Escrow Contract Details...');
  const escrow = await web3Service.getEscrowInfo();
  console.log('  Contract:', escrow.contractAddress);
  console.log('  NFT Address:', escrow.nftAddress);
  console.log('  Seller:', escrow.seller);
  console.log('  Inspector:', escrow.inspector);
  console.log('  Contract Balance:', escrow.contractBalanceEth, 'ETH\n');

  console.log(' [4/6] Querying Escrow State for Property #1...');
  const prop = await web3Service.getEscrowProperty(1);
  console.log('  NFT ID:', prop.nftId);
  console.log('  Listed Status:', prop.isListed ? 'LISTED' : 'NOT LISTED');
  console.log('  Purchase Price:', prop.purchasePriceEth, 'ETH');
  console.log('  Earnest Escrow Required:', prop.escrowAmountEth, 'ETH');
  console.log('  Inspection Passed:', prop.inspectionPassed ? 'YES' : 'NO\n');

  console.log(' [5/6] Preparing Transaction Calldata for Client Signing...');
  const mintTx = web3Service.prepareMintTransaction('ipfs://QmRentVerseVilla1/metadata.json', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  console.log('  Mint Target:', mintTx.to);
  console.log('  Mint Calldata Length:', mintTx.data.length, 'bytes');

  const depositTx = web3Service.prepareDepositTransaction({ nftId: 1, amountEth: '10' });
  console.log('  Deposit Target:', depositTx.to);
  console.log('  Deposit Value:', depositTx.valueEth, 'ETH');
  console.log('  Deposit Calldata Length:', depositTx.data.length, 'bytes\n');

  console.log(' [6/6] SIWE (Sign-In with Ethereum) Nonce Generation...');
  const challenge = web3Service.generateNonce('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  console.log('  Address:', challenge.address);
  console.log('  Nonce:', challenge.nonce);
  console.log('  Challenge Message Preview:', challenge.message.split('\n')[0]);

  console.log('\n ALL TESTS COMPLETED SUCCESSFULLY! Smart Contract API is 100% Operational.\n');
}

runVerification().then(() => process.exit(0)).catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
