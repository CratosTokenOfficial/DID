import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptedData } from '../types/did';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor(secretKey: string) {
    this.secretKey = Buffer.from(secretKey, 'hex');
  }

  /**
   * Encrypts data using AES-256-GCM
   */
  async encrypt(data: string): Promise<EncryptedData> {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.secretKey, iv);
    
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    
    return {
      encryptedData,
      iv: iv.toString('hex'),
      authTag: (cipher as any).getAuthTag().toString('hex')
    };
  }

  /**
   * Decrypts data using AES-256-GCM
   */
  async decrypt(encrypted: EncryptedData): Promise<string> {
    const decipher = createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(encrypted.iv, 'hex')
    );
    
    (decipher as any).setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}