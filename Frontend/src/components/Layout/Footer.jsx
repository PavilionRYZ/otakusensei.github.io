// 

import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 py-12 font-['Bubblegum_Sans']">
            <div className="container mx-auto px-4">
                {/* Navigation Links */}
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-8">
                    <Link
                        to="/genres"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm font-medium"
                    >
                        Genres
                    </Link>
                    <Link
                        to="/new-releases"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm font-medium"
                    >
                        New Releases
                    </Link>
                    <Link
                        to="/my-library"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm font-medium"
                    >
                        My Library
                    </Link>
                    <Link
                        to="/about"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm font-medium"
                    >
                        About Us
                    </Link>
                    <Link
                        to="/contact"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm font-medium"
                    >
                        Contact Us
                    </Link>
                </div>

                {/* Secondary Links */}
                <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-8">
                    <Link
                        to="/privacy"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        to="/terms"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200 text-sm"
                    >
                        Terms of Service
                    </Link>
                </div>

                {/* Social Media Icons */}
                <div className="flex justify-center items-center space-x-6 mb-8">
                    {/* Twitter/X */}
                    <a
                        href="#"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200"
                        aria-label="Twitter"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                    </a>

                    {/* Facebook */}
                    <a
                        href="#"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200"
                        aria-label="Facebook"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                    </a>

                    {/* Instagram */}
                    <a
                        href="#"
                        className="text-white hover:text-gray-200 dark:text-gray-900 dark:hover:text-gray-800 transition-colors duration-200"
                        aria-label="Instagram"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} OtakuSensei. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;