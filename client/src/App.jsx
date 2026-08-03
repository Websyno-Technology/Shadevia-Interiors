import React, { useEffect } from 'react';
import heroImage from './assets/image.png';

const brandName = 'Shadevia Interiors';

const images = {
  hero: heroImage,
  curtains: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmTIu1VFtJjRHF2vHKVtlATrWfgkJvbLv_07yAkU2NrwNRjUhkIZDtClzUoPnkjy2MVkVHOpBF-GLj4w5ritIT50NnPaMCJl8m9fqBJC6p0KSCHv2sIndR7QrzXpV5TVG8P9K6HmvKrmVsO4UTXxvOyvVsgXPJ2Gty6xOecMiV9aiR0GF6NtSF5REqpJ1Bb7MmW6repmm9I5qnERDfYHnU0m9Uln1BBjzyaioEqbSIQgkneM_BXwLa',
  blinds: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4gXxZHAZ8ivG96Bc1lY4fohnqgkjhphfXmnmxYy7SdKoYu6XZh12RY9KmS8qNn4FTSMfXIYswCqnrJz66jQbv8MfyXNR326F6LQyb4eEA5JHiF7AvuK74ZCQLCZ5qrfvNVFuV9JtqT6gakwRqh51ais_GxK33n9z4_qURdu5p6UQxashwdRhesMaKj2I-bMG19L1txNTT784B5NZ9FqlG57HjPiN9-8vZGsnXQFS9-MZ2_xk-9KH5',
  wallpaper: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJgMOzXEKZXZw81h313upNkXXWtzgh2hQZgpFlI-p8tMre2MIuu-itTBfGVa0tVDPb8Bxc4lQezoqS4Gd2-A8GUp_FbKXKTlf_EwAcVwMLmoyGts8whnTVGrEEyANb1I8gj11mQQYGJuPk-6qfgKILdbQPq6hjbMCDEUROZLmsFrTV5QmuVmRwQ9adC8hW9JhzG7YlSCy1-a35Xs9gpXCOtnyZakVeNNu3JinlV_qcaHn_b2EuFYNP',
  flooring: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwQwz9XRKQtK242t32d2sgTrw6QhkApzlIFqv-E6C0b_7Lwr9w4ruXNq7NDUlgsXKx9BprwblVWYMUrCSNPR6_LKk_RmOFb7L0rdVXLeAcdm1d2kPf4DSknUbew0ggeCmJTjmgB_X5yH17nM0YLhZC-mVvlIZ8P3467ltuIi0GijHm-7XE1AoPrJsof-JxRyyxNzja03oo0AAEd5QuJT4EM03uO8-9PEL0I_oN8KszaqAMjLckCfJT'
};

const usps = [
  ['verified', 'Durability'],
  ['diamond', 'Premium Quality'],
  ['payments', 'Affordability'],
  ['architecture', 'Made-to-Order']
];

const services = [
  ['curtains', 'Curtains', 'Hand-stitched window treatments designed for privacy and light control.', images.curtains],
  ['blinds', 'Blinds', 'Modern and functional roller, Roman, and Venetian blind systems.', images.blinds],
  ['wallpaper', 'Wallpaper', 'Luxury wall coverings that add depth and personality to any room.', images.wallpaper],
  ['floor', 'Flooring', 'High-quality hardwood, laminate, and luxury vinyl tile solutions.', images.flooring]
];

const features = [
  ['palette', 'Expert Design', 'Consultations with certified interior designers to ensure every choice is intentional and cohesive.'],
  ['high_quality', 'Quality Materials', 'Sourcing only sustainable, high-grade textiles and woods that age beautifully over decades.'],
  ['schedule', 'Timely Delivery', 'Rigorous project management to ensure your transformation is completed within the agreed timeline.'],
  ['support_agent', 'After-Sales Support', "Our relationship does not end at installation. We offer care guidance and maintenance services."]
];

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function App() {
  useEffect(() => {
    const nav = document.querySelector('.top-nav');
    const handleScroll = () => nav?.classList.toggle('is-scrolled', window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className="top-nav">
        <div className="nav-inner">
          <a className="brand" href="#home">{brandName}</a>
          <div className="nav-links">
            <a className="active" href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </div>
          <a className="nav-cta" href="#contact">Get Free Quote</a>
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <img src={images.hero} alt="A sunlit luxury living room with warm textures and elegant furniture" />
          <div className="hero-overlay" />
          <div className="container hero-content">
            <h1>Timeless Elegance for Your Home</h1>
            <p>Crafting bespoke interiors with trustworthy craftsmanship and a philosophy of quiet luxury.</p>
            <div className="button-row">
              <a className="button primary" href="#contact">Free Quotation</a>
              <a className="button ghost" href="#services">View Portfolio</a>
            </div>
          </div>
        </section>

        <section className="usp-strip">
          <div className="container usp-grid">
            {usps.map(([icon, label]) => (
              <div className="usp-item" key={label}>
                <Icon>{icon}</Icon>
                <h3>{label}</h3>
              </div>
            ))}
          </div>
        </section>

        <section className="section container" id="services">
          <div className="section-heading">
            <span>Our Expertise</span>
            <h2>Service Categories</h2>
          </div>
          <div className="service-grid">
            {services.map(([icon, title, copy, image]) => (
              <article className="service-card" key={title}>
                <div className="service-image">
                  <img src={image} alt={`${title} by ${brandName}`} />
                </div>
                <div className="service-body">
                  <Icon>{icon}</Icon>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>


        <section className="section container why" id="about">
          <div className="why-copy">
            <span>Our Difference</span>
            <h2>Why Discerning Homeowners Choose Shadevia Interiors</h2>
            <p>We do not just sell products; we curate atmospheres. Our process is rooted in understanding your lifestyle and translating it into a physical sanctuary.</p>
            <a href="#contact">Learn more about our process</a>
          </div>
          <div className="feature-grid">
            {features.map(([icon, title, copy]) => (
              <article className="feature" key={title}>
                <div className="feature-icon"><Icon>{icon}</Icon></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="coming-soon" aria-labelledby="coming-soon-title">
          <div className="container coming-soon-banner">
            <Icon className="coming-soon-icon">hourglass_top</Icon>
            <span>Coming Soon</span>
            <h2 id="coming-soon-title">Customer Experiences</h2>
            <p>Real project stories and client reviews from Shadevia Interiors will be shared here soon.</p>
          </div>
        </section>

        <section className="cta" id="contact">
          <div className="cta-inner">
            <h2>Ready to redefine your space?</h2>
            <p>Join our consultation waitlist for a bespoke design experience tailored to your lifestyle.</p>
            <form className="consult-form">
              <input placeholder="Your Email Address" type="email" aria-label="Your email address" />
              <button type="submit">Book My Consultation</button>
            </form>
          </div>
        </section>
      </main>

      <footer>
        <div className="container footer-grid">
          <div>
            <h3>{brandName}</h3>
            <p>Creating sanctuary through timeless design and meticulous craftsmanship.</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <a href="#about">Design Philosophy</a>
            <a href="#contact">Privacy Policy</a>
            <a href="#contact">Terms of Service</a>
            <a href="#contact">FAQ</a>
          </div>
          <div>
            <h4>Services</h4>
            <a href="#services">Residential Design</a>
            <a href="#services">Commercial Space</a>
            <a href="#services">Custom Furniture</a>
            <a href="#services">Space Planning</a>
          </div>
          <div>
            <h4>Contact</h4>
            <p><Icon>location_on</Icon> We will notify you soon.</p>
            <p><Icon>mail</Icon> info@shadeviainteriors.in</p>
            <p><Icon>call</Icon> 99902 23099</p>
          </div>
        </div>
        <div className="container footer-bottom">
         <p className="credit-line">© 2026 Shadevia Interiors. Under development by <a href="https://www.websyno.in/" target="_blank" rel="noreferrer">Websyno Technologies</a>.</p>
          <div className="socials">
            <a href="#home" aria-label="Share"><Icon>share</Icon></a>
            <a href="#home" aria-label="Instagram"><Icon>camera</Icon></a>
            <a href="#home" aria-label="Gallery"><Icon>linked_camera</Icon></a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;










