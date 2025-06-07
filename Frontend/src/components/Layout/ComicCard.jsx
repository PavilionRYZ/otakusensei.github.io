import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Heart, Crown } from "lucide-react";
import { likeComicById } from "../../Redux/Slices/comicSlice";
import { toast } from "react-toastify";

const ComicCard = ({ comic }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { likeStatus } = useSelector((state) => state.comic);
  const comicLikeStatus = likeStatus[comic._id] || { hasLiked: false, likesCount: comic.likesCount || 0 };

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to like this comic", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    dispatch(likeComicById(comic._id));
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="flex flex-col items-center">
      {/* Image Container */}
      <motion.div
        className="relative w-48 sm:w-56 md:w-60 lg:w-52 xl:w-56 h-72 sm:h-80 md:h-96 lg:h-80 xl:h-96 rounded-lg overflow-hidden"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
      >
        <Link to={`/comics/${comic._id}`}>
          <img
            src={comic.coverImage}
            alt={comic.title}
            className="w-full h-full object-cover"
          />
        </Link>

        {/* Like Button (Top Right) */}
        <button
          onClick={handleLike}
          className="absolute top-2 right-2 flex items-center space-x-1 bg-gray-800/70 dark:bg-gray-200/70 rounded-full p-2 hover:bg-gray-800/90 dark:hover:bg-gray-200/90 transition"
        >
          <Heart
            className={`h-5 w-5 ${comicLikeStatus.hasLiked ? "fill-current text-red-500 dark:text-red-600" : "text-white dark:text-gray-900"}`}
          />
          <span className="text-sm text-white dark:text-gray-900">{comicLikeStatus.likesCount}</span>
        </button>

        {/* Premium Badge (Top Left) */}
        {comic.premium && (
          <div className="absolute top-0 left-0 flex items-center space-x-1 bg-[#D3AF37] rounded-tr-none rounded-tl-[7px] rounded-bl-none rounded-br-[19px] p-1.5">
            <Crown className="h-4 w-4 text-white" />
            <span className="text-xs font-semibold text-white font-['Petit_Formal_Script']">Premium</span>
          </div>
        )}
      </motion.div>

      {/* Title (Outside the Image Container) */}
      <h3 className="text-lg font-semibold text-white dark:text-gray-900 truncate mt-3 text-center w-48 sm:w-56 md:w-60 lg:w-52 xl:w-56">
        {comic.title}
      </h3>
    </div>
  );
};

export default ComicCard;