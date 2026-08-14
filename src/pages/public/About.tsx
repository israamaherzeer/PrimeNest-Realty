import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Home, Users, Star, Award } from 'lucide-react';
import './About.css';

const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fade-up', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="about-page">
      <div className="about-header fade-up">
        <h1 className="about-title">About PrimeNest Realty</h1>
        <p className="about-subtitle">
          We are a premier real estate agency dedicated to helping you find the perfect property that fits your lifestyle and aspirations.
        </p>
      </div>

      <div className="about-content-grid fade-up">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1973&q=80" 
            alt="Office" 
            className="about-image"
          />
        </div>
        <div>
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-section-desc">
            At PrimeNest Realty, our mission is to redefine the real estate experience through personalized service, transparent transactions, and a deep understanding of our clients' unique needs. We believe that finding a home should be an exciting and stress-free journey.
          </p>
          <h2 className="about-section-title">Our Vision</h2>
          <p className="about-section-desc-last">
            To be the most trusted and sought-after luxury real estate agency, known for our integrity, innovation, and exceptional results in every market we serve.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="about-stats-container fade-up">
        <div>
          <Home className="about-stat-icon" />
          <div className="about-stat-value">500+</div>
          <div className="about-stat-label">Properties Listed</div>
        </div>
        <div>
          <Users className="about-stat-icon" />
          <div className="about-stat-value">250+</div>
          <div className="about-stat-label">Happy Clients</div>
        </div>
        <div>
          <Star className="about-stat-icon" />
          <div className="about-stat-value">10+</div>
          <div className="about-stat-label">Years Experience</div>
        </div>
        <div>
          <Award className="about-stat-icon" />
          <div className="about-stat-value">25+</div>
          <div className="about-stat-label">Expert Agents</div>
        </div>
      </div>
    </div>
  );
};

export default About;
