const app = {
  selected: new Set(),
  categories: [],
  results: null,
  netStatus: 'direct',

  show(id) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  goToWelcome() { this.show('page-welcome'); },
  goToSelect() { this.show('page-select'); this.render(); },
  goToDetect() { this.show('page-detect'); this.runDetect(); },

  async init() {
    this.categories = await window.api.getProducts();
    this.render();
  },

  // === Page 2: Selection ===
  render() {
    const el = document.getElementById('product-list');
    el.innerHTML = '';
    for (const cat of this.categories) {
      const sec = document.createElement('div');
      sec.className = 'category-section';
      sec.innerHTML = `<div class="category-title">${cat.name}</div>`;
      for (const p of cat.products) {
        if (!p.platforms?.includes('mac') && !p.platforms?.includes('win')) continue;
        const d = document.createElement('div');
        d.className = 'product-item' + (this.selected.has(p.id) ? ' selected' : '');
        d.innerHTML = `<div class="product-checkbox"></div><div class="product-info"><div class="product-name">${p.name}<span class="product-vendor">${p.vendor}</span></div></div>${p.requires?.length ? `<div class="product-deps">${p.requires.map(r => `<span class="dep-tag">需要 ${r}</span>`).join('')}</div>` : ''}`;
        d.onclick = () => { this.selected.has(p.id) ? this.selected.delete(p.id) : this.selected.add(p.id); this.render(); this.updBtn(); };
        sec.appendChild(d);
      }
      el.appendChild(sec);
    }
    this.updBtn();
  },

  updBtn() {
    document.getElementById('selected-count').textContent = `已选 ${this.selected.size} 项`;
    document.getElementById('btn-detect').disabled = this.selected.size === 0;
  },

  // === Page 3: Detect ===
  async runDetect() {
    const el = document.getElementById('detect-result');
    el.innerHTML = '<div class="loading-spinner">⏳ 正在检测环境...</div>';
    document.getElementById('btn-install').disabled = true;

    const ids = Array.from(this.selected);
    this.results = await window.api.detectEnvironment(ids);
    this.netStatus = this.results._network?.status || 'direct';

    const deps = Object.keys(this.results).filter(k => !k.startsWith('_'));
    const missing = deps.filter(k => this.results[k].status !== 'ok');

    let html = '<div class="detect-section"><div class="detect-title">💻 系统</div>';
    html += `<div class="detect-item"><span class="detect-icon">🖥</span><span class="detect-name">${this.results._platform}</span><span class="detect-msg">${this.results._network?.message||'未知'}</span></div></div>`;

    html += '<div class="detect-section"><div class="detect-title">✅ 依赖检测</div>';
    for (const k of deps) {
      const d = this.results[k];
      const ic = d.status === 'ok' ? '✅' : d.status === 'old' ? '⚠️' : '❌';
      html += `<div class="detect-item"><span class="detect-icon">${ic}</span><span class="detect-name">${d.name}</span><span class="detect-msg">${d.message}</span></div>`;
    }
    html += '</div>';

    html += '<div class="detect-section"><div class="detect-title">📋 安装评估</div>';
    for (const id of ids) {
      let p = null;
      for (const c of this.categories) { p = c.products.find(x => x.id === id); if (p) break; }
      if (!p) continue;
      const prodDeps = p.requires || [];
      const prodMissing = prodDeps.filter(d => this.results[d]?.status !== 'ok');
      const ic = prodMissing.length === 0 ? '✅' : '⚠️';
      const msg = prodMissing.length === 0 ? '可直接安装' : `需先安装 ${prodMissing.join(', ')}`;
      html += `<div class="detect-item"><span class="detect-icon">${ic}</span><span class="detect-name">${p.name}</span><span class="detect-msg">${msg}</span></div>`;
    }
    html += '</div>';

    el.innerHTML = html;
    document.getElementById('detect-summary').textContent = missing.length ? `还需安装 ${missing.length} 个依赖` : '✅ 所有依赖已满足';
    document.getElementById('btn-install').disabled = false;
  },

  // === Page 4: Install ===
  async startInstall() {
    this.show('page-install');
    const ids = Array.from(this.selected);
    const container = document.getElementById('install-items');
    container.innerHTML = '';
    document.getElementById('log-section').style.display = 'none';

    for (const id of ids) {
      let nm = id;
      for (const c of this.categories) { const p = c.products.find(x => x.id === id); if (p) { nm = p.name; break; } }
      const d = document.createElement('div');
      d.className = 'install-item waiting';
      d.id = `inst-${id}`;
      d.innerHTML = `<span class="item-icon">⏳</span><div class="item-info"><div class="item-name">${nm}</div><div class="item-msg">等待中...</div><div class="item-progress"><div class="item-progress-fill" style="width:0%"></div></div></div>`;
      container.appendChild(d);
    }

    document.getElementById('install-bottom').style.display = 'none';

    const result = await window.api.startInstall({ productIds: ids, networkStatus: this.netStatus });

    document.getElementById('install-bottom').style.display = 'flex';
    document.getElementById('total-progress-text').textContent = '🎉 全部安装完成！';
    document.getElementById('total-progress-fill').style.width = '100%';
    document.getElementById('log-section').style.display = 'block';
  },

  // === Page 5: Log Viewer ===
  async viewLogs() {
    this.show('page-logs');
    const el = document.getElementById('log-output');
    el.textContent = '加载中...';
    try {
      const logs = await window.api.readLogs(100);
      el.textContent = logs.join('\n') || '(暂无日志)';
    } catch (e) {
      el.textContent = '加载日志失败: ' + e.message;
    }
  },

  async refreshLogs() {
    await this.viewLogs();
  }
};

// Install progress handler
window.api.onInstallProgress((data) => {
  const total = Array.from(app.selected).length;
  const done = document.querySelectorAll('.install-item.done, .install-item.failed').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('total-progress-fill').style.width = pct + '%';
  document.getElementById('total-progress-text').textContent = `安装中 ${done}/${total}`;

  if (data.current) {
    const item = document.getElementById(`inst-${data.current}`);
    if (item) {
      item.className = 'install-item active';
      const ic = item.querySelector('.item-icon');
      const msg = item.querySelector('.item-msg');
      const fill = item.querySelector('.item-progress-fill');
      ic.textContent = data.status === 'downloading' ? '⬇️' : '⏳';
      msg.textContent = data.message;
      if (fill) fill.style.width = data.progress + '%';
      if (data.status === 'completed') { item.className = 'install-item done'; ic.textContent = '✅'; }
      if (data.status === 'failed') { item.className = 'install-item failed'; ic.textContent = '❌'; }
    }
  }
});

document.addEventListener('DOMContentLoaded', () => app.init());
