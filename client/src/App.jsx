import React, { useEffect, useState } from 'react';
import heroImage from './assets/image.png';
import Dashboard from './Dashboard.jsx';

const brandName = 'Shadevia Interiors';
const apiUrl = import.meta.env.VITE_API_URL || '/api';
const productImageUrl = (image) => image?.startsWith('http') ? image : `${apiUrl.replace(/\/api$/, '')}${image}`;
const images = {
  hero: heroImage,
  curtains: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmTIu1VFtJjRHF2vHKVtlATrWfgkJvbLv_07yAkU2NrwNRjUhkIZDtClzUoPnkjy2MVkVHOpBF-GLj4w5ritIT50NnPaMCJl8m9fqBJC6p0KSCHv2sIndR7QrzXpV5TVG8P9K6HmvKrmVsO4UTXxvOyvVsgXPJ2Gty6xOecMiV9aiR0GF6NtSF5REqpJ1Bb7MmW6repmm9I5qnERDfYHnU0m9Uln1BBjzyaioEqbSIQgkneM_BXwLa',
  blinds: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4gXxZHAZ8ivG96Bc1lY4fohnqgkjhphfXmnmxYy7SdKoYu6XZh12RY9KmS8qNn4FTSMfXIYswCqnrJz66jQbv8MfyXNR326F6LQyb4eEA5JHiF7AvuK74ZCQLCZ5qrfvNVFuV9JtqT6gakwRqh51ais_GxK33n9z4_qURdu5p6UQxashwdRhesMaKj2I-bMG19L1txNTT784B5NZ9FqlG57HjPiN9-8vZGsnXQFS9-MZ2_xk-9KH5',
  wallpaper: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJgMOzXEKZXZw81h313upNkXXWtzgh2hQZgpFlI-p8tMre2MIuu-itTBfGVa0tVDPb8Bxc4lQezoqS4Gd2-A8GUp_FbKXKTlf_EwAcVwMLmoyGts8whnTVGrEEyANb1I8gj11mQQYGJuPk-6qfgKILdbQPq6hjbMCDEUROZLmsFrTV5QmuVmRwQ9adC8hW9JhzG7YlSCy1-a35Xs9gpXCOtnyZakVeNNu3JinlV_qcaHn_b2EuFYNP',
  flooring: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwQwz9XRKQtK242t32d2sgTrw6QhkApzlIFqv-E6C0b_7Lwr9w4ruXNq7NDUlgsXKx9BprwblVWYMUrCSNPR6_LKk_RmOFb7L0rdVXLeAcdm1d2kPf4DSknUbew0ggeCmJTjmgB_X5yH17nM0YLhZC-mVvlIZ8P3467ltuIi0GijHm-7XE1AoPrJsof-JxRyyxNzja03oo0AAEd5QuJT4EM03uO8-9PEL0I_oN8KszaqAMjLckCfJT'
};
const usps = [['verified', 'Durability'], ['diamond', 'Premium Quality'], ['payments', 'Affordability'], ['architecture', 'Made-to-Order']];
const services = [['curtains', 'Curtains', 'Hand-stitched window treatments designed for privacy and light control.', images.curtains], ['blinds', 'Blinds', 'Modern and functional roller, Roman, and Venetian blind systems.', images.blinds], ['wallpaper', 'Wallpaper', 'Luxury wall coverings that add depth and personality to any room.', images.wallpaper], ['floor', 'Flooring', 'High-quality hardwood, laminate, and luxury vinyl tile solutions.', images.flooring]];
const features = [['palette', 'Expert Design', 'Consultations with certified interior designers to ensure every choice is intentional and cohesive.'], ['high_quality', 'Quality Materials', 'Sourcing only sustainable, high-grade textiles and woods that age beautifully over decades.'], ['schedule', 'Timely Delivery', 'Rigorous project management to ensure your transformation is completed within the agreed timeline.'], ['support_agent', 'After-Sales Support', 'Our relationship does not end at installation. We offer care guidance and maintenance services.']];

function Icon({ children, className = '' }) { return <span className={`material-symbols-outlined ${className}`}>{children}</span>; }

function App() {
  const [authMode, setAuthMode] = useState(null);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState('');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogMessage, setCatalogMessage] = useState('');

  useEffect(() => {
    const nav = document.querySelector('.top-nav');
    const handleScroll = () => nav?.classList.toggle('is-scrolled', window.scrollY > 50);
    handleScroll(); window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    fetch(`${apiUrl}/auth/me`, { credentials: 'include' }).then((response) => response.ok ? response.json() : null).then((data) => data?.user && setUser(data.user)).catch(() => {});
  }, []);
  const openAuth = (mode) => { setAuthMode(mode); setAuthError(''); setForm({ name: '', email: '', password: '' }); };
  const submitAuth = async (event) => {
    event.preventDefault(); setAuthError(''); setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/auth/${authMode === 'signup' ? 'signup' : 'login'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(authMode === 'signup' ? form : { email: form.email, password: form.password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to continue. Please try again.');
      setUser(data.user); setAuthMode(null);
    } catch (error) { setAuthError(error.message); } finally { setIsSubmitting(false); }
  };
  const logout = async () => { await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' }); setUser(null); };
  const browseCategory = async (category) => {
    setCatalogCategory(category); setCatalogProducts([]); setCatalogMessage('Loading products…');
    try {
      const response = await fetch(`${apiUrl}/products?category=${encodeURIComponent(category)}`);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : { message: 'Catalog is temporarily unavailable.' };
      if (!response.ok) throw new Error(data.message || 'Unable to load products.');
      setCatalogProducts(data.products); setCatalogMessage(data.products.length ? '' : 'No products are available in this category yet.');
    } catch (error) { setCatalogMessage(error.message); }
  };

  if (user) return <Dashboard user={user} onLogout={logout} />;

  return <>
    <nav className="top-nav"><div className="nav-inner"><a className="brand" href="#home">{brandName}</a><div className="nav-links"><a className="active" href="#home">Home</a><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a></div>{user ? <button className="nav-cta nav-user" type="button" onClick={logout}>Sign out · {user.name}</button> : <button className="nav-cta" type="button" onClick={() => openAuth('login')}>Sign in</button>}</div></nav>
    <main>
      <section className="hero" id="home"><img src={images.hero} alt="A sunlit luxury living room with warm textures and elegant furniture" /><div className="hero-overlay" /><div className="container hero-content"><h1>Timeless Elegance for Your Home</h1><p>Crafting bespoke interiors with trustworthy craftsmanship and a philosophy of quiet luxury.</p><div className="button-row"><a className="button primary" href="#contact">Free Quotation</a><a className="button ghost" href="#services">View Portfolio</a></div></div></section>
      <section className="usp-strip"><div className="container usp-grid">{usps.map(([icon, label]) => <div className="usp-item" key={label}><Icon>{icon}</Icon><h3>{label}</h3></div>)}</div></section>
      <section className="section container" id="services"><div className="section-heading"><span>Our Expertise</span><h2>Service Categories</h2></div><div className="service-grid">{services.map(([icon, title, copy, image]) => <button className="service-card service-button" type="button" key={title} onClick={() => browseCategory(title.toLowerCase())}><div className="service-image"><img src={image} alt={`${title} by ${brandName}`} /></div><div className="service-body"><Icon>{icon}</Icon><h3>{title}</h3><p>{copy}</p><span className="catalog-link">View products →</span></div></button>)}</div>{catalogCategory && <div className="catalog-results" aria-live="polite"><div className="catalog-heading"><div><span>Catalog</span><h3>{catalogCategory.charAt(0).toUpperCase() + catalogCategory.slice(1)}</h3></div><button type="button" onClick={() => { setCatalogCategory(''); setCatalogProducts([]); }}>Close</button></div>{catalogMessage ? <p className="catalog-empty">{catalogMessage}</p> : <div className="catalog-grid">{catalogProducts.map((product) => <article className="catalog-product" key={product.id}><img src={productImageUrl(product.images[0])} alt={product.name} /><div><h4>{product.name}</h4><p>{product.description}</p>{product.tags?.length > 0 && <div className="catalog-tags">{product.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}<strong>₹{Number(product.price).toLocaleString('en-IN')}</strong></div></article>)}</div>}</div>}</section>
      <section className="section container why" id="about"><div className="why-copy"><span>Our Difference</span><h2>Why Discerning Homeowners Choose Shadevia Interiors</h2><p>We do not just sell products; we curate atmospheres. Our process is rooted in understanding your lifestyle and translating it into a physical sanctuary.</p><a href="#contact">Learn more about our process</a></div><div className="feature-grid">{features.map(([icon, title, copy]) => <article className="feature" key={title}><div className="feature-icon"><Icon>{icon}</Icon></div><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
      <section className="coming-soon" aria-labelledby="coming-soon-title"><div className="container coming-soon-banner"><Icon className="coming-soon-icon">hourglass_top</Icon><span>Coming Soon</span><h2 id="coming-soon-title">Customer Experiences</h2><p>Real project stories and client reviews from Shadevia Interiors will be shared here soon.</p></div></section>
      <section className="cta" id="contact"><div className="cta-inner"><h2>Ready to redefine your space?</h2><p>Join our consultation waitlist for a bespoke design experience tailored to your lifestyle.</p><form className="consult-form"><input placeholder="Your Email Address" type="email" aria-label="Your email address" /><button type="submit">Book My Consultation</button></form></div></section>
    </main>
    <footer><div className="container footer-grid"><div><h3>{brandName}</h3><p>Creating sanctuary through timeless design and meticulous craftsmanship.</p></div><div><h4>Quick Links</h4><a href="#about">Design Philosophy</a><a href="#contact">Privacy Policy</a><a href="#contact">Terms of Service</a><a href="#contact">FAQ</a></div><div><h4>Services</h4><a href="#services">Residential Design</a><a href="#services">Commercial Space</a><a href="#services">Custom Furniture</a><a href="#services">Space Planning</a></div><div><h4>Contact</h4><p><Icon>location_on</Icon> We will notify you soon.</p><p><Icon>mail</Icon> info@shadeviainteriors.in</p><p><Icon>call</Icon> 99902 23099</p></div></div><div className="container footer-bottom"><p className="credit-line">© 2026 Shadevia Interiors. Under development by <a href="https://www.websyno.in/" target="_blank" rel="noreferrer">Websyno Technologies</a>.</p><div className="socials"><a href="#home" aria-label="Share"><Icon>share</Icon></a><a href="#home" aria-label="Instagram"><Icon>camera</Icon></a><a href="#home" aria-label="Gallery"><Icon>linked_camera</Icon></a></div></div></footer>
    {authMode && <div className="auth-overlay" role="presentation" onMouseDown={() => setAuthMode(null)}><section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}><button className="auth-close" type="button" onClick={() => setAuthMode(null)} aria-label="Close authentication form">×</button><span className="auth-kicker">Shadevia Interiors</span><h2 id="auth-title">{authMode === 'signup' ? 'Create your account' : 'Welcome back'}</h2><p>{authMode === 'signup' ? 'Create an account to save your design journey.' : 'Sign in to continue your design journey.'}</p><form className="auth-form" onSubmit={submitAuth}>{authMode === 'signup' && <label>Full name<input required minLength="2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} autoComplete="name" /></label>}<label>Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" /></label><label>Password<input required type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} /></label>{authError && <p className="auth-error" role="alert">{authError}</p>}<button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}</button></form><p className="auth-switch">{authMode === 'signup' ? 'Already have an account?' : 'New to Shadevia?'}<button type="button" onClick={() => openAuth(authMode === 'signup' ? 'login' : 'signup')}>{authMode === 'signup' ? ' Sign in' : ' Create one'}</button></p></section></div>}
  </>;
}
export default App;
