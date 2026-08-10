import { Router } from 'express';
import { MovieController } from '../controllers/movieController.js';

const router = Router();

router.get('/', MovieController.getMovies);
router.get('/:id', MovieController.getMovieById);

export default router;
