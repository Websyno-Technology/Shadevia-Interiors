import React, { useEffect, useState } from 'react';
import { categories, tags as allowedTags } from './config/catalog.js';

const apiUrl = import.meta.env.VITE_API_URL || '/api';
const serverUrl = apiUrl.replace(/\/api$/, '');
const imageUrl = (image) => image?.startsWith('http') ? image : `${serverUrl}${image}`;
const readResponse = async (response) => {
  const body = await response.text();
  try { return JSON.parse(body); } catch { return { message: `API returned a non-JSON response (${response.status}). Check that the server is running and VITE_API_URL points to its /api endpoint.` }; }
};
const navItems = [['dashboard', 'grid_view', 'Overview'], ['add', 'add_photo_alternate', 'New product'], ['products', 'inventory_2', 'Manage products']];
const emptyProduct = { name: '', description: '', price: '', category: categories[0]?.id || '', tags: [] };

function Dashboard({ user, onLogout, onGoHome }) {
  const [section, setSection] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState(emptyProduct);
  const notify = (text, type = 'success') => setToast({ text, type, id: Date.now() });

  const loadProducts = async () => {
    const response = await fetch(`${apiUrl}/products/manage`, { credentials: 'include' });
    const data = await readResponse(response);
    if (response.ok) setProducts(data.products || []);
  };
  useEffect(() => { loadProducts(); }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const submitProduct = async (event) => {
    event.preventDefault();
    const missingDetails = [!form.name.trim() && 'a product name', !form.price && 'a valid price', !form.category && 'a category', !form.description.trim() && 'a description', !files.length && 'at least one product image'].filter(Boolean);
    if (missingDetails.length) return notify(`Please add ${missingDetails.join(', ')} before uploading.`, 'error');
    if (Number(form.price) < 0) return notify('Please enter a valid price.', 'error');
    setIsSaving(true);
    const data = new FormData();
    Object.entries({ ...form, tags: form.tags.join(',') }).forEach(([key, value]) => data.append(key, value));
    files.forEach((file) => data.append('images', file));
    try {
      const response = await fetch(`${apiUrl}/products`, { method: 'POST', credentials: 'include', body: data });
      const result = await readResponse(response);
      if (!response.ok) throw new Error(result.message || 'Unable to add the product.');
      setProducts((current) => [result.product, ...current]);
      setForm(emptyProduct); setFiles([]); setSection('products'); notify('Product added to your catalog.');
    } catch (error) { notify(error.message, 'error'); } finally { setIsSaving(false); }
  };

  const updateProduct = async (productId, updates, successMessage = 'Product updated successfully.') => {
    const response = await fetch(`${apiUrl}/products/${productId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(updates) });
    const data = await readResponse(response);
    if (!response.ok) return notify(data.message || 'Unable to update the product.', 'error');
    setProducts((current) => current.map((product) => product.id === productId ? data.product : product));
    notify(successMessage);
    return data.product;
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    const response = await fetch(`${apiUrl}/products/${product.id}`, { method: 'DELETE', credentials: 'include' });
    if (!response.ok) {
      const data = await readResponse(response);
      return notify(data.message || 'Unable to delete the product.', 'error');
    }
    setProducts((current) => current.filter((currentProduct) => currentProduct.id !== product.id));
    notify('Product deleted.');
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, description: product.description, price: String(product.price), category: product.category, tags: product.tags || [] });
  };
  const saveEdit = async (event) => {
    event.preventDefault();
    if (!editForm.name.trim() || !editForm.description.trim() || editForm.price === '' || Number(editForm.price) < 0) return notify('Please complete the product name, description, and valid price.', 'error');
    const saved = await updateProduct(editingProduct.id, { ...editForm, price: Number(editForm.price) });
    if (saved) setEditingProduct(null);
  };

  const visibleCount = products.filter((product) => product.isVisible).length;
  const outOfStockCount = products.filter((product) => product.stockStatus === 'out_of_stock').length;
  return <div className="dashboard-shell">
    <aside className="dashboard-sidebar"><div className="sidebar-brand-row"><button className="homepage-link" type="button" onClick={onGoHome} aria-label="Go to website homepage"><span className="material-symbols-outlined">home</span></button><a className="dashboard-logo" href="#dashboard">S</a></div><nav>{navItems.map(([key, icon, label]) => <button className={section === key ? 'active' : ''} type="button" key={key} onClick={() => setSection(key)}><span className="material-symbols-outlined">{icon}</span><span>{label}</span></button>)}</nav><button className="sidebar-logout" type="button" onClick={onLogout}><span className="material-symbols-outlined">logout</span><span>Sign out</span></button></aside>
    <div className="dashboard-main"><header className="dashboard-topbar"><div><p>Good morning, {user.name}</p><h1>{section === 'dashboard' ? 'Dashboard' : section === 'add' ? 'Add a new product' : 'Manage products'}</h1></div><div className="profile-badge">{user.name.charAt(0).toUpperCase()}</div></header>{toast && <Toast key={toast.id} toast={toast} onDismiss={() => setToast(null)} />}
      {section === 'dashboard' && <Overview products={products} visibleCount={visibleCount} outOfStockCount={outOfStockCount} setSection={setSection} />}
      {section === 'add' && <section className="dashboard-content"><ProductForm form={form} setForm={setForm} files={files} setFiles={setFiles} onSubmit={submitProduct} isSaving={isSaving} /></section>}
      {section === 'products' && <section className="dashboard-content"><article className="dashboard-card product-manager"><div className="card-heading"><div><p>Catalog</p><h2>All products</h2></div><button type="button" onClick={() => setSection('add')}>+ Add product</button></div>{products.length ? <div className="manage-list">{products.map((product) => <ProductRow key={product.id} product={product} onUpdate={updateProduct} onEdit={openEdit} onDelete={deleteProduct} />)}</div> : <div className="empty-state">No products yet. Use “Add product” to create your first listing.</div>}</article></section>}
      {editingProduct && <EditDialog form={editForm} setForm={setEditForm} onClose={() => setEditingProduct(null)} onSubmit={saveEdit} />}
    </div>
  </div>;
}

function ProductForm({ form, setForm, files, setFiles, onSubmit, isSaving }) {
  return <form className="product-form dashboard-card" onSubmit={onSubmit} noValidate><div className="card-heading"><div><p>Catalog</p><h2>New product</h2></div><span>Up to 10 images</span></div><ProductFields form={form} setForm={setForm} /><label className="upload-area"><input type="file" accept="image/*" multiple onChange={(event) => setFiles(Array.from(event.target.files).slice(0, 10))} /><span className="material-symbols-outlined">cloud_upload</span><strong>Choose product images</strong><small>PNG, JPG or WEBP · maximum 10 images · 5 MB each</small></label>{files.length > 0 && <div className="upload-preview">{files.map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt="Selected preview" />)}</div>}<button className="save-product" disabled={isSaving} type="submit">{isSaving ? 'Uploading…' : 'Add product'}</button></form>;
}

function ProductFields({ form, setForm }) {
  return <div className="product-form-grid"><label>Product name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Price (INR)<input min="0" step="0.01" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category.id} value={category.id}>{category.label}</option>)}</select></label><TagSelector value={form.tags} onChange={(tags) => setForm({ ...form, tags })} /><label className="wide">Description<textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe the product" /></label></div>;
}

function TagSelector({ value, onChange }) { return <fieldset className="tag-picker"><legend>Tags</legend><div>{allowedTags.map((tag) => <label key={tag}><input type="checkbox" checked={value.includes(tag)} onChange={(event) => onChange(event.target.checked ? [...value, tag] : value.filter((selectedTag) => selectedTag !== tag))} />{tag}</label>)}</div></fieldset>; }
function EditDialog({ form, setForm, onClose, onSubmit }) { return <div className="category-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><form className="category-dialog edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-product-title" onSubmit={onSubmit}><button className="category-dialog-close" type="button" onClick={onClose} aria-label="Close product editor">×</button><p>Catalog</p><h2 id="edit-product-title">Edit product</h2><ProductFields form={form} setForm={setForm} /><div className="category-dialog-actions"><button type="button" onClick={onClose}>Cancel</button><button type="submit">Save changes</button></div></form></div>; }
function Overview({ products, visibleCount, outOfStockCount, setSection }) { return <section className="dashboard-content"><div className="stat-grid"><Stat icon="inventory_2" label="Total products" value={products.length} /><Stat icon="visibility" label="Visible in store" value={visibleCount} /><Stat icon="remove_shopping_cart" label="Out of stock" value={outOfStockCount} /></div><div className="dashboard-panels"><article className="dashboard-card inventory-overview"><div className="card-heading"><div><p>Inventory overview</p><h2>Product availability</h2></div><button type="button" onClick={() => setSection('products')}>Manage inventory</button></div><div className="availability-bar"><span style={{ width: `${products.length ? (visibleCount / products.length) * 100 : 0}%` }} /></div><div className="availability-legend"><span><i className="visible-dot" /> Visible {visibleCount}</span><span><i className="hidden-dot" /> Hidden {products.length - visibleCount}</span><span><i className="stock-dot" /> Out of stock {outOfStockCount}</span></div></article><article className="dashboard-card quick-actions"><p>Quick actions</p><h2>Keep your catalog current</h2><button type="button" onClick={() => setSection('add')}><span className="material-symbols-outlined">add_photo_alternate</span>Add new product</button><button type="button" onClick={() => setSection('products')}><span className="material-symbols-outlined">sell</span>Update products</button></article></div></section>; }
function Stat({ icon, label, value }) { return <article><span className="material-symbols-outlined">{icon}</span><p>{label}</p><strong>{value}</strong></article>; }
function ProductRow({ product, onUpdate, onEdit, onDelete }) { const [price, setPrice] = useState(product.price); return <article className="manage-product"><img src={imageUrl(product.images[0])} alt={product.name} /><div className="product-name"><strong>{product.name}</strong><small>{product.category} · {product.images.length} image{product.images.length === 1 ? '' : 's'}</small></div><label className="price-editor">INR<input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} /><button type="button" onClick={() => onUpdate(product.id, { price: Number(price) })}>Save</button></label><label className="toggle-control"><input type="checkbox" checked={product.isVisible} onChange={(event) => onUpdate(product.id, { isVisible: event.target.checked })} /><span />Visible</label><select value={product.stockStatus} onChange={(event) => onUpdate(product.id, { stockStatus: event.target.value })}><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option></select><div className="product-actions"><button type="button" onClick={() => onEdit(product)}>Edit</button><button className="delete-product" type="button" onClick={() => onDelete(product)}>Delete</button></div></article>; }
function Toast({ toast, onDismiss }) { return <div className={`toast toast-${toast.type}`} role="status"><span className="material-symbols-outlined">{toast.type === 'error' ? 'error' : 'check_circle'}</span><p>{toast.text}</p><button type="button" onClick={onDismiss} aria-label="Dismiss notification">×</button></div>; }

export default Dashboard;
