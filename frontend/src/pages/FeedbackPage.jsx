import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import { Star, MessageSquare, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comments, setComments] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await matchAPI.checkFeedback(sessionId);
        if (res.data.success && res.data.data?.submitted) {
          setAlreadySubmitted(true);
        }
      } catch (e) {}
      finally { setLoading(false); }
    };
    check();
  }, [sessionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      const res = await matchAPI.submitFeedback({
        matchRequestId: sessionId,
        rating,
        comments,
      });
      if (res.data.success) {
        toast.success('Feedback submitted! Thank you 🙏');
        setTimeout(() => navigate('/sessions'), 1500);
      } else {
        toast.error(res.data.message || 'Failed to submit');
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to submit feedback');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center pt-16">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (alreadySubmitted) return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" />
      <div className="glass-card p-12 text-center max-w-md relative z-10 animate-fade-in">
        <CheckCircle className="w-16 h-16 text-accent-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Feedback Already Submitted</h2>
        <p className="text-surface-400 mb-6">You've already shared your feedback for this session.</p>
        <button onClick={() => navigate('/sessions')} className="btn-primary">
          Back to Sessions
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      <div className="bg-orb bg-orb-1" /><div className="bg-orb bg-orb-2" />
      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Session Feedback</h1>
          <p className="text-surface-400">How was your interview experience?</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-3 text-center">
                Rate your experience
              </label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform duration-200 hover:scale-125">
                    <Star className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-surface-600'
                    }`} />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-amber-400 mt-2">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                </p>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Comments (optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="input-field h-32 resize-none"
                placeholder="Share your thoughts about the session..."
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting || rating === 0}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send className="w-5 h-5" /> Submit Feedback</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
