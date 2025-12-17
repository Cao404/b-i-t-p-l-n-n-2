function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

var CATEGORY_STORAGE_KEY = 'larkon_categories';
var ATTRIBUTE_STORAGE_KEY = 'larkon_attribute_groups';

var categories = [];
var attributeGroups = [];
var editingCategoryId = null;
var editingAttributeId = null;

function loadCategories() {
  try {
    var raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) {
      categories = [];
      return;
    }
    var parsed = JSON.parse(raw);
    categories = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc danh mục', e);
    categories = [];
  }
}

function saveCategories() {
  try {
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Không thể lưu danh mục', e);
  }
}

function loadAttributeGroups() {
  try {
    var raw = localStorage.getItem(ATTRIBUTE_STORAGE_KEY);
    if (!raw) {
      attributeGroups = [];
      return;
    }
    var parsed = JSON.parse(raw);
    attributeGroups = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc nhóm thuộc tính', e);
    attributeGroups = [];
  }
}

function saveAttributeGroups() {
  try {
    localStorage.setItem(ATTRIBUTE_STORAGE_KEY, JSON.stringify(attributeGroups));
  } catch (e) {
    console.error('Không thể lưu nhóm thuộc tính', e);
  }
}

function buildCategoryTree(parentId) {
  return categories
    .filter(function (c) { return (c.parentId || null) === (parentId || null); })
    .sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); });
}

function renderCategoryTree() {
  var container = document.getElementById('category-tree');
  if (!container) return;

  if (!categories || categories.length === 0) {
    container.innerHTML = '<div class="empty-state">Chưa có danh mục nào. Bấm "Thêm Danh Mục" để tạo danh mục gốc.</div>';
    return;
  }

  function renderNodes(parentId) {
    var nodes = buildCategoryTree(parentId);
    if (!nodes.length) return '';

    return nodes
      .map(function (c) {
        var children = buildCategoryTree(c.id);
        var hasChildren = children.length > 0;
        var productText = (c.productCount || 0) + ' sản phẩm';

        var item = [
          '<div class="tree-item ' + (hasChildren ? 'has-children' : '') + '" data-id="' + c.id + '">',
          '  <span>' + (c.name || '') + '</span>',
          '  <span style="margin-left:auto;color:var(--muted);font-size:12px">' + productText + '</span>',
          '  <div class="inline-actions">',
          '    <button class="inline-action-btn" type="button" onclick="event.stopPropagation(); openCategoryModal(' + c.id + ')">Sửa</button>',
          '    <button class="inline-action-btn" type="button" onclick="event.stopPropagation(); deleteCategory(' + c.id + ')">Xóa</button>',
          '  </div>',
          '</div>'
        ].join('');

        var childrenHtml = '';
        if (hasChildren) {
          childrenHtml = '<div class="tree-children">' + renderNodes(c.id) + '</div>';
        }
        return item + childrenHtml;
      })
      .join('');
  }

  container.innerHTML = renderNodes(null);

  container.querySelectorAll('.tree-item.has-children').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (e.target.closest('.inline-actions')) return;
      el.classList.toggle('expanded');
    });
  });
}

function renderAttributeGroups() {
  var container = document.getElementById('attribute-groups');
  if (!container) return;

  if (!attributeGroups || attributeGroups.length === 0) {
    container.innerHTML = '<div class="empty-state">Chưa có nhóm thuộc tính nào. Bấm "Thêm Nhóm Thuộc Tính" để tạo mới.</div>';
    return;
  }

  container.innerHTML = attributeGroups
    .sort(function (a, b) { return (a.name || '').localeCompare(b.name || ''); })
    .map(function (g) {
      var appliesText = g.appliesToText || 'Tất cả';
      var values = Array.isArray(g.values) ? g.values : [];
      var valuesHtml = values
        .map(function (v, index) {
          return (
            '<span class="attribute-value">' +
            v +
            ' <button type="button" class="inline-action-btn" onclick="removeAttributeValue(' + g.id + ',' + index + ');event.stopPropagation();">×</button></span>'
          );
        })
        .join('');

      return [
        '<div class="attribute-group">',
        '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">',
        '    <div>',
        '      <div style="font-weight:700;font-size:16px">' + (g.name || '') + '</div>',
        '      <div style="color:var(--muted);font-size:13px;margin-top:4px">Áp dụng cho: ' + appliesText + '</div>',
        '    </div>',
        '    <div class="act" style="display:flex;gap:6px">',
        '      <div class="pill edit" title="Sửa" onclick="openAttributeModal(' + g.id + ')">',
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg>',
        '      </div>',
        '      <div class="pill del" title="Xóa" onclick="deleteAttributeGroup(' + g.id + ')">',
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" stroke="currentColor"/></svg>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="attribute-values">' + (valuesHtml || '<span class="attribute-value" style="color:var(--muted)">Chưa có giá trị</span>') + '</div>',
        '</div>'
      ].join('');
    })
    .join('');
}

function openCategoryModal(id) {
  var backdrop = document.getElementById('category-modal-backdrop');
  var title = document.getElementById('category-modal-title');
  var nameInput = document.getElementById('category-name');
  var parentSelect = document.getElementById('category-parent');
  var countInput = document.getElementById('category-product-count');
  if (!backdrop || !title || !nameInput || !parentSelect) return;

  parentSelect.innerHTML = '<option value="">(Không có)</option>' +
    categories
      .filter(function (c) { return !id || c.id !== id; })
      .map(function (c) { return '<option value="' + c.id + '">' + (c.name || '') + '</option>'; })
      .join('');

  if (id) {
    var cat = categories.find(function (c) { return c.id === id; });
    if (!cat) return;
    editingCategoryId = id;
    title.textContent = 'Chỉnh sửa danh mục';
    nameInput.value = cat.name || '';
    parentSelect.value = cat.parentId || '';
    countInput.value = cat.productCount || '';
  } else {
    editingCategoryId = null;
    title.textContent = 'Thêm danh mục';
    nameInput.value = '';
    parentSelect.value = '';
    countInput.value = '';
  }

  backdrop.style.display = 'flex';
}

function closeCategoryModal() {
  var backdrop = document.getElementById('category-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  editingCategoryId = null;
}

function openAttributeModal(id) {
  var backdrop = document.getElementById('attribute-modal-backdrop');
  var title = document.getElementById('attribute-modal-title');
  var nameInput = document.getElementById('attr-name');
  var appliesInput = document.getElementById('attr-applies');
  var valuesInput = document.getElementById('attr-values');
  if (!backdrop || !title || !nameInput || !appliesInput || !valuesInput) return;

  if (id) {
    var g = attributeGroups.find(function (ag) { return ag.id === id; });
    if (!g) return;
    editingAttributeId = id;
    title.textContent = 'Chỉnh sửa nhóm thuộc tính';
    nameInput.value = g.name || '';
    appliesInput.value = g.appliesToText || '';
    valuesInput.value = (Array.isArray(g.values) ? g.values : []).join(', ');
  } else {
    editingAttributeId = null;
    title.textContent = 'Thêm nhóm thuộc tính';
    nameInput.value = '';
    appliesInput.value = '';
    valuesInput.value = '';
  }

  backdrop.style.display = 'flex';
}

function closeAttributeModal() {
  var backdrop = document.getElementById('attribute-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  editingAttributeId = null;
}

function deleteCategory(id) {
  if (!confirm('Xóa danh mục này? Các danh mục con cũng sẽ bị xóa.')) return;
  var collectIds = [id];
  function collectChildren(parentId) {
    categories
      .filter(function (c) { return c.parentId === parentId; })
      .forEach(function (c) {
        collectIds.push(c.id);
        collectChildren(c.id);
      });
  }
  collectChildren(id);

  categories = categories.filter(function (c) { return collectIds.indexOf(c.id) === -1; });
  saveCategories();
  renderCategoryTree();
}

function deleteAttributeGroup(id) {
  if (!confirm('Xóa nhóm thuộc tính này?')) return;
  attributeGroups = attributeGroups.filter(function (g) { return g.id !== id; });
  saveAttributeGroups();
  renderAttributeGroups();
}

function removeAttributeValue(groupId, valueIndex) {
  var g = attributeGroups.find(function (ag) { return ag.id === groupId; });
  if (!g || !Array.isArray(g.values)) return;
  g.values.splice(valueIndex, 1);
  saveAttributeGroups();
  renderAttributeGroups();
}

document.addEventListener('DOMContentLoaded', function () {
  loadCategories();
  loadAttributeGroups();

  if (!categories || categories.length === 0) {
    var now = Date.now();
    categories = [
      { id: 1, name: 'Thời Trang', parentId: null, productCount: 1234, createdAt: now },
      { id: 2, name: 'Thời Trang Nam', parentId: 1, productCount: 456, createdAt: now + 1 },
      { id: 3, name: 'Thời Trang Nữ', parentId: 1, productCount: 678, createdAt: now + 2 },
      { id: 4, name: 'Điện Tử', parentId: null, productCount: 890, createdAt: now + 3 },
      { id: 5, name: 'Điện Thoại', parentId: 4, productCount: 234, createdAt: now + 4 },
      { id: 6, name: 'Laptop', parentId: 4, productCount: 456, createdAt: now + 5 },
      { id: 7, name: 'Nội Thất', parentId: null, productCount: 567, createdAt: now + 6 }
    ];
    saveCategories();
  }

  if (!attributeGroups || attributeGroups.length === 0) {
    attributeGroups = [
      {
        id: 1,
        name: 'Kích Thước (Size)',
        appliesToText: 'Thời Trang',
        values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        createdAt: Date.now()
      },
      {
        id: 2,
        name: 'Màu Sắc (Color)',
        appliesToText: 'Tất cả',
        values: ['Đỏ', 'Xanh dương', 'Xanh lá', 'Vàng', 'Đen', 'Trắng'],
        createdAt: Date.now() + 1
      },
      {
        id: 3,
        name: 'Chất Liệu (Material)',
        appliesToText: 'Thời Trang, Nội Thất',
        values: ['Cotton', 'Polyester', 'Silk', 'Leather', 'Wood'],
        createdAt: Date.now() + 2
      }
    ];
    saveAttributeGroups();
  }

  renderCategoryTree();
  renderAttributeGroups();

  var categoryForm = document.getElementById('category-form');
  if (categoryForm) {
    categoryForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('category-name').value.trim();
      var parentId = document.getElementById('category-parent').value || null;
      var productCount = Number(document.getElementById('category-product-count').value || 0);
      if (!name) {
        alert('Vui lòng nhập tên danh mục');
        return;
      }
      if (editingCategoryId) {
        var index = categories.findIndex(function (c) { return c.id === editingCategoryId; });
        if (index !== -1) {
          categories[index] = Object.assign({}, categories[index], {
            name: name,
            parentId: parentId ? Number(parentId) : null,
            productCount: productCount
          });
        }
      } else {
        var newId = categories.length ? Math.max.apply(null, categories.map(function (c) { return c.id; })) + 1 : 1;
        categories.push({
          id: newId,
          name: name,
          parentId: parentId ? Number(parentId) : null,
          productCount: productCount,
          createdAt: Date.now()
        });
      }
      saveCategories();
      renderCategoryTree();
      closeCategoryModal();
    });
  }

  var attrForm = document.getElementById('attribute-form');
  if (attrForm) {
    attrForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var name = document.getElementById('attr-name').value.trim();
      var applies = document.getElementById('attr-applies').value.trim();
      var valuesRaw = document.getElementById('attr-values').value.trim();
      if (!name) {
        alert('Vui lòng nhập tên nhóm thuộc tính');
        return;
      }
      var values = valuesRaw
        ? valuesRaw.split(',').map(function (v) { return v.trim(); }).filter(Boolean)
        : [];

      if (editingAttributeId) {
        var index = attributeGroups.findIndex(function (g) { return g.id === editingAttributeId; });
        if (index !== -1) {
          attributeGroups[index] = Object.assign({}, attributeGroups[index], {
            name: name,
            appliesToText: applies || 'Tất cả',
            values: values
          });
        }
      } else {
        var newIdAttr = attributeGroups.length ? Math.max.apply(null, attributeGroups.map(function (g) { return g.id; })) + 1 : 1;
        attributeGroups.push({
          id: newIdAttr,
          name: name,
          appliesToText: applies || 'Tất cả',
          values: values,
          createdAt: Date.now()
        });
      }

      saveAttributeGroups();
      renderAttributeGroups();
      closeAttributeModal();
    });
  }

  var catBackdrop = document.getElementById('category-modal-backdrop');
  if (catBackdrop) {
    catBackdrop.addEventListener('click', function (event) {
      if (event.target === catBackdrop) closeCategoryModal();
    });
  }

  var attrBackdrop = document.getElementById('attribute-modal-backdrop');
  if (attrBackdrop) {
    attrBackdrop.addEventListener('click', function (event) {
      if (event.target === attrBackdrop) closeAttributeModal();
    });
  }
});

// Các hàm đơn giản phục vụ cho HTML hiện tại (onclick trong admin-category-attributes.html)
// Nếu sau này bạn muốn dùng modal/phức tạp hơn có thể gọi lại openCategoryModal / openAttributeModal.

function toggleTree(element) {
  // Toggle expand/collapse cho node cây danh mục tĩnh
  if (!element) return;
  element.classList.toggle('expanded');
}

function addCategory() {
  // Sau này có thể gọi openCategoryModal(null) nếu bạn thêm modal vào HTML
  if (typeof openCategoryModal === 'function') {
    openCategoryModal(null);
  }
}

function editCategory(id) {
  if (typeof openCategoryModal === 'function') {
    openCategoryModal(id);
  }
}

function addAttributeGroup() {
  if (typeof openAttributeModal === 'function') {
    openAttributeModal(null);
  }
}

function editAttributeGroup(id) {
  if (typeof openAttributeModal === 'function') {
    openAttributeModal(id);
  }
}
