import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FaHeart, FaCrown, FaStar, FaStarHalfAlt, FaRegStar, FaBookmark } from "react-icons/fa";
import { fetchComicById, likeComicById, submitReview } from "../../Redux/Slices/comicSlice";
import { toast } from "react-toastify";
import AnimeLoadingPage from "../Loading/AnimeLoadingPage";

// Helper component to render star ratings
const StarRating = ({ rating, totalStars = 5, onClick = null, size = 16 }) => {
  const stars = [];
  for (let i = 1; i <= totalStars; i++) {
    if (rating >= i) {
      stars.push(
        <FaStar
          key={i}
          size={size}
          className="text-red-400 cursor-pointer"
          onClick={() => onClick && onClick(i)}
        />
      );
    } else if (rating >= i - 0.5) {
      stars.push(
        <FaStarHalfAlt
          key={i}
          size={size}
          className="text-red-400 cursor-pointer"
          onClick={() => onClick && onClick(i)}
        />
      );
    } else {
      stars.push(
        <FaRegStar
          key={i}
          size={size}
          className="text-red-400 cursor-pointer"
          onClick={() => onClick && onClick(i)}
        />
      );
    }
  }
  return <div className="flex">{stars}</div>;
};

// Component to render ratings bar graph
const RatingsBarGraph = ({ reviews }) => {
  if (!reviews || reviews.length === 0) return null;

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    const rating = Math.round(review.rating);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }
  });

  const totalReviews = reviews.length;
  const ratingPercentages = ratingCounts.map((count) =>
    totalReviews > 0 ? (count / totalReviews) * 100 : 0
  );

  return (
    <div className="mb-8">
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => (
          <div key={star} className="flex items-center space-x-3">
            <span className="w-2 text-sm text-gray-600 font-medium">{star}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-300 rounded-full transition-all duration-500"
                style={{ width: `${ratingPercentages[star] || 0}%` }}
              />
            </div>
            <span className="w-10 text-sm text-gray-500 text-right">
              {(ratingPercentages[star] || 0).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ComicDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedComic, isLoading, error, likeStatus } = useSelector((state) => state.comic);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const comicLikeStatus = likeStatus[id] || { hasLiked: false, likesCount: selectedComic?.likesCount || 0 };

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchComicById({ id, populate: ["chapters", "reviews", "likes"] }))
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to load comic", {
            position: "top-right",
            autoClose: 3000,
          });
        });
    } else {
      toast.error("Invalid comic ID", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/");
    }
  }, [dispatch, id, navigate]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like this comic", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    dispatch(likeComicById(id));
  };

  const handleReadChapter = (chapter) => {
    if (!isAuthenticated) {
      toast.error("Please log in to read this comic", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    if (selectedComic?.premium && !user?.hasPremium) {
      toast.error("Upgrade to a premium subscription to read this comic", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/upgrade");
      return;
    }

    navigate(`/read/${id}/chapter/${chapter.chapterNumber}`);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please log in to write a review", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/login");
      return;
    }

    if (selectedComic?.premium && !user?.hasPremium) {
      toast.error("Upgrade to a premium subscription to review this comic", {
        position: "top-right",
        autoClose: 3000,
      });
      navigate("/upgrade");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!selectedComic || selectedComic._id !== id) {
      toast.error("Invalid comic ID or comic not loaded", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setSubmitLoading(true);
    try {
      await dispatch(submitReview({ comicId: id, rating, comment })).unwrap();
      toast.success("Review submitted successfully", {
        position: "top-right",
        autoClose: 3000,
      });
      setRating(0);
      setComment("");
      dispatch(fetchComicById({ id, populate: ["chapters", "reviews", "likes"] }));
    } catch (err) {
      toast.error(err || "Failed to submit review", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Fallback UI when selectedComic is not available
  const renderFallbackContent = () => {
    if (!selectedComic) {
      return (
        <div className="text-center text-gray-100 dark:text-gray-900 py-8">
          <p>No comic data available. Please try again later.</p>
          <button
            onClick={() => dispatch(fetchComicById({ id, populate: ["chapters", "reviews", "likes"] }))}
            className="mt-4 bg-red-300 hover:bg-red-400 text-gray-100 dark:text-gray-900 px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <AnimeLoadingPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-100 font-['Bubblegum_Sans']">
      <div className="container mx-auto px-6 py-4">
        <nav className="text-sm text-gray-500">
          <Link to="/comics" className="hover:text-gray-700">Comics</Link>
          <span className="mx-2">/</span>
          <span>{selectedComic?.genres?.[0] || "Action"}</span>
        </nav>
      </div>

      <div className="container mx-auto px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {renderFallbackContent()}

            {selectedComic && (
              <>
                {/* Title and Author */}
                <div className="mb-6">
                  <h1 className="text-4xl font-bold text-gray-100 dark:text-gray-900 mb-2">{selectedComic.title}</h1>
                  <p className="text-gray-50 dark:text-gray-900 mb-1">
                    Genre: <span className="text-gray-100 dark:text-gray-900">{selectedComic.genres?.join(", ") || "Action"}</span> |
                    Author: <span className="text-gray-100 dark:text-gray-900">{selectedComic.author}</span>
                  </p>
                  {selectedComic.premium && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                      Premium
                    </span>
                  )}
                </div>

                {/* Synopsis */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-100 dark:text-gray-900 mb-3">Synopsis</h2>
                  <p className="text-gray-100 dark:text-gray-900 leading-relaxed">{selectedComic.description}</p>
                </div>

                {/* Comic Image (on small screens) */}
                <div className="mb-8 lg:hidden">
                  <div className="relative w-full">
                    <img
                      src={selectedComic.coverImage}
                      alt={selectedComic.title}
                      className="w-full h-80 object-cover rounded-lg shadow-lg"
                      loading="lazy"
                    />
                    {selectedComic.premium && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                        <FaCrown size={12} />
                        Premium
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Section */}
                <div className="mb-8">
                  <div className="flex items-start gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-100 dark:text-gray-900">
                        {selectedComic.averageRating?.toFixed(1) || "0.0"}
                      </div>
                      <div className="flex justify-center mt-2">
                        <StarRating rating={selectedComic.averageRating || 0} size={20} />
                      </div>
                      <div className="text-gray-100 dark:text-gray-900 text-sm mt-1">
                        {selectedComic.reviews?.length || 0} reviews
                      </div>
                    </div>

                    <div className="flex-1">
                      <RatingsBarGraph reviews={selectedComic.reviews} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-8">
                  <motion.button
                    onClick={() => selectedComic.chapters?.[0] && handleReadChapter(selectedComic.chapters[0])}
                    className="bg-red-300 hover:bg-red-400 text-gray-100 dark:text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Read Now
                  </motion.button>
                  <motion.button
                    className="border border-gray-300 hover:bg-gray-50 text-gray-100 dark:text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaBookmark size={16} />
                    Add to Library
                  </motion.button>
                </div>

                {/* Reviews Section */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-900 mb-6">Reviews</h2>

                  {selectedComic.reviews?.length > 0 ? (
                    <div className="space-y-6">
                      {selectedComic.reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={review.user.avatar || "https://i.pinimg.com/736x/3f/dd/e4/3fdde421b22a34874e9be56a4277e04c.jpg"}
                              alt={review.user.firstName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-100 dark:text-gray-900">
                                {review.user.firstName} {review.user.lastName}
                              </div>
                              <div className="text-sm text-gray-100 dark:text-gray-900">
                                {new Date(review.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="mb-2">
                            <StarRating rating={review.rating} size={16} />
                          </div>
                          <p className="text-gray-100 dark:text-gray-900 leading-relaxed">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-100 dark:text-gray-900">No reviews yet. Be the first to write one!</p>
                  )}

                  <div className="mt-8 bg-gray-900 dark:bg-gray-100 text-white dark:text-black p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-100 dark:text-gray-900 mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-100 dark:text-gray-900 mb-2">Your Rating</label>
                        <StarRating rating={rating} onClick={setRating} size={20} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-100 dark:text-gray-900 mb-2">Your Review</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
                          placeholder="Write your review here..."
                        />
                      </div>
                      <motion.button
                        type="submit"
                        className="bg-red-300 hover:bg-red-400 text-gray-100 dark:text-gray-900 px-6 py-2 rounded-lg font-medium transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={submitLoading}
                      >
                        {submitLoading ? "Submitting..." : "Submit Review"}
                      </motion.button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Section - Comic Cover (on large screens) */}
          <div className="hidden lg:block lg:w-1/3">
            <div className="sticky top-6">
              <div className="relative w-full">
                <img
                  src={selectedComic?.coverImage || ""}
                  alt={selectedComic?.title || "Comic"}
                  className="w-full h-80 sm:h-96 md:h-[420px] lg:h-[480px] object-cover rounded-lg shadow-lg"
                  loading="lazy"
                />
                {selectedComic?.premium && (
                  <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                    <FaCrown size={12} />
                    Premium
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicDetailsPage;