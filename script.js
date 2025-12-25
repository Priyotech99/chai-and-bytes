// script.js (index page) - updated to keep "Added ✓" state permanently, show mini-drawer, and feedback functionality

// Products list - filenames from your folder (as per screenshot)
const products = [
  { id: 'kulhad', name: 'Kulhad chai', price: 89, img: 'kulhad.jpg' },
  { id: 'matar', name: 'Matar Paneer', price: 320, img: 'mattarpaneer.jpg' },
  { id: 'pizza', name: 'Pizza', price: 320, img: 'pizza.jpg' },
  { id: 'noodles', name: 'Hakka Noodles', price: 109, img: 'hakkanoodles.jpg' },
  // Two cold coffee files exist; prefer exact 'cold coffee.jpg'
  { id: 'coldcoffee', name: 'Cold Coffee', price: 149, img: 'cold cofee.jpg' },
  // sandwich image not found -> using burger.jpg as placeholder
  { id: 'sandwich', name: 'Grilled Sandwich', price: 149, img: 'grilled sandwich.jpg' }
];

const shopSection = document.querySelector('.shop-section');
const itemNamesDiv = document.getElementById('itemNames');
const cartCountSpan = document.getElementById('cartCount');

function urlFor(name){
  // encode spaces properly
  return encodeURI(name);
}

function renderProducts(filter=''){
  shopSection.innerHTML = '';
  itemNamesDiv.innerHTML = '';
  products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    .forEach(p => {
      const box = document.createElement('div');
      box.className = 'box';
      const imgDiv = document.createElement('div');
      imgDiv.className = 'food-img';
      imgDiv.style.backgroundImage = `url('${urlFor(p.img)}')`;
      box.appendChild(imgDiv);

      const title = document.createElement('div');
      title.style.padding = '10px';
      title.innerHTML = `<h3 style="margin-bottom:6px">${p.name}</h3>
                         <div class="mrp">MRP ₹ ${p.price}</div>`;
      box.appendChild(title);

      const btn = document.createElement('p');
      btn.className = 'order-btn';
      // If an item already in cart, keep button as 'Added ✓'
      const inCart = getCart().some(i => i.id === p.id);
      btn.textContent = inCart ? 'Added ✓' : 'Order Now';
      if(inCart){
        btn.classList.add('added');
      }
      btn.addEventListener('click', () => addToCart(p, btn));
      box.appendChild(btn);

      shopSection.appendChild(box);

      // also add to item-name row
      const span = document.createElement('p');
      span.textContent = p.name;
      span.style.margin='6px';
      itemNamesDiv.appendChild(span);
  });
}

function getCart(){
  const raw = localStorage.getItem('tripathi_cart');
  return raw ? JSON.parse(raw) : [];
}
function saveCart(cart){
  localStorage.setItem('tripathi_cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(product, btn){
  let cart = getCart();
  const found = cart.find(i => i.id === product.id);
  if(found){
    found.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, qty: 1 });
  }
  saveCart(cart);
  // Make button permanently show 'Added ✓'
  btn.textContent = 'Added ✓';
  btn.classList.add('added');

  // Show mini drawer with item info
  showMiniDrawer(product);
}

// cart count
function updateCartCount(){
  const cart = getCart();
  const totalItems = cart.reduce((s,i)=> s + i.qty, 0);
  cartCountSpan.textContent = totalItems;
}

// open cart page
document.getElementById('openCart').addEventListener('click', () => {
  window.location.href = 'cart.html';
});

// Bind with us -> modal
const bindBtn = document.getElementById('bindBtn');
const signinModal = document.getElementById('signinModal');
const closeModal = document.getElementById('closeModal');

if(bindBtn){
  bindBtn.addEventListener('click', () => {
    signinModal.style.display = 'block';
  });
}
if(closeModal){
  closeModal.addEventListener('click', () => signinModal.style.display = 'none');
}
window.addEventListener('click', (e) => {
  if(e.target === signinModal) signinModal.style.display = 'none';
});

// Search
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
  renderProducts(e.target.value);
});

// initial render
renderProducts();
updateCartCount();

/* ---- Mini Drawer logic ---- */
const miniDrawer = document.getElementById('miniDrawer');
const miniImg = document.getElementById('miniImg');
const miniName = document.getElementById('miniName');
const miniPrice = document.getElementById('miniPrice');
const viewCartBtn = document.getElementById('viewCartBtn');
const miniClose = document.getElementById('miniClose');

function showMiniDrawer(product){
  miniImg.src = urlFor(product.img);
  miniName.textContent = product.name;
  miniPrice.textContent = `₹ ${product.price}`;
  miniDrawer.classList.add('show');
  miniDrawer.setAttribute('aria-hidden','false');

  // auto hide after 6 seconds
  setTimeout(()=> {
    if(miniDrawer) {
      miniDrawer.classList.remove('show');
      miniDrawer.setAttribute('aria-hidden','true');
    }
  }, 6000);
}

viewCartBtn.addEventListener('click', ()=> {
  window.location.href = 'cart.html';
});
miniClose.addEventListener('click', ()=> {
  miniDrawer.classList.remove('show');
  miniDrawer.setAttribute('aria-hidden','true');
});

/* ---- Feedback logic ---- */
const feedbackNavBtn = document.getElementById('feedbackNavBtn'); // nav-return
const feedbackModal = document.getElementById('feedbackModal');
const feedbackClose = document.getElementById('feedbackClose');
const feedbackSubmit = document.getElementById('feedbackSubmit');
const feedbackCancel = document.getElementById('feedbackCancel');
const feedbackToast = document.getElementById('feedbackToast');
const feedbackText = document.getElementById('feedbackText');

if(feedbackNavBtn){
  feedbackNavBtn.addEventListener('click', () => {
    feedbackModal.style.display = 'block';
  });
}
if(feedbackClose){
  feedbackClose.addEventListener('click', () => {
    feedbackModal.style.display = 'none';
  });
}
if(feedbackCancel){
  feedbackCancel.addEventListener('click', () => {
    feedbackModal.style.display = 'none';
  });
}
if(feedbackSubmit){
  feedbackSubmit.addEventListener('click', () => {
    // you can store feedback in localStorage or send to server — here just show toast
    const text = feedbackText.value.trim();
    // Optionally: store
    if(text){
      const saved = JSON.parse(localStorage.getItem('tripathi_feedbacks') || '[]');
      saved.push({ text: text, created: new Date().toISOString() });
      localStorage.setItem('tripathi_feedbacks', JSON.stringify(saved));
    }
    feedbackModal.style.display = 'none';
    showFeedbackToast();
    feedbackText.value = '';
  });
}
window.addEventListener('click', (e) => {
  if(e.target === feedbackModal) feedbackModal.style.display = 'none';
});

function showFeedbackToast(){
  feedbackToast.style.display = 'block';
  setTimeout(()=> feedbackToast.style.display = 'none', 3500);
}
