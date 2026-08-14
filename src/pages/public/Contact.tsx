import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fade-up', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="contact-page" ref={containerRef}>
      <div className="contact-header fade-up">
        <h1 className="contact-title">Contact Us</h1>
        <p className="contact-subtitle">
          Have a question or need assistance? Reach out to our team of experts, and we'll be happy to help.
        </p>
      </div>

      <div className="contact-grid">
        {/* Contact Information */}
        <div className="fade-up contact-info-container">
          <div>
            <h2 className="contact-info-title">Get In Touch</h2>
            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-icon-wrapper">
                  <MapPin className="contact-icon" />
                </div>
                <div>
                  <h3 className="contact-item-title">Office Address</h3>
                  <p className="contact-item-desc">123 Luxury Ave, Suite 500<br />New York, NY 10001</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-wrapper">
                  <Phone className="contact-icon" />
                </div>
                <div>
                  <h3 className="contact-item-title">Phone Number</h3>
                  <p className="contact-item-desc">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-wrapper">
                  <Mail className="contact-icon" />
                </div>
                <div>
                  <h3 className="contact-item-title">Email Address</h3>
                  <p className="contact-item-desc">contact@primenestrealty.com</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-icon-wrapper">
                  <Clock className="contact-icon" />
                </div>
                <div>
                  <h3 className="contact-item-title">Business Hours</h3>
                  <p className="contact-item-desc">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="contact-map-container">
             {/* Map Placeholder */}
             <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.2528001602!2d-74.14448744031649!3d40.69763123330689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1715691000000!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>
        </div>

        {/* Contact Form */}
        <div className="fade-up">
          <div className="contact-form-container">
            <h2 className="contact-form-title">Send a Message</h2>
            <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
              <div>
                <label className="contact-form-label">Full Name</label>
                <input type="text" required className="contact-form-input" placeholder="John Doe" />
              </div>
              <div className="contact-form-row">
                <div>
                  <label className="contact-form-label">Email</label>
                  <input type="email" required className="contact-form-input" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="contact-form-label">Phone</label>
                  <input type="tel" className="contact-form-input" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
              <div>
                <label className="contact-form-label">Subject</label>
                <input type="text" required className="contact-form-input" placeholder="How can we help?" />
              </div>
              <div>
                <label className="contact-form-label">Message</label>
                <textarea required rows={5} className="contact-form-textarea" placeholder="Your message..."></textarea>
              </div>
              <button type="submit" className="contact-form-submit">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
