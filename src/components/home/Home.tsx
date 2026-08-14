import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Building2, ShieldCheck, UserCheck, Map } from 'lucide-react';
import './Home.css';

const Home = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.from('.hero-content > *', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.2,
      });

      // Features Animations
      gsap.from('.feature-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.8,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="home-page">

      {/* Hero Section */}
      <section ref={heroRef} className="hero-section">
        <div className="hero-bg-wrapper">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
            alt="Luxury Home"
            className="hero-bg-image"
          />

          <div className="hero-bg-overlay"></div>
        </div>

        <div className="hero-content-wrapper hero-content">
          <h1 className="hero-title">
            Find a Place You'll{' '}
            <br className="hero-title-break" />
            <span className="hero-title-highlight">
              Love to Call Home.
            </span>
          </h1>

          <p className="hero-subtitle">
            Discover exceptional homes, apartments, and investment
            properties with PrimeNest Realty.
          </p>

          <div className="hero-cta-group">
            <Link
              to="/properties"
              className="hero-btn-primary"
            >
              Explore Properties
            </Link>

            <Link
              to="/properties"
              className="hero-btn-secondary"
            >
              Schedule a Viewing
            </Link>
          </div>
        </div>
      </section>

      {/* Property Search Component Placeholder */}

      {/* Why Choose Us */}
      <section
        className="features-section"
        ref={featuresRef}
      >
        <div className="features-header">
          <h2 className="features-title">
            Why Choose PrimeNest
          </h2>

          <p className="features-subtitle">
            We provide a premium real estate experience tailored to
            your needs, ensuring a smooth and successful journey.
          </p>
        </div>

        <div className="features-grid">
          {[
            {
              icon: ShieldCheck,
              title: 'Trusted Expertise',
              desc: 'Decades of combined experience in the luxury real estate market.',
            },
            {
              icon: Building2,
              title: 'Verified Properties',
              desc: 'Every property goes through a rigorous inspection and verification.',
            },
            {
              icon: UserCheck,
              title: 'Personalized Service',
              desc: 'Dedicated agents who understand your unique requirements.',
            },
            {
              icon: Map,
              title: 'Local Market Knowledge',
              desc: 'Deep insights into neighborhood trends and property values.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="feature-card"
            >
              <div className="feature-icon-wrapper">
                <feature.icon className="feature-icon-svg" />
              </div>

              <h3 className="feature-title">
                {feature.title}
              </h3>

              <p className="feature-desc">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta-section">
        <div className="final-cta-container">
          <h2 className="final-cta-title">
            Ready to Find Your Next Property?
          </h2>

          <p className="final-cta-subtitle">
            Join thousands of satisfied clients who found their dream
            home with us.
          </p>

          <div className="final-cta-group">
            <Link
              to="/properties"
              className="final-cta-btn-primary"
            >
              Explore Properties
            </Link>

            <Link
              to="/contact"
              className="final-cta-btn-secondary"
            >
              Contact an Agent
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;