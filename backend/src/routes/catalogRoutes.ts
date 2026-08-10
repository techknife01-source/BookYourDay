import { Router } from 'express';
import { CatalogController } from '../controllers/catalogController.js';

const router = Router();

router.get('/', CatalogController.getCatalog);
router.get('/:category', CatalogController.getByCategory);
router.get('/:category/:id', CatalogController.getItemById);

export default router;
