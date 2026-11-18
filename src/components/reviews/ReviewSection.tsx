import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle, Image as ImageIcon, MessageSquare, AlertCircle, Send, X } from 'lucide-react';
import { catalogApi } from '../../api/catalogApi';

interface Review {
  _id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
  verifiedBooking?: boolean;
  helpfulCount: number;
  createdAt: string;
}

interface ReviewSectionProps {
  itemId: string;
  itemType: string;
  itemTitle: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ itemId, itemType, itemTitle }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'helpful'>('recent');

  // Form State
  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchReviews = async () => {
    if (!itemId) return;
    try {
      setLoading(true);
      const res = await catalogApi.getReviews(itemId);
      if (res) {
        setReviews(res.reviews || []);
        setTotalCount(res.total || (res.reviews ? res.reviews.length : 0));
        setAverageRating(res.averageRating || 5.0);
        setDistribution(res.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
      }
    } catch (err) {
      console.warn('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [itemId]);

  const handleHelpful = async (reviewId: string) => {
    try {
      const res = await catalogApi.markReviewHelpful(reviewId);
      if (res && res.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r))
        );
      }
    } catch (err) {
      console.warn('Helpful error:', err);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formComment.trim()) {
      setFormFeedback({ type: 'error', message: 'Please provide both a title and written comments for your review.' });
      return;
    }

    try {
      setSubmitting(true);
      setFormFeedback(null);
      const photos = formPhoto.trim() ? [formPhoto.trim()] : [];
      const res = await catalogApi.submitReview({
        itemId,
        itemType,
        rating: formRating,
        title: formTitle.trim(),
        comment: formComment.trim(),
        photos
      });

      if (res && res.success) {
        setFormFeedback({ type: 'success', message: 'Your review has been submitted successfully!' });
        setFormTitle('');
        setFormComment('');
        setFormPhoto('');
        setTimeout(() => {
          setFormOpen(false);
          setFormFeedback(null);
          fetchReviews();
        }, 1200);
      } else {
        setFormFeedback({
          type: 'error',
          message: res?.message || 'Failed to submit review. Verified completed booking required.'
        });
      }
    } catch (err: any) {
      setFormFeedback({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to submit review. Ensure you have a completed booking.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'helpful') return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
      {/* Header & Overall Ratings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <span className="w-2.5 h-6 bg-rose-600 rounded-full" />
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs text-slate-400 mt-1">Verified community experiences for {itemTitle}</p>
        </div>

        <button
          onClick={() => setFormOpen(true)}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-rose-900/30 transition-all self-start md:self-auto"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Rating Breakdown & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-950/60 border border-slate-800 rounded-2xl p-6">
        {/* Score */}
        <div className="flex flex-col items-center justify-center text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-800/80 pb-4 md:pb-0 md:pr-6">
          <div className="text-5xl font-black text-white tracking-tight">{averageRating.toFixed(1)}</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-700'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            Based on {totalCount} verified review{totalCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* 5-Star Distribution Bars */}
        <div className="md:col-span-2 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars] || 0;
            const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-12 text-slate-400 font-bold flex items-center gap-1">
                  {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline" />
                </span>
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-slate-400 font-semibold">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sorting Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Sort by:</span>
          {(['recent', 'highest', 'helpful'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors ${
                sortBy === s
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {s === 'recent' ? 'Most Recent' : s === 'highest' ? 'Highest Rated' : 'Most Helpful'}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 font-medium">Showing {sortedReviews.length} reviews</span>
      </div>

      {/* Write Review Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setFormOpen(false); setFormFeedback(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">Write a Verified Review</h3>
              <p className="text-xs text-slate-400 mt-1">Share your genuine experience with other travellers & moviegoers</p>
            </div>

            {formFeedback && (
              <div
                className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{formFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Select */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Overall Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFormRating(s)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          s <= formRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-400 ml-2">
                    {formRating} Star{formRating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Review Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Incredible atmosphere & crystal sound"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Comment */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Detailed Feedback</label>
                <textarea
                  rows={4}
                  placeholder="Tell us what you liked most, seat comfort, crowd, food, or overall service..."
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Photo URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Photo URL (Optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formPhoto}
                  onChange={(e) => setFormPhoto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Cards List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800 rounded-2xl space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No reviews yet</p>
            <p className="text-xs text-slate-400">Be the first to share your experience after attending!</p>
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-sm text-rose-400 border border-slate-700 overflow-hidden">
                    {rev.userAvatar ? (
                      <img src={rev.userAvatar} alt={rev.userName} className="w-full h-full object-cover" />
                    ) : (
                      rev.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{rev.userName}</span>
                      {rev.verifiedBooking && (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle className="w-3 h-3" />
                          Verified Booking
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-800'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Title & Comment */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">{rev.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>

              {/* Photos if any */}
              {rev.photos && rev.photos.length > 0 && (
                <div className="flex items-center gap-2 pt-1 overflow-x-auto">
                  {rev.photos.map((p, pIdx) => (
                    <img
                      key={pIdx}
                      src={p}
                      alt="Review snapshot"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-800 hover:scale-105 transition-transform"
                    />
                  ))}
                </div>
              )}

              {/* Helpful footer */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-900 text-[11px] text-slate-500">
                <span>Did you find this review helpful?</span>
                <button
                  onClick={() => handleHelpful(rev._id)}
                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-400 transition-colors font-bold px-2.5 py-1 rounded-lg hover:bg-slate-900"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.helpfulCount || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
