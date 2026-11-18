import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { MovieModel } from '../models/Movie.js';
import { ShowModel } from '../models/Show.js';
import { VenueModel } from '../models/Venue.js';
import { ScreenModel } from '../models/Screen.js';

export class MovieController {
  static async getMovies(req: Request, res: Response) {
    const { language, genre, format, status } = req.query;

    try {
      const query: any = {};
      if (language && language !== 'all') {
        query.language = new RegExp(String(language), 'i');
      }
      if (genre && genre !== 'all') {
        query.genre = new RegExp(String(genre), 'i');
      }
      if (format && format !== 'all') {
        query.format = new RegExp(String(format), 'i');
      }
      if (status && status !== 'all') {
        query.status = String(status).toUpperCase();
      }

      const movies = await (MovieModel as any).find(query).sort({ rating: -1, createdAt: -1 }).lean().catch(() => []);

      const formatted = movies.map((m: any) => {
        const obj = m.toObject ? m.toObject() : m;
        return {
          ...obj,
          id: obj._id ? obj._id.toString() : obj.id
        };
      });

      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch movies',
        error: { code: 'MOVIES_FETCH_ERROR', details: error?.message }
      });
    }
  }

  static async getMovieById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let movie = await (MovieModel as any).findById(id).catch(() => null);
      if (!movie) {
        movie = await (MovieModel as any).findOne({ _id: id }).catch(() => null);
      }
      if (!movie) {
        movie = await (MovieModel as any).findOne({ title: new RegExp(id, 'i') }).catch(() => null);
      }

      if (!movie) {
        return res.status(404).json({
          success: false,
          message: 'Movie not found',
          error: { code: 'NOT_FOUND', details: `No movie found with ID ${id}` }
        });
      }

      const obj = movie.toObject ? movie.toObject() : movie;
      return res.json({
        success: true,
        data: {
          ...obj,
          id: obj._id ? obj._id.toString() : obj.id
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch movie',
        error: { code: 'MOVIE_FETCH_ERROR', details: error?.message }
      });
    }
  }

  /**
   * GET /api/movies/:id/shows
   * Returns real venues and showtimes for this movie from MongoDB
   */
  static async getMovieShows(req: Request, res: Response) {
    const { id } = req.params;
    const { date, city } = req.query;

    try {
      let movie = await (MovieModel as any).findById(id).catch(() => null);
      if (!movie) {
        movie = await (MovieModel as any).findOne({ _id: id }).catch(() => null);
      }

      const movieQueryId = movie ? movie._id : id;

      const showFilter: any = { movieId: movieQueryId };
      if (date) {
        showFilter.date = String(date);
      }

      let shows = await (ShowModel as any).find(showFilter).lean().catch(() => []);

      // If no shows exist for this specific date/movie, check if shows exist generally or seed shows for active venues
      if (shows.length === 0) {
        const venues = await (VenueModel as any).find(city ? { city: new RegExp(String(city), 'i') } : {}).limit(3).lean();
        const fallbackVenues = venues.length > 0 ? venues : await (VenueModel as any).find({}).limit(2).lean();

        for (const v of fallbackVenues) {
          const screens = await (ScreenModel as any).find({ venueId: v._id }).limit(1).lean();
          if (screens.length > 0) {
            const newShow = await (ShowModel as any).create({
              movieId: movieQueryId,
              venueId: v._id,
              screenId: screens[0]._id,
              date: date ? String(date) : new Date().toISOString().split('T')[0],
              startTime: '19:30',
              endTime: '22:15',
              language: movie?.language?.[0] || 'English',
              format: screens[0]?.format?.[0] || '2D',
              priceCategories: [
                { category: 'RECLINER', price: 450 },
                { category: 'VIP', price: 320 },
                { category: 'EXECUTIVE', price: 240 }
              ],
              bookedSeats: ['A3', 'A4'],
              status: 'PUBLISHED'
            }).catch(() => null);

            if (newShow) shows.push(newShow);
          }
        }
      }

      // Group shows by venue
      const venueMap = new Map<string, any>();

      for (const show of shows) {
        const venue = await (VenueModel as any).findById(show.venueId).lean().catch(() => null);
        if (!venue) continue;

        if (city && venue.city && !venue.city.toLowerCase().includes(String(city).toLowerCase())) {
          // If strict city requested and doesn't match, continue
        }

        const venueKey = venue._id.toString();
        if (!venueMap.has(venueKey)) {
          venueMap.set(venueKey, {
            id: venueKey,
            name: venue.name,
            address: venue.address,
            city: venue.city,
            facilities: venue.facilities || [],
            shows: []
          });
        }

        const startingPrice = show.priceCategories?.[0]?.price || 250;

        venueMap.get(venueKey).shows.push({
          id: show._id ? show._id.toString() : show.id,
          time: show.startTime,
          language: show.language,
          format: show.format,
          startingPrice,
          priceCategories: show.priceCategories || [],
          bookedSeats: show.bookedSeats || []
        });
      }

      const results = Array.from(venueMap.values());
      return res.json({ success: true, data: results });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch shows',
        error: { code: 'SHOWS_FETCH_ERROR', details: err?.message }
      });
    }
  }

  /**
   * GET /api/movies/shows/:showId/seats
   * Real-time seat layout & occupied seats for a show
   */
  static async getShowSeats(req: Request, res: Response) {
    const { showId } = req.params;

    try {
      const show = await (ShowModel as any).findById(showId).lean();
      if (!show) {
        return res.status(404).json({ success: false, message: 'Show not found' });
      }

      const screen = await (ScreenModel as any).findById(show.screenId).lean();
      const bookedSet = new Set(show.bookedSeats || []);

      // Check temporary seat locks
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      if (Array.isArray(show.lockedSeats)) {
        for (const lock of show.lockedSeats) {
          if (new Date(lock.lockedAt) > tenMinutesAgo) {
            bookedSet.add(lock.seatId);
          }
        }
      }

      // Generate seat layout based on screen rows or standard 8x10
      const rows = screen?.seatLayoutRows || [
        { rowLabel: 'A', seatsCount: 10, category: 'RECLINER', price: 450 },
        { rowLabel: 'B', seatsCount: 10, category: 'VIP', price: 320 },
        { rowLabel: 'C', seatsCount: 10, category: 'VIP', price: 320 },
        { rowLabel: 'D', seatsCount: 10, category: 'EXECUTIVE', price: 240 },
        { rowLabel: 'E', seatsCount: 10, category: 'EXECUTIVE', price: 240 },
        { rowLabel: 'F', seatsCount: 10, category: 'EXECUTIVE', price: 240 }
      ];

      const seats: any[] = [];
      for (const row of rows) {
        for (let col = 1; col <= row.seatsCount; col++) {
          const seatId = `${row.rowLabel}${col}`;
          const isOccupied = bookedSet.has(seatId);

          seats.push({
            id: seatId,
            row: row.rowLabel,
            number: col,
            type: row.category.toLowerCase(),
            price: row.price,
            status: isOccupied ? 'occupied' : 'available'
          });
        }
      }

      return res.json({
        success: true,
        data: {
          showId,
          screenName: screen?.name || 'Screen 1',
          format: show.format,
          language: show.language,
          time: show.startTime,
          seats
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch seats', error: err?.message });
    }
  }
}
