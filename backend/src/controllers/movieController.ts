import { Request, Response } from 'express';
import { MovieModel } from '../models/Movie.js';

const MOCK_MOVIES_LIST = [
  {
    id: 'm1',
    title: 'Echoes of Tomorrow',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    rating: 4.9,
    votesCount: 42800,
    genre: ['Sci-Fi', 'Action', 'Thriller'],
    language: ['English', 'Hindi', 'Tamil'],
    duration: '2h 45m',
    releaseDate: '10 Aug 2026',
    format: ['2D', '3D', 'IMAX 3D', '4DX'],
    description: 'When humanity unlocks temporal memory transfer, a rouge agent must navigate quantum timelines to prevent the unraveling of the past before total reality collapse.',
    director: 'Christopher Nolan',
    isTrending: true
  },
  {
    id: 'm2',
    title: 'Midnight Run: Eclipse',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80',
    rating: 4.7,
    votesCount: 28400,
    genre: ['Action', 'Crime', 'Mystery'],
    language: ['English', 'Hindi'],
    duration: '2h 15m',
    releaseDate: '02 Aug 2026',
    format: ['2D', 'IMAX 2D', '4DX'],
    description: 'A high-octane heist thriller taking place during a city-wide blackout.',
    director: 'Denis Villeneuve',
    isTrending: true
  }
];

export class MovieController {
  static async getMovies(req: Request, res: Response) {
    try {
      const movies = await (MovieModel as any).find({});
      if (movies && movies.length > 0) {
        return res.json({ success: true, data: movies });
      }
    } catch {
      // Graceful fallback
    }
    return res.json({ success: true, data: MOCK_MOVIES_LIST });
  }

  static async getMovieById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const movie = await (MovieModel as any).findById(id);
      if (movie) return res.json({ success: true, data: movie });
    } catch {
      // Fallback search in mock list
    }
    const found = MOCK_MOVIES_LIST.find(m => m.id === id) || MOCK_MOVIES_LIST[0];
    return res.json({ success: true, data: found });
  }
}
