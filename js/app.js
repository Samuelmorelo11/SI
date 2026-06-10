// ── LOGIN ──
function openLogin() {
  document.getElementById('loginModal').classList.add('active');
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('login-wapp').value = '';
  document.getElementById('login-pass').value = '';
  document.body.style.overflow = 'hidden';
}
function closeLogin() {
  document.getElementById('loginModal').classList.remove('active');
  document.body.style.overflow = '';
}
function switchToLogin() {
  closeRegister();
  setTimeout(openLogin, 150);
}
function switchToRegister() {
  closeLogin();
  setTimeout(() => openRegister('gratis'), 150);
}
function handleLogin() {
  const wapp = document.getElementById('login-wapp').value.trim();
  const pass = document.getElementById('login-pass').value;
  const err  = document.getElementById('login-error');
  if (!wapp || !pass) { err.classList.add('show'); return; }
  if (registeredAccount && wapp === registeredAccount.wapp && pass === registeredAccount.pass) {
    closeLogin();
    crmUser.nombre  = registeredAccount.nombre;
    crmUser.negocio = registeredAccount.negocio;
    setTimeout(openCRM, 150);
  } else {
    err.classList.add('show');
    document.getElementById('login-wapp').style.borderColor = '#C0392B';
    document.getElementById('login-pass').style.borderColor = '#C0392B';
    setTimeout(() => {
      document.getElementById('login-wapp').style.borderColor = '';
      document.getElementById('login-pass').style.borderColor = '';
    }, 1500);
  }
}
document.getElementById('loginModal').addEventListener('click', function(e) {
  if (e.target === this) closeLogin();
});

// ── Plan mapping
const PLAN_LABELS = { gratis: 'Gratis', negocio: 'Negocio ($29K/mes)', pro: 'Pro ($59K/mes)' };

function openRegister(plan) {
  document.getElementById('planName').textContent = PLAN_LABELS[plan] || 'Gratis';
  document.getElementById('registerModal').dataset.plan = plan;
  document.getElementById('registerModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeRegister() {
  document.getElementById('registerModal').classList.remove('active');
  document.body.style.overflow = '';
}
function closeDashboard() {
  document.getElementById('dashboardScreen').classList.remove('active');
  document.body.style.overflow = '';
}

function handleRegister() {
  const nombre  = document.getElementById('reg-nombre').value.trim();
  const negocio = document.getElementById('reg-negocio').value.trim();
  const tipo    = document.getElementById('reg-tipo').value;
  const wapp    = document.getElementById('reg-wapp').value.trim();
  const pass    = document.getElementById('reg-pass').value;

  if (!nombre || !negocio || !tipo || !wapp || !pass) {
    ['reg-nombre','reg-negocio','reg-tipo','reg-wapp','reg-pass'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.borderColor = '#C0392B';
        el.style.animation = 'shake .3s ease';
        setTimeout(() => { el.style.animation = ''; el.style.borderColor = ''; }, 600);
      }
    });
    return;
  }
  if (pass.length < 6) {
    const p = document.getElementById('reg-pass');
    p.style.borderColor = '#C0392B';
    p.focus();
    return;
  }

  const plan = document.getElementById('registerModal').dataset.plan || 'gratis';
  const firstName = nombre.split(' ')[0];

  crmUser.nombre = nombre;
  crmUser.negocio = negocio;
  registeredAccount = { nombre, negocio, wapp, pass };
  localStorage.setItem('cc_account', JSON.stringify(registeredAccount));
  localStorage.setItem('cc_user', JSON.stringify(crmUser));

  document.getElementById('dash-nombre').textContent = firstName;
  document.getElementById('dash-negocio-title').textContent = negocio;
  document.getElementById('dash-plan-chip').textContent = '✓ Plan ' + (PLAN_LABELS[plan] || 'Gratis') + ' activado';

  closeRegister();
  setTimeout(() => {
    document.getElementById('dashboardScreen').classList.add('active');
    document.body.style.overflow = 'hidden';
  }, 200);
}

// ── CRM DATA ──
const crmData = {
  clientes:  JSON.parse(localStorage.getItem('cc_clientes')  || '[]'),
  productos: JSON.parse(localStorage.getItem('cc_productos') || '[]'),
  ventas:    JSON.parse(localStorage.getItem('cc_ventas')    || '[]'),
};
let crmUser = JSON.parse(localStorage.getItem('cc_user') || '{"nombre":"","negocio":""}');

function saveStorage() {
  localStorage.setItem('cc_clientes',  JSON.stringify(crmData.clientes));
  localStorage.setItem('cc_productos', JSON.stringify(crmData.productos));
  localStorage.setItem('cc_ventas',    JSON.stringify(crmData.ventas));
}

function openCRM() {
  document.getElementById('dashboardScreen').classList.remove('active');
  const initials = crmUser.nombre.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  document.getElementById('crm-avatar-initials').textContent = initials || 'TU';
  document.getElementById('crm-user-label').textContent = crmUser.negocio || 'Mi Negocio';
  document.getElementById('crmScreen').classList.add('active');
  document.body.style.overflow = 'hidden';
  switchTab('clientes', document.querySelector('.crm-nav-item'));
  renderClientes();
  renderInventario();
  renderVentas();
}
function closeCRM() {
  document.getElementById('crmScreen').classList.remove('active');
  document.body.style.overflow = '';
}

function switchTab(tab, btn) {
  document.querySelectorAll('.crm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.crm-nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');
}

function toggleForm(id) {
  const panel = document.getElementById(id);
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    panel.querySelectorAll('input').forEach(i => i.value = '');
    panel.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    if (id === 'form-venta') {
      populateProductoSelector();
      document.getElementById('v-cantidad').value = 1;
    }
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function filterTable(tbodyId, q) {
  const rows = document.querySelectorAll('#' + tbodyId + ' tr[data-searchable]');
  const ql = q.toLowerCase();
  rows.forEach(r => r.style.display = r.dataset.searchable.toLowerCase().includes(ql) ? '' : 'none');
}

const COLORS = ['var(--terra)','var(--clay)','var(--leaf)','var(--sky)','var(--clay2)','var(--leaf2)'];
function pickColor(str) { let h=0; for(let c of str) h+=c.charCodeAt(0); return COLORS[h%COLORS.length]; }
function initials(name) { return name.trim().split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function fmt(n) { return '$' + Number(n).toLocaleString('es-CO'); }
function today() { return new Date().toLocaleDateString('es-CO', {day:'2-digit',month:'2-digit',year:'2-digit'}); }

// ── CLIENTES ──
function saveCliente() {
  const nombre = document.getElementById('cl-nombre').value.trim();
  const wapp   = document.getElementById('cl-wapp').value.trim();
  const ciudad = document.getElementById('cl-ciudad').value.trim();
  const tag    = document.getElementById('cl-tag').value;
  const deuda  = parseFloat(document.getElementById('cl-deuda').value) || 0;
  if (!nombre) { document.getElementById('cl-nombre').focus(); return; }
  crmData.clientes.push({ nombre, wapp, ciudad, tag, deuda });
  saveStorage();
  toggleForm('form-cliente');
  renderClientes();
}
function deleteCliente(i) {
  crmData.clientes.splice(i, 1);
  saveStorage();
  renderClientes();
}
function renderClientes() {
  const tbody = document.getElementById('clientes-tbody');
  const list = crmData.clientes;
  updateClienteStats();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="crm-empty"><div class="icon">👥</div><p>Aún no tienes clientes. ¡Agrega el primero!</p><button class="btn-add" style="margin:0 auto;" onclick="toggleForm('form-cliente')">+ Agregar cliente</button></div></td></tr>`;
    return;
  }
  const tagClass = { VIP:'badge-vip', Nuevo:'badge-new', Debe:'badge-debe', Frecuente:'badge-frec' };
  tbody.innerHTML = list.map((c,i) => `
    <tr data-searchable="${c.nombre} ${c.ciudad} ${c.tag}">
      <td><div class="td-name"><div class="crm-avatar" style="background:${pickColor(c.nombre)}">${initials(c.nombre)}</div><div><div class="n">${c.nombre}</div><div class="s">${c.wapp||'—'}</div></div></div></td>
      <td>${c.wapp||'—'}</td>
      <td>${c.ciudad||'—'}</td>
      <td><span class="badge ${tagClass[c.tag]||'badge-new'}">${c.tag}</span></td>
      <td>${c.deuda>0?fmt(c.deuda):'—'}</td>
      <td><div class="row-actions"><button class="btn-row" onclick="deleteCliente(${i})">Eliminar</button></div></td>
    </tr>`).join('');
}
function updateClienteStats() {
  const list = crmData.clientes;
  document.getElementById('stat-total-cl').textContent = list.length;
  document.getElementById('stat-vip-cl').textContent = list.filter(c=>c.tag==='VIP').length;
  document.getElementById('stat-deben-cl').textContent = list.filter(c=>c.deuda>0).length;
  document.getElementById('stat-cobrar-cl').textContent = fmt(list.reduce((s,c)=>s+c.deuda,0));
  document.getElementById('clientes-count-sub').textContent = list.length + ' cliente' + (list.length!==1?'s':'') + ' registrado' + (list.length!==1?'s':'');
}

// ── INVENTARIO ──
function saveProducto() {
  const nombre = document.getElementById('pr-nombre').value.trim();
  const cat    = document.getElementById('pr-cat').value;
  const stock  = parseInt(document.getElementById('pr-stock').value) || 0;
  const precio = parseFloat(document.getElementById('pr-precio').value) || 0;
  if (!nombre) { document.getElementById('pr-nombre').focus(); return; }
  crmData.productos.push({ nombre, cat, stock, precio });
  saveStorage();
  toggleForm('form-producto');
  renderInventario();
}
function deleteProducto(i) { crmData.productos.splice(i,1); saveStorage(); renderInventario(); }
function renderInventario() {
  const tbody = document.getElementById('inventario-tbody');
  const list = crmData.productos;
  updateInvStats();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="crm-empty"><div class="icon">📦</div><p>Aún no tienes productos en inventario.</p><button class="btn-add" style="margin:0 auto;" onclick="toggleForm('form-producto')">+ Agregar producto</button></div></td></tr>`;
    return;
  }
  tbody.innerHTML = list.map((p,i) => {
    const estado = p.stock===0 ? '<span class="badge badge-out">Sin stock</span>' : p.stock<=5 ? '<span class="badge badge-low">Stock bajo</span>' : '<span class="badge badge-stock">En stock</span>';
    return `<tr data-searchable="${p.nombre} ${p.cat}">
      <td><div class="td-name"><div class="crm-avatar" style="background:${pickColor(p.nombre)}">${initials(p.nombre)}</div><div class="n">${p.nombre}</div></div></td>
      <td>${p.cat}</td>
      <td>${p.stock} uds.</td>
      <td>${fmt(p.precio)}</td>
      <td>${estado}</td>
      <td><div class="row-actions"><button class="btn-row" onclick="deleteProducto(${i})">Eliminar</button></div></td>
    </tr>`;
  }).join('');
}
function updateInvStats() {
  const list = crmData.productos;
  document.getElementById('stat-total-inv').textContent = list.length;
  document.getElementById('stat-stock-inv').textContent = list.reduce((s,p)=>s+p.stock,0);
  document.getElementById('stat-low-inv').textContent = list.filter(p=>p.stock<=5).length;
  document.getElementById('stat-val-inv').textContent = fmt(list.reduce((s,p)=>s+(p.stock*p.precio),0));
  document.getElementById('inv-count-sub').textContent = list.length + ' producto' + (list.length!==1?'s':'') + ' registrado' + (list.length!==1?'s':'');
}

// ── VENTAS ──
function findCliente(nombre) {
  return crmData.clientes.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
}

function populateProductoSelector() {
  const select = document.getElementById('v-producto');
  if (!select) return;
  const current = select.value;
  select.innerHTML = '<option value="">— Selecciona un producto —</option>';
  crmData.productos.forEach((p, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = `${p.nombre} (Stock: ${p.stock} uds. · ${fmt(p.precio)})`;
    opt.disabled = p.stock === 0;
    select.appendChild(opt);
  });
  select.value = current;
}

function onProductoChange() {
  const idx = document.getElementById('v-producto').value;
  const cantidad = parseInt(document.getElementById('v-cantidad').value) || 1;
  if (idx === '') { document.getElementById('v-monto').value = ''; return; }
  const precio = crmData.productos[idx].precio;
  document.getElementById('v-monto').value = precio * cantidad;
}

function onCantidadChange() {
  const idx = document.getElementById('v-producto').value;
  if (idx === '') return;
  const cantidad = parseInt(document.getElementById('v-cantidad').value) || 1;
  const precio = crmData.productos[idx].precio;
  document.getElementById('v-monto').value = precio * cantidad;
}

function saveVenta() {
  const cliente  = document.getElementById('v-cliente').value.trim();
  const prodIdx  = document.getElementById('v-producto').value;
  const cantidad = parseInt(document.getElementById('v-cantidad').value) || 1;
  const monto    = parseFloat(document.getElementById('v-monto').value) || 0;
  const tipo     = document.getElementById('v-tipo').value;

  if (!cliente || prodIdx === '' || !monto) {
    if (!cliente) document.getElementById('v-cliente').focus();
    else if (prodIdx === '') document.getElementById('v-producto').focus();
    return;
  }

  const producto = crmData.productos[prodIdx];

  // Descontar stock del inventario
  producto.stock = Math.max(0, producto.stock - cantidad);

  const estado = tipo === 'Crédito' ? 'Pendiente' : 'Pagada';
  crmData.ventas.unshift({ fecha: today(), cliente, producto: producto.nombre, cantidad, monto, tipo, estado });

  // Actualizar la deuda del cliente según el tipo de venta
  const cl = findCliente(cliente);
  if (cl) {
    if (tipo === 'Crédito') {
      cl.deuda = (cl.deuda || 0) + monto;
      if (cl.tag !== 'VIP') cl.tag = 'Debe';
    } else {
      cl.deuda = Math.max(0, (cl.deuda || 0) - monto);
      if (cl.deuda === 0 && cl.tag === 'Debe') cl.tag = 'Frecuente';
    }
  }

  saveStorage();
  toggleForm('form-venta');
  renderVentas();
  renderClientes();
  renderInventario();
}

function marcarPagada(i) {
  const venta = crmData.ventas[i];
  // Restar el monto de la deuda del cliente al cobrar
  if (venta.estado === 'Pendiente') {
    const cl = findCliente(venta.cliente);
    if (cl) {
      cl.deuda = Math.max(0, (cl.deuda || 0) - venta.monto);
      // Si ya no debe nada, quitarle el tag "Debe"
      if (cl.deuda === 0 && cl.tag === 'Debe') cl.tag = 'Frecuente';
    }
  }
  crmData.ventas[i].estado = 'Pagada';
  saveStorage();
  renderVentas();
  renderClientes();
}

function deleteVenta(i) {
  const venta = crmData.ventas[i];
  // Si la venta estaba pendiente, restar la deuda al cliente
  if (venta.estado === 'Pendiente') {
    const cl = findCliente(venta.cliente);
    if (cl) {
      cl.deuda = Math.max(0, (cl.deuda || 0) - venta.monto);
      if (cl.deuda === 0 && cl.tag === 'Debe') cl.tag = 'Frecuente';
    }
  }
  crmData.ventas.splice(i, 1);
  saveStorage();
  renderVentas();
  renderClientes();
}
function renderVentas() {
  const tbody = document.getElementById('ventas-tbody');
  const list = crmData.ventas;
  updateVentasStats();
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="crm-empty"><div class="icon">🧾</div><p>Aún no has registrado ventas.</p><button class="btn-add" style="margin:0 auto;" onclick="toggleForm('form-venta')">+ Nueva venta</button></div></td></tr>`;
    return;
  }
  const estClass = { Pagada:'badge-pagada', Pendiente:'badge-pendiente', Crédito:'badge-credito' };
  const tipoClass = { Contado:'badge-stock', Crédito:'badge-credito' };
  tbody.innerHTML = list.map((v,i) => `
    <tr data-searchable="${v.cliente} ${v.producto} ${v.tipo} ${v.estado}">
      <td>${v.fecha}</td>
      <td>${v.cliente}</td>
      <td>${v.producto}${v.cantidad > 1 ? ` <span style="color:var(--clay);font-size:.8em">(x${v.cantidad})</span>` : ''}</td>
      <td>${fmt(v.monto)}</td>
      <td><span class="badge ${tipoClass[v.tipo]||''}">${v.tipo}</span></td>
      <td><span class="badge ${estClass[v.estado]||''}">${v.estado}</span></td>
      <td><div class="row-actions">
        ${v.estado==='Pendiente'?`<button class="btn-row" onclick="marcarPagada(${i})">✓ Cobrar</button>`:''}
        <button class="btn-row" onclick="deleteVenta(${i})">Eliminar</button>
      </div></td>
    </tr>`).join('');
}
function updateVentasStats() {
  const list = crmData.ventas;
  const mes = new Date().getMonth();
  const ingresosMes = list.filter(v=>{ const d=v.fecha.split('/'); return parseInt(d[1])-1===mes && v.estado==='Pagada'; }).reduce((s,v)=>s+v.monto,0);
  document.getElementById('stat-total-v').textContent = list.length;
  document.getElementById('stat-mes-v').textContent = fmt(ingresosMes);
  document.getElementById('stat-pend-v').textContent = list.filter(v=>v.estado==='Pendiente').length;
  document.getElementById('stat-cred-v').textContent = fmt(list.filter(v=>v.tipo==='Crédito'&&v.estado==='Pendiente').reduce((s,v)=>s+v.monto,0));
  document.getElementById('ventas-count-sub').textContent = list.length + ' venta' + (list.length!==1?'s':'') + ' registrada' + (list.length!==1?'s':'');
}

// Wire dashboard button to open CRM
document.querySelector('.btn-dash-primary').addEventListener('click', openCRM);

// Close modal clicking backdrop
document.getElementById('registerModal').addEventListener('click', function(e) {
  if (e.target === this) closeRegister();
});

// Shake animation
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`;
document.head.appendChild(shakeStyle);

let registeredAccount = JSON.parse(localStorage.getItem('cc_account') || 'null');

// Attach to plan buttons
document.querySelectorAll('.btn-plan').forEach((btn, i) => {
  const plans = ['gratis','negocio','pro'];
  btn.addEventListener('click', () => openRegister(plans[i]));
});
// Hero CTA buttons
document.querySelectorAll('a[href="#cta"], .btn-cta-white, a.btn-primary').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); openRegister('gratis'); });
});
// Nav CTA
document.querySelector('.nav-cta')?.addEventListener('click', e => { e.preventDefault(); openRegister('gratis'); });

const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 80);
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => observer.observe(el));
