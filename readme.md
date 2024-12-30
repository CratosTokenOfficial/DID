# Cratos DID System

Welcome to the Cratos DID (Decentralized Identity) System! This repository contains a robust implementation of a DID system that combines on-chain security with off-chain scalability.

## Overview

This system provides a complete DID solution with:
- EVM-compatible smart contracts for on-chain verification
- Secure off-chain data storage with encryption
- TypeScript/Node.js backend implementation
- Complete SDK for easy integration

## Key Features

- Hybrid storage architecture (on-chain/off-chain)
- AES-256-GCM encryption for sensitive data
- MongoDB integration for scalable off-chain storage
- Full TypeScript support
- Comprehensive API
- Easy-to-use SDK

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/cratos-did.git

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env

# Deploy smart contract
yarn compile
yarn deploy

# Start the server
yarn dev
```

## Architecture

Cratos DID implements a hybrid architecture that combines the security of blockchain with the scalability of traditional databases:

- **On-chain**: Stores cryptographic proofs and access control
- **Off-chain**: Stores encrypted DID documents in MongoDB
- **Encryption**: Uses AES-256-GCM for data security

## Project Structure

```
├── contracts/
│   └── EncryptedDIDRegistry.sol    # Smart contract for DID registry
├── src/
│   ├── types/
│   │   └── did.ts                  # TypeScript interfaces
│   ├── services/
│   │   ├── encryption.service.ts   # Encryption handling
│   │   └── did.service.ts          # Core DID operations
│   ├── api/
│   │   └── did.controller.ts       # REST API endpoints
│   ├── sdk/
│   │   ├── types.ts               # SDK type definitions
│   │   └── did-sdk.ts             # SDK implementation
│   └── server.ts                   # Main server file
├── examples/
│   └── sdk-usage.ts               # SDK usage examples
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## API Documentation

### Create DID
```http
POST /api/did
{
  "didDocument": {...},
  "signature": "0x..."
}
```

### Resolve DID
```http
GET /api/did/:did
```

### Update DID
```http
PUT /api/did/:did
{
  "updateData": {...},
  "signature": "0x..."
}
```

## SDK Usage

```typescript
import { createSDK } from '@cratos/did-sdk';

const sdk = createSDK({
  apiUrl: 'http://localhost:3000',
  contractAddress: '0x...',
  providerUrl: 'http://localhost:8545'
});

// Create new DID
const did = await sdk.createDID({...});
```

## Security Considerations

- All sensitive data is encrypted before storage
- On-chain data integrity verification
- Access control through signature verification
- Nonce-based replay attack prevention

## Contributing

We welcome contributions!

## License

This project is licensed under the MIT License.

## Support

If you have any questions or need help, please:
- Open an issue
