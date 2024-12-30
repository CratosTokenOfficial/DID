const ethers = require('ethers');

class DIDClient {
    constructor(contractAddress, provider) {
        this.contractAddress = contractAddress;
        this.provider = provider;
        this.contract = new ethers.Contract(
            contractAddress,
            DIDRegistryABI,  // Contract ABI
            provider
        );
    }

    /**
     * Create a new DID
     * @param {string} did - DID identifier
     * @param {ethers.Signer} signer - Ethereum signer
     * @returns {Promise<string>} Transaction hash
     */
    async createDID(did, signer) {
        const contract = this.contract.connect(signer);
        const tx = await contract.createDID(did);
        await tx.wait();
        return tx.hash;
    }

    /**
     * Add a public key to DID document
     * @param {string} did - DID identifier
     * @param {string} publicKey - Public key to add
     * @param {ethers.Signer} signer - Ethereum signer
     * @returns {Promise<string>} Transaction hash
     */
    async addPublicKey(did, publicKey, signer) {
        const contract = this.contract.connect(signer);
        const tx = await contract.addPublicKey(did, publicKey);
        await tx.wait();
        return tx.hash;
    }

    /**
     * Set attribute for DID document
     * @param {string} did - DID identifier
     * @param {string} key - Attribute key
     * @param {string} value - Attribute value
     * @param {ethers.Signer} signer - Ethereum signer
     * @returns {Promise<string>} Transaction hash
     */
    async setAttribute(did, key, value, signer) {
        const contract = this.contract.connect(signer);
        const tx = await contract.setAttribute(did, key, value);
        await tx.wait();
        return tx.hash;
    }

    /**
     * Resolve DID document
     * @param {string} did - DID to resolve
     * @returns {Promise<Object>} DID document
     */
    async resolveDID(did) {
        const result = await this.contract.resolveDID(did);
        return {
            controller: result.controller,
            publicKeys: result.publicKeys,
            updated: new Date(result.updated.toNumber() * 1000),
            active: result.active
        };
    }

    /**
     * Get attribute from DID document
     * @param {string} did - DID identifier
     * @param {string} key - Attribute key
     * @returns {Promise<string>} Attribute value
     */
    async getAttribute(did, key) {
        return await this.contract.getAttribute(did, key);
    }

    /**
     * Watch DID events
     * @param {Function} callback - Event callback function
     */
    async watchDIDEvents(callback) {
        this.contract.on('DIDCreated', (did, controller, event) => {
            callback({
                type: 'created',
                did,
                controller,
                transactionHash: event.transactionHash
            });
        });

        this.contract.on('DIDUpdated', (did, key, value, event) => {
            callback({
                type: 'updated',
                did,
                key,
                value,
                transactionHash: event.transactionHash
            });
        });
    }

    /**
     * Example usage of DID client
     */
    static async example() {
        // Set up provider (e.g., local development network)
        const provider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
        
        // Create wallet from private key (for testing)
        const wallet = new ethers.Wallet('0x...', provider);
        
        // Initialize DID client instance
        const didClient = new DIDClient('CONTRACT_ADDRESS', provider);
        
        // Create new DID
        const did = `did:evm:${wallet.address}`;
        await didClient.createDID(did, wallet);
        
        // Add public key
        const publicKey = 'PUBLIC_KEY';
        await didClient.addPublicKey(did, publicKey, wallet);
        
        // Resolve DID document
        const didDocument = await didClient.resolveDID(did);
        console.log('DID Document:', didDocument);
    }
}

/**
 * Example of event monitoring
 * @param {DIDClient} didClient - DID client instance
 */
async function monitorDIDEvents(didClient) {
    didClient.watchDIDEvents((event) => {
        console.log('DID Event:', event);
    });
}

module.exports = DIDClient;