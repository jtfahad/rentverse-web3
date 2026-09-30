const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

// Status & Network
router.get('/status', contractController.getStatus.bind(contractController));
router.get('/balance/:address', contractController.getAddressBalance.bind(contractController));

// RealEstate ERC721 NFT Endpoints
router.get('/real-estate/info', contractController.getRealEstateInfo.bind(contractController));
router.get('/real-estate/token/:id', contractController.getTokenDetails.bind(contractController));
router.post('/real-estate/prepare-mint', contractController.prepareMint.bind(contractController));

// Escrow Smart Contract Endpoints
router.get('/escrow/info', contractController.getEscrowInfo.bind(contractController));
router.get('/escrow/property/:id', contractController.getEscrowProperty.bind(contractController));
router.get('/escrow/property/:id/approval/:address', contractController.getApprovalStatus.bind(contractController));
router.post('/escrow/prepare-list', contractController.prepareList.bind(contractController));
router.post('/escrow/prepare-deposit', contractController.prepareDeposit.bind(contractController));
router.post('/escrow/prepare-inspection', contractController.prepareInspection.bind(contractController));
router.post('/escrow/prepare-approve', contractController.prepareApprove.bind(contractController));
router.post('/escrow/prepare-finalize', contractController.prepareFinalize.bind(contractController));
router.post('/escrow/prepare-cancel', contractController.prepareCancel.bind(contractController));

// Wallet Authentication / SIWE Endpoints
router.get('/auth/nonce', contractController.getNonce.bind(contractController));
router.post('/auth/verify', contractController.verifySignature.bind(contractController));
router.get('/auth/me', contractController.getCurrentWalletUser.bind(contractController));

module.exports = router;
