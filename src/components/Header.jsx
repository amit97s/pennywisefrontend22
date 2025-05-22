import React, { useState } from "react";
import {Menu, X } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="bg-gray-900 text-white h-14 shadow-lg w-full flex items-center relative">
      <div className="container mx-auto flex justify-between items-center px-6 w-full">
        <Link to={'/'}><h1 className="text-2xl font-bold">Penny-Wise</h1></Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex space-x-8 text-lg">
          <Link to={'/'} className="hover:text-gray-400 transition">
            Home
          </Link>
          <Link to={'/day-book'} className="hover:text-gray-400 transition">
            Day Book
          </Link>
          <Link to={'/account-statement'} className="hover:text-gray-400 transition">
            Account Statement
          </Link>
          <Link to={'/trial-balance'} className="hover:text-gray-400 transition">
            Trial Balance
          </Link>
          <Link to={'/erase-all'} className="hover:text-gray-400 transition">
            Erase all
          </Link>
          <Link to={'/add-new'} className="hover:text-gray-400 transition">
            +
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <nav
        className={`lg:hidden fixed top-14 left-0 w-full bg-gray-800 py-2 flex flex-col z-50 shadow-md transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto">
          <Link 
            to={'/'} 
            className="block px-6 py-3 hover:bg-gray-700 transition-colors" 
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            to={'/day-book'} 
            className="block px-6 py-3 hover:bg-gray-700 transition-colors" 
            onClick={closeMenu}
          >
            Day Book
          </Link>
          <Link 
            to={'/account-statement'} 
            className="block px-6 py-3 hover:bg-gray-700 transition-colors" 
            onClick={closeMenu}
          >
            Account Statement
          </Link>
          <Link 
            to={'/trial-balance'} 
            className="block px-6 py-3 hover:bg-gray-700 transition-colors" 
            onClick={closeMenu}
          >
            Trial Balance
          </Link>
          <Link 
            to={'/erase-all'} 
            className="block px-6 py-3 hover:bg-gray-700 transition-colors" 
            onClick={closeMenu}
          >
            Erase all
          </Link>
          <Link 
            to={'/add-new'} 
            className="block px-6 py-3 hover:bg-gray-700 transition-colors" 
            onClick={closeMenu}
          >
            Add New
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
