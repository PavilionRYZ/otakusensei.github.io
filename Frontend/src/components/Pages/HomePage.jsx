import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import ComicCard from "../Layout/ComicCard";
import { fetchComics } from "../../Redux/Slices/comicSlice";

const HomePage = () => {
  const dispatch = useDispatch();
  const { comics, isLoading, error } = useSelector((state) => state.comic);

  useEffect(() => {
    dispatch(fetchComics());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <div className="bg-gray-900 dark:bg-gray-100 min-h-screen text-white dark:text-gray-900">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Your Next Favorite Comic
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Dive into a world of stories with OtakuSensei.
          </p>
        </motion.div>
      </section>

      {/* Comics Grid */}
      <section className="container mx-auto px-4 py-12">
        {isLoading ? (
          <p className="text-center">Loading comics...</p>
        ) : error ? (
          <p className="text-center text-red-500 dark:text-red-600">{error}</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {comics.map((comic) => (
              <ComicCard key={comic._id} comic={comic} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default HomePage;