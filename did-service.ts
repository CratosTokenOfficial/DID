import { ethers } from 'ethers';
import { DIDDocument } from '../types/did';
import { EncryptionService } from './encryption.service';
import { MongoClient, Db } from 'mongodb';

export class DIDService {
  private db: Db;
  private encryptionService: EncryptionService;
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  constructor(
    mongoUrl: string,
    encryptionKey: string,
    contractAddress: string,
    contractAbi: any,
    provider: ethers.providers.Provider
  ) {
    this.encryptionService = new EncryptionService(encryptionKey);
    this.provider = provider;
    this.contract = new ethers.Contract(contractAddress, contractAbi, provider);
  }

  async initialize() {
    const client = await MongoClient.connect(process.env.MONGODB_URL);
    this.db = client.db('did_db');
    
    await this.db.collection('did_documents').createIndex({ did: 1 }, { unique: true });
    await this.db.collection('did_documents').createIndex({ controller: 1 });
  }

  async createDID(didDocument: DIDDocument, signature: string): Promise<void> {
    const documentJson = JSON.stringify(didDocument);
    const encrypted = await this.encryptionService.encrypt(documentJson);
    
    const didHash = ethers.utils.id(didDocument.id);
    await this.contract.createEncryptedDID(
      didHash,
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(encrypted.encryptedData)),
      signature
    );
    
    await this.db.collection('did_documents').insertOne({
      did: didDocument.id,
      controller: didDocument.controller,
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      created: new Date(),
      updated: new Date()
    });
  }

  async resolveDID(did: string): Promise<DIDDocument | null> {
    const record = await this.db.collection('did_documents').findOne({ did });
    if (!record) return null;

    const didHash = ethers.utils.id(did);
    const onChainData = await this.contract.resolveEncryptedDID(didHash);
    
    if (!this.verifyDataIntegrity(record, onChainData)) {
      throw new Error('Data integrity verification failed');
    }

    const decrypted = await this.encryptionService.decrypt({
      encryptedData: record.encryptedData,
      iv: record.iv,
      authTag: record.authTag
    });

    return JSON.parse(decrypted);
  }

  async updateDID(
    did: string,
    updateData: Partial<DIDDocument>,
    signature: string
  ): Promise<void> {
    const existingDocument = await this.resolveDID(did);
    if (!existingDocument) {
      throw new Error('DID document not found');
    }

    const updatedDocument = {
      ...existingDocument,
      ...updateData,
      updated: new Date()
    };

    const documentJson = JSON.stringify(updatedDocument);
    const encrypted = await this.encryptionService.encrypt(documentJson);

    const didHash = ethers.utils.id(did);
    const nonce = await this.contract.documents(didHash).nonce;
    await this.contract.updateEncryptedDID(
      didHash,
      ethers.utils.hexlify(ethers.utils.toUtf8Bytes(encrypted.encryptedData)),
      signature,
      nonce + 1
    );

    await this.db.collection('did_documents').updateOne(
      { did },
      {
        $set: {
          encryptedData: encrypted.encryptedData,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          updated: new Date()
        }
      }
    );
  }

  private verifyDataIntegrity(
    offChainData: any,
    onChainData: any
  ): boolean {
    const offChainHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(offChainData.encryptedData)
    );
    return offChainHash === onChainData.dataHash;
  }
}