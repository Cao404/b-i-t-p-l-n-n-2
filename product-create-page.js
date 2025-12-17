// Toggle size/option selection
function toggleOption(element) {
  element.classList.toggle('active');
}

// Toggle color selection
function toggleColor(element) {
  element.classList.toggle('active');
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const container = document.getElementById('previewImage');
      let imgElement = container.querySelector('img');
      if (!imgElement) {
        container.innerHTML = '<img src="' + e.target.result + '" alt="Product" style="width:100%;height:100%;object-fit:contain;" />';
      } else {
        imgElement.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }
}

// Update preview
function updatePreview() {
  const name = document.getElementById('productName').value;
  const category = document.getElementById('productCategory').value;
  const price = document.getElementById('productPrice').value;
  const discount = document.getElementById('productDiscount').value;
  
  document.getElementById('previewTitle').textContent = name;
  document.getElementById('previewSubtitle').textContent = '(' + category + ')';
  document.getElementById('previewPriceNew').textContent = '$' + price;
  
  if (discount > 0) {
    const oldPrice = Math.round(price / (1 - discount / 100));
    document.getElementById('previewPriceOld').textContent = '$' + oldPrice;
    document.getElementById('previewDiscount').textContent = discount + '% OFF';
    document.getElementById('previewPriceOld').style.display = 'block';
    document.getElementById('previewDiscount').style.display = 'block';
  } else {
    document.getElementById('previewPriceOld').style.display = 'none';
    document.getElementById('previewDiscount').style.display = 'none';
  }
}

// Create product: lưu vào localStorage thông qua kho sản phẩm chung
function createProduct() {
  // Lấy thông tin cơ bản từ form
  const nameInput = document.getElementById('productName');
  const categorySelect = document.getElementById('productCategory');
  const priceInput = document.getElementById('productPrice');
  const discountInput = document.getElementById('productDiscount');

  const name = nameInput ? nameInput.value.trim() : '';
  const category = categorySelect ? categorySelect.value : '';
  const price = priceInput ? Number(priceInput.value || 0) : 0;
  const discount = discountInput ? Number(discountInput.value || 0) : 0;

  if (!name) {
    alert('Vui lòng nhập tên sản phẩm');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!category) {
    alert('Vui lòng chọn danh mục sản phẩm');
    if (categorySelect) categorySelect.focus();
    return;
  }

  // Lấy stock (nếu có)
  const stockInput = Array.prototype.slice.call(document.querySelectorAll('.form-section input.form-input'))
    .find(function (el) { return el.placeholder === 'Quantity'; });
  const stock = stockInput ? Number(stockInput.value || 0) : 0;

  // Lấy danh sách size được chọn
  const sizeButtons = document.querySelectorAll('#sizeOptions .option-btn.active');
  const sizes = Array.prototype.slice.call(sizeButtons).map(function (btn) { return btn.textContent.trim(); });

  // Lấy danh sách màu được chọn
  const colorPickers = document.querySelectorAll('#colorOptions .color-picker.active');
  const colors = Array.prototype.slice.call(colorPickers).map(function (el) {
    return window.getComputedStyle(el).backgroundColor;
  });

  // Lấy ảnh preview nếu có
  let image = '';
  const previewImg = document.querySelector('#previewImage img');
  if (previewImg && previewImg.src) {
    image = previewImg.src;
  }

  // Lấy danh sách sản phẩm hiện tại từ kho
  const products = typeof getAllProducts === 'function' ? getAllProducts() : [];
  const maxId = products.length ? Math.max.apply(null, products.map(function (p) { return p.id || 0; })) : 0;
  const newId = maxId + 1;

  const newProduct = {
    id: newId,
    name: name,
    price: price,
    oldPrice: discount > 0 ? Math.round(price / (1 - discount / 100)) : null,
    discount: discount > 0 ? discount : null,
    rating: 0,
    reviews: 0,
    stock: stock,
    sold: 0,
    image: image || 'https://via.placeholder.com/400x400?text=Product',
    category: category,
    sizes: sizes.length ? sizes : ['S', 'M', 'L'],
    colors: colors.length ? colors : ['#1a1a1a']
  };

  products.push(newProduct);
  if (typeof saveAllProducts === 'function') {
    saveAllProducts(products);
  }

  // Lưu id sản phẩm vừa tạo để có thể mở trực tiếp ở trang chi tiết/sửa
  localStorage.setItem('selectedProductId', String(newId));

  const notification = document.createElement('div');
  notification.style.cssText = '\
    position: fixed;\
    bottom: 30px;\
    right: 30px;\
    background: linear-gradient(135deg, #10b981, #059669);\
    color: white;\
    padding: 16px 24px;\
    border-radius: 12px;\
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);\
    z-index: 10000;\
    font-weight: 600;\
    display: flex;\
    align-items: center;\
    gap: 12px;\
  ';
  notification.innerHTML = '<span style="font-size: 20px;">✓</span><span>Sản phẩm mới đã được tạo và lưu vào kho!</span>';
  document.body.appendChild(notification);
  
  setTimeout(function () {
    notification.remove();
    window.location.href = 'product-list.html';
  }, 2000);
}

// Drag and drop
var uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--accent)';
    uploadArea.style.background = 'rgba(255, 143, 61, 0.1)';
  });
  
  uploadArea.addEventListener('dragleave', function () {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
  });
  
  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    
    var file = e.dataTransfer.files[0];
    if (file && file.type && file.type.indexOf('image/') === 0) {
      var reader = new FileReader();
      reader.onload = function (ev) {
        var imgElement = document.querySelector('#previewImage img');
        if (!imgElement) {
          document.querySelector('#previewImage').innerHTML = '<img src="' + ev.target.result + '" alt="Product" style="width: 100%; height: 100%; object-fit: contain;" />';
        } else {
          imgElement.src = ev.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

// Toggle sidebar
function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

// Toggle submenu
function toggleSubmenu(element) {
  var navItem = element.parentElement;
  navItem.classList.toggle('open');
}

// Restore sidebar state on load
if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}
