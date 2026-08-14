import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Building } from 'lucide-react';
import { useState } from 'react';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Properties', path: '/properties' },
    { name: 'About Us', path: '/about' },
    // { name: 'Agents', path: '/agents' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md fixed w-full z-50 top-0 border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Building className="h-8 w-8 text-gold transition-transform group-hover:scale-110" />
              <span className="font-heading font-bold text-2xl tracking-tight text-primary">
                PrimeNest<span className="text-gold">Realty</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-gold relative group ${isActive(link.path) ? 'text-gold' : 'text-text-main'}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gold transition-all duration-300 ${isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
            <Link
              to="/properties"
              className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gold transition-colors shadow-sm hover:shadow-md"
            >
              Schedule a Viewing
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-main hover:text-gold p-2 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-white border-b border-gray-100 transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="px-4 pt-2 pb-6 space-y-1 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium ${isActive(link.path) ? 'text-gold bg-background' : 'text-text-main hover:text-gold hover:bg-background'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4">
            <Link
              to="/properties"
              onClick={() => setIsOpen(false)}
              className="w-full flex justify-center bg-primary text-white px-4 py-3 rounded-md text-base font-medium hover:bg-gold transition-colors"
            >
              Schedule a Viewing
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
