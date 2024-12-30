import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ethers } from 'ethers';
import { config } from 'dotenv';
import { createDIDRouter } from './api/did.controller';
import { DIDService } from './services/did.service';
import contractAbi from '../artifacts/contracts/EncryptedDIDRegistry.sol/EncryptedDIDRegistry.json';

config();

async function startServer() {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Initialize services
  const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
  const didService = new DIDService(
    process.env.MONGODB_URL,
    process.env.ENCRYPTION_KEY,
    process.env.CONTRACT_ADDRESS,
    contractAbi.abi,
    provider
  );

  await didService.initialize();

  // Routes
  app.use('/api', createDIDRouter(didService));

  // Error handling
  app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);