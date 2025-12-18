// Category list management
var CATEGORY_STORAGE_KEY = 'shopvn_categories';
var CATEGORY_ITEMS_PER_PAGE = 8;
var categoryCurrentPage = 1;
var allCategories = [];

function loadCategories() {
  try {
    var raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc danh mục', e);
    return [];
  }
}

function getParentCategoryName(categories, parentId) {
  if (!parentId) return null;
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === parentId) {
      return categories[i].name;
    }
  }
  return null;
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  var date = new Date(timestamp);
  var day = String(date.getDate()).padStart(2, '0');
  var month = String(date.getMonth() + 1).padStart(2, '0');
  var year = date.getFullYear();
  return day + '/' + month + '/' + year;
}

// Calculate product count from actual product data (same as admin-category-attributes.js)
function calculateProductCountForCategory(categoryName) {
  try {
    var productsRaw = localStorage.getItem('shopvn_products');
    if (!productsRaw) return 0;
    
    var products = JSON.parse(productsRaw);
    if (!Array.isArray(products)) return 0;
    
    // Category mapping: Vietnamese name -> Product category code
    var categoryMapping = {
      'Thời Trang': 'Fashion',
      'Thời Trang Nam': 'Fashion',
      'Thời Trang Nữ': 'Fashion',
      'Điện Tử': 'Electronics',
      'Điện tử': 'Electronics',
      'Điện Thoại': 'Electronics',
      'Điện thoại': 'Electronics',
      'Laptop': 'Electronics',
      'laptop': 'Electronics',
      'Nội Thất': 'Furniture',
      'Nội thất': 'Furniture',
      'Fashion': 'Fashion',
      'Electronics': 'Electronics',
      'Hand Bag': 'Hand Bag',
      'Túi xách': 'Hand Bag',
      'Cap': 'Cap',
      'Mũ & Kính': 'Cap',
      'Mũ & kính': 'Cap',
      'Shoes': 'Shoes',
      'Giày dép': 'Shoes',
      'Wallet': 'Wallet',
      'Ví': 'Wallet'
    };
    
    // Map category name to product category code
    var categoryCode = categoryMapping[categoryName] || categoryName;
    
    // Also try direct match (in case category name is already a code)
    if (!categoryMapping[categoryName]) {
      categoryCode = categoryName;
    }
    
    var count = 0;
    for (var i = 0; i < products.length; i++) {
      if (products[i].category === categoryCode) {
        count++;
      }
    }
    
    return count;
  } catch (e) {
    console.error('Error calculating product count:', e);
    return 0;
  }
}

function renderCategories() {
  // Clean up duplicates first
  cleanupDuplicateCategories();
  
  allCategories = loadCategories();
  var tbody = document.getElementById('categoryTableBody');
  if (!tbody) {
    tbody = document.querySelector('.table tbody');
  }
  if (!tbody) return;

  // If no categories, show default data
  if (allCategories.length === 0) {
    // Keep the default HTML rows
    return;
  }

  // Clear existing rows (except header)
  tbody.innerHTML = '';

  var startIndex = (categoryCurrentPage - 1) * CATEGORY_ITEMS_PER_PAGE;
  var endIndex = Math.min(startIndex + CATEGORY_ITEMS_PER_PAGE, allCategories.length);

  // Render each category in current page
  for (var i = startIndex; i < endIndex; i++) {
    var cat = allCategories[i];
    var parentName = getParentCategoryName(allCategories, cat.parentId);
    var categoryType = cat.parentId ? 'Danh mục con' : 'Danh mục chính';
    var parentDisplay = parentName ? parentName : '<span style="color:var(--muted)">—</span>';
    
    // Calculate actual product count from product data
    var actualCount = calculateProductCountForCategory(cat.name);
    // Use actual count if available, otherwise use stored count
    var productCount = actualCount > 0 ? actualCount : (cat.productCount || 0);
    
    // Update stored count if different
    if (actualCount > 0 && cat.productCount !== actualCount) {
      cat.productCount = actualCount;
    }
    
    // Get image - use default if not available
    var imageUrl = cat.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100';
    
    var row = document.createElement('tr');
    row.innerHTML = [
      '<td class="chk"><input type="checkbox" /></td>',
      '<td>',
      '  <div class="product">',
      '    <div class="thumb">',
      '      <img src="' + imageUrl + '" alt="" />',
      '    </div>',
      '    <div>',
      '      <div class="name">' + (cat.name || '') + '</div>',
      '      <div class="sub">' + categoryType + '</div>',
      '    </div>',
      '  </div>',
      '</td>',
      '<td><div class="sub">' + parentDisplay + '</div></td>',
      '<td><div class="tag" style="background:var(--accent);color:#2b1606;font-weight:700">' + productCount + '</div></td>',
      '<td>' + (cat.createdBy || 'Quản trị') + '</td>',
      '<td><div class="sub">' + formatDate(cat.createdAt) + '</div></td>',
      '<td>',
      '  <div class="act">',
      '    <div class="pill view" title="Xem"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/></svg></div>',
      '    <div class="pill edit" title="Sửa" onclick="window.location.href=\'category-edit.html\'"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg></div>',
      '    <div class="pill del" title="Xóa" onclick="deleteCategory(' + cat.id + ')"><svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/></svg></div>',
      '  </div>',
      '</td>'
    ].join('');

    tbody.appendChild(row);
  }

  // Save updated counts
  if (allCategories.some(function(c) { return c.productCount !== (calculateProductCountForCategory(c.name) || 0); })) {
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(allCategories));
    } catch (e) {
      console.error('Error saving updated counts:', e);
    }
  }
  
  // Update pagination info
  updatePaginationInfo(allCategories.length);
  renderCategoryPagination();
}

function updatePaginationInfo(total) {
  var pageInfo = document.getElementById('categoryPageInfo');
  if (pageInfo) {
    if (total === 0) {
      pageInfo.textContent = 'Không có kết quả';
      return;
    }
    var start = (categoryCurrentPage - 1) * CATEGORY_ITEMS_PER_PAGE + 1;
    var end = Math.min(categoryCurrentPage * CATEGORY_ITEMS_PER_PAGE, total);
    pageInfo.textContent = 'Hiển thị ' + start + '-' + end + ' trong ' + total + ' kết quả';
  }
}

function renderCategoryPagination() {
  var pagination = document.getElementById('categoryPagination');
  if (!pagination) return;

  var total = allCategories.length;
  var totalPages = Math.ceil(total / CATEGORY_ITEMS_PER_PAGE) || 1;

  var html = '';

  html += '<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--muted);cursor:pointer" ' +
          (categoryCurrentPage === 1 ? 'disabled' : 'onclick="changeCategoryPage(' + (categoryCurrentPage - 1) + ')"') +
          '>Trước đó</button>';

  for (var i = 1; i <= totalPages; i++) {
    if (i === categoryCurrentPage) {
      html += '<button style="padding:6px 12px;background:var(--accent);border:1px solid var(--accent);border-radius:6px;color:#2b1606;font-weight:700;cursor:pointer">' + i + '</button>';
    } else {
      html += '<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" onclick="changeCategoryPage(' + i + ')">' + i + '</button>';
    }
  }

  html += '<button style="padding:6px 12px;background:var(--panel);border:1px solid var(--line);border-radius:6px;color:var(--text);cursor:pointer" ' +
          (categoryCurrentPage === totalPages ? 'disabled' : 'onclick="changeCategoryPage(' + (categoryCurrentPage + 1) + ')"') +
          '>Tiếp theo</button>';

  pagination.innerHTML = html;
}

function changeCategoryPage(page) {
  var total = allCategories.length;
  var totalPages = Math.ceil(total / CATEGORY_ITEMS_PER_PAGE) || 1;
  if (page < 1 || page > totalPages) return;
  categoryCurrentPage = page;
  renderCategories();
}

function deleteCategory(id) {
  if (!confirm('Bạn có chắc muốn xóa danh mục này?')) {
    return;
  }

  var categories = loadCategories();
  var index = -1;
  for (var i = 0; i < categories.length; i++) {
    if (categories[i].id === id) {
      index = i;
      break;
    }
  }

  if (index !== -1) {
    categories.splice(index, 1);
    try {
      localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
      alert('Xóa danh mục thành công!');
      renderCategories();
    } catch (e) {
      console.error('Lỗi khi xóa danh mục:', e);
      alert('Có lỗi xảy ra khi xóa danh mục!');
    }
  }
}

// Clean up duplicate categories and ensure data consistency
function cleanupDuplicateCategories() {
  var categories = loadCategories();
  var cleaned = [];
  var seen = {}; // Track seen categories by name+parentId
  
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    var key = (cat.name || '').toLowerCase() + '_' + (cat.parentId || 'null');
    
    // Skip if we've seen this exact combination before
    if (seen[key]) {
      console.log('Xóa danh mục trùng lặp:', cat.name, 'parentId:', cat.parentId);
      continue;
    }
    
    seen[key] = true;
    cleaned.push(cat);
  }
  
  if (cleaned.length !== categories.length) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(cleaned));
    console.log('Đã làm sạch dữ liệu: ' + (categories.length - cleaned.length) + ' danh mục trùng lặp đã bị xóa');
    return true;
  }
  
  return false;
}

// Calculate total product count for a category including all subcategories
function calculateTotalProductCount(category, categories) {
  if (!category) return 0;
  
  // Count products in this category
  var count = calculateProductCountForCategory(category.name);
  
  // Find all subcategories
  var subcategories = categories.filter(function(c) {
    return c.parentId === category.id;
  });
  
  // Add counts from subcategories recursively
  for (var i = 0; i < subcategories.length; i++) {
    count += calculateTotalProductCount(subcategories[i], categories);
  }
  
  return count;
}

// Update category cards from actual category data in localStorage
function updateCategoryCards() {
  var categories = loadCategories();
  
  // Clean up duplicates first
  cleanupDuplicateCategories();
  categories = loadCategories(); // Reload after cleanup
  
  // Filter only main categories (no parent)
  var mainCategories = categories.filter(function(cat) {
    return !cat.parentId;
  });
  
  // Calculate product count for each category (including subcategories)
  var categoryList = [];
  for (var i = 0; i < mainCategories.length; i++) {
    var cat = mainCategories[i];
    // Calculate total count including subcategories
    var totalCount = calculateTotalProductCount(cat, categories);
    // Fallback to stored count if no products found
    var count = totalCount > 0 ? totalCount : (cat.productCount || 0);
    
    categoryList.push({
      name: cat.name,
      count: count,
      category: cat
    });
  }
  
  // Sort by count descending
  categoryList.sort(function(a, b) {
    return b.count - a.count;
  });
  
  // Update first 4 cards
  var cards = document.querySelectorAll('.category-card');
  for (var i = 0; i < Math.min(4, categoryList.length); i++) {
    var card = cards[i];
    if (card) {
      var nameEl = card.querySelector('.category-name');
      var countEl = card.querySelector('.category-count');
      if (nameEl) {
        nameEl.textContent = categoryList[i].name;
      }
      if (countEl) {
        countEl.textContent = categoryList[i].count.toLocaleString('vi-VN') + ' sản phẩm';
      }
      // Show the card
      card.style.display = '';
    }
  }
  
  // Hide remaining cards if there are fewer categories
  for (var i = categoryList.length; i < cards.length; i++) {
    if (cards[i]) {
      cards[i].style.display = 'none';
    }
  }
}

// Modal functions for add/edit category
var editingCategoryId = null;

function openCategoryModal(id) {
  var backdrop = document.getElementById('category-modal-backdrop');
  var title = document.getElementById('category-modal-title');
  var nameInput = document.getElementById('category-name');
  var parentSelect = document.getElementById('category-parent');
  var countInput = document.getElementById('category-product-count');
  var createdBySelect = document.getElementById('category-created-by');
  
  if (!backdrop || !title || !nameInput || !parentSelect) return;
  
  // Load categories for parent dropdown
  var categories = loadCategories();
  parentSelect.innerHTML = '<option value="">(Không có - Danh mục chính)</option>';
  for (var i = 0; i < categories.length; i++) {
    var cat = categories[i];
    // Don't show current category as parent option
    if (id && cat.id === id) continue;
    var option = document.createElement('option');
    option.value = cat.id;
    option.textContent = cat.name || 'Danh mục #' + cat.id;
    parentSelect.appendChild(option);
  }
  
  if (id) {
    // Edit mode
    var cat = categories.find(function(c) { return c.id === id; });
    if (!cat) return;
    editingCategoryId = id;
    title.textContent = 'Chỉnh sửa danh mục';
    nameInput.value = cat.name || '';
    parentSelect.value = cat.parentId || '';
    countInput.value = cat.productCount || '';
    if (createdBySelect) {
      createdBySelect.value = cat.createdBy || 'Quản trị';
    }
  } else {
    // Add mode
    editingCategoryId = null;
    title.textContent = 'Thêm danh mục';
    nameInput.value = '';
    parentSelect.value = '';
    countInput.value = '';
    if (createdBySelect) {
      createdBySelect.value = 'Quản trị';
    }
  }
  
  backdrop.style.display = 'flex';
}

function closeCategoryModal() {
  var backdrop = document.getElementById('category-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  editingCategoryId = null;
}

// Save category (add or edit)
function saveCategory(name, parentId, productCount, createdBy) {
  var categories = loadCategories();
  
  if (editingCategoryId) {
    // Edit existing
    var index = categories.findIndex(function(c) { return c.id === editingCategoryId; });
    if (index !== -1) {
      categories[index] = Object.assign({}, categories[index], {
        name: name,
        parentId: parentId ? Number(parentId) : null,
        productCount: Number(productCount) || 0,
        createdBy: createdBy || 'Quản trị'
      });
    }
  } else {
    // Add new
    var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
    categories.push({
      id: newId,
      name: name,
      parentId: parentId ? Number(parentId) : null,
      productCount: Number(productCount) || 0,
      createdBy: createdBy || 'Quản trị',
      createdAt: Date.now()
    });
  }
  
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    return true;
  } catch (e) {
    console.error('Error saving category:', e);
    return false;
  }
}

// Initialize default categories: Linh kiện > Laptop > (RAM, CPU, VGA, Main)
function initializeLaptopSubcategories() {
  var categories = loadCategories();
  var added = false;
  
  // Step 1: Find or create "Linh kiện" (main category)
  var linhKienCategory = categories.find(function(c) {
    return c.name && (c.name.toLowerCase() === 'linh kiện' || c.name.toLowerCase() === 'linh kien');
  });
  
  if (!linhKienCategory) {
    var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
    linhKienCategory = {
      id: newId,
      name: 'Linh kiện',
      parentId: null,
      productCount: 0,
      createdBy: 'Quản trị',
      createdAt: Date.now()
    };
    categories.push(linhKienCategory);
    added = true;
    console.log('Đã tạo danh mục chính: Linh kiện');
  }
  
  // Step 2: Find or create "Laptop" as subcategory of "Linh kiện"
  var laptopCategory = categories.find(function(c) {
    return c.name && c.name.toLowerCase() === 'laptop' && c.parentId === linhKienCategory.id;
  });
  
  if (!laptopCategory) {
    // Check if laptop exists with different parent, update it
    var existingLaptop = categories.find(function(c) {
      return c.name && c.name.toLowerCase() === 'laptop';
    });
    
    if (existingLaptop) {
      // Update existing laptop to be child of Linh kiện
      existingLaptop.parentId = linhKienCategory.id;
      laptopCategory = existingLaptop;
      added = true;
      console.log('Đã cập nhật Laptop thành con của Linh kiện');
    } else {
      // Create new laptop category
      var newId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
      laptopCategory = {
        id: newId,
        name: 'Laptop',
        parentId: linhKienCategory.id,
        productCount: 0,
        createdBy: 'Quản trị',
        createdAt: Date.now()
      };
      categories.push(laptopCategory);
      added = true;
      console.log('Đã tạo danh mục con: Laptop (con của Linh kiện)');
    }
  }
  
  // Step 3: Create subcategories of Laptop: RAM, CPU, VGA, Main
  var subcategories = [
    { name: 'RAM', parentId: laptopCategory.id },
    { name: 'CPU', parentId: laptopCategory.id },
    { name: 'VGA', parentId: laptopCategory.id },
    { name: 'Main', parentId: laptopCategory.id }
  ];
  
  for (var i = 0; i < subcategories.length; i++) {
    var sub = subcategories[i];
    var exists = categories.some(function(c) {
      return c.name && c.name.toLowerCase() === sub.name.toLowerCase() && c.parentId === sub.parentId;
    });
    
    if (!exists) {
      var newSubId = categories.length ? Math.max.apply(null, categories.map(function(c) { return c.id; })) + 1 : 1;
      categories.push({
        id: newSubId,
        name: sub.name,
        parentId: sub.parentId,
        productCount: 0,
        createdBy: 'Quản trị',
        createdAt: Date.now()
      });
      added = true;
      console.log('Đã tạo danh mục con: ' + sub.name + ' (con của Laptop)');
    }
  }
  
  if (added) {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    console.log('Hoàn tất: Đã tạo cấu trúc danh mục Linh kiện > Laptop > (RAM, CPU, VGA, Main)');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Category List JS loaded');
  
  // Clean up duplicates first
  cleanupDuplicateCategories();
  
  // Initialize laptop subcategories
  initializeLaptopSubcategories();
  
  // Clean up again after initialization
  cleanupDuplicateCategories();
  
  renderCategories();
  updateCategoryCards();
  
  // Setup category form
  var categoryForm = document.getElementById('category-form');
  if (categoryForm) {
    categoryForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var name = document.getElementById('category-name').value.trim();
      var parentId = document.getElementById('category-parent').value || null;
      var productCount = document.getElementById('category-product-count').value || 0;
      var createdBy = document.getElementById('category-created-by') ? document.getElementById('category-created-by').value : 'Quản trị';
      
      if (!name) {
        alert('Vui lòng nhập tên danh mục!');
        return;
      }
      
      // Calculate actual product count
      var actualCount = calculateProductCountForCategory(name);
      if (actualCount > 0) {
        productCount = actualCount;
      }
      
      if (saveCategory(name, parentId, productCount, createdBy)) {
        closeCategoryModal();
        renderCategories();
        updateCategoryCards();
      } else {
        alert('Có lỗi xảy ra khi lưu danh mục!');
      }
    });
  }
  
  // Close modal when clicking backdrop
  var backdrop = document.getElementById('category-modal-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function(event) {
      if (event.target === backdrop) {
        closeCategoryModal();
      }
    });
  }
});

