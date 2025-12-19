function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.querySelector('.layout').classList.add('collapsed');
}

function toggleSubmenu(element) {
  const navItem = element.parentElement;
  navItem.classList.toggle('open');
}

function filterSellers(status) {
  document.querySelectorAll('.filter-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  // Filter logic here
  console.log('Filter by:', status);
}

function approveSeller(id) {
  if (confirm('Bạn có chắc muốn duyệt người bán này?')) {
    alert('Đã duyệt người bán thành công!');
    // Update status logic here
  }
}

function rejectSeller(id) {
  const reason = prompt('Nhập lý do từ chối:');
  if (reason) {
    alert('Đã từ chối người bán. Lý do: ' + reason);
    // Update status logic here
  }
}

function suspendSeller(id) {
  const days = prompt('Nhập số ngày tạm ngưng (hoặc để trống cho vô thời hạn):');
  if (confirm('Bạn có chắc muốn tạm ngưng người bán này?')) {
    alert('Đã tạm ngưng người bán ' + (days ? days + ' ngày' : 'vô thời hạn'));
    // Update status logic here
  }
}

function lockSeller(id) {
  if (confirm('Bạn có chắc muốn khóa tài khoản người bán này? Hành động này không thể hoàn tác.')) {
    alert('Đã khóa tài khoản người bán!');
    // Update status logic here
  }
}

// Search
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', function(e) {
      const query = e.target.value.toLowerCase();
      // Search logic here
      console.log('Search:', query);
    });
  }
});

