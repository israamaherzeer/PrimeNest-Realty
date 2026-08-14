import { Link } from 'react-router-dom';
import { Building, Mail, Phone, MapPin } from 'lucide-react';


const Footer = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Building className="h-8 w-8 text-gold" />
              <span className="font-heading font-bold text-2xl tracking-tight text-white">
                PrimeNest<span className="text-gold">Realty</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              Discover exceptional homes, apartments, and investment properties with PrimeNest Realty. Your dream home awaits.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gold transition-colors font-medium">
                LinkedIn
              </a>
              <a href="#" className="text-gray-400 hover:text-gold transition-colors font-medium">
                GitHub
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/properties" className="text-gray-400 hover:text-gold transition-colors text-sm">Properties</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-gold transition-colors text-sm">About Us</Link></li>
              <li><Link to="/agents" className="text-gray-400 hover:text-gold transition-colors text-sm">Our Agents</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-gold transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Legal</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-gold transition-colors text-sm">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 font-heading">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400 text-sm">
                <MapPin className="h-5 w-5 text-gold shrink-0" />
                <span>123 Luxury Ave, Suite 500<br />New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Phone className="h-5 w-5 text-gold shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Mail className="h-5 w-5 text-gold shrink-0" />
                <span>contact@primenestrealty.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} PrimeNest Realty. All rights reserved.
          </p>
          <div className="text-gray-500 text-sm">
            Designed for Luxury Real Estate
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
