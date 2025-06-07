import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-6">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-xl font-bold">OtakuSensei</h2>
                        <p className="text-sm">Your ultimate comic book destination.</p>
                    </div>
                    <div className="flex space-x-6">
                        <Link to="/about" className="hover:text-blue-400">
                            About Us
                        </Link>
                        <Link to="/contact" className="hover:text-blue-400">
                            Contact
                        </Link>
                        <Link to="/privacy" className="hover:text-blue-400">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
                <div className="text-center mt-4 text-sm">
                    &copy; {new Date().getFullYear()} OtakuSensei. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
