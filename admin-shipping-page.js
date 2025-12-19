var SHIPPING_PARTNERS_KEY = 'shopvn_shipping_partners';

var shippingPartners = [];
var currentSearch = '';

function toggleSidebar() {
  document.querySelector('.layout').classList.toggle('collapsed');
  localStorage.setItem('sidebarCollapsed', document.querySelector('.layout').classList.contains('collapsed'));
}

if (localStorage.getItem('sidebarCollapsed') === 'true') {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.layout').classList.add('collapsed');
  });
}

function loadShippingPartners() {
  try {
    var raw = localStorage.getItem(SHIPPING_PARTNERS_KEY);
    if (!raw) {
      shippingPartners = [
        {
          id: 1,
          name: 'GHN - Giao Hàng Nhanh',
          webhook: 'https://api.ghn.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 1-3 ngày làm việc',
          successRate: 98.5,
          status: 'active',
          fees: [
            { id: 1, region: 'Nội thành', baseFee: '25,000đ', extraFee: '5,000đ' },
            { id: 2, region: 'Liên tỉnh', baseFee: '35,000đ', extraFee: '8,000đ' }
          ]
        },
        {
          id: 2,
          name: 'GHTK - Giao Hàng Tiết Kiệm',
          webhook: 'https://api.ghtk.vn/webhook/status',
          apiKeyMasked: '••••••••••••••••',
          sla: 'Thời gian giao hàng: 2-5 ngày làm việc',
          successRate: 97.2,
          status: 'active',
          fees: []
        }
      ];
      saveShippingPartners();
      return;
    }
    var parsed = JSON.parse(raw);
    shippingPartners = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Không thể đọc danh sách đối tác vận chuyển', e);
    shippingPartners = [];
  }
}

function saveShippingPartners() {
  try {
    localStorage.setItem(SHIPPING_PARTNERS_KEY, JSON.stringify(shippingPartners));
  } catch (e) {
    console.error('Không thể lưu danh sách đối tác vận chuyển', e);
  }
}

function renderShippingPartners() {
  var container = document.getElementById('shipping-partners-container');
  if (!container) return;

  var items = shippingPartners.filter(function (p) {
    if (!currentSearch) return true;
    var q = currentSearch.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.webhook || '').toLowerCase().includes(q)
    );
  });

  container.innerHTML = items
    .map(function (partner, partnerIndex) {
      var statusClass = partner.status === 'active' ? 'status-active' : 'status-inactive';
      var statusLabel = partner.status === 'active' ? 'Đang hoạt động' : 'Vô hiệu hóa';

      var feesHtml = (partner.fees || [])
        .map(function (fee, feeIndex) {
          return (
            '<tr>' +
            '  <td>' + fee.region + '</td>' +
            '  <td>' + fee.baseFee + '</td>' +
            '  <td>' + fee.extraFee + '</td>' +
            '  <td>' +
            '    <div class="act">' +
            '      <div class="pill edit" onclick="editFee(' + partnerIndex + ',' + feeIndex + ')">' +
            '        <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor"/></svg>' +
            '      </div>' +
            '    </div>' +
            '  </td>' +
            '</tr>'
          );
        })
        .join('');

      return (
        '<div class="shipping-partner">' +
        '  <div class="shipping-partner-header">' +
        '    <div>' +
        '      <div class="shipping-partner-name">' + partner.name + '</div>' +
        '      <div class="shipping-partner-sub">Webhook: ' + (partner.webhook || '') + '</div>' +
        '      <div class="shipping-partner-sub">API Key: ' + (partner.apiKeyMasked || '••••••••••••••••') + '</div>' +
        '    </div>' +
        '    <span class="' + statusClass + '">' + statusLabel + '</span>' +
        '  </div>' +
        '  <div class="shipping-partner-section">' +
        '    <div class="shipping-partner-section-title">SLA (Service Level Agreement)</div>' +
        '    <div class="shipping-partner-sub">' + (partner.sla || '') + '</div>' +
        '    <div class="shipping-partner-sub">Tỷ lệ thành công: ' + (partner.successRate || 0) + '%</div>' +
        '  </div>' +
        '  <div class="shipping-partner-section">' +
        '    <div class="shipping-partner-section-title">Bảng Phí Vận Chuyển</div>' +
        '    <table class="fee-table">' +
        '      <thead>' +
        '        <tr>' +
        '          <th>Khu vực</th>' +
        '          <th>Phí cơ bản (kg đầu)</th>' +
        '          <th>Phí thêm (mỗi kg)</th>' +
        '          <th>Hành động</th>' +
        '        </tr>' +
        '      </thead>' +
        '      <tbody>' + feesHtml + '</tbody>' +
        '    </table>' +
        '    <button class="btn btn-secondary" style="margin-top:8px" onclick="addFee(' + partnerIndex + ')">Thêm dòng phí</button>' +
        '  </div>' +
        '  <div class="shipping-partner-actions">' +
        '    <button class="btn" style="background:var(--panel-2);color:var(--text);border:1px solid var(--line)" onclick="editPartner(' + partnerIndex + ')">Chỉnh sửa</button>' +
        (partner.status === 'active'
          ? '    <button class="btn btn-danger" onclick="togglePartnerStatus(' + partnerIndex + ')">Vô hiệu hóa</button>'
          : '    <button class="btn" onclick="togglePartnerStatus(' + partnerIndex + ')">Kích hoạt lại</button>') +
        '  </div>' +
        '</div>'
      );
    })
    .join('');
}

function openPartnerModal(index) {
  var backdrop = document.getElementById('shipping-partner-modal-backdrop');
  var title = document.getElementById('shipping-partner-modal-title');
  var nameInput = document.getElementById('partner-name');
  var webhookInput = document.getElementById('partner-webhook');
  var apiKeyInput = document.getElementById('partner-api-key');
  var slaInput = document.getElementById('partner-sla');
  var successInput = document.getElementById('partner-success');
  var statusSelect = document.getElementById('partner-status');
  if (!backdrop || !nameInput || !webhookInput || !apiKeyInput || !slaInput || !successInput || !statusSelect) return;

  backdrop.dataset.index = typeof index === 'number' ? String(index) : '';

  if (typeof index === 'number' && shippingPartners[index]) {
    var p = shippingPartners[index];
    nameInput.value = p.name || '';
    webhookInput.value = p.webhook || '';
    apiKeyInput.value = p.apiKeyMasked || '';
    slaInput.value = p.sla || '';
    successInput.value = p.successRate != null ? p.successRate : '';
    statusSelect.value = p.status || 'active';
    title.textContent = 'Chỉnh sửa đối tác vận chuyển';
  } else {
    nameInput.value = '';
    webhookInput.value = '';
    apiKeyInput.value = '';
    slaInput.value = '';
    successInput.value = '';
    statusSelect.value = 'active';
    title.textContent = 'Thêm đối tác vận chuyển';
  }

  backdrop.style.display = 'flex';
}

function closePartnerModal() {
  var backdrop = document.getElementById('shipping-partner-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    backdrop.dataset.index = '';
  }
}

function addPartner() {
  openPartnerModal(null);
}

function editPartner(index) {
  openPartnerModal(index);
}

function togglePartnerStatus(index) {
  var p = shippingPartners[index];
  if (!p) return;
  var toInactive = p.status === 'active';
  if (!confirm((toInactive ? 'Vô hiệu hóa' : 'Kích hoạt lại') + ' đối tác này?')) return;
  p.status = toInactive ? 'inactive' : 'active';
  saveShippingPartners();
  renderShippingPartners();
}

function openFeeModal(partnerIndex, feeIndex) {
  var backdrop = document.getElementById('shipping-fee-modal-backdrop');
  var title = document.getElementById('shipping-fee-modal-title');
  var regionInput = document.getElementById('fee-region');
  var baseInput = document.getElementById('fee-base');
  var extraInput = document.getElementById('fee-extra');
  if (!backdrop || !regionInput || !baseInput || !extraInput) return;

  backdrop.dataset.partnerIndex = String(partnerIndex);
  backdrop.dataset.feeIndex = typeof feeIndex === 'number' ? String(feeIndex) : '';

  var p = shippingPartners[partnerIndex];
  var fee = p && typeof feeIndex === 'number' ? p.fees[feeIndex] : null;

  if (fee) {
    regionInput.value = fee.region || '';
    baseInput.value = fee.baseFee || '';
    extraInput.value = fee.extraFee || '';
    title.textContent = 'Chỉnh sửa bảng phí';
  } else {
    regionInput.value = '';
    baseInput.value = '';
    extraInput.value = '';
    title.textContent = 'Thêm bảng phí';
  }

  backdrop.style.display = 'flex';
}

function closeFeeModal() {
  var backdrop = document.getElementById('shipping-fee-modal-backdrop');
  if (backdrop) {
    backdrop.style.display = 'none';
    backdrop.dataset.partnerIndex = '';
    backdrop.dataset.feeIndex = '';
  }
}

function addFee(partnerIndex) {
  openFeeModal(partnerIndex, null);
}

function editFee(partnerIndex, feeIndex) {
  openFeeModal(partnerIndex, feeIndex);
}

document.addEventListener('DOMContentLoaded', function () {
  loadShippingPartners();

  var searchInput = document.getElementById('shippingSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function (e) {
      currentSearch = e.target.value || '';
      renderShippingPartners();
    });
  }

  var partnerForm = document.getElementById('shipping-partner-form');
  if (partnerForm) {
    partnerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var backdrop = document.getElementById('shipping-partner-modal-backdrop');
      var indexStr = backdrop ? backdrop.dataset.index : '';
      var nameInput = document.getElementById('partner-name');
      var webhookInput = document.getElementById('partner-webhook');
      var apiKeyInput = document.getElementById('partner-api-key');
      var slaInput = document.getElementById('partner-sla');
      var successInput = document.getElementById('partner-success');
      var statusSelect = document.getElementById('partner-status');
      if (!nameInput || !webhookInput || !apiKeyInput || !slaInput || !successInput || !statusSelect) return;

      var data = {
        name: nameInput.value || '',
        webhook: webhookInput.value || '',
        apiKeyMasked: apiKeyInput.value || '••••••••••••••••',
        sla: slaInput.value || '',
        successRate: successInput.value ? parseFloat(successInput.value) : 0,
        status: statusSelect.value || 'active'
      };

      if (!data.name) {
        alert('Vui lòng nhập tên đối tác');
        return;
      }

      if (indexStr) {
        var idx = parseInt(indexStr, 10);
        if (!isNaN(idx) && shippingPartners[idx]) {
          // giữ nguyên fees
          data.fees = shippingPartners[idx].fees || [];
          data.id = shippingPartners[idx].id;
          shippingPartners[idx] = data;
        }
      } else {
        data.id = Date.now();
        data.fees = [];
        shippingPartners.push(data);
      }

      saveShippingPartners();
      renderShippingPartners();
      closePartnerModal();
    });
  }

  var feeForm = document.getElementById('shipping-fee-form');
  if (feeForm) {
    feeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var backdrop = document.getElementById('shipping-fee-modal-backdrop');
      if (!backdrop) return;
      var partnerIndexStr = backdrop.dataset.partnerIndex;
      var feeIndexStr = backdrop.dataset.feeIndex;
      var partnerIndex = partnerIndexStr ? parseInt(partnerIndexStr, 10) : NaN;
      if (isNaN(partnerIndex) || !shippingPartners[partnerIndex]) return;

      var regionInput = document.getElementById('fee-region');
      var baseInput = document.getElementById('fee-base');
      var extraInput = document.getElementById('fee-extra');
      if (!regionInput || !baseInput || !extraInput) return;

      var fee = {
        region: regionInput.value || '',
        baseFee: baseInput.value || '',
        extraFee: extraInput.value || ''
      };

      if (!fee.region) {
        alert('Vui lòng nhập khu vực');
        return;
      }

      var p = shippingPartners[partnerIndex];
      if (!Array.isArray(p.fees)) p.fees = [];

      if (feeIndexStr) {
        var fIdx = parseInt(feeIndexStr, 10);
        if (!isNaN(fIdx) && p.fees[fIdx]) {
          fee.id = p.fees[fIdx].id;
          p.fees[fIdx] = fee;
        }
      } else {
        fee.id = Date.now();
        p.fees.push(fee);
      }

      saveShippingPartners();
      renderShippingPartners();
      closeFeeModal();
    });
  }

  var partnerBackdrop = document.getElementById('shipping-partner-modal-backdrop');
  if (partnerBackdrop) {
    partnerBackdrop.addEventListener('click', function (event) {
      if (event.target === partnerBackdrop) {
        closePartnerModal();
      }
    });
  }

  var feeBackdrop = document.getElementById('shipping-fee-modal-backdrop');
  if (feeBackdrop) {
    feeBackdrop.addEventListener('click', function (event) {
      if (event.target === feeBackdrop) {
        closeFeeModal();
      }
    });
  }

  renderShippingPartners();

  // Đảm bảo các handler có sẵn trên window cho onclick inline
  window.addPartner = addPartner;
  window.editPartner = editPartner;
  window.togglePartnerStatus = togglePartnerStatus;
  window.addFee = addFee;
  window.editFee = editFee;
});
