export interface DIDDocument {
  id: string;
  controller: string;
  created: Date;
  updated: Date;
  publicKeys: PublicKey[];
  services: Service[];
  proof?: Proof;
}

export interface PublicKey {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase: string;
}

export interface Service {
  id: string;
  type: string;
  serviceEndpoint: string;
}

export interface Proof {
  type: string;
  created: Date;
  verificationMethod: string;
  proofPurpose: string;
  proofValue: string;
}

export interface EncryptedData {
  encryptedData: string;
  iv: string;
  authTag: string;
}