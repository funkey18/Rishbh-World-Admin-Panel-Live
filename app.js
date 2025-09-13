/* Vanilla JS implementation of Dashboard functionality */
(function () {
  const config = window.APP_CONFIG || {};
  const BASE_URL = config.serverUrl || '';

  // Session helpers (compatible with Angular's AppCookieServiceService and ConstantsService)
  const SESSION_KEY = 'KG_ADMIN_USER';
  function getSession() {
    try {
      const encoded = sessionStorage.getItem(SESSION_KEY);
      if (!encoded) return null;
      return JSON.parse(decodeURIComponent(atob(encoded)));
    } catch (e) {
      return null;
    }
  }
  function setSession(obj) {
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(obj)));
      sessionStorage.setItem(SESSION_KEY, encoded);
    } catch (e) {
      console.warn('Failed to set session');
    }
  }
  function getAuthHeader() {
    const user = getSession();
    if (!user) return '';
    const token = user.sessionToken || user['session-token'] || '';
    return token ? `Bearer ${token}` : '';
    }

  // Simple fetch wrappers
  async function apiGet(path) {
    const res = await fetch(BASE_URL + path, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      credentials: 'omit',
    });
    if (!res.ok) throw new Error(`GET ${path} failed ${res.status}`);
    return res.json();
  }

  async function apiPost(path, data) {
    const res = await fetch(BASE_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(data),
      credentials: 'omit',
    });
    if (!res.ok) throw new Error(`POST ${path} failed ${res.status}`);
    return res.json();
  }

  async function apiPut(path, data) {
    const res = await fetch(BASE_URL + path, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(),
      },
      body: JSON.stringify(data),
      credentials: 'omit',
    });
    if (!res.ok) throw new Error(`PUT ${path} failed ${res.status}`);
    return res.json().catch(() => ({ success: true }));
  }

  // Elements
  const elSearch = document.getElementById('searchQuery');
  const elBtnNewOrder = document.getElementById('btnNewOrder');
  const elLoading = document.getElementById('loadingBox');
  const elNoResults = document.getElementById('noResults');
  const elCustomersBox = document.getElementById('customersBox');
  const elCustomersTableBody = document.querySelector('#customersTable tbody');
  const elSummary = document.getElementById('summaryBox');
  // Excel import elements
  const elExcelFile = document.getElementById('excelFile');
  const elBtnImportExcel = document.getElementById('btnImportExcel');

  // View Orders modal elements
  const orderModal = document.getElementById('orderModal');
  const orderBackdrop = document.getElementById('orderBackdrop');
  const v_name = document.getElementById('v_name');
  const v_mobile = document.getElementById('v_mobile');
  const v_address = document.getElementById('v_address');
  const v_dob_box = document.getElementById('v_dob_box');
  const v_dob = document.getElementById('v_dob');
  const v_total_orders = document.getElementById('v_total_orders');
  const ordersTbody = document.getElementById('ordersTbody');

  // Edit customer modal elements
  const customerEditModal = document.getElementById('customerEditModal');
  const customerBackdrop = document.getElementById('customerBackdrop');
  const cust_id = document.getElementById('cust_id');
  const cust_name = document.getElementById('cust_name');
  const cust_mobile = document.getElementById('cust_mobile');
  const cust_address = document.getElementById('cust_address');
  const cust_dob = document.getElementById('cust_dob');
  const btnSaveCustomer = document.getElementById('btnSaveCustomer');

  // Edit order modal elements
  const orderEditModal = document.getElementById('orderEditModal');
  const orderEditBackdrop = document.getElementById('orderEditBackdrop');
  const ord_id = document.getElementById('ord_id');
  const ord_date = document.getElementById('ord_date');
  const ord_orderNo = document.getElementById('ord_orderNo');
  const ord_billNo = document.getElementById('ord_billNo');
  const ord_tailoring = document.getElementById('ord_tailoring');
  const ord_totalAmt = document.getElementById('ord_totalAmt');
  const ord_advance = document.getElementById('ord_advance');
  const ord_balance = document.getElementById('ord_balance');
  const ord_fabric = document.getElementById('ord_fabric');
  const ord_shirt = document.getElementById('ord_shirt');
  const ord_kurta = document.getElementById('ord_kurta');
  const ord_trouser = document.getElementById('ord_trouser');
  const ord_suit = document.getElementById('ord_suit');
  const ord_bandi = document.getElementById('ord_bandi');
  const ord_jodhpuri = document.getElementById('ord_jodhpuri');
  const ord_sherwani = document.getElementById('ord_sherwani');
  const ord_other = document.getElementById('ord_other');
  const ord_trialDate = document.getElementById('ord_trialDate');
  const ord_deliveryDate = document.getElementById('ord_deliveryDate');
  const ord_remark = document.getElementById('ord_remark');
  const btnSaveOrder = document.getElementById('btnSaveOrder');

  // New order modal elements
  const newOrderModal = document.getElementById('newOrderModal');
  const newOrderBackdrop = document.getElementById('newOrderBackdrop');
  const n_name = document.getElementById('n_name');
  const n_mobile = document.getElementById('n_mobile');
  const n_address = document.getElementById('n_address');
  const n_dob = document.getElementById('n_dob');
  const n_date = document.getElementById('n_date');
  const n_orderNo = document.getElementById('n_orderNo');
  const n_billNo = document.getElementById('n_billNo');
  const n_tailoring = document.getElementById('n_tailoring');
  const n_fabric = document.getElementById('n_fabric');
  const n_shirt = document.getElementById('n_shirt');
  const n_kurta = document.getElementById('n_kurta');
  const n_trouser = document.getElementById('n_trouser');
  const n_suit = document.getElementById('n_suit');
  const n_bandi = document.getElementById('n_bandi');
  const n_jodhpuri = document.getElementById('n_jodhpuri');
  const n_sherwani = document.getElementById('n_sherwani');
  const n_other = document.getElementById('n_other');
  const n_trialDate = document.getElementById('n_trialDate');
  const n_deliveryDate = document.getElementById('n_deliveryDate');
  const n_rating = document.getElementById('n_rating');
  const n_totalAmt = document.getElementById('n_totalAmt');
  const n_advance = document.getElementById('n_advance');
  const n_balance = document.getElementById('n_balance');
  const n_remark = document.getElementById('n_remark');
  const n_reason = document.getElementById('n_reason');
  const n_report = document.getElementById('n_report');
  const btnCreateOrder = document.getElementById('btnCreateOrder');

  // Customers state
  let customers = [];
  let selectedCustomer = null;

  // Utilities
  function show(el) { el && (el.style.display = 'block'); }
  function hide(el) { el && (el.style.display = 'none'); }
  function formatDateISO(d) { if (!d) return ''; const dt = new Date(d); return dt.toISOString().slice(0, 10); }
  function formatDateHuman(d) { if (!d) return 'N/A'; try { return new Date(d).toLocaleDateString(); } catch { return d; } }

  function generateOrderNumber() {
    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return {
      orderNo: `ORD-${year}${month}${day}-${random}`,
      billNo: `BILL-${year}${month}${day}-${random}`,
    };
  }

  function calculateBalance(total, advance) {
    const t = parseFloat(total || '0') || 0;
    const a = parseFloat(advance || '0') || 0;
    return (t - a).toFixed(2);
  }

  // Render functions
  function renderCustomers() {
    elCustomersTableBody.innerHTML = '';
    customers.forEach((c, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-center">${idx + 1}</td>
        <td>
          <div class="fw-bold">${c.name || ''}</div>
          <small class="text-muted">ID: ${c.id}</small>
        </td>
        <td>
          <a href="tel:${c.mobile || ''}" class="text-decoration-none">
            <i class="bi bi-telephone"></i> ${c.mobile || ''}
          </a>
        </td>
        <td>${c.address || 'N/A'}</td>
        <td><span class="badge bg-primary rounded-pill">${(c.orders || []).length} orders</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" data-action="view" data-id="${c.id}"><i class="bi bi-eye"></i> View</button>
          <button class="btn btn-sm btn-outline-secondary" data-action="edit" data-id="${c.id}"><i class="bi bi-pencil"></i> Edit</button>
        </td>
      `;
      elCustomersTableBody.appendChild(tr);
    });

    // Action handlers
    elCustomersTableBody.querySelectorAll('button[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const cust = customers.find(x => x.id === id);
        if (cust) openOrderModal(cust);
      });
    });
    elCustomersTableBody.querySelectorAll('button[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-id'));
        const cust = customers.find(x => x.id === id);
        if (cust) openCustomerEdit(cust);
      });
    });
  }

  function renderSummary() {
    elSummary.textContent = `Showing ${customers.length} customers with their orders. Use the search above to refine results.`;
  }

  // Modal helpers
  function openModal(modal, backdrop) {
    if (!modal) return;
    modal.classList.add('show');
    modal.style.display = 'block';
    show(backdrop);
  }
  function closeModal(modal, backdrop) {
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    hide(backdrop);
  }
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-close-modal');
      const m = document.getElementById(id);
      const b = document.getElementById(id.replace('Modal','Backdrop'));
      closeModal(m, b);
    });
  });

  // View Orders
  function openOrderModal(cust) {
    selectedCustomer = cust;
    v_name.textContent = cust.name || '';
    v_mobile.textContent = cust.mobile || '';
    v_address.textContent = cust.address || 'N/A';
    const hasDob = !!cust.dob;
    v_dob_box.style.display = hasDob ? 'block' : 'none';
    v_dob.textContent = hasDob ? formatDateHuman(cust.dob) : '';
    v_total_orders.textContent = (cust.orders || []).length;

    ordersTbody.innerHTML = '';
    (cust.orders || []).forEach(order => {
      const statusCompleted = order.balance === 'PAID' || order.balance === '0';
      const items = [];
      if ((order.shirt||'').toString().trim()) items.push(`Shirt: ${order.shirt}`);
      if ((order.kurta||'').toString().trim()) items.push(`Kurta: ${order.kurta}`);
      if ((order.trouser||'').toString().trim()) items.push(`Trouser: ${order.trouser}`);
      if ((order.suit||'').toString().trim()) items.push(`Suit: ${order.suit}`);
      if ((order.bandi||'').toString().trim()) items.push(`Bandi: ${order.bandi}`);
      if ((order.jodhpuri||'').toString().trim()) items.push(`Jodhpuri: ${order.jodhpuri}`);
      if ((order.sherwani||'').toString().trim()) items.push(`Sherwani: ${order.sherwani}`);
      if ((order.other||'').toString().trim()) items.push(`Other: ${order.other}`);
      const itemsHtml = items.length ? items.map(t => `<span class="badge bg-info text-dark me-1 mb-1">${t}</span>`).join('') : 'No items specified';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${order.orderNo || 'N/A'}</td>
        <td>${order.billNo || 'N/A'}</td>
        <td>${formatDateHuman(order.date)}</td>
        <td><div class="d-flex flex-wrap gap-1">${itemsHtml}</div></td>
        <td class="text-nowrap">${order.advance || 'N/A'}</td>
        <td class="${statusCompleted ? 'text-success' : (order.balance !== '0' ? 'text-danger' : 'text-warning')}">
          ${order.balance === '0' ? 'PAID' : (order.balance || 'N/A')}
        </td>
        <td>${order.trialDate ? formatDateHuman(order.trialDate) : 'N/A'}</td>
        <td>${order.deliveryDate ? formatDateHuman(order.deliveryDate) : 'N/A'}</td>
        <td>
          <span class="badge ${statusCompleted ? 'bg-success' : 'bg-warning'}">${statusCompleted ? 'Completed' : 'In Progress'}</span>
          <button class="btn btn-sm btn-outline-secondary ms-2" data-action="edit-order" data-id="${order.id}"><i class="bi bi-pencil"></i> Edit</button>
        </td>
      `;
      ordersTbody.appendChild(tr);
    });

    // Wire edit order buttons
    ordersTbody.querySelectorAll('button[data-action="edit-order"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const oid = Number(btn.getAttribute('data-id'));
        const ord = (cust.orders || []).find(o => o.id === oid);
        if (ord) openOrderEdit(ord);
      });
    });

    openModal(orderModal, orderBackdrop);
  }

  // Edit customer
  function openCustomerEdit(c) {
    cust_id.value = c.id;
    cust_name.value = c.name || '';
    cust_mobile.value = c.mobile || '';
    cust_address.value = c.address || '';
    cust_dob.value = c.dob ? formatDateISO(c.dob) : '';
    openModal(customerEditModal, customerBackdrop);
  }

  async function saveCustomerEdit() {
    const id = cust_id.value;
    if (!id) return;
    const payload = {
      name: (cust_name.value || '').trim(),
      mobile: (cust_mobile.value || '').trim(),
      address: (cust_address.value || '').trim(),
      dob: (cust_dob.value || '').trim(),
    };
    try {
      await apiPut(`api/customers/${id}`, payload);
      closeModal(customerEditModal, customerBackdrop);
      await loadCustomers();
    } catch (e) {
      console.error('Failed to update customer', e);
      alert('Failed to update customer');
    }
  }

  // Edit order
  function openOrderEdit(o) {
    ord_id.value = o.id;
    ord_date.value = o.date ? formatDateISO(o.date) : '';
    ord_orderNo.value = o.orderNo || '';
    ord_billNo.value = o.billNo || '';
    ord_tailoring.value = o.tailoring || '';
    ord_totalAmt.value = o.totalAmt || '';
    ord_advance.value = o.advance || '';
    ord_balance.value = o.balance || '';
    ord_fabric.value = o.fabric || '';
    ord_shirt.value = o.shirt || '';
    ord_kurta.value = o.kurta || '';
    ord_trouser.value = o.trouser || '';
    ord_suit.value = o.suit || '';
    ord_bandi.value = o.bandi || '';
    ord_jodhpuri.value = o.jodhpuri || '';
    ord_sherwani.value = o.sherwani || '';
    ord_other.value = o.other || '';
    ord_trialDate.value = o.trialDate ? formatDateISO(o.trialDate) : '';
    ord_deliveryDate.value = o.deliveryDate ? formatDateISO(o.deliveryDate) : '';
    ord_remark.value = o.remark || '';
    openModal(orderEditModal, orderEditBackdrop);
  }

  async function saveOrderEdit() {
    const id = ord_id.value;
    if (!id) return;
    const payload = {
      date: (ord_date.value || '').trim(),
      orderNo: (ord_orderNo.value || '').trim(),
      billNo: (ord_billNo.value || '').trim(),
      tailoring: (ord_tailoring.value || '').trim(),
      totalAmt: (ord_totalAmt.value || '').trim(),
      advance: (ord_advance.value || '').trim(),
      balance: (ord_balance.value || '').trim(),
      fabric: (ord_fabric.value || '').trim(),
      shirt: (ord_shirt.value || '').trim(),
      kurta: (ord_kurta.value || '').trim(),
      trouser: (ord_trouser.value || '').trim(),
      suit: (ord_suit.value || '').trim(),
      bandi: (ord_bandi.value || '').trim(),
      jodhpuri: (ord_jodhpuri.value || '').trim(),
      sherwani: (ord_sherwani.value || '').trim(),
      other: (ord_other.value || '').trim(),
      trialDate: (ord_trialDate.value || '').trim(),
      deliveryDate: (ord_deliveryDate.value || '').trim(),
      remark: (ord_remark.value || '').trim(),
    };
    try {
      await apiPut(`api/customers/orders/${id}`, payload);
      closeModal(orderEditModal, orderEditBackdrop);
      // If order modal is open, refresh selected customer list by reloading customers
      await loadCustomers();
      if (selectedCustomer) {
        const ref = customers.find(c => c.id === selectedCustomer.id);
        if (ref) openOrderModal(ref);
      }
    } catch (e) {
      console.error('Failed to update order', e);
      alert('Failed to update order');
    }
  }

  // New Order
  function openNewOrderModal() {
    // reset
    n_name.value = '';
    n_mobile.value = '';
    n_address.value = '';
    n_dob.value = '';
    n_date.value = formatDateISO(new Date());
    const ids = generateOrderNumber();
    n_orderNo.value = ids.orderNo;
    n_billNo.value = ids.billNo;
    n_tailoring.value = 'Yes';
    n_fabric.value = '';
    n_shirt.checked = false;
    n_kurta.checked = false;
    n_trouser.checked = false;
    n_suit.checked = false;
    n_bandi.checked = false;
    n_jodhpuri.checked = false;
    n_sherwani.checked = false;
    n_other.checked = false;
    n_trialDate.value = '';
    n_deliveryDate.value = '';
    n_rating.value = '5';
    n_totalAmt.value = '';
    n_advance.value = '';
    n_balance.value = '0';
    n_remark.value = '';
    n_reason.value = '';
    n_report.value = '';
    openModal(newOrderModal, newOrderBackdrop);
  }

  function updateNewOrderBalance() {
    n_balance.value = calculateBalance(n_totalAmt.value, n_advance.value);
  }

  async function createOrder() {
    // basic validation
    if (!n_name.value || !n_mobile.value || !n_orderNo.value || !n_billNo.value) {
      alert('Please fill in all required fields');
      return;
    }
    const payload = {
      name: n_name.value,
      mobile: n_mobile.value,
      address: n_address.value || null,
      dob: n_dob.value || null,
      date: n_date.value,
      orderNo: n_orderNo.value,
      billNo: n_billNo.value,
      tailoring: n_tailoring.value,
      totalAmt: n_totalAmt.value,
      advance: n_advance.value,
      balance: n_balance.value,
      fabric: n_fabric.value,
      shirt: n_shirt.checked ? 'Shirt' : '',
      kurta: n_kurta.checked ? 'Kurta' : '',
      trouser: n_trouser.checked ? 'Trouser' : '',
      suit: n_suit.checked ? 'Suit' : '',
      bandi: n_bandi.checked ? 'Bandi' : '',
      jodhpuri: n_jodhpuri.checked ? 'Jodhpuri' : '',
      sherwani: n_sherwani.checked ? 'Sherwani' : '',
      other: n_other.checked ? 'Other' : '',
      trialDate: n_trialDate.value || null,
      deliveryDate: n_deliveryDate.value || null,
      remark: n_remark.value || null,
      rating: n_rating.value || '5',
      reason: n_reason.value || null,
      report: n_report.value || null,
    };
    try {
      await apiPost('api/customers/orders', payload);
      alert('Order created successfully!');
      closeModal(newOrderModal, newOrderBackdrop);
      await loadCustomers();
    } catch (e) {
      console.error('Error creating order', e);
      alert('Error creating order. Please try again.');
    }
  }

  // Load customers
  let searchDebounce = null;
  async function loadCustomers() {
    show(elLoading);
    hide(elNoResults);
    hide(elCustomersBox);
    hide(elSummary);

    const q = (elSearch.value || '').trim();
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';

    try {
      const res = await apiGet(`api/customers/with-orders${qs}`);
      customers = Array.isArray(res.result) ? res.result : [];
      hide(elLoading);
      if (!customers.length) {
        show(elNoResults);
        return;
      }
      renderCustomers();
      renderSummary();
      show(elCustomersBox);
      show(elSummary);
    } catch (e) {
      console.error('Error fetching customers', e);
      hide(elLoading);
      show(elNoResults);
    }
  }

  // Wire events
  elBtnNewOrder.addEventListener('click', openNewOrderModal);
  [n_totalAmt, n_advance].forEach(el => el.addEventListener('input', updateNewOrderBalance));
  btnCreateOrder.addEventListener('click', createOrder);
  btnSaveCustomer.addEventListener('click', saveCustomerEdit);
  btnSaveOrder.addEventListener('click', saveOrderEdit);

  // Excel import handlers
  const IMPORT_FILE_EXTNS = ['xlsx', 'xls'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  async function importExcel() {
    const file = elExcelFile && elExcelFile.files && elExcelFile.files[0];
    if (!file) {
      alert('Please select an Excel file (.xlsx or .xls) to upload.');
      return;
    }
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!IMPORT_FILE_EXTNS.includes(ext)) {
      alert('Invalid file type. Please upload .xlsx or .xls files only.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('File size should not exceed 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    // Optional companion payload to mirror Angular's multipartRequest(..., 'data', {})
    const emptyJson = new Blob([JSON.stringify({})], { type: 'application/json' });
    formData.append('data', emptyJson);

    try {
      const res = await fetch(BASE_URL + 'api/import/upload', {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
        },
        body: formData,
        credentials: 'omit',
      });
      if (!res.ok) throw new Error(`Import failed ${res.status}`);
      const json = await res.json().catch(() => ({}));
      if (json && json.status === '200' && json.message === 'excel.imported') {
        alert('Excel file has been imported successfully!');
      } else {
        alert('File imported successfully!');
      }
      if (elExcelFile) elExcelFile.value = '';
      // Refresh data after import
      await loadCustomers();
    } catch (e) {
      console.error('Error importing file:', e);
      alert('Failed to import file. Please try again.');
    }
  }

  if (elBtnImportExcel) {
    elBtnImportExcel.addEventListener('click', importExcel);
  }

  elSearch.addEventListener('input', () => {
    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(loadCustomers, 300);
  });
  elSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loadCustomers();
  });

  // Initial values and first load
  // If you need to set a temporary session for testing, uncomment:
  // setSession({ 'session-token': 'YOUR_TOKEN' });
  n_date && (n_date.value = formatDateISO(new Date()));
  const ids = generateOrderNumber();
  if (n_orderNo) n_orderNo.value = ids.orderNo;
  if (n_billNo) n_billNo.value = ids.billNo;

  loadCustomers();
})();
