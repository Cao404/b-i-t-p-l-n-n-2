var DISPUTES_KEY = 'larkon_disputes';

var disputes = [];
var disputesSearch = '';

function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.layout').classList.add('collapsed');
  });
}

function loadDisputes() {
  try {
    var raw = localStorage.getItem(DISPUTES_KEY);
    if (!raw) {
      disputes = [
        {
          id: 'D1234',
          type: 'Hàng không đúng mô tả',
          buyer: 'Nguyễn Văn A',
          seller: 'Shop ABC',
          orderId: 'ORD5678',
          amount: '450,000đ',
          status: 'pending',
          refundNote: ''
        },
        {
          id: 'D1235',
          type: 'Hoàn tiền',
          buyer: 'Lê Thị B',
          seller: 'Shop XYZ',
          orderId: 'ORD5679',
          amount: '1,250,000đ',
          status: 'processing',
          refundNote: ''
        },
        {
          id: 'D1236',
          type: 'Giao hàng chậm',
          buyer: 'Trần Văn C',
          seller: 'Shop 123',
          orderId: 'ORD5680',
          amount: '890,000đ',
          status: 'resolved',
          refundNote: ''
        }
      ];
      saveDisputes();
    } else {
      var parsed = JSON.parse(raw);
      disputes = Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) {
    console.error('Không thể đọc danh sách khiếu nại', e);
    disputes = [];
  }
}

function saveDisputes() {
  try {
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));
  } catch (e) {
    console.error('Không thể lưu danh sách khiếu nại', e);
  }
}

function getStatusLabel(status) {
  if (status === 'pending') return 'Chờ xử lý';
  if (status === 'processing') return 'Đang xử lý';
  if (status === 'resolved') return 'Đã giải quyết';
  return status || '';
}

function getStatusClass(status) {
  if (status === 'pending') return 'status-pending';
  if (status === 'processing') return 'status-processing';
  if (status === 'resolved') return 'status-resolved';
  return '';
}

function renderDisputes() {
  var tbody = document.getElementById('disputesTableBody');
  if (!tbody) return;

  var items = disputes.filter(function (d) {
    if (!disputesSearch) return true;
    var q = disputesSearch.toLowerCase();
    return (
      (d.id || '').toLowerCase().includes(q) ||
      (d.orderId || '').toLowerCase().includes(q) ||
      (d.buyer || '').toLowerCase().includes(q) ||
      (d.seller || '').toLowerCase().includes(q)
    );
  });

  tbody.innerHTML = items
    .map(function (d, index) {
      var statusLabel = getStatusLabel(d.status);
      var statusClass = getStatusClass(d.status);
      var canResolve = d.status !== 'resolved';
      var canDecideRefund = d.status === 'processing';
      return (
        '<tr>' +
        '  <td>#' + d.id + '</td>' +
        '  <td><span class="dispute-type">' + d.type + '</span></td>' +
        '  <td>' + d.buyer + '</td>' +
        '  <td>' + d.seller + '</td>' +
        '  <td>#' + d.orderId + '</td>' +
        '  <td class="price">' + d.amount + '</td>' +
        '  <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>' +
        '  <td>' +
        '    <div class="act">' +
        '      <div class="pill view" onclick="viewDispute(' + index + ')">' +
        '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="3" stroke="currentColor"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" stroke="currentColor"/></svg>' +
        '      </div>' +
        (canResolve
          ? '      <div class="pill edit" onclick="resolveDispute(' + index + ')">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/></svg>' +
            '      </div>'
          : '') +
        (canDecideRefund
          ? '      <div class="pill edit" onclick="decideRefund(' + index + ')">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" stroke-width="2"/></svg>' +
            '      </div>'
          : '') +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    })
    .join('');
}

function viewDispute(index) {
  var d = disputes[index];
  if (!d) return;

  var backdrop = document.getElementById('dispute-detail-backdrop');
  var idEl = document.getElementById('detail-dispute-id');
  var typeEl = document.getElementById('detail-type');
  var amountEl = document.getElementById('detail-amount');
  var buyerEl = document.getElementById('detail-buyer');
  var sellerEl = document.getElementById('detail-seller');
  var orderEl = document.getElementById('detail-order');
  var statusEl = document.getElementById('detail-status');
  var refundEl = document.getElementById('detail-refund-note');

  if (!backdrop || !idEl || !typeEl || !amountEl || !buyerEl || !sellerEl || !orderEl || !statusEl || !refundEl) return;

  idEl.textContent = '#' + d.id;
  typeEl.textContent = d.type;
  amountEl.textContent = d.amount;
  buyerEl.textContent = d.buyer;
  sellerEl.textContent = d.seller;
  orderEl.textContent = '#' + d.orderId;
  statusEl.textContent = getStatusLabel(d.status);
  statusEl.className = 'status-badge ' + getStatusClass(d.status);
  refundEl.textContent = d.refundNote || 'Chưa có quyết định hoàn tiền';

  backdrop.style.display = 'flex';
}

function closeDisputeDetail() {
  var backdrop = document.getElementById('dispute-detail-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
  }
}

function resolveDispute(index) {
  var d = disputes[index];
  if (!d) return;
  if (!confirm('Đánh dấu khiếu nại #' + d.id + ' là ĐÃ GIẢI QUYẾT?')) return;
  d.status = 'resolved';
  saveDisputes();
  renderDisputes();
}

function decideRefund(index) {
  var d = disputes[index];
  if (!d) return;
  var type = prompt('Chọn loại hoàn tiền:\n1 - Hoàn tiền một bên (người mua)\n2 - Hoàn tiền đa bên (người mua + người bán)');
  if (!type) return;
  if (type !== '1' && type !== '2') {
    alert('Loại không hợp lệ, vui lòng nhập 1 hoặc 2');
    return;
  }
  d.status = 'processing';
  d.refundNote = type === '1' ? 'Hoàn tiền một bên cho người mua' : 'Hoàn tiền đa bên (người mua + người bán)';
  saveDisputes();
  renderDisputes();
}

document.addEventListener('DOMContentLoaded', function () {
  loadDisputes();

  var searchInput = document.getElementById('disputesSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      disputesSearch = e.target.value || '';
      renderDisputes();
    });
  }

  var backdrop = document.getElementById('dispute-detail-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function (event) {
      if (event.target === backdrop) closeDisputeDetail();
    });
  }

  renderDisputes();

  // expose handlers cho onclick inline
  window.viewDispute = viewDispute;
  window.resolveDispute = resolveDispute;
  window.decideRefund = decideRefund;
  window.closeDisputeDetail = closeDisputeDetail;
});
