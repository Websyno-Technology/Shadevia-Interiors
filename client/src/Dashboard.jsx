import React, { useEffect, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL || '/api';
const serverUrl = apiUrl.replace(/\/api$/, '');
const imageUrl = (image) => image?.startsWith('http') ? image : `${serverUrl}${image}`;
const readResponse = async (response) => {
  const body = await response.text();
  try { return JSON.parse(body); } catch { return { message: `API returned a non-JSON response (${response.status}). Check that the server is running and VITE_API_URL points to its /api endpoint.` }; }
};
const navItems = [['dashboard', 'grid_view', 'Overview'], ['add', 'add_photo_alternate', 'New product'], ['products', 'inventory_2', 'Manage products']];

function Dashboard({ user, onLogout }) {
  const [section, setSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'curtains', customCategory: '', tags: '' });
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const notify = (text, type = 'success') => setToast({ text, type, id: Date.now() });

  const loadProducts = async () => {
    const response = await fetch(`${apiUrl}/products/manage`, { credentials: 'include' });
    const data = await readResponse(response);
    if (response.ok) setProducts(data.products);
  };
  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const updateProduct = async (productId, updates) => {
    const response = await fetch(`${apiUrl}/products/${productId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(updates) });
    const data = await readResponse(response);
    if (!response.ok) return notify(data.message || 'Unable to update the product.', 'error');
    setProducts((current) => current.map((product) => product.id === productId ? data.product : product));
    notify('Product updated successfully.');
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    if (!files.length) return notify('Please select at least one image.', 'error');
    if (files.length > 10) return notify('You can upload a maximum of 10 images.', 'error');
    setIsSaving(true);
    const data = new FormData();
    const productForm = { ...form, category: form.category === 'custom' ? form.customCategory : form.category };
    delete productForm.customCategory;
    const tagList = form.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    if (tagList.length > 12) { setIsSaving(false); return notify('A product can have a maximum of 12 tags.', 'error'); }
    Object.entries({ ...productForm, tags: tagList.join(',') }).forEach(([key, value]) => data.append(key, value));
    files.forEach((file) => data.append('images', file));
    try {
      const response = await fetch(`${apiUrl}/products`, { method: 'POST', credentials: 'include', body: data });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.message || 'Unable to add the product.');
      setProducts((current) => [result.product, ...current]);
      setForm({ name: '', description: '', price: '', category: 'curtains', customCategory: '', tags: '' });
      setFiles([]); setSection('products'); notify('Product added to your catalog.');
    } catch (error) { notify(error.message, 'error'); } finally { setIsSaving(false); }
  };

  const visibleCount = products.filter((product) => product.isVisible).length;
  const outOfStockCount = products.filter((product) => product.stockStatus === 'out_of_stock').length;
  return <div className="dashboard-shell">
    <aside className="dashboard-sidebar"><a className="dashboard-logo" href="#dashboard">S</a><nav>{navItems.map(([key, icon, label]) => <button className={section === key ? 'active' : ''} type="button" key={key} onClick={() => setSection(key)}><span className="material-symbols-outlined">{icon}</span><span>{label}</span></button>)}</nav><button className="sidebar-logout" type="button" onClick={onLogout}><span className="material-symbols-outlined">logout</span><span>Sign out</span></button></aside>
    <div className="dashboard-main">
      <header className="dashboard-topbar"><div><p>Good morning, {user.name}</p><h1>{section === 'dashboard' ? 'Dashboard' : section === 'add' ? 'Add a new product' : 'Manage products'}</h1></div><div className="profile-badge">{user.name.charAt(0).toUpperCase()}</div></header>
      {toast && <Toast key={toast.id} toast={toast} onDismiss={() => setToast(null)} />}
      {section === 'dashboard' && <Overview products={products} visibleCount={visibleCount} outOfStockCount={outOfStockCount} setSection={setSection} />}
      {section === 'add' && <section className="dashboard-content"><form className="product-form dashboard-card" onSubmit={submitProduct}><div className="card-heading"><div><p>Catalog</p><h2>New product</h2></div><span>Up to 10 images</span></div><div className="product-form-grid"><label>Product name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Price (INR)<input required min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Category<select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}><option value="curtains">Curtains</option><option value="blinds">Blinds</option><option value="wallpaper">Wallpaper</option><option value="flooring">Flooring</option><option value="other">Other</option><option value="custom">+ Add a category</option></select></label>{form.category === 'custom' && <label>New category<input required value={form.customCategory} onChange={(event) => setForm({ ...form, customCategory: event.target.value })} placeholder="e.g. Cushion covers" /></label>}<label>Tags<input list="product-tag-presets" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="luxury, linen, beige" /><datalist id="product-tag-presets"><option value="limited time deal" /><option value="new arrival" /><option value="bestseller" /></datalist><small>Enter your own comma-separated tags or choose a suggestion (up to 12)</small></label><label className="wide">Description<textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Optional product description" /></label></div><label className="upload-area"><input required type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files).slice(0, 10))} /><span className="material-symbols-outlined">cloud_upload</span><strong>Choose product images</strong><small>PNG, JPG or WEBP · maximum 10 images · 5 MB each</small></label>{files.length > 0 && <div className="upload-preview">{files.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt="Selected preview" />)}</div>}<button className="save-product" disabled={isSaving} type="submit">{isSaving ? 'Uploading…' : 'Add product'}</button></form></section>}
      {section === 'products' && <section className="dashboard-content"><article className="dashboard-card product-manager"><div className="card-heading"><div><p>Catalog</p><h2>All products</h2></div><button type="button" onClick={() => setSection('add')}>+ Add product</button></div>{products.length ? <div className="manage-list">{products.map((product) => <ProductRow key={product.id} product={product} onUpdate={updateProduct} />)}</div> : <div className="empty-state">No products yet. Use “Add product” to create your first listing.</div>}</article></section>}
    </div>
  </div>;
}

function Overview({ products, visibleCount, outOfStockCount, setSection }) {
  return <section className="dashboard-content"><div className="stat-grid"><Stat icon="inventory_2" label="Total products" value={products.length} /><Stat icon="visibility" label="Visible in store" value={visibleCount} /><Stat icon="remove_shopping_cart" label="Out of stock" value={outOfStockCount} /></div><div className="dashboard-panels"><article className="dashboard-card inventory-overview"><div className="card-heading"><div><p>Inventory overview</p><h2>Product availability</h2></div><button type="button" onClick={() => setSection('products')}>Manage inventory</button></div><div className="availability-bar"><span style={{ width: `${products.length ? (visibleCount / products.length) * 100 : 0}%` }} /></div><div className="availability-legend"><span><i className="visible-dot" /> Visible {visibleCount}</span><span><i className="hidden-dot" /> Hidden {products.length - visibleCount}</span><span><i className="stock-dot" /> Out of stock {outOfStockCount}</span></div></article><article className="dashboard-card quick-actions"><p>Quick actions</p><h2>Keep your catalog current</h2><button type="button" onClick={() => setSection('add')}><span className="material-symbols-outlined">add_photo_alternate</span>Add new product</button><button type="button" onClick={() => setSection('products')}><span className="material-symbols-outlined">sell</span>Update products</button></article></div><article className="dashboard-card recent-products"><div className="card-heading"><div><p>Latest additions</p><h2>Recently listed products</h2></div></div>{products.length ? <div className="recent-list">{products.slice(0, 4).map((product) => <div key={product.id}><img src={imageUrl(product.images[0])} alt="" /><span>{product.name}</span><strong>INR {Number(product.price).toLocaleString('en-IN')}</strong><em className={product.stockStatus}>{product.stockStatus === 'in_stock' ? 'In stock' : 'Out of stock'}</em></div>)}</div> : <div className="empty-state">Your catalog is empty. Add your first product to get started.</div>}</article></section>;
}
function Stat({ icon, label, value }) { return <article><span className="material-symbols-outlined">{icon}</span><p>{label}</p><strong>{value}</strong></article>; }
function ProductRow({ product, onUpdate }) { const [price, setPrice] = useState(product.price); return <article className="manage-product"><img src={imageUrl(product.images[0])} alt={product.name} /><div className="product-name"><strong>{product.name}</strong><small>{product.category} · {product.images.length} image{product.images.length === 1 ? '' : 's'}</small></div><label className="price-editor">INR<input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /><button type="button" onClick={() => onUpdate(product.id, { price: Number(price) })}>Save</button></label><label className="toggle-control"><input type="checkbox" checked={product.isVisible} onChange={(event) => onUpdate(product.id, { isVisible: event.target.checked })} /><span />Visible</label><select value={product.stockStatus} onChange={(event) => onUpdate(product.id, { stockStatus: event.target.value })}><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select></article>; }
function Toast({ toast, onDismiss }) { return <div className={`toast toast-${toast.type}`} role="status"><span className="material-symbols-outlined">{toast.type === 'error' ? 'error' : 'check_circle'}</span><p>{toast.text}</p><button type="button" onClick={onDismiss} aria-label="Dismiss notification">×</button></div>; }

export default Dashboard;
