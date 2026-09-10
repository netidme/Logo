(function() {
  'use strict';

  const ONLINE_FONTS = [
    'Smiley Sans Oblique',
    'LXGW WenKai',
    'MiSans',
    'Alimama DongFang DaKai',
    'Source Han Sans SC VF',
    'Source Han Serif SC VF',
    'Yozai',
    'Slideyouran'
  ];

  let allIconNames = [];
  const svgCache = {};

  async function fetchIconSVG(iconName) {
    if (svgCache[iconName]) return svgCache[iconName];
    try {
      const url = `https://api.iconify.design/icon-park/${iconName}.svg`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const text = await res.text();
      svgCache[iconName] = text;
      return text;
    } catch (e) {
      return null;
    }
  }

  function recolorSVG(svgText, color) {
    let svg = svgText;
    svg = svg.replace(/fill="[^"]*"/g, '');
    if (svg.includes('<svg')) {
      svg = svg.replace('<svg', `<svg fill="${color}"`);
    }
    if (!svg.includes('xmlns=')) {
      svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return svg;
  }

  function svgTextToImage(svgText) {
    return new Promise((resolve) => {
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  async function loadIconList() {
    const grid = document.getElementById('iconfontGrid');
    if (grid) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#888;font-size:12px;">⏳ 正在加载 2600+ 图标...</div>';
    }
    try {
      const res = await fetch('https://api.iconify.design/collection?prefix=icon-park');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      
      let names = [];
      if (data.uncategorized) names = names.concat(data.uncategorized);
      if (data.categories) {
        Object.values(data.categories).forEach(cat => {
          if (Array.isArray(cat)) names = names.concat(cat);
        });
      }
      
      allIconNames = [...new Set(names)];
      console.log('✅ 加载', allIconNames.length, '个 IconPark 图标');
      setStatus(`✅ 成功加载 ${allIconNames.length} 个图标`, 5000);
      return allIconNames.length;
      
    } catch (e) {
      console.warn('动态加载失败', e);
      allIconNames = [];
      if (grid) {
        grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:20px;color:#ff4444;font-size:12px;">
          ❌ 图标列表加载失败<br>
          <span style="color:#888;font-size:11px;">${e.message}</span><br><br>
          <button onclick="location.reload()" style="padding:8px 16px;background:#e94560;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">🔄 刷新重试</button>
        </div>`;
      }
      setStatus(`❌ 图标加载失败: ${e.message}`, 8000);
      return 0;
    }
  }

  const SCHEME_PRESETS = [
    { name: '红金星', emoji: '★', shape: 'star', iconBg: '#e94560', iconTextColor: '#ffffff', brandColor: '#e94560', sloganColor: '#f5a623', exportBg: '#ffffff', cornerRadius: 30 },
    { name: '蜜你猫', emoji: '🐱', shape: 'rounded', iconBg: '#e94560', iconTextColor: '#ffffff', brandColor: '#ffffff', sloganColor: '#ffffff', exportBg: '#e94560', cornerRadius: 60 },
    { name: '星弧', emoji: '⭐', shape: 'star', iconBg: '#e94560', iconTextColor: '#f5c542', brandColor: '#e94560', sloganColor: '#f5a623', exportBg: 'transparent', cornerRadius: 30 },
    { name: '科技蓝', emoji: '🚀', shape: 'circle', iconBg: '#0066ff', iconTextColor: '#ffffff', brandColor: '#0066ff', sloganColor: '#66a3ff', exportBg: '#ffffff', cornerRadius: 50 },
    { name: '活力橙', emoji: '🔥', shape: 'rounded', iconBg: '#ff6b35', iconTextColor: '#ffffff', brandColor: '#ff6b35', sloganColor: '#ffa07a', exportBg: '#fff8f0', cornerRadius: 40 },
    { name: '自然绿', emoji: '🌿', shape: 'circle', iconBg: '#2ecc71', iconTextColor: '#ffffff', brandColor: '#2ecc71', sloganColor: '#7dcea0', exportBg: '#f0f9f4', cornerRadius: 50 },
    { name: '奢华黑金', emoji: '👑', shape: 'circle', iconBg: '#1a1a1a', iconTextColor: '#d4af37', brandColor: '#1a1a1a', sloganColor: '#8b7355', exportBg: '#faf8f5', cornerRadius: 50 },
    { name: '少女粉', emoji: '🌸', shape: 'circle', iconBg: '#ff69b4', iconTextColor: '#ffffff', brandColor: '#ff69b4', sloganColor: '#ffb6d9', exportBg: '#fff0f5', cornerRadius: 50 },
    { name: '学院蓝', emoji: '📚', shape: 'rounded', iconBg: '#0f3460', iconTextColor: '#ffffff', brandColor: '#0f3460', sloganColor: '#7a9cc6', exportBg: '#faf8f0', cornerRadius: 20 },
    { name: '电光紫', emoji: '⚡', shape: 'rounded', iconBg: '#8e44ad', iconTextColor: '#f1c40f', brandColor: '#8e44ad', sloganColor: '#c39bd3', exportBg: '#2c2c54', cornerRadius: 40 },
    { name: '海洋蓝', emoji: '🌊', shape: 'circle', iconBg: '#1abc9c', iconTextColor: '#ffffff', brandColor: '#1abc9c', sloganColor: '#48c9b0', exportBg: '#e8f8f5', cornerRadius: 50 },
    { name: '酒红金', emoji: '🍷', shape: 'rounded', iconBg: '#8b0000', iconTextColor: '#d4af37', brandColor: '#8b0000', sloganColor: '#b8860b', exportBg: '#faf8f5', cornerRadius: 30 }
  ];

  const LAYOUT_TEMPLATES = [
    { name: '上下居中', preview: { iconX: 50, iconY: 35, iconSize: 30, textX: 50, textY: 68, textW: 40, textH: 6 },
      apply: { textPosition: 'bottom', iconSizeRatio: 55, paddingRatio: 10, iconTextGap: 10, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: -5 } },
    { name: '左图右文', preview: { iconX: 25, iconY: 50, iconSize: 35, textX: 62, textY: 45, textW: 40, textH: 6, textY2: 58, textH2: 4 },
      apply: { textPosition: 'right', iconSizeRatio: 55, paddingRatio: 8, iconTextGap: 5, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: 0 } },
    { name: '上图下文', preview: { iconX: 50, iconY: 30, iconSize: 35, textX: 50, textY: 75, textW: 40, textH: 6 },
      apply: { textPosition: 'bottom', iconSizeRatio: 50, paddingRatio: 10, iconTextGap: 15, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: -10 } },
    { name: '紧凑型', preview: { iconX: 50, iconY: 40, iconSize: 35, textX: 50, textY: 72, textW: 40, textH: 6 },
      apply: { textPosition: 'bottom', iconSizeRatio: 60, paddingRatio: 8, iconTextGap: -5, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: 0 } },
    { name: '对角式', preview: { iconX: 25, iconY: 25, iconSize: 25, textX: 75, textY: 75, textW: 35, textH: 6 },
      apply: { textPosition: 'bottom', iconSizeRatio: 40, paddingRatio: 10, iconTextGap: 5, textOffsetX: 30, textOffsetY: 25, iconOffsetX: -30, iconOffsetY: -30 } },
    { name: '居中大图标', preview: { iconX: 50, iconY: 50, iconSize: 55 },
      apply: { textPosition: 'none', iconSizeRatio: 75, paddingRatio: 8, iconTextGap: 0, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: 0 } },
    { name: '底部图标', preview: { iconX: 50, iconY: 70, iconSize: 35, textX: 50, textY: 25, textW: 40, textH: 6 },
      apply: { textPosition: 'top', iconSizeRatio: 50, paddingRatio: 10, iconTextGap: 10, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: 5 } },
    { name: '右图左文', preview: { iconX: 75, iconY: 50, iconSize: 35, textX: 38, textY: 45, textW: 40, textH: 6, textY2: 58, textH2: 4 },
      apply: { textPosition: 'left', iconSizeRatio: 55, paddingRatio: 8, iconTextGap: 5, textOffsetX: 0, textOffsetY: 0, iconOffsetX: 0, iconOffsetY: 0 } }
  ];

  const EMOJIS = [
    '🔥','⭐','💎','🚀','💡','🎯','🎨','⚡','🌟','💫',
    '🌙','☀️','⛰️','🌊','🌿','🍀','🌸','🌺','🦋','🐝',
    '🦁','🐯','🐺','🦊','🐼','🐨','🐸','🦄','🐙','🐳',
    '📱','💻','⌚','🎧','📷','🎮','🏆','🎁','📚','✏️',
    '🔧','⚙️','🔑','🔒','💰','💳','🏠','🚗','✈️','🍕'
  ];

  const SCHEMES = [
    { icon: '#ffffff', bg: '#e94560', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#0f3460', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#00b894', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#1a1a1a', bg: '#f39c12', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#8e44ad', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#2c3e50', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#e74c3c', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#16a085', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#3498db', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#d35400', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#c0392b', brand: '#ffffff', slogan: '#ffffff' },
    { icon: '#ffffff', bg: '#2ecc71', brand: '#ffffff', slogan: '#ffffff' }
  ];

  const state = {
    shape: 'none',
    iconType: 'text',
    iconText: 'A',
    iconfontName: null,
    iconfontImage: null,
    emoji: '',
    iconImage: null,
    brandName: 'ABC',
    brandSlogan: 'Design Studio',
    textPosition: 'bottom',
    iconTextColor: '#ffffff',
    iconBg: '#e94560',
    brandColor: '#ffffff',
    sloganColor: '#ffffff',
    exportBg: 'transparent',
    customBgColor: '#ffffff',
    iconSizeRatio: 70,
    cornerRadius: 30,
    iconFontRatio: 55,
    shadowStrength: 5,
    nameFontRatio: 110,
    sloganFontRatio: 55,
    fontWeight: 'bold',
    fontFamily: '"PingFang SC", "Microsoft YaHei", Arial, sans-serif',
    textGap: 5,
    sloganOpacity: 70,
    paddingRatio: 8,
    iconTextGap: 2,
    textOffsetY: 0,
    textOffsetX: 0,
    iconOffsetX: 0,
    iconOffsetY: 0,
    previewSize: 300
  };

  const mainPreview = document.getElementById('logoPreviewMain');
  const statusBar = document.getElementById('statusBar');

  function hexToRgb(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, parseInt(r) || 0));
    g = Math.max(0, Math.min(255, parseInt(g) || 0));
    b = Math.max(0, Math.min(255, parseInt(b) || 0));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function setStatus(msg, duration) {
    statusBar.textContent = msg;
    clearTimeout(statusBar._timer);
    statusBar._timer = setTimeout(() => { 
      statusBar.textContent = '就绪 · 点击面板标题可折叠/展开'; 
    }, duration || 3000);
  }

  async function init() {
    renderLayoutTemplates();
    renderSchemePresets();
    renderShapes();
    renderEmojis();
    renderSchemes();
    bindFold();
    bindSliders();
    bindColorControls();
    bindEvents();
    renderAll();
    updateCurrentIconLabel();
    
    await loadIconList();
    renderIconfontIcons();
  }

  function renderLayoutTemplates() {
    const grid = document.getElementById('layoutGrid');
    grid.innerHTML = '';
    
    LAYOUT_TEMPLATES.forEach((tpl, index) => {
      const div = document.createElement('div');
      div.className = 'layout-item';
      div.dataset.index = index;
      
      const preview = document.createElement('div');
      preview.className = 'layout-preview';
      
      const p = tpl.preview;
      if (p.iconSize) {
        const icon = document.createElement('div');
        icon.className = 'lp-icon';
        icon.style.left = p.iconX + '%';
        icon.style.top = p.iconY + '%';
        icon.style.width = p.iconSize + '%';
        icon.style.height = p.iconSize + '%';
        icon.style.transform = 'translate(-50%, -50%)';
        icon.textContent = 'A';
        preview.appendChild(icon);
      }
      
      const text = document.createElement('div');
      text.className = 'lp-text';
      text.style.left = p.textX + '%';
      text.style.top = p.textY + '%';
      text.style.width = p.textW + '%';
      text.style.height = p.textH + '%';
      text.style.transform = 'translate(-50%, -50%)';
      preview.appendChild(text);
      
      if (p.textY2 && p.textW) {
        const text2 = document.createElement('div');
        text2.className = 'lp-text';
        text2.style.left = p.textX + '%';
        text2.style.top = p.textY2 + '%';
        text2.style.width = (p.textW * 0.7) + '%';
        text2.style.height = p.textH2 + '%';
        text2.style.transform = 'translate(-50%, -50%)';
        text2.style.background = '#666';
        preview.appendChild(text2);
      }
      
      const name = document.createElement('div');
      name.className = 'layout-name';
      name.textContent = tpl.name;
      
      div.appendChild(preview);
      div.appendChild(name);
      
      div.onclick = () => applyLayoutTemplate(index, div);
      grid.appendChild(div);
    });
  }

  function applyLayoutTemplate(index, element) {
    const tpl = LAYOUT_TEMPLATES[index];
    const apply = tpl.apply;
    
    Object.keys(apply).forEach(key => {
      if (key === 'textPosition') {
        state.textPosition = apply[key];
        const tpEl = document.getElementById('textPosition');
        if (tpEl) tpEl.value = apply[key];
      } else {
        state[key] = apply[key];
        const el = document.getElementById(key);
        if (el) {
          el.value = apply[key];
          const valEl = document.getElementById(key + 'Val');
          if (valEl) {
            const suffix = (key.includes('Ratio') || key.includes('Opacity')) ? '%' : '';
            valEl.textContent = apply[key] + suffix;
          }
        }
      }
    });
    
    renderAll();
    
    document.querySelectorAll('.layout-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    
    setStatus(`✅ 已应用排版：${tpl.name}`);
  }

  function renderSchemePresets() {
    const grid = document.getElementById('presetGrid');
    grid.innerHTML = '';
    
    SCHEME_PRESETS.forEach((preset, index) => {
      const div = document.createElement('div');
      div.className = 'preset-item';
      div.dataset.index = index;
      
      const preview = document.createElement('div');
      preview.className = 'preset-preview';
      preview.style.background = preset.exportBg === 'transparent' ? '#f0f0f0' : preset.exportBg;
      
      const shape = document.createElement('div');
      shape.className = 'preset-shape';
      shape.style.background = preset.iconBg;
      shape.style.color = preset.iconTextColor;
      
      if (preset.shape === 'circle') shape.style.borderRadius = '50%';
      else if (preset.shape === 'rounded') shape.style.borderRadius = '20%';
      else if (preset.shape === 'square') shape.style.borderRadius = '0';
      else if (preset.shape === 'diamond') shape.style.transform = 'rotate(45deg)';
      else if (preset.shape === 'hexagon') shape.style.clipPath = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
      else if (preset.shape === 'star') shape.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      
      shape.textContent = preset.emoji;
      
      if (preset.shape === 'diamond') {
        const span = document.createElement('span');
        span.textContent = preset.emoji;
        span.style.transform = 'rotate(-45deg)';
        span.style.display = 'inline-block';
        shape.textContent = '';
        shape.appendChild(span);
      }
      
      const text = document.createElement('div');
      text.className = 'preset-text';
      text.style.color = preset.brandColor;
      text.textContent = 'ABC';
      
      preview.appendChild(shape);
      preview.appendChild(text);
      
      const name = document.createElement('div');
      name.className = 'preset-name';
      name.textContent = preset.name;
      
      div.appendChild(preview);
      div.appendChild(name);
      
      div.onclick = () => applySchemePreset(index, div);
      grid.appendChild(div);
    });
  }

  function applySchemePreset(index, element) {
    const preset = SCHEME_PRESETS[index];
    
    state.shape = preset.shape;
    state.iconBg = preset.iconBg;
    state.iconTextColor = preset.iconTextColor;
    state.brandColor = preset.brandColor;
    state.sloganColor = preset.sloganColor;
    state.exportBg = preset.exportBg;
    state.cornerRadius = preset.cornerRadius;
    
    state.iconType = 'emoji';
    state.emoji = preset.emoji;
    state.iconText = '';
    state.iconfontName = null;
    state.iconfontImage = null;
    state.iconImage = null;
    const iconTextEl = document.getElementById('iconText');
    if (iconTextEl) iconTextEl.value = '';
    
    const bgEl = document.getElementById('exportBg');
    if (bgEl) bgEl.value = preset.exportBg;
    const cornerEl = document.getElementById('cornerRadius');
    if (cornerEl) {
      cornerEl.value = preset.cornerRadius;
      const cornerValEl = document.getElementById('cornerRadiusVal');
      if (cornerValEl) cornerValEl.textContent = preset.cornerRadius;
    }
    document.querySelectorAll('.shape-item').forEach(el => {
      el.classList.toggle('active', el.dataset.shape === preset.shape);
    });
    
    updateAllColorControls();
    renderEmojis();
    updateCurrentIconLabel();
    renderAll();
    
    document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
    if (element) element.classList.add('active');
    
    setStatus(`✅ 已应用风格：${preset.name}`);
  }

  function bindFold() {
    document.querySelectorAll('.panel-section > h3').forEach(h3 => {
      const content = h3.nextElementSibling;
      if (!content || !content.classList.contains('content')) return;
      const toggle = h3.querySelector('.toggle');
      content.classList.add('open');
      if (toggle) toggle.classList.add('open');
      h3.onclick = function() {
        content.classList.toggle('open');
        if (toggle) toggle.classList.toggle('open');
      };
    });
  }

  function bindColorControls() {
    document.querySelectorAll('.color-control').forEach(control => {
      const key = control.dataset.colorKey;
      if (!key) return;
      
      const picker = control.querySelector('.color-picker');
      const hexInput = control.querySelector('.color-hex');
      const rInput = control.querySelector('.rgb-inputs .r');
      const gInput = control.querySelector('.rgb-inputs .g');
      const bInput = control.querySelector('.rgb-inputs .b');
      const hexWrapper = control.querySelector('.hex-input-wrapper');
      const rgbWrapper = control.querySelector('.rgb-inputs');
      const tabs = control.querySelectorAll('.color-tab');
      
      if (!picker || !hexInput) return;
      if (!state[key]) state[key] = '#ffffff';
      
      picker.value = state[key];
      hexInput.value = state[key];
      const rgb = hexToRgb(state[key]);
      if (rInput) rInput.value = rgb.r;
      if (gInput) gInput.value = rgb.g;
      if (bInput) bInput.value = rgb.b;
      
      tabs.forEach(tab => {
        tab.onclick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          if (tab.dataset.mode === 'rgb') {
            if (hexWrapper) hexWrapper.classList.add('hidden');
            if (rgbWrapper) rgbWrapper.classList.add('active');
          } else {
            if (hexWrapper) hexWrapper.classList.remove('hidden');
            if (rgbWrapper) rgbWrapper.classList.remove('active');
          }
        };
      });
      
      picker.addEventListener('input', function() {
        updateColorFromHex(key, picker.value, control);
      });
      
      hexInput.addEventListener('input', function() {
        let val = hexInput.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
          updateColorFromHex(key, val, control);
        }
      });
      
      function handleRGBInput() {
        const r = parseInt(rInput.value) || 0;
        const g = parseInt(gInput.value) || 0;
        const b = parseInt(bInput.value) || 0;
        const hex = rgbToHex(r, g, b);
        picker.value = hex;
        hexInput.value = hex;
        state[key] = hex;
        onColorChange(key);
        renderAll();
      }
      
      if (rInput) rInput.addEventListener('input', handleRGBInput);
      if (gInput) gInput.addEventListener('input', handleRGBInput);
      if (bInput) bInput.addEventListener('input', handleRGBInput);
    });
  }

  function updateColorFromHex(key, hex, control) {
    state[key] = hex;
    const picker = control.querySelector('.color-picker');
    const hexInput = control.querySelector('.color-hex');
    const rInput = control.querySelector('.rgb-inputs .r');
    const gInput = control.querySelector('.rgb-inputs .g');
    const bInput = control.querySelector('.rgb-inputs .b');
    
    if (picker) picker.value = hex;
    if (hexInput) hexInput.value = hex;
    const rgb = hexToRgb(hex);
    if (rInput) rInput.value = rgb.r;
    if (gInput) gInput.value = rgb.g;
    if (bInput) bInput.value = rgb.b;
    
    onColorChange(key);
    renderAll();
  }

  function onColorChange(key) {
    if (key === 'iconTextColor' && state.iconfontName) {
      loadIconparkImage(state.iconfontName, state.iconTextColor);
    }
  }

  function updateAllColorControls() {
    document.querySelectorAll('.color-control').forEach(control => {
      const key = control.dataset.colorKey;
      if (!key || !state[key]) return;
      const picker = control.querySelector('.color-picker');
      const hexInput = control.querySelector('.color-hex');
      const rInput = control.querySelector('.rgb-inputs .r');
      const gInput = control.querySelector('.rgb-inputs .g');
      const bInput = control.querySelector('.rgb-inputs .b');
      if (picker) picker.value = state[key];
      if (hexInput) hexInput.value = state[key];
      const rgb = hexToRgb(state[key]);
      if (rInput) rInput.value = rgb.r;
      if (gInput) gInput.value = rgb.g;
      if (bInput) bInput.value = rgb.b;
    });
  }

  function bindSliders() {
    const rangeIds = ['iconSizeRatio', 'cornerRadius', 'iconFontRatio', 'shadowStrength',
      'nameFontRatio', 'sloganFontRatio', 'textGap', 'sloganOpacity',
      'paddingRatio', 'iconTextGap', 'textOffsetY', 'textOffsetX',
      'iconOffsetX', 'iconOffsetY'];
    
    rangeIds.forEach(id => {
      const input = document.getElementById(id);
      if (!input) return;
      input.addEventListener('input', function(e) {
        state[id] = parseFloat(e.target.value);
        const valEl = document.getElementById(id + 'Val');
        if (valEl) {
          const suffix = (id.includes('Ratio') || id.includes('Opacity')) ? '%' : '';
          valEl.textContent = state[id] + suffix;
        }
        renderAll();
      });
    });
  }

  function renderShapes() {
    document.querySelectorAll('.shape-item').forEach(el => {
      el.onclick = () => {
        document.querySelectorAll('.shape-item').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        state.shape = el.dataset.shape;
        renderAll();
      };
    });
  }

  async function renderIconfontIcons(keyword) {
    const grid = document.getElementById('iconfontGrid');
    grid.innerHTML = '';
    
    if (allIconNames.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#888;font-size:12px;">' +
        '图标列表未加载<br>' +
        '<button onclick="location.reload()" style="margin-top:10px;padding:6px 12px;background:#e94560;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">🔄 刷新重试</button>' +
        '</div>';
      const countEl = document.getElementById('iconCount');
      if (countEl) countEl.textContent = '0';
      return;
    }
    
    const list = allIconNames;
    const kw = (keyword || '').toLowerCase().trim();
    const filtered = kw 
      ? list.filter(name => name.toLowerCase().includes(kw))
      : list;
    
    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:20px; color:#888; font-size:12px;">没有找到匹配的图标</div>';
      const countEl = document.getElementById('iconCount');
      if (countEl) countEl.textContent = '0';
      return;
    }
    
    const displayList = kw ? filtered.slice(0, 500) : filtered.slice(0, 300);
    
    const countEl = document.getElementById('iconCount');
    if (countEl) {
      if (kw) {
        countEl.textContent = filtered.length;
      } else {
        countEl.textContent = displayList.length + ' / ' + filtered.length;
      }
    }
    
    const items = [];
    displayList.forEach(name => {
      const div = document.createElement('div');
      div.className = 'iconfont-item';
      div.title = name;
      div.dataset.iconName = name;
      div.onclick = () => selectIconparkIcon(name, div);
      div.innerHTML = '<span style="color:#555;font-size:10px;">·</span>';
      grid.appendChild(div);
      items.push({ el: div, name: name });
    });
    
    const batchSize = 20;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item) => {
        try {
          const svgText = await fetchIconSVG(item.name);
          if (svgText) {
            const whiteSvg = recolorSVG(svgText, '#ffffff');
            item.el.innerHTML = whiteSvg;
          } else {
            item.el.innerHTML = '<span style="color:#555;font-size:10px;">?</span>';
          }
        } catch (e) {
          item.el.innerHTML = '<span style="color:#555;font-size:10px;">?</span>';
        }
      }));
    }
  }

  async function selectIconparkIcon(iconName, element) {
    state.iconType = 'iconfont';
    state.iconfontName = iconName;
    state.iconText = '';
    state.emoji = '';
    state.iconImage = null;
    
    const iconTextEl = document.getElementById('iconText');
    if (iconTextEl) iconTextEl.value = '';
    document.querySelectorAll('.iconfont-item').forEach(x => x.classList.remove('active'));
    if (element) element.classList.add('active');
    document.querySelectorAll('.emoji-item').forEach(x => x.classList.remove('active'));
    
    setStatus('⏳ 加载图标...');
    await loadIconparkImage(iconName, state.iconTextColor);
  }

  async function loadIconparkImage(iconName, color) {
    try {
      const svgText = await fetchIconSVG(iconName);
      if (!svgText) {
        setStatus(`❌ 图标 "${iconName}" 不存在`);
        return;
      }
      
      const coloredSvg = recolorSVG(svgText, color);
      const img = await svgTextToImage(coloredSvg);
      
      if (img) {
        state.iconfontImage = img;
        updateCurrentIconLabel();
        renderAll();
        setStatus(`✅ 已选择图标：${iconName}`);
      } else {
        setStatus(`❌ 图标 "${iconName}" 转换失败`);
      }
    } catch (e) {
      console.warn('图标加载失败', e);
      setStatus(`❌ 图标 "${iconName}" 加载失败`);
    }
  }

  function renderEmojis() {
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = '';
    EMOJIS.forEach(emoji => {
      const div = document.createElement('div');
      div.className = 'emoji-item' + (emoji === state.emoji ? ' active' : '');
      div.textContent = emoji;
      div.onclick = () => {
        state.iconType = 'emoji';
        state.emoji = emoji;
        state.iconText = '';
        state.iconfontName = null;
        state.iconfontImage = null;
        state.iconImage = null;
        const iconTextEl = document.getElementById('iconText');
        if (iconTextEl) iconTextEl.value = '';
        document.querySelectorAll('.iconfont-item').forEach(x => x.classList.remove('active'));
        renderEmojis();
        updateCurrentIconLabel();
        renderAll();
      };
      grid.appendChild(div);
    });
  }

  function renderSchemes() {
    const grid = document.getElementById('colorSchemes');
    grid.innerHTML = '';
    SCHEMES.forEach(scheme => {
      const div = document.createElement('div');
      div.className = 'scheme-item';
      div.style.background = `linear-gradient(135deg, ${scheme.bg} 0%, ${scheme.bg}cc 100%)`;
      div.onclick = () => {
        state.iconTextColor = scheme.icon;
        state.iconBg = scheme.bg;
        state.brandColor = scheme.brand;
        state.sloganColor = scheme.slogan;
        updateAllColorControls();
        if (state.iconfontName) loadIconparkImage(state.iconfontName, state.iconTextColor);
        renderAll();
      };
      grid.appendChild(div);
    });
  }

  function updateCurrentIconLabel() {
    const label = document.getElementById('currentIconLabel');
    if (!label) return;
    if (state.iconType === 'iconfont' && state.iconfontName) label.textContent = `IconPark: ${state.iconfontName}`;
    else if (state.iconType === 'emoji') label.textContent = `Emoji: ${state.emoji}`;
    else if (state.iconType === 'image') label.textContent = '自定义图片';
    else label.textContent = `文字: ${state.iconText || '(空)'}`;
  }

  function renderAll() {
    renderMainPreview();
    renderSizePreviews();
  }

  function renderMainPreview() {
    mainPreview.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 600;
    canvas.style.width = state.previewSize + 'px';
    canvas.style.height = state.previewSize + 'px';
    canvas.style.borderRadius = '10px';
    drawLogo(canvas, 600, true);
    mainPreview.appendChild(canvas);
  }

  function renderSizePreviews() {
    [256, 128, 64, 32].forEach(size => {
      const canvas = document.getElementById('preview' + size);
      if (canvas) drawLogo(canvas, size, true);
    });
  }

  function drawLogo(canvas, size, showText) {
    const ctx = canvas.getContext('2d');
    const W = size;
    const H = size;
    
    ctx.clearRect(0, 0, W, H);
    
    let bgColor = state.exportBg;
    if (bgColor === 'custom') bgColor = state.customBgColor;
    if (bgColor === 'white') bgColor = '#ffffff';
    if (bgColor === 'black') bgColor = '#000000';
    
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);
    }
    
    const padding = W * (state.paddingRatio / 100);
    const hasText = showText && state.textPosition !== 'none' && (state.brandName || state.brandSlogan) && state.textPosition !== 'inside';
    const hasSlogan = state.brandSlogan && state.textPosition !== 'none' && state.textPosition !== 'inside';
    
    const gap = W * (state.iconTextGap / 100);
    const nameFontSize = W * (state.nameFontRatio / 1000);
    const sloganFontSize = W * (state.sloganFontRatio / 1000);
    const textBlockHeight = hasSlogan ? nameFontSize * 1.1 + sloganFontSize * 1.2 : nameFontSize * 1.2;
    
    let iconArea = { x: padding, y: padding, w: W - padding*2, h: H - padding*2 };
    let textArea = null;
    let iconSquareSize = W * (state.iconSizeRatio / 100);
    
    if (!showText) {
      iconSquareSize = Math.min(iconSquareSize, W - padding*2, H - padding*2);
      const iconX = (W - iconSquareSize) / 2 + (state.iconOffsetX / 500) * W;
      const iconY = (H - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX, y: iconY, w: iconSquareSize, h: iconSquareSize };
    } else if (state.textPosition === 'bottom' && hasText) {
      const availableH = H - padding*2 - textBlockHeight - gap;
      iconSquareSize = Math.min(iconSquareSize, W - padding*2, availableH);
      const iconX = (W - iconSquareSize) / 2;
      const iconY = padding + (availableH - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX + (state.iconOffsetX / 500) * W, y: iconY, w: iconSquareSize, h: iconSquareSize };
      const textY = H - padding - textBlockHeight + (state.textOffsetY / 500) * H;
      textArea = { x: (state.textOffsetX / 500) * W, y: textY, w: W, h: textBlockHeight };
    } else if (state.textPosition === 'top' && hasText) {
      const availableH = H - padding*2 - textBlockHeight - gap;
      iconSquareSize = Math.min(iconSquareSize, W - padding*2, availableH);
      const iconX = (W - iconSquareSize) / 2;
      const iconY = padding + textBlockHeight + gap + (availableH - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX + (state.iconOffsetX / 500) * W, y: iconY, w: iconSquareSize, h: iconSquareSize };
      const textY = padding + (state.textOffsetY / 500) * H;
      textArea = { x: (state.textOffsetX / 500) * W, y: textY, w: W, h: textBlockHeight };
    } else if (state.textPosition === 'right' && hasText) {
      const maxIconSize = Math.min(H - padding*2, (W - padding*2) * 0.5);
      iconSquareSize = Math.min(iconSquareSize, maxIconSize);
      const iconX = padding + (state.iconOffsetX / 500) * W;
      const iconY = (H - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX, y: iconY, w: iconSquareSize, h: iconSquareSize };
      const textX = iconX + iconSquareSize + gap;
      const textW = W - textX - padding;
      textArea = { x: textX + (state.textOffsetX / 500) * W, y: (state.textOffsetY / 500) * H, w: textW, h: H };
    } else if (state.textPosition === 'left' && hasText) {
      const maxIconSize = Math.min(H - padding*2, (W - padding*2) * 0.5);
      iconSquareSize = Math.min(iconSquareSize, maxIconSize);
      const iconX = W - padding - iconSquareSize + (state.iconOffsetX / 500) * W;
      const iconY = (H - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX, y: iconY, w: iconSquareSize, h: iconSquareSize };
      const textX = padding;
      const textW = iconX - padding - gap;
      textArea = { x: textX + (state.textOffsetX / 500) * W, y: (state.textOffsetY / 500) * H, w: textW, h: H };
    } else if (state.textPosition === 'inside') {
      iconSquareSize = Math.min(iconSquareSize, W - padding*2, H - padding*2);
      const iconX = (W - iconSquareSize) / 2 + (state.iconOffsetX / 500) * W;
      const iconY = (H - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX, y: iconY, w: iconSquareSize, h: iconSquareSize };
      textArea = iconArea;
    } else {
      iconSquareSize = Math.min(iconSquareSize, W - padding*2, H - padding*2);
      const iconX = (W - iconSquareSize) / 2 + (state.iconOffsetX / 500) * W;
      const iconY = (H - iconSquareSize) / 2 + (state.iconOffsetY / 500) * H;
      iconArea = { x: iconX, y: iconY, w: iconSquareSize, h: iconSquareSize };
    }
    
    if (state.textPosition !== 'inside' || !showText) {
      drawIconShape(ctx, iconArea, size);
    }
    drawIconContent(ctx, iconArea, size);
    
    if (showText && textArea && state.textPosition !== 'inside' && state.textPosition !== 'none') {
      drawText(ctx, textArea, size, hasSlogan);
    } else if (showText && state.textPosition === 'inside') {
      drawTextInside(ctx, iconArea, size, hasSlogan);
    }
  }

  function drawIconShape(ctx, area, size) {
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const r = Math.min(area.w, area.h) / 2;
    ctx.save();
    if (state.shadowStrength > 0) {
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = (state.shadowStrength / 100) * size * 0.5;
      ctx.shadowOffsetY = (state.shadowStrength / 100) * size * 0.1;
    }
    const gradient = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    gradient.addColorStop(0, state.iconBg);
    gradient.addColorStop(1, adjustColor(state.iconBg, 20));
    ctx.fillStyle = gradient;
    
    if (state.shape === 'circle') {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    } else if (state.shape === 'rounded') {
      roundRect(ctx, cx - r, cy - r, r*2, r*2, (state.cornerRadius / 100) * r); ctx.fill();
    } else if (state.shape === 'square') {
      ctx.fillRect(cx - r, cy - r, r*2, r*2);
    } else if (state.shape === 'hexagon') {
      drawPolygon(ctx, cx, cy, r, 6); ctx.fill();
    } else if (state.shape === 'diamond') {
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.fill();
    } else if (state.shape === 'shield') {
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy - r*0.6); ctx.lineTo(cx + r, cy + r*0.2); ctx.quadraticCurveTo(cx + r, cy + r, cx, cy + r); ctx.quadraticCurveTo(cx - r, cy + r, cx - r, cy + r*0.2); ctx.lineTo(cx - r, cy - r*0.6); ctx.closePath(); ctx.fill();
    } else if (state.shape === 'star') {
      drawStar(ctx, cx, cy, 5, r, r*0.4); ctx.fill();
    }
    ctx.restore();
  }

  function drawIconContent(ctx, area, size) {
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const r = Math.min(area.w, area.h) / 2;
    
    if (state.iconType === 'image' && state.iconImage) {
      const imgSize = r * 1.3;
      ctx.save();
      if (state.shape === 'circle') {
        ctx.beginPath(); ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2); ctx.clip();
      }
      drawContainImage(ctx, state.iconImage, cx - imgSize/2, cy - imgSize/2, imgSize, imgSize);
      ctx.restore();
    } else if (state.iconType === 'iconfont' && state.iconfontImage) {
      const iconSize = r * (state.iconFontRatio / 45);
      ctx.drawImage(state.iconfontImage, cx - iconSize/2, cy - iconSize/2, iconSize, iconSize);
    } else if (state.iconType === 'emoji' && state.emoji) {
      const fontSize = r * (state.iconFontRatio / 50);
      ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(state.emoji, cx, cy + fontSize * 0.05);
    } else if (state.iconText) {
      const fontSize = r * (state.iconFontRatio / 50);
      ctx.font = `${state.fontWeight} ${fontSize}px ${state.fontFamily}`;
      ctx.fillStyle = state.iconTextColor;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(state.iconText, cx, cy);
    }
  }

  function drawText(ctx, area, size, hasSlogan) {
    const name = state.brandName || '';
    const slogan = state.brandSlogan || '';
    const nameFontSize = size * (state.nameFontRatio / 1000);
    const sloganFontSize = size * (state.sloganFontRatio / 1000);
    const gap = size * (state.textGap / 1000);
    
    if (state.textPosition === 'bottom' || state.textPosition === 'top') {
      const centerX = area.x + area.w / 2;
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = state.brandColor;
      ctx.font = `${state.fontWeight} ${nameFontSize}px ${state.fontFamily}`;
      ctx.fillText(name, centerX, area.y);
      if (slogan) {
        ctx.fillStyle = state.sloganColor;
        ctx.font = `normal ${sloganFontSize}px ${state.fontFamily}`;
        ctx.globalAlpha = state.sloganOpacity / 100;
        ctx.fillText(slogan, centerX, area.y + nameFontSize + gap);
        ctx.globalAlpha = 1.0;
      }
    } else if (state.textPosition === 'right' || state.textPosition === 'left') {
      const centerY = area.y + area.h / 2;
      const align = state.textPosition === 'right' ? 'left' : 'right';
      const x = state.textPosition === 'right' ? area.x : area.x + area.w;
      ctx.textAlign = align; ctx.textBaseline = 'middle';
      const totalHeight = slogan ? nameFontSize + gap + sloganFontSize : nameFontSize;
      let startY = centerY - totalHeight / 2 + nameFontSize / 2;
      ctx.fillStyle = state.brandColor;
      ctx.font = `${state.fontWeight} ${nameFontSize}px ${state.fontFamily}`;
      ctx.fillText(name, x, startY);
      if (slogan) {
        ctx.fillStyle = state.sloganColor;
        ctx.font = `normal ${sloganFontSize}px ${state.fontFamily}`;
        ctx.globalAlpha = state.sloganOpacity / 100;
        ctx.fillText(slogan, x, startY + nameFontSize / 2 + gap + sloganFontSize / 2);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  function drawTextInside(ctx, area, size, hasSlogan) {
    const name = state.brandName || '';
    const slogan = state.brandSlogan || '';
    const cx = area.x + area.w / 2;
    const cy = area.y + area.h / 2;
    const nameFontSize = size * (state.nameFontRatio / 1000);
    const sloganFontSize = size * (state.sloganFontRatio / 1000);
    const gap = size * (state.textGap / 1000);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const totalHeight = slogan ? nameFontSize + gap + sloganFontSize : nameFontSize;
    const startY = cy - totalHeight / 2 + nameFontSize / 2;
    ctx.fillStyle = state.brandColor;
    ctx.font = `${state.fontWeight} ${nameFontSize}px ${state.fontFamily}`;
    ctx.fillText(name, cx, startY);
    if (slogan) {
      ctx.fillStyle = state.sloganColor;
      ctx.font = `normal ${sloganFontSize}px ${state.fontFamily}`;
      ctx.globalAlpha = state.sloganOpacity / 100;
      ctx.fillText(slogan, cx, startY + nameFontSize / 2 + gap + sloganFontSize / 2);
      ctx.globalAlpha = 1.0;
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawPolygon(ctx, cx, cy, r, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i / sides) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI * i / spikes) - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawContainImage(ctx, img, x, y, w, h) {
    const imgRatio = img.width / img.height;
    const targetRatio = w / h;
    let dw, dh, dx, dy;
    if (imgRatio > targetRatio) {
      dw = w; dh = w / imgRatio; dx = x; dy = y + (h - dh) / 2;
    } else {
      dh = h; dw = h * imgRatio; dx = x + (w - dw) / 2; dy = y;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  }

  function bindEvents() {
    const iconSearchEl = document.getElementById('iconSearch');
    if (iconSearchEl) {
      let searchTimer = null;
      iconSearchEl.addEventListener('input', function(e) {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          renderIconfontIcons(e.target.value);
        }, 300);
      });
    }

    const iconTextEl = document.getElementById('iconText');
    if (iconTextEl) {
      iconTextEl.addEventListener('input', function(e) {
        state.iconText = e.target.value;
        if (e.target.value) {
          state.iconType = 'text';
          state.emoji = '';
          state.iconfontName = null;
          state.iconfontImage = null;
          state.iconImage = null;
          document.querySelectorAll('.iconfont-item').forEach(x => x.classList.remove('active'));
          document.querySelectorAll('.emoji-item').forEach(x => x.classList.remove('active'));
        }
        updateCurrentIconLabel();
        renderAll();
      });
    }

    const brandNameEl = document.getElementById('brandName');
    if (brandNameEl) brandNameEl.addEventListener('input', function(e) { state.brandName = e.target.value; renderAll(); });

    const brandSloganEl = document.getElementById('brandSlogan');
    if (brandSloganEl) brandSloganEl.addEventListener('input', function(e) { state.brandSlogan = e.target.value; renderAll(); });

    const textPositionEl = document.getElementById('textPosition');
    if (textPositionEl) textPositionEl.addEventListener('change', function(e) { state.textPosition = e.target.value; renderAll(); });

    const exportBgEl = document.getElementById('exportBg');
    if (exportBgEl) exportBgEl.addEventListener('change', function(e) { state.exportBg = e.target.value; renderAll(); });

    const fontWeightEl = document.getElementById('fontWeight');
    if (fontWeightEl) fontWeightEl.addEventListener('change', function(e) { state.fontWeight = e.target.value; renderAll(); });

    const fontFamilyEl = document.getElementById('fontFamily');
    if (fontFamilyEl) {
      fontFamilyEl.addEventListener('change', async function(e) {
        state.fontFamily = e.target.value;
        
        const firstFont = state.fontFamily.split(',')[0].trim().replace(/"/g, '');
        const badge = document.getElementById('fontPreviewBadge');
        const isOnline = ONLINE_FONTS.includes(firstFont);
        
        if (badge) {
          badge.textContent = isOnline ? '在线' : '系统';
        }
        
        if (isOnline) {
          setStatus(`⏳ 首次加载字体：${firstFont}...`);
          try {
            await document.fonts.load(`${state.fontWeight} 32px "${firstFont}"`);
            await document.fonts.load(`normal 32px "${firstFont}"`);
            await document.fonts.ready;
          } catch (err) {
            console.warn('字体加载超时', err);
          }
        }
        
        renderAll();
        setStatus(`✅ 已应用字体：${firstFont}`, 2000);
      });
    }

    const iconUploadEl = document.getElementById('iconUpload');
    if (iconUploadEl) {
      iconUploadEl.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          const img = new Image();
          img.onload = function() {
            state.iconType = 'image';
            state.iconImage = img;
            state.iconText = '';
            state.emoji = '';
            state.iconfontName = null;
            state.iconfontImage = null;
            const iconTextEl2 = document.getElementById('iconText');
            if (iconTextEl2) iconTextEl2.value = '';
            document.querySelectorAll('.iconfont-item').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.emoji-item').forEach(x => x.classList.remove('active'));
            updateCurrentIconLabel();
            renderAll();
            setStatus('✅ 图标已上传');
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    const downloadWithTextEl = document.getElementById('downloadWithText');
    if (downloadWithTextEl) downloadWithTextEl.onclick = function() { downloadLogo(true, false); };

    const downloadIconOnlyEl = document.getElementById('downloadIconOnly');
    if (downloadIconOnlyEl) downloadIconOnlyEl.onclick = function() { downloadLogo(false, false); };

    const downloadSizesEl = document.getElementById('downloadSizes');
    if (downloadSizesEl) downloadSizesEl.onclick = function() { downloadMultiSizes(true); };

    const downloadIconSizesEl = document.getElementById('downloadIconSizes');
    if (downloadIconSizesEl) downloadIconSizesEl.onclick = function() { downloadMultiSizes(false); };

    const downloadTransparentEl = document.getElementById('downloadTransparent');
    if (downloadTransparentEl) downloadTransparentEl.onclick = function() { downloadLogo(true, true); };

    const resetBtnEl = document.getElementById('resetBtn');
    if (resetBtnEl) resetBtnEl.onclick = reset;
  }

  function downloadLogo(showText, forceTransparent) {
    const oldBg = state.exportBg;
    if (forceTransparent) state.exportBg = 'transparent';
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    drawLogo(canvas, 1024, showText);
    if (forceTransparent) { state.exportBg = oldBg; renderAll(); }
    const timestamp = Date.now();
    const suffix = showText ? '完整' : '图标';
    const link = document.createElement('a');
    link.download = `logo_${suffix}_${state.brandName || 'brand'}_${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus(`✅ ${showText ? '完整Logo' : '图标'}已下载`);
  }

  function downloadMultiSizes(showText) {
    const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];
    const timestamp = Date.now();
    if (typeof JSZip === 'undefined') { alert('ZIP库未加载'); return; }
    const zip = new JSZip();
    const suffix = showText ? 'full' : 'icon';
    sizes.forEach(size => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      drawLogo(canvas, size, showText);
      const dataUrl = canvas.toDataURL('image/png');
      zip.file(`logo_${suffix}_${size}x${size}_${timestamp}.png`, dataUrl.split(',')[1], { base64: true });
    });
    zip.generateAsync({ type: 'blob' }).then(content => {
      const link = document.createElement('a');
      link.download = `logo_${suffix}_多尺寸_${timestamp}.zip`;
      link.href = URL.createObjectURL(content);
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus(`✅ ${showText ? '完整' : '图标'}多尺寸ZIP已下载`);
    });
  }

  function reset() {
    if (!confirm('确定重置？')) return;
    Object.assign(state, {
      shape: 'none', iconType: 'text', iconText: 'A', iconfontName: null, iconfontImage: null,
      emoji: '', iconImage: null, brandName: 'ABC', brandSlogan: 'Design Studio', textPosition: 'bottom',
      iconTextColor: '#ffffff', iconBg: '#e94560', brandColor: '#ffffff', sloganColor: '#ffffff',
      exportBg: 'transparent', customBgColor: '#ffffff',
      iconSizeRatio: 70, cornerRadius: 30, iconFontRatio: 55, shadowStrength: 5,
      nameFontRatio: 110, sloganFontRatio: 55, fontWeight: 'bold',
      fontFamily: '"PingFang SC", "Microsoft YaHei", Arial, sans-serif',
      textGap: 5, sloganOpacity: 70, paddingRatio: 8, iconTextGap: 2,
      textOffsetY: 0, textOffsetX: 0, iconOffsetX: 0, iconOffsetY: 0
    });
    
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    
    setVal('iconText', 'A');
    setVal('brandName', 'ABC');
    setVal('brandSlogan', 'Design Studio');
    setVal('textPosition', 'bottom');
    setVal('exportBg', 'transparent');
    setVal('fontWeight', 'bold');
    setVal('fontFamily', '"PingFang SC", "Microsoft YaHei", Arial, sans-serif');
    setVal('iconUpload', '');
    setVal('iconSearch', '');
    
    const badge = document.getElementById('fontPreviewBadge');
    if (badge) badge.textContent = '系统';
    
    const rangeDefaults = {
      iconSizeRatio: 70, cornerRadius: 30, iconFontRatio: 55, shadowStrength: 5,
      nameFontRatio: 110, sloganFontRatio: 55, textGap: 5, sloganOpacity: 70,
      paddingRatio: 8, iconTextGap: 2, textOffsetY: 0, textOffsetX: 0,
      iconOffsetX: 0, iconOffsetY: 0
    };
    Object.keys(rangeDefaults).forEach(id => {
      setVal(id, rangeDefaults[id]);
      const suffix = (id.includes('Ratio') || id.includes('Opacity')) ? '%' : '';
      setText(id + 'Val', rangeDefaults[id] + suffix);
    });
    
    document.querySelectorAll('.shape-item').forEach(el => {
      el.classList.toggle('active', el.dataset.shape === 'none');
    });
    document.querySelectorAll('.iconfont-item').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.emoji-item').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.layout-item').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.preset-item').forEach(x => x.classList.remove('active'));
    
    updateAllColorControls();
    renderIconfontIcons();
    renderEmojis();
    updateCurrentIconLabel();
    renderAll();
    setStatus('↺ 已重置');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();