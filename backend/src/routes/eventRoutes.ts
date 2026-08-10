import { Router } from 'express';
import { EventController } from '../controllers/eventController.js';

const router = Router();

router.get('/', EventController.getEvents);
router.get('/:id', EventController.getEventById);

export default router;
