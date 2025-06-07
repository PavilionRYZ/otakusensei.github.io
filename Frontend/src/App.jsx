import React, { Fragment } from 'react';
import { Routes, Route } from 'react-router-dom';
import ErrorBoundary from './lib/ErrorBoundary';
import SignInPage from './components/Auth/SignInPage';
import SignUpPage from './components/Auth/SignUpPage';
import OtpVerificationPage from './components/Auth/OtpVerificationPage';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './components/Pages/HomePage';
import ComicDetailsPage from './components/Pages/ComicDetailsPage';
import PageNotFound from './components/Pages/PageNotFound';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { useSelector } from 'react-redux';
import AnimeLoadingPage from './components/Loading/AnimeLoadingPage';

const App = () => {
  const { isLoading } = useSelector((state) => state.auth);

  return (
    <Fragment>
      {isLoading ? (
        <AnimeLoadingPage />
      ) : (
        <div className="flex min-h-screen flex-col">
          <Header />
          <ErrorBoundary>
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/signup"
                  element={
                    <ProtectedRoute redirectTo="/" forAuth={true}>
                      <SignUpPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/otp" element={<OtpVerificationPage />} />
                <Route
                  path="/login"
                  element={
                    <ProtectedRoute redirectTo="/" forAuth={true}>
                      <SignInPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/signin"
                  element={
                    <ProtectedRoute redirectTo="/" forAuth={true}>
                      <SignInPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/comics/:id" element={<ComicDetailsPage />} />
                <Route path="/upgrade" element={<div>Upgrade Page</div>} />
                <Route path="/read/:comicId/chapter/:chapterNumber" element={<div>Read Chapter Page</div>} />
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </main>
          </ErrorBoundary>
          <Footer />
        </div>
      )}
    </Fragment>
  );
};

export default App;
