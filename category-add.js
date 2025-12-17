// Category management functions
const CATEGORY_STORAGE_KEY = 'larkon_categories';

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc danh mục', e);
    return [];
  }
}

function saveCategories(categories) {
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    return true;
  } catch (e) {
    console.error('Không thể lưu danh mục', e);
    return false;
  }
}

// Update preview when user types - make it global
window.updatePreview = function() {
  const title = document.getElementById('categoryTitle')?.value || '';
  const createdBy = document.getElementById('createdBy')?.value || '';
  const stock = document.getElementById('stock')?.value || '';
  const tagID = document.getElementById('tagID')?.value || '';

  // Update preview title
  const previewTitle = document.querySelector('.preview-title');
  if (previewTitle) {
    previewTitle.textContent = title || 'Fashion Men, Women & Kid\'s';
  }

  // Update preview info
  const previewCreatedBy = document.getElementById('previewCreatedBy');
  if (previewCreatedBy) {
    previewCreatedBy.textContent = createdBy || '-';
  }

  const previewStock = document.getElementById('previewStock');
  if (previewStock) {
    previewStock.textContent = stock || '-';
  }

  const previewID = document.getElementById('previewID');
  if (previewID) {
    previewID.textContent = tagID || '-';
  }
};

// Create new category - make it global
window.createCategory = function(e) {
  // Prevent default form submission if called from form
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const title = document.getElementById('categoryTitle')?.value.trim();
  const createdBy = document.getElementById('createdBy')?.value;
  const stock = document.getElementById('stock')?.value.trim();
  const tagID = document.getElementById('tagID')?.value.trim();
  const description = document.getElementById('description')?.value.trim();

  // Validation
  if (!title) {
    alert('Vui lòng nhập tên danh mục!');
    const titleInput = document.getElementById('categoryTitle');
    if (titleInput) {
      titleInput.focus();
    }
    return false;
  }

  try {
    // Load existing categories
    const categories = loadCategories();

    // Generate new ID
    const newId = categories.length > 0 
      ? Math.max(...categories.map(c => c.id || 0)) + 1 
      : 1;

    // Create category object
    const newCategory = {
      id: newId,
      name: title,
      parentId: null, // Can be extended later for subcategories
      productCount: parseInt(stock) || 0,
      createdBy: createdBy || 'Quản trị',
      tagID: tagID || '',
      description: description || '',
      image: document.querySelector('#previewImage img')?.src || '',
      createdAt: Date.now()
    };

    // Add to categories
    categories.push(newCategory);

    // Save to localStorage
    if (saveCategories(categories)) {
      alert('Tạo danh mục thành công!');
      // Redirect to category list
      setTimeout(() => {
        window.location.href = 'category-list.html';
      }, 100);
      return true;
    } else {
      alert('Có lỗi xảy ra khi lưu danh mục!');
      return false;
    }
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
    alert('Có lỗi xảy ra: ' + error.message);
    return false;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add event listeners to form inputs for preview update
  const inputs = ['categoryTitle', 'createdBy', 'stock', 'tagID', 'description'];
  inputs.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', updatePreview);
      element.addEventListener('change', updatePreview);
    }
  });

  // Connect Create Category buttons - use onclick attribute approach
  // The buttons already have onclick="createCategory()" so we just need to make sure the function is available globally

  // Initial preview update
  updatePreview();
});

