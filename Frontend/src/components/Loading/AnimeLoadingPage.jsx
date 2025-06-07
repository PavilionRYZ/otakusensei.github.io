import React from 'react';
import loading from "../../assets/loading.gif"
const AnimeLoadingPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Loading Anime Adventure...</h1>
                <div className="w-64 h-64 mx-auto">
                    <img
                        src={loading}
                        alt="Loading..."
                        className="w-full h-full object-cover"
                    />
                </div>
                <p className="mt-6 text-xl text-white">Preparing your journey into the world of anime...</p>
            </div>
        </div>
    );
};

export default AnimeLoadingPage;
