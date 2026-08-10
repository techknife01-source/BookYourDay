import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  poster: string;
  backdrop: string;
  rating: number;
  votesCount: number;
  genre: string[];
  language: string[];
  duration: string;
  releaseDate: string;
  format: string[];
  description: string;
  cast: { name: string; role: string; avatar: string }[];
  director: string;
  isTrending?: boolean;
}

const MovieSchema = new Schema<IMovie>({
  title: { type: String, required: true },
  poster: { type: String, required: true },
  backdrop: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  votesCount: { type: Number, default: 1000 },
  genre: [{ type: String }],
  language: [{ type: String }],
  duration: { type: String, required: true },
  releaseDate: { type: String, required: true },
  format: [{ type: String }],
  description: { type: String, required: true },
  cast: [{ name: String, role: String, avatar: String }],
  director: { type: String, required: true },
  isTrending: { type: Boolean, default: false }
});

export const MovieModel: Model<IMovie> = (mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema)) as any;
