import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import ConnectButton from '../wallet/ConnectButton';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center space-x-2">
              <svg width="30" height="35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="20" r="10" stroke="#0682ff" />
                <circle cx="15" cy="20" r="6" stroke="#0682ff" strokeWidth="3" />
              </svg>
              <span className="text-2xl font-bold text-primary-600 mt-0.5">RentVerse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-secondary-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}

            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <ConnectButton />
            <button
              type="button"
              className="text-secondary-600 hover:text-primary-600 p-1"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-secondary-100 pb-3">
            <div className="pt-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-3 py-2 text-base font-medium text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;