const web3Service = require('../services/web3Service');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rentverse_jwt_secret_development_key_2026';

class ContractController {
  /**
   * Health & Network Status
   * GET /api/contracts/status
   */
  async getStatus(req, res) {
    try {
      const status = await web3Service.getNetworkStatus();
      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get ETH balance for given address
   * GET /api/contracts/balance/:address
   */
  async getAddressBalance(req, res) {
    try {
      const { address } = req.params;
      const balance = await web3Service.getBalance(address);
      return res.status(200).json({
        success: true,
        data: balance,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get RealEstate Contract Information
   * GET /api/contracts/real-estate/info
   */
  async getRealEstateInfo(req, res) {
    try {
      const info = await web3Service.getRealEstateInfo();
      return res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get Token Details by ID
   * GET /api/contracts/real-estate/token/:id
   */
  async getTokenDetails(req, res) {
    try {
      const { id } = req.params;
      const details = await web3Service.getTokenDetails(id);
      return res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare Mint NFT Transaction
   * POST /api/contracts/real-estate/prepare-mint
   */
  async prepareMint(req, res) {
    try {
      const { tokenURI, recipient } = req.body;
      if (!tokenURI) {
        return res.status(400).json({ success: false, message: 'tokenURI is required' });
      }
      const txData = web3Service.prepareMintTransaction(tokenURI, recipient);
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get Escrow Contract Information
   * GET /api/contracts/escrow/info
   */
  async getEscrowInfo(req, res) {
    try {
      const info = await web3Service.getEscrowInfo();
      return res.status(200).json({
        success: true,
        data: info,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get Escrow Property Details
   * GET /api/contracts/escrow/property/:id
   */
  async getEscrowProperty(req, res) {
    try {
      const { id } = req.params;
      const details = await web3Service.getEscrowProperty(id);
      return res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get Escrow Approval for an address
   * GET /api/contracts/escrow/property/:id/approval/:address
   */
  async getApprovalStatus(req, res) {
    try {
      const { id, address } = req.params;
      const approval = await web3Service.getApprovalStatus(id, address);
      return res.status(200).json({
        success: true,
        data: approval,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare List Property Transaction
   * POST /api/contracts/escrow/prepare-list
   */
  async prepareList(req, res) {
    try {
      const { nftId, buyer, purchasePriceEth, escrowAmountEth } = req.body;
      const txData = web3Service.prepareListTransaction({
        nftId,
        buyer,
        purchasePriceEth,
        escrowAmountEth,
      });
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare Deposit Earnest Transaction
   * POST /api/contracts/escrow/prepare-deposit
   */
  async prepareDeposit(req, res) {
    try {
      const { nftId, amountEth } = req.body;
      const txData = web3Service.prepareDepositTransaction({ nftId, amountEth });
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare Update Inspection Status Transaction
   * POST /api/contracts/escrow/prepare-inspection
   */
  async prepareInspection(req, res) {
    try {
      const { nftId, passed } = req.body;
      const txData = web3Service.prepareInspectionTransaction({ nftId, passed: Boolean(passed) });
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare Approve Sale Transaction
   * POST /api/contracts/escrow/prepare-approve
   */
  async prepareApprove(req, res) {
    try {
      const { nftId } = req.body;
      const txData = web3Service.prepareApproveTransaction({ nftId });
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare Finalize Sale Transaction
   * POST /api/contracts/escrow/prepare-finalize
   */
  async prepareFinalize(req, res) {
    try {
      const { nftId } = req.body;
      const txData = web3Service.prepareFinalizeTransaction({ nftId });
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Prepare Cancel Sale Transaction
   * POST /api/contracts/escrow/prepare-cancel
   */
  async prepareCancel(req, res) {
    try {
      const { nftId } = req.body;
      const txData = web3Service.prepareCancelTransaction({ nftId });
      return res.status(200).json({
        success: true,
        data: txData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // ==========================================
  // WALLET AUTHENTICATION
  // ==========================================

  /**
   * Request Nonce for Sign-In with Ethereum
   * GET /api/auth/wallet/nonce
   */
  async getNonce(req, res) {
    try {
      const { address } = req.query;
      if (!address) {
        return res.status(400).json({ success: false, message: 'Ethereum address is required' });
      }
      const challenge = web3Service.generateNonce(address);
      return res.status(200).json({
        success: true,
        data: challenge,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Verify Signature & Issue JWT Session
   * POST /api/auth/wallet/verify
   */
  async verifySignature(req, res) {
    try {
      const { address, signature } = req.body;
      if (!address || !signature) {
        return res.status(400).json({ success: false, message: 'Address and signature are required' });
      }

      const result = web3Service.verifyWalletSignature(address, signature);

      // Generate JWT for web3 session
      const token = jwt.sign(
        {
          address: result.address,
          authType: 'web3_wallet',
          verifiedAt: result.verifiedAt,
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie('web3_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            address: result.address,
            authType: 'web3_wallet',
            authenticated: true,
          },
        },
        message: 'Wallet authenticated successfully',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Current Authenticated Wallet User
   * GET /api/auth/wallet/me
   */
  async getCurrentWalletUser(req, res) {
    try {
      const authHeader = req.headers.authorization;
      const token = (authHeader && authHeader.startsWith('Bearer '))
        ? authHeader.split(' ')[1]
        : req.cookies?.web3_token;

      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authenticated' });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({
        success: true,
        data: {
          address: decoded.address,
          authType: decoded.authType,
          verifiedAt: decoded.verifiedAt,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }
}

module.exports = new ContractController();
