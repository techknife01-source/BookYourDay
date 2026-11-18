import { Router } from 'express';
import { MovieController } from '../controllers/movieController.js';

const router = Router();

router.get('/', MovieController.getMovies);
router.get('/shows/:showId/seats', MovieController.getShowSeats);
router.get('/:id/shows', MovieController.getMovieShows);
router.get('/:id', MovieController.getMovieById);

export default router;
