import { Router, Request, Response } from 'express';
import { DIDService } from '../services/did.service';

export function createDIDRouter(didService: DIDService): Router {
  const router = Router();

  router.post('/did', async (req: Request, res: Response) => {
    try {
      const { didDocument, signature } = req.body;
      await didService.createDID(didDocument, signature);
      res.status(201).json({ message: 'DID created successfully' });
    } catch (error) {
      console.error('Error creating DID:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/did/:did', async (req: Request, res: Response) => {
    try {
      const did = req.params.did;
      const document = await didService.resolveDID(did);
      
      if (!document) {
        return res.status(404).json({ error: 'DID not found' });
      }
      
      res.json(document);
    } catch (error) {
      console.error('Error resolving DID:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/did/:did', async (req: Request, res: Response) => {
    try {
      const { did } = req.params;
      const { updateData, signature } = req.body;
      await didService.updateDID(did, updateData, signature);
      res.json({ message: 'DID updated successfully' });
    } catch (error) {
      console.error('Error updating DID:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}