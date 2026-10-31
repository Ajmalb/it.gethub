/**
 * TITAN IT - THE ULTIMATE ENTERPRISE IT & TROUBLESHOOTING ENCYCLOPEDIA
 * APPLICATION CONTROLLER (js/app.js)
 * Live Search, Category Filtering, Bookmarks, Modals, Tools, Wizard, & Themes
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    category: 'all',
    searchQuery: '',
    severityFilter: 'all',
    bookmarkedOnly: false,
    bookmarks: JSON.parse(localStorage.getItem('titan_it_bookmarks') || '[]'),
    theme: localStorage.getItem('titan_it_theme') || 'dark',
    wizardHistory: ['start']
  };

  // DOM Elements
  const issuesGrid = document.getElementById('issuesGrid');
  const globalSearchInput = document.getElementById('globalSearchInput');
  const categoryNav = document.getElementById('categoryNav');
  const severityFilters = document.getElementById('severityFilters');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const issueModal = document.getElementById('issueModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDetailsContainer = document.getElementById('modalDetailsContainer');
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');
  const activeCountEl = document.getElementById('activeCount');
  const totalCountEl = document.getElementById('totalCount');
  const bookmarkFilterBtn = document.getElementById('bookmarkFilterBtn');
  const emergencyCloseBtn = document.getElementById('emergencyCloseBtn');
  const emergencyBanner = document.getElementById('emergencyBanner');

  // Tools & Wizard Modals
  const wizardModal = document.getElementById('wizardModal');
  const wizardCloseBtn = document.getElementById('wizardCloseBtn');
  const wizardContainer = document.getElementById('wizardContainer');
  const openWizardBtn = document.getElementById('openWizardBtn');
  const openWizardBtnHero = document.getElementById('openWizardBtnHero');

  const toolsModal = document.getElementById('toolsModal');
  const toolsCloseBtn = document.getElementById('toolsCloseBtn');
  const openToolsBtn = document.getElementById('openToolsBtn');
  const openToolsBtnHero = document.getElementById('openToolsBtnHero');

  // Initialize Theme
  if (state.theme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon(true);
  }

  // Render Initial View
  renderCategoryNav();
  renderIssues();
  setupEventListeners();

  /* =========================================================================
     RENDERING FUNCTIONS
     ========================================================================= */

  function renderCategoryNav() {
    if (!categoryNav) return;
    categoryNav.innerHTML = '';

    IT_DATABASE.categories.forEach(cat => {
      const count = cat.id === 'all' 
        ? IT_DATABASE.issues.length 
        : IT_DATABASE.issues.filter(i => i.category === cat.id).length;

      const li = document.createElement('li');
      li.className = `category-nav-item ${state.category === cat.id ? 'active' : ''}`;
      li.dataset.category = cat.id;
      li.innerHTML = `
        <div class="category-nav-item-left">
          <span class="cat-icon">${cat.icon}</span>
          <span>${cat.name}</span>
        </div>
        <span class="cat-count">${count}</span>
      `;

      li.addEventListener('click', () => {
        state.category = cat.id;
        state.bookmarkedOnly = false;
        if (bookmarkFilterBtn) bookmarkFilterBtn.classList.remove('active');
        document.querySelectorAll('.category-nav-item').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        renderIssues();
      });

      categoryNav.appendChild(li);
    });
  }

  function getFilteredIssues() {
    return IT_DATABASE.issues.filter(issue => {
      // Category filter
      if (state.category !== 'all' && issue.category !== state.category) {
        return false;
      }

      // Severity filter
      if (state.severityFilter !== 'all' && issue.severity !== state.severityFilter) {
        return false;
      }

      // Bookmarks filter
      if (state.bookmarkedOnly && !state.bookmarks.includes(issue.id)) {
        return false;
      }

      // Search Query filter
      if (state.searchQuery.trim() !== '') {
        const q = state.searchQuery.toLowerCase();
        const inTitle = issue.title.toLowerCase().includes(q);
        const inCode = issue.errorCode.toLowerCase().includes(q);
        const inSummary = issue.summary.toLowerCase().includes(q);
        const inTags = issue.tags.some(t => t.toLowerCase().includes(q));
        const inRoot = issue.rootCause.toLowerCase().includes(q);
        if (!inTitle && !inCode && !inSummary && !inTags && !inRoot) {
          return false;
        }
      }

      return true;
    });
  }

  function renderIssues() {
    const filtered = getFilteredIssues();
    if (activeCountEl) activeCountEl.textContent = filtered.length;
    if (totalCountEl) totalCountEl.textContent = IT_DATABASE.issues.length;

    if (filtered.length === 0) {
      issuesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No matching IT issues found</h3>
          <p>Try broadening your search term or selecting another category.</p>
          <button class="btn btn-primary" id="resetFiltersBtn">Reset All Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          state.category = 'all';
          state.severityFilter = 'all';
          state.searchQuery = '';
          state.bookmarkedOnly = false;
          if (globalSearchInput) globalSearchInput.value = '';
          renderCategoryNav();
          renderIssues();
        });
      }
      return;
    }

    issuesGrid.innerHTML = filtered.map(issue => {
      const isBookmarked = state.bookmarks.includes(issue.id);
      return `
        <div class="issue-card" data-id="${issue.id}">
          <div class="card-top">
            <div class="card-badges">
              <span class="cat-tag">${issue.category.toUpperCase()}</span>
              <span class="sev-badge sev-${issue.severity}">${issue.severity}</span>
            </div>
            <button class="bookmark-btn ${isBookmarked ? 'active' : ''}" data-id="${issue.id}" title="${isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}">
              ${isBookmarked ? '★' : '☆'}
            </button>
          </div>

          <h3 class="card-title" data-id="${issue.id}">${escapeHtml(issue.title)}</h3>
          <div class="card-error-code">${escapeHtml(issue.errorCode)}</div>
          <p class="card-summary">${escapeHtml(issue.summary)}</p>

          <div class="card-quick-code">
            <code>${escapeHtml(issue.quickSnippet)}</code>
            <button class="quick-copy-icon" data-copy="${escapeHtml(issue.quickSnippet)}" title="Copy Snippet">
              📋
            </button>
          </div>

          <div class="card-footer">
            <div class="card-tags-list">
              ${issue.tags.slice(0, 3).map(tag => `<span class="tag-badge">#${escapeHtml(tag)}</span>`).join('')}
            </div>
            <button class="view-details-btn" data-id="${issue.id}">
              Detailed Fix →
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Attach Click Handlers for Cards
    attachCardListeners();
  }

  function attachCardListeners() {
    // Open Detailed Solution Modal
    document.querySelectorAll('.card-title, .view-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        openSolutionModal(id);
      });
    });

    // Bookmark Toggle
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        toggleBookmark(id);
      });
    });

    // Quick Copy Snippet
    document.querySelectorAll('.quick-copy-icon').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.copy;
        copyToClipboard(text);
      });
    });
  }

  /* =========================================================================
     MODAL DEEP-DIVE SOLUTION VIEWER
     ========================================================================= */

  function openSolutionModal(issueId) {
    const issue = IT_DATABASE.issues.find(i => i.id === issueId);
    if (!issue) return;

    const isBookmarked = state.bookmarks.includes(issue.id);

    modalDetailsContainer.innerHTML = `
      <div class="modal-header">
        <div class="modal-title-group">
          <div class="modal-meta-row" style="margin-bottom: 8px;">
            <span class="cat-tag">${issue.category.toUpperCase()}</span>
            <span class="sev-badge sev-${issue.severity}">${issue.severity.toUpperCase()}</span>
            <span class="card-error-code" style="margin-bottom: 0;">${escapeHtml(issue.errorCode)}</span>
          </div>
          <h2>${escapeHtml(issue.title)}</h2>
        </div>
        <button class="modal-close-btn" id="modalCloseInnerBtn">&times;</button>
      </div>

      <div class="modal-body">
        <!-- Root Cause & Technical Summary -->
        <div class="solution-box">
          <div class="solution-section-title">
            <i>🔍</i> Root Cause Analysis & Description
          </div>
          <p style="margin-bottom: 12px; font-size: 0.92rem; color: var(--text-main); font-weight: 500;">
            ${escapeHtml(issue.rootCause)}
          </p>
          <p style="font-size: 0.88rem; color: var(--text-muted);">
            ${escapeHtml(issue.summary)}
          </p>
        </div>

        <!-- Symptoms Checklist -->
        <div class="solution-box">
          <div class="solution-section-title">
            <i>⚠️</i> Observed Symptoms & Diagnostic Indicators
          </div>
          <ul style="list-style: disc; padding-left: 20px; font-size: 0.88rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 6px;">
            ${issue.symptoms.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
          </ul>
        </div>

        <!-- Ordered Step-by-Step Resolution -->
        <div class="solution-box">
          <div class="solution-section-title">
            <i>🛠️</i> Step-by-Step Production Resolution Procedure
          </div>
          <div class="steps-list">
            ${issue.steps.map((st, idx) => `
              <div class="step-item">
                <div class="step-number">${idx + 1}</div>
                <div class="step-content">
                  <div class="step-title">${escapeHtml(st.title)}</div>
                  <div class="step-desc">${escapeHtml(st.desc).replace(/\\n/g, '<br>')}</div>
                  ${st.code ? `
                    <div class="code-wrapper">
                      <div class="code-header">
                        <span class="code-lang-label">COMMAND / SCRIPT</span>
                        <button class="code-copy-btn" data-copy="${escapeHtml(st.code)}">
                          📋 Copy Script
                        </button>
                      </div>
                      <pre class="code-content">${escapeHtml(st.code)}</pre>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Verification Procedure -->
        <div class="alert-callout alert-callout-tip">
          <span style="font-size: 1.2rem;">✅</span>
          <div>
            <strong>How to Verify the Fix:</strong><br>
            ${escapeHtml(issue.verification)}
          </div>
        </div>

        <!-- Pro-Tip / Field Gotcha -->
        <div class="alert-callout alert-callout-warning">
          <span style="font-size: 1.2rem;">💡</span>
          <div>
            <strong>Senior Engineer Pro-Tip:</strong><br>
            ${escapeHtml(issue.proTip)}
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn btn-icon-only bookmark-btn ${isBookmarked ? 'active' : ''}" id="modalBookmarkBtn" data-id="${issue.id}" title="Toggle Bookmark">
          ${isBookmarked ? '★' : '☆'}
        </button>
        <div style="display: flex; gap: 10px;">
          <button class="btn" id="modalPrintBtn">🖨️ Print Guide</button>
          <button class="btn btn-primary" id="modalCloseFooterBtn">Done / Close</button>
        </div>
      </div>
    `;

    issueModal.classList.add('open');

    // Attach Inner Modal Handlers
    const closeInner = document.getElementById('modalCloseInnerBtn');
    const closeFooter = document.getElementById('modalCloseFooterBtn');
    const bookmarkModal = document.getElementById('modalBookmarkBtn');
    const printModal = document.getElementById('modalPrintBtn');

    if (closeInner) closeInner.addEventListener('click', closeSolutionModal);
    if (closeFooter) closeFooter.addEventListener('click', closeSolutionModal);

    if (bookmarkModal) {
      bookmarkModal.addEventListener('click', () => {
        toggleBookmark(issue.id);
        const nowBookmarked = state.bookmarks.includes(issue.id);
        bookmarkModal.innerHTML = nowBookmarked ? '★' : '☆';
        bookmarkModal.classList.toggle('active', nowBookmarked);
      });
    }

    if (printModal) {
      printModal.addEventListener('click', () => window.print());
    }

    // Modal Copy Buttons
    modalDetailsContainer.querySelectorAll('.code-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.dataset.copy;
        copyToClipboard(text);
      });
    });
  }

  function closeSolutionModal() {
    issueModal.classList.remove('open');
  }

  /* =========================================================================
     INTERACTIVE DIAGNOSTIC WIZARD
     ========================================================================= */

  function openWizard() {
    state.wizardHistory = ['start'];
    renderWizardStep('start');
    wizardModal.classList.add('open');
  }

  function closeWizard() {
    wizardModal.classList.remove('open');
  }

  function renderWizardStep(nodeKey) {
    const node = IT_WIZARD.getState(nodeKey);
    if (!node) return;

    wizardContainer.innerHTML = `
      <div class="wizard-container">
        <div class="wizard-step-indicator">
          <span class="wizard-badge">Diagnostic Step ${state.wizardHistory.length}</span>
          ${state.wizardHistory.length > 1 ? `
            <button class="btn" id="wizardBackBtn" style="padding: 3px 8px; font-size: 0.75rem;">← Back</button>
          ` : ''}
          <button class="btn" id="wizardRestartBtn" style="padding: 3px 8px; font-size: 0.75rem; margin-left: auto;">Restart</button>
        </div>

        <h3 class="wizard-question">${node.question}</h3>

        <div class="wizard-options-grid">
          ${node.options.map((opt, idx) => `
            <button class="wizard-option-btn" data-index="${idx}">
              <span>${opt.label}</span>
              <span>→</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Back & Restart Handlers
    const backBtn = document.getElementById('wizardBackBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (state.wizardHistory.length > 1) {
          state.wizardHistory.pop();
          const prev = state.wizardHistory[state.wizardHistory.length - 1];
          renderWizardStep(prev);
        }
      });
    }

    const restartBtn = document.getElementById('wizardRestartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        state.wizardHistory = ['start'];
        renderWizardStep('start');
      });
    }

    // Option Click Handlers
    wizardContainer.querySelectorAll('.wizard-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        const selected = node.options[index];

        if (selected.outcome) {
          renderWizardOutcome(selected.outcome);
        } else if (selected.next) {
          state.wizardHistory.push(selected.next);
          renderWizardStep(selected.next);
        }
      });
    });
  }

  function renderWizardOutcome(outcome) {
    wizardContainer.innerHTML = `
      <div class="wizard-container">
        <div class="wizard-step-indicator">
          <span class="wizard-badge" style="background: var(--accent-emerald);">Diagnosis Complete</span>
          <button class="btn" id="wizardRestartBtn" style="padding: 3px 8px; font-size: 0.75rem; margin-left: auto;">Start New Diagnosis</button>
        </div>

        <div class="wizard-outcome-card">
          <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--accent-emerald); margin-bottom: 8px;">
            ${escapeHtml(outcome.title)}
          </h3>
          <p style="font-size: 0.92rem; color: var(--text-main); margin-bottom: 16px;">
            ${escapeHtml(outcome.summary)}
          </p>

          <div style="margin-bottom: 16px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px;">
              Recommended First-Action Command:
            </div>
            <div class="card-quick-code">
              <code>${escapeHtml(outcome.quickCommand)}</code>
              <button class="quick-copy-icon" id="wizardCopyCommand" data-copy="${escapeHtml(outcome.quickCommand)}" title="Copy Command">
                📋
              </button>
            </div>
          </div>

          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" id="wizardJumpToIssueBtn" data-id="${outcome.issueId}">
              Open Full Step-by-Step Resolution Guide →
            </button>
          </div>
        </div>
      </div>
    `;

    const restartBtn = document.getElementById('wizardRestartBtn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        state.wizardHistory = ['start'];
        renderWizardStep('start');
      });
    }

    const jumpBtn = document.getElementById('wizardJumpToIssueBtn');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        closeWizard();
        openSolutionModal(outcome.issueId);
      });
    }

    const copyCmdBtn = document.getElementById('wizardCopyCommand');
    if (copyCmdBtn) {
      copyCmdBtn.addEventListener('click', () => {
        copyToClipboard(copyCmdBtn.dataset.copy);
      });
    }
  }

  /* =========================================================================
     INTERACTIVE TOOLS: SUBNET CALC & BATCH GENERATOR
     ========================================================================= */

  function openTools() {
    renderToolsView();
    toolsModal.classList.add('open');
  }

  function closeTools() {
    toolsModal.classList.remove('open');
  }

  function renderToolsView() {
    const container = document.getElementById('toolsContainer');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 28px;">
        
        <!-- TOOL 1: IPv4 SUBNET CALCULATOR -->
        <div class="solution-box">
          <div class="solution-section-title">
            <i>🌐</i> Enterprise IPv4 Subnet Calculator
          </div>
          <div class="tool-grid">
            <div class="tool-form-group">
              <label class="tool-label">Host / Network IP Address</label>
              <input type="text" class="tool-input" id="subnetIpInput" value="192.168.1.150" placeholder="e.g. 10.0.4.1">
            </div>
            <div class="tool-form-group">
              <label class="tool-label">Subnet Mask / CIDR Prefix</label>
              <select class="tool-select" id="subnetCidrSelect">
                ${Array.from({ length: 24 }, (_, i) => i + 8).map(cidr => `
                  <option value="${cidr}" ${cidr === 24 ? 'selected' : ''}>/${cidr}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div id="subnetResultsBox"></div>
        </div>

        <!-- TOOL 2: ONE-CLICK BATCH REPAIR SCRIPT GENERATOR -->
        <div class="solution-box">
          <div class="solution-section-title">
            <i>⚙️</i> Automated Windows Workstation Repair Script Generator
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
            Select desired repair actions to generate an elevated .bat script for helpdesk automation:
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genFlushDns" checked> Flush & Register DNS Cache
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genDhcpRenew" checked> Release & Renew DHCP Leases
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genResetWinsock" checked> Reset Winsock & TCP/IP v4/v6
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genClearArp" checked> Flush ARP & NetBIOS Tables
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genFixSpooler"> Clean Stuck Print Spooler Jobs
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genSfcDism"> Run SFC & DISM Online Repair
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genRestartSysMain"> Disable SysMain Disk Thrashing
            </label>
            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer;">
              <input type="checkbox" id="genRebootPrompt"> Prompt for Final Reboot
            </label>
          </div>

          <div class="code-wrapper">
            <div class="code-header">
              <span class="code-lang-label">GENERATED BATCH SCRIPT</span>
              <div style="display: flex; gap: 8px;">
                <button class="code-copy-btn" id="copyGenScriptBtn">📋 Copy Script</button>
                <button class="code-copy-btn" id="downloadGenScriptBtn" style="color: var(--accent-emerald);">💾 Download .bat</button>
              </div>
            </div>
            <pre class="code-content" id="batchScriptPreview" style="max-height: 220px;"></pre>
          </div>
        </div>

        <!-- TOOL 3: ENTERPRISE COMMON PORTS LOOKUP -->
        <div class="solution-box">
          <div class="solution-section-title">
            <i>🚪</i> Core Enterprise Ports Fast Reference
          </div>
          <div style="margin-bottom: 10px;">
            <input type="text" class="tool-input" id="portSearchInput" placeholder="Filter by port or service (e.g. 443, DNS, Kerberos)..." style="width: 100%;">
          </div>
          <div style="max-height: 200px; overflow-y: auto;">
            <table class="calc-results-table" id="portsTable">
              <thead>
                <tr>
                  <th>Port</th>
                  <th>Proto</th>
                  <th>Service</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody id="portsTableBody"></tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Hook Up Subnet Calc
    const ipIn = document.getElementById('subnetIpInput');
    const cidrIn = document.getElementById('subnetCidrSelect');
    const updateSubnet = () => {
      const res = IT_TOOLS.calculateSubnet(ipIn.value, cidrIn.value);
      const resBox = document.getElementById('subnetResultsBox');
      if (!res) {
        resBox.innerHTML = `<div style="color: var(--accent-rose); font-size: 0.85rem; margin-top: 8px;">⚠️ Invalid IPv4 Address format.</div>`;
        return;
      }
      resBox.innerHTML = `
        <table class="calc-results-table">
          <tr>
            <th>Network Address:</th><td>${res.network}</td>
            <th>Broadcast Address:</th><td>${res.broadcast}</td>
          </tr>
          <tr>
            <th>Subnet Mask:</th><td>${res.netmask}</td>
            <th>Wildcard Mask:</th><td>${res.wildcard}</td>
          </tr>
          <tr>
            <th>Usable Host Range:</th><td>${res.firstUsable} — ${res.lastUsable}</td>
            <th>Usable Host Count:</th><td>${res.usableHosts} hosts</td>
          </tr>
          <tr>
            <th>IP Classification:</th><td colspan="3">${res.ipClass} (CIDR /${res.cidr})</td>
          </tr>
        </table>
      `;
    };
    ipIn.addEventListener('input', updateSubnet);
    cidrIn.addEventListener('change', updateSubnet);
    updateSubnet();

    // Hook Up Batch Generator
    const updateBatch = () => {
      const opts = {
        flushDns: document.getElementById('genFlushDns').checked,
        dhcpRenew: document.getElementById('genDhcpRenew').checked,
        resetWinsock: document.getElementById('genResetWinsock').checked,
        clearArp: document.getElementById('genClearArp').checked,
        fixSpooler: document.getElementById('genFixSpooler').checked,
        sfcDism: document.getElementById('genSfcDism').checked,
        restartSysMain: document.getElementById('genRestartSysMain').checked,
        rebootPrompt: document.getElementById('genRebootPrompt').checked
      };
      const script = IT_TOOLS.generateBatchScript(opts);
      document.getElementById('batchScriptPreview').textContent = script;
      return script;
    };

    container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', updateBatch);
    });
    updateBatch();

    document.getElementById('copyGenScriptBtn').addEventListener('click', () => {
      const text = document.getElementById('batchScriptPreview').textContent;
      copyToClipboard(text);
    });

    document.getElementById('downloadGenScriptBtn').addEventListener('click', () => {
      const text = document.getElementById('batchScriptPreview').textContent;
      downloadFile('Titan_IT_Workstation_Repair.bat', text);
    });

    // Hook Up Ports Reference
    const renderPorts = (filter = '') => {
      const tbody = document.getElementById('portsTableBody');
      const q = filter.toLowerCase().trim();
      const filtered = IT_TOOLS.ports.filter(p => 
        p.port.toString().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
      );
      tbody.innerHTML = filtered.map(p => `
        <tr>
          <td style="font-weight: 700; color: var(--accent-cyan);">${p.port}</td>
          <td>${p.proto}</td>
          <td style="font-weight: 600; color: var(--text-main);">${escapeHtml(p.service)}</td>
          <td>${escapeHtml(p.desc)}</td>
        </tr>
      `).join('');
    };
    renderPorts();
    document.getElementById('portSearchInput').addEventListener('input', (e) => {
      renderPorts(e.target.value);
    });
  }

  /* =========================================================================
     EVENT LISTENERS & GENERAL UTILITIES
     ========================================================================= */

  function setupEventListeners() {
    // Global Search with Instant Debounce
    let searchDebounce;
    globalSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        state.searchQuery = e.target.value;
        renderIssues();
      }, 150);
    });

    // Severity Filters
    if (severityFilters) {
      severityFilters.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
          severityFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          state.severityFilter = pill.dataset.severity;
          renderIssues();
        });
      });
    }

    // Bookmark Filter Toggle
    if (bookmarkFilterBtn) {
      bookmarkFilterBtn.addEventListener('click', () => {
        state.bookmarkedOnly = !state.bookmarkedOnly;
        bookmarkFilterBtn.classList.toggle('active', state.bookmarkedOnly);
        renderIssues();
      });
    }

    // Theme Toggle
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        state.theme = isLight ? 'light' : 'dark';
        localStorage.setItem('titan_it_theme', state.theme);
        updateThemeIcon(isLight);
      });
    }

    // Modals Close handlers
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSolutionModal);
    issueModal.addEventListener('click', (e) => {
      if (e.target === issueModal) closeSolutionModal();
    });

    if (wizardCloseBtn) wizardCloseBtn.addEventListener('click', closeWizard);
    wizardModal.addEventListener('click', (e) => {
      if (e.target === wizardModal) closeWizard();
    });

    if (toolsCloseBtn) toolsCloseBtn.addEventListener('click', closeTools);
    toolsModal.addEventListener('click', (e) => {
      if (e.target === toolsModal) closeTools();
    });

    // Open Wizard Buttons
    if (openWizardBtn) openWizardBtn.addEventListener('click', openWizard);
    if (openWizardBtnHero) openWizardBtnHero.addEventListener('click', openWizard);

    // Open Tools Buttons
    if (openToolsBtn) openToolsBtn.addEventListener('click', openTools);
    if (openToolsBtnHero) openToolsBtnHero.addEventListener('click', openTools);

    // Emergency Banner Dismiss
    if (emergencyCloseBtn && emergencyBanner) {
      emergencyCloseBtn.addEventListener('click', () => {
        emergencyBanner.style.display = 'none';
      });
    }

    // Keyboard Shortcuts: '/' to search, 'Esc' to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== globalSearchInput) {
        e.preventDefault();
        globalSearchInput.focus();
        globalSearchInput.select();
      } else if (e.key === 'Escape') {
        closeSolutionModal();
        closeWizard();
        closeTools();
      }
    });

    // Emergency Banner Link
    const emergLink = document.getElementById('emergencyProtocolLink');
    if (emergLink) {
      emergLink.addEventListener('click', () => {
        openSolutionModal('sec-ransomware-first-response');
      });
    }
  }

  function toggleBookmark(issueId) {
    const idx = state.bookmarks.indexOf(issueId);
    if (idx === -1) {
      state.bookmarks.push(issueId);
      showToast('Saved to your Quick Reference bookmarks!');
    } else {
      state.bookmarks.splice(idx, 1);
      showToast('Removed from bookmarks.');
    }
    localStorage.setItem('titan_it_bookmarks', JSON.stringify(state.bookmarks));
    renderIssues();
  }

  function updateThemeIcon(isLight) {
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = isLight ? '🌙' : '☀️';
      themeToggleBtn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard successfully!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    });
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`);
  }

  function showToast(msg) {
    if (!toastNotice || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotice.classList.add('show');
    setTimeout(() => {
      toastNotice.classList.remove('show');
    }, 2800);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
