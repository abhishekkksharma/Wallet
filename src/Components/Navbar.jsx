import React, { useState, useEffect } from 'react';
import { Menu, Search, X, Moon, Sun } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Handle scroll effect for navbar shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-black dark:border-gray-800
        ${scrolled ? 'shadow-md py-2' : 'border-b border-gray-100 dark:border-gray-800 py-4'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LEFT SIDE: Avatar & Greeting */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user?.user_metadata?.avatar_url || "https://i.pinimg.com/736x/ab/73/ed/ab73ed4889f9e81678ede016203bc503.jpg"}
                alt="User Avatar"
                className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-xl  font-semibold text-gray-900 dark:text-white leading-none">
                <span className='font-light'>Hello</span>, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest'}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Search & Hamburger */}
          <div className="flex items-center gap-4">

            {/* Theme Toggle */}
            <AnimatedThemeToggler />

            {/* Search Button (Expandable) */}
            {/* <div className={`
              flex items-center transition-all duration-300 ease-in-out bg-white dark:bg-black rounded-full
              ${isSearchOpen ? 'w-48 sm:w-64 px-2 py-1 border border-gray-200 shadow-sm' : 'w-10 h-10 justify-center cursor-pointer'}
            `}>
              {isSearchOpen ? (
                <>
                  <Search size={20} className="text-gray-400 min-w-[20px]" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="ml-2 bg-transparent border-none outline-none text-sm text-gray-700 dark:text-white w-full placeholder-gray-400"
                    autoFocus
                    onBlur={() => !window.getSelection().toString() && setIsSearchOpen(false)}
                  />
                </>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full h-full flex items-center justify-center text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                >
                  <Search size={24} strokeWidth={2.5} />
                </button>
              )}
            </div> */}

            {/* Hamburger Menu (Replaces Bell) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
            >
              <Menu size={28} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Content */}
          <div className="relative w-64 bg-white dark:bg-black dark:border-l dark:border-gray-800 h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col space-y-5">
              {['Dashboard', 'Profile', 'Messages', 'Settings'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:translate-x-1 transition-all"
                >
                  {item}
                </a>
              ))}
              <button
                onClick={handleLogout}
                className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:translate-x-1 transition-all text-left"
              >
                Log Out
              </button>
            </nav>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;