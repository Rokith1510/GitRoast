/**
 * GitRoast & Rescue — Frontend Application Logic
 * Vanilla JavaScript, accessible DOM handling, XSS-safe rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const roastForm = document.getElementById('roastForm');
  const usernameInput = document.getElementById('usernameInput');
  const submitBtn = document.getElementById('submitBtn');
  const inputError = document.getElementById('inputError');
  const quickBtns = document.querySelectorAll('.quick-btn');

  const loadingSection = document.getElementById('loadingSection');
  const loadingText = document.getElementById('loadingText');
  const loadingSubtext = document.getElementById('loadingSubtext');

  const errorSection = document.getElementById('errorSection');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const errorDetails = document.getElementById('errorDetails');
  const errorRetryBtn = document.getElementById('errorRetryBtn');

  const resultsView = document.getElementById('resultsView');

  // Mode buttons & views
  const roastModeBtn = document.getElementById('roastModeBtn');
  const recruiterModeBtn = document.getElementById('recruiterModeBtn');
  const roastViewContainer = document.getElementById('roastViewContainer');
  const recruiterViewContainer = document.getElementById('recruiterViewContainer');

  // Copy button
  const copyRoastBtn = document.getElementById('copyRoastBtn');

  // App State
  let currentAnalysisData = null;
  let activeRescueFilter = 'all';
  let completedFixes = new Set();
  let loadingInterval = null;

  // GitHub Username Regex
  const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;

  // Fun loading status phrases
  const LOADING_MESSAGES = [
    { title: 'Connecting to GitHub API...', sub: 'Fetching public profile and repository manifests...' },
    { title: 'Auditing Documentation...', sub: 'Scanning for missing README files and setup guides...' },
    { title: 'Calculating Health Score...', sub: 'Weighing project quality, commit frequency, and versatility...' },
    { title: 'Heating Up the Grill...', sub: 'Synthesizing personalized observations and drafting the rescue plan...' }
  ];

  // ----------------------------------------------------
  // Event Listeners
  // ----------------------------------------------------

  // Form submit
  roastForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawValue = usernameInput.value.trim();
    handleSearch(rawValue);
  });

  // Quick pick buttons
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const user = btn.getAttribute('data-user');
      usernameInput.value = user;
      handleSearch(user);
    });
  });

  // Error retry button
  errorRetryBtn.addEventListener('click', () => {
    hideError();
    usernameInput.focus();
    usernameInput.select();
  });

  // Mode Toggle
  roastModeBtn.addEventListener('click', () => setMode('roast'));
  recruiterModeBtn.addEventListener('click', () => setMode('recruiter'));

  // Copy summary
  copyRoastBtn.addEventListener('click', copySummaryToClipboard);

  // Check URL query param on page load (e.g. ?user=torvalds)
  const urlParams = new URLSearchParams(window.location.search);
  const initialUser = urlParams.get('user');
  if (initialUser) {
    usernameInput.value = initialUser;
    handleSearch(initialUser);
  }

  // ----------------------------------------------------
  // Main Search Handler
  // ----------------------------------------------------
  async function handleSearch(rawUsername) {
    clearInputError();

    // Remove leading @ if typed
    const cleanUsername = rawUsername.startsWith('@') ? rawUsername.slice(1).trim() : rawUsername.trim();

    if (!cleanUsername) {
      showInputError('Please enter a GitHub username.');
      usernameInput.focus();
      return;
    }

    if (!GITHUB_USERNAME_REGEX.test(cleanUsername)) {
      showInputError('Invalid GitHub username format. Use letters, numbers, and single hyphens.');
      usernameInput.focus();
      return;
    }

    // Update browser URL query without reload
    const newUrl = `${window.location.pathname}?user=${encodeURIComponent(cleanUsername)}`;
    window.history.pushState({ user: cleanUsername }, '', newUrl);

    // Start loading
    showLoading();
    hideError();
    resultsView.hidden = true;

    try {
      const response = await fetch(`/api/roast/${encodeURIComponent(cleanUsername)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to inspect GitHub profile.');
      }

      currentAnalysisData = data;
      completedFixes.clear();

      // Render all sections
      renderResults(data);

      hideLoading();
      resultsView.hidden = false;
      resultsView.scrollIntoView({ behavior: 'smooth', block: 'start' });

    } catch (err) {
      hideLoading();
      showError('Analysis Failed', err.message);
    }
  }

  // ----------------------------------------------------
  // Rendering Logic
  // ----------------------------------------------------
  function renderResults(data) {
    const { user, score, roast, rescue, projects, recruiter } = data;

    // 1. Profile Banner
    renderProfileBanner(user, score);

    // 2. Score & Potential Score
    renderScoreboard(score);

    // 3. Category Breakdown
    renderCategories(score.categories);

    // 4. The Roast
    renderRoast(roast);

    // 5. Biggest Problems
    renderBiggestProblems(score.deductions);

    // 6. Rescue Plan
    renderRescuePlan(rescue);

    // 7. Top 5 Fixes
    renderTop5Fixes(rescue.top5Fixes);

    // 8. Key Repositories Audit
    renderProjects(projects);

    // 9. Recruiter Mode
    renderRecruiterMode(recruiter);
  }

  // Render Profile Banner
  function renderProfileBanner(user, score) {
    const avatar = document.getElementById('userAvatar');
    avatar.src = user.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
    avatar.alt = `${user.name || user.login}'s avatar`;

    document.getElementById('userName').textContent = user.name || user.login;
    const userHandle = document.getElementById('userHandle');
    userHandle.textContent = `@${user.login}`;
    userHandle.href = user.htmlUrl;

    const profileLevelBadge = document.getElementById('profileLevelBadge');
    profileLevelBadge.textContent = `${score.badge || '🔥'} ${score.level}`;

    const userBio = document.getElementById('userBio');
    userBio.textContent = user.bio || '⚠️ No public bio configured.';

    document.getElementById('chipRepos').textContent = `📦 ${user.publicRepos} Public Repos`;
    document.getElementById('chipFollowers').textContent = `👥 ${user.followers} Followers`;
    
    const langCount = score.categories.technicalDiversity?.score > 0
      ? `${Object.keys(user.publicRepos).length || ''}`
      : '';
    document.getElementById('chipLanguages').textContent = `💻 Stack: ${score.level}`;

    document.getElementById('chipLastActive').textContent = `⏳ ${user.location || 'Remote'}`;

    const ghLink = document.getElementById('ghProfileLink');
    ghLink.href = user.htmlUrl;
  }

  // Render Scoreboard
  function renderScoreboard(score) {
    const scoreVal = document.getElementById('overallScoreVal');
    const radialFill = document.getElementById('scoreRadialFill');
    const scoreTierText = document.getElementById('scoreTierText');
    const scoreSummaryDesc = document.getElementById('scoreSummaryDesc');

    // Animate score counter
    animateNumber(scoreVal, 0, score.overall, 1200);

    scoreTierText.textContent = `${score.badge} ${score.level}`;
    scoreSummaryDesc.textContent = score.summary;

    // Radial stroke dashoffset calculation:
    // radius = 50, circumference = 2 * PI * 50 = 314.159
    const circumference = 314.159;
    const offset = circumference - (score.overall / 100) * circumference;
    radialFill.style.strokeDashoffset = offset;

    // Radial color based on score
    if (score.overall >= 80) {
      radialFill.style.stroke = 'var(--rescue-green)';
    } else if (score.overall >= 60) {
      radialFill.style.stroke = 'var(--warning-amber)';
    } else {
      radialFill.style.stroke = 'var(--fire-primary)';
    }

    // Potential Score Card
    const currentMetric = document.getElementById('currentScoreMetric');
    const potentialMetric = document.getElementById('potentialScoreMetric');
    const potentialGainBadge = document.getElementById('potentialGainBadge');
    const currentScoreBar = document.getElementById('currentScoreBar');
    const potentialGainBar = document.getElementById('potentialGainBar');

    currentMetric.textContent = score.overall;
    potentialMetric.textContent = score.potential;
    potentialGainBadge.textContent = `+${score.improvement} pts recoverable`;

    currentScoreBar.style.width = `${score.overall}%`;
    potentialGainBar.style.width = `${score.improvement}%`;
  }

  // Render Categories Breakdown Grid
  function renderCategories(categories) {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';

    const categoryEntries = [
      { key: 'documentation', label: 'Documentation', max: 25, data: categories.documentation },
      { key: 'projectQuality', label: 'Project Quality', max: 25, data: categories.projectQuality },
      { key: 'activity', label: 'Activity & Momentum', max: 20, data: categories.activity },
      { key: 'professionalPresence', label: 'Professional Presence', max: 15, data: categories.professionalPresence },
      { key: 'technicalDiversity', label: 'Technical Diversity', max: 15, data: categories.technicalDiversity }
    ];

    categoryEntries.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'category-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');

      const pct = cat.data ? cat.data.percentage : 0;
      const score = cat.data ? cat.data.score : 0;
      const deductions = cat.data?.deductions || [];

      // Determine bar color
      let barColor = 'var(--fire-primary)';
      if (pct >= 80) barColor = 'var(--rescue-green)';
      else if (pct >= 55) barColor = 'var(--warning-amber)';

      card.innerHTML = `
        <div class="category-card-top">
          <span class="category-name">${escapeHtml(cat.label)}</span>
          <span class="category-score-pill">${score}/${cat.max}</span>
        </div>
        <div class="category-bar-bg" aria-hidden="true">
          <div class="category-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
        </div>
        <div class="category-deductions-count">
          ${deductions.length === 0 ? '✨ Full points earned' : `⚠️ ${deductions.length} deduction(s) • Click to inspect`}
        </div>
        <div class="category-drawer" hidden>
          ${deductions.length === 0
            ? '<p style="color: var(--rescue-green);">Pristine standards in this area!</p>'
            : deductions.map(d => `
                <div class="deduction-row">
                  <span>${escapeHtml(d.item)}</span>
                  <strong>-${d.points} pts</strong>
                </div>
                <div class="deduction-reason">${escapeHtml(d.reason)}</div>
              `).join('')
          }
        </div>
      `;

      // Accordion toggle on click or Enter
      const drawer = card.querySelector('.category-drawer');
      const toggle = () => {
        const isHidden = drawer.hidden;
        drawer.hidden = !isHidden;
        card.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      };

      card.addEventListener('click', toggle);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      });

      grid.appendChild(card);
    });
  }

  // Render The Roast Section
  function renderRoast(roast) {
    document.getElementById('roastSeverityTag').textContent = roast.severityLevel || 'Extra Crispy';
    document.getElementById('headlineRoastText').textContent = roast.headline;
    document.getElementById('roastVerdictText').textContent = roast.roastVerdict;

    // AI Snippet
    const aiSnippetCard = document.getElementById('aiSnippetCard');
    const aiSnippetText = document.getElementById('aiSnippetText');
    if (roast.aiSnippet) {
      aiSnippetText.textContent = roast.aiSnippet;
      aiSnippetCard.hidden = false;
    } else {
      aiSnippetCard.hidden = true;
    }

    // Observations list
    const obsGrid = document.getElementById('roastObservationsList');
    obsGrid.innerHTML = '';

    (roast.observations || []).forEach(obs => {
      const card = document.createElement('article');
      card.className = 'roast-card';
      card.setAttribute('role', 'listitem');

      card.innerHTML = `
        <div class="roast-tag-row">
          <span class="roast-tag">${escapeHtml(obs.tag)}</span>
          <span class="roast-severity">${escapeHtml(obs.severity)}</span>
        </div>
        <p class="roast-quote">“${escapeHtml(obs.quote)}”</p>
        <p class="roast-punchline">${escapeHtml(obs.punchline)}</p>
      `;

      obsGrid.appendChild(card);
    });
  }

  // Render Biggest Problems List
  function renderBiggestProblems(deductions = []) {
    const container = document.getElementById('biggestProblemsList');
    container.innerHTML = '';

    // Take top 3-4 severe deductions
    const topDeductions = [...deductions]
      .sort((a, b) => b.points - a.points)
      .slice(0, 4);

    if (topDeductions.length === 0) {
      container.innerHTML = '<p style="color: var(--rescue-green);">No major penalties detected! Profile is in great standing.</p>';
      return;
    }

    topDeductions.forEach(d => {
      const card = document.createElement('div');
      card.className = 'problem-card';
      card.innerHTML = `
        <div class="problem-info">
          <span class="problem-title">${escapeHtml(d.item)}</span>
          <span class="problem-desc">${escapeHtml(d.reason)}</span>
        </div>
        <div class="problem-deduction">-${d.points} pts</div>
      `;
      container.appendChild(card);
    });
  }

  // Render Rescue Plan with Priority Filter
  function renderRescuePlan(rescue) {
    document.getElementById('countAll').textContent = rescue.totalActionsCount || 0;
    document.getElementById('countHigh').textContent = rescue.highPriority?.length || 0;
    document.getElementById('countMedium').textContent = rescue.mediumPriority?.length || 0;
    document.getElementById('countLow').textContent = rescue.lowPriority?.length || 0;

    // Filter tab buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        activeRescueFilter = btn.getAttribute('data-filter');
        filterRescueCards(rescue);
      };
    });

    filterRescueCards(rescue);
  }

  function filterRescueCards(rescue) {
    const list = document.getElementById('rescueCardsList');
    list.innerHTML = '';

    let items = rescue.allActions || [];
    if (activeRescueFilter === 'High') items = rescue.highPriority || [];
    else if (activeRescueFilter === 'Medium') items = rescue.mediumPriority || [];
    else if (activeRescueFilter === 'Low') items = rescue.lowPriority || [];

    if (items.length === 0) {
      list.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1;">No actions in this priority filter.</p>';
      return;
    }

    items.forEach(action => {
      const card = document.createElement('article');
      card.className = 'rescue-card';
      card.setAttribute('role', 'listitem');

      card.innerHTML = `
        <div class="rescue-meta-row">
          <span class="rescue-priority ${action.priority}">${action.priority} Priority</span>
          <span class="rescue-gain">+${action.estimatedScoreImprovement} pts potential</span>
        </div>
        <h4 class="rescue-problem-title">${escapeHtml(action.problem)}</h4>
        <div class="rescue-why">
          <strong>Why this matters:</strong> ${escapeHtml(action.whyItMatters)}
        </div>
        <div class="rescue-action-box">
          <span class="rescue-action-label">Action (${action.timeToFix}):</span>
          <p class="rescue-action-text">${escapeHtml(action.action)}</p>
        </div>
      `;

      list.appendChild(card);
    });
  }

  // Render Top 5 Fixes List
  function renderTop5Fixes(top5 = []) {
    const list = document.getElementById('top5FixesList');
    list.innerHTML = '';
    const progressCount = document.getElementById('fixesCompletedCount');

    const updateFixesProgress = () => {
      progressCount.textContent = `${completedFixes.size}/${top5.length}`;
    };

    top5.forEach((fix, index) => {
      const item = document.createElement('div');
      item.className = 'top-fix-item';
      item.id = `top-fix-${index}`;

      const checkboxId = `fix-check-${index}`;
      const isChecked = completedFixes.has(index);

      item.innerHTML = `
        <input type="checkbox" id="${checkboxId}" class="fix-checkbox" aria-label="Mark ${escapeHtml(fix.title)} as done" ${isChecked ? 'checked' : ''}>
        <div class="fix-content">
          <div class="fix-title-row">
            <span class="fix-rank-title">#${fix.rank} ${escapeHtml(fix.title)}</span>
            <span class="fix-gain-tag">+${fix.estimatedScoreImprovement} pts (${fix.timeToFix})</span>
          </div>
          <p class="fix-action-text">${escapeHtml(fix.action)}</p>
        </div>
      `;

      const checkbox = item.querySelector('.fix-checkbox');
      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          completedFixes.add(index);
          item.classList.add('completed');
        } else {
          completedFixes.delete(index);
          item.classList.remove('completed');
        }
        updateFixesProgress();
      });

      list.appendChild(item);
    });

    updateFixesProgress();
  }

  // Render Key Repositories Audit Grid
  function renderProjects(projects = []) {
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    if (projects.length === 0) {
      grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1;">No public non-empty repositories found.</p>';
      return;
    }

    projects.forEach(repo => {
      const card = document.createElement('article');
      card.className = 'project-card';

      // Score badge color
      let scoreColor = 'var(--rescue-green)';
      if (repo.projectScore < 50) scoreColor = 'var(--alert-red)';
      else if (repo.projectScore < 75) scoreColor = 'var(--warning-amber)';

      card.innerHTML = `
        <div>
          <div class="project-card-header">
            <a href="${repo.htmlUrl}" target="_blank" rel="noopener noreferrer" class="project-name-link">
              ${escapeHtml(repo.name)} ↗
            </a>
            <span class="project-score-badge" style="color: ${scoreColor}; border-color: ${scoreColor};">
              ${repo.projectScore}/100
            </span>
          </div>
          <p class="project-desc">${escapeHtml(repo.description)}</p>
        </div>

        <div class="project-badges-row">
          <span class="badge-item">💻 ${escapeHtml(repo.language)}</span>
          <span class="badge-item">⭐ ${repo.stars}</span>
          <span class="badge-item">🍴 ${repo.forks}</span>
          <span class="badge-item">${escapeHtml(repo.updatedAtFormatted)}</span>
          <span class="badge-item ${repo.hasReadme ? 'active' : 'inactive'}">
            ${repo.hasReadme ? 'README ✅' : 'No README ❌'}
          </span>
          <span class="badge-item ${repo.hasDemo ? 'active' : 'inactive'}">
            ${repo.hasDemo ? 'Demo Live 🔗' : 'No Demo ❌'}
          </span>
        </div>

        <div class="project-roast-rescue-box">
          <div class="proj-roast">
            <strong>🔥 Repo Roast:</strong> ${escapeHtml(repo.roast)}
          </div>
          <div class="proj-rescue">
            <strong>🚑 Repo Rescue:</strong> ${escapeHtml(repo.rescue)}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // Render Recruiter Mode Report
  function renderRecruiterMode(recruiter) {
    if (!recruiter) return;

    document.getElementById('readinessBadge').textContent = recruiter.readinessBadge;
    document.getElementById('recruiterSummaryText').textContent = recruiter.readinessSummary;

    // 5 Dimensions
    const dimsGrid = document.getElementById('recruiterDimensionsGrid');
    dimsGrid.innerHTML = '';

    const dims = recruiter.dimensions || {};
    Object.keys(dims).forEach(k => {
      const dim = dims[k];
      const card = document.createElement('div');
      card.className = 'dimension-card';

      card.innerHTML = `
        <div class="dim-header">
          <span class="dim-title">${escapeHtml(dim.title)}</span>
          <span class="dim-score">${dim.score}/${dim.maxScore}</span>
        </div>
        <p class="dim-assessment">${escapeHtml(dim.assessment)}</p>
      `;

      dimsGrid.appendChild(card);
    });

    // Recommendations list
    const recsList = document.getElementById('recruiterRecommendationsList');
    recsList.innerHTML = '';

    (recruiter.recommendations || []).forEach(rec => {
      const li = document.createElement('li');
      li.className = 'rec-item';
      li.innerHTML = `
        <span class="rec-icon" aria-hidden="true">💡</span>
        <div>
          <span class="rec-area">${escapeHtml(rec.area)}:</span>
          <span class="rec-text">${escapeHtml(rec.suggestion)}</span>
        </div>
      `;
      recsList.appendChild(li);
    });
  }

  // ----------------------------------------------------
  // Mode Switching
  // ----------------------------------------------------
  function setMode(mode) {
    if (mode === 'roast') {
      roastModeBtn.classList.add('active');
      roastModeBtn.setAttribute('aria-pressed', 'true');
      recruiterModeBtn.classList.remove('active');
      recruiterModeBtn.setAttribute('aria-pressed', 'false');

      roastViewContainer.hidden = false;
      recruiterViewContainer.hidden = true;
    } else {
      recruiterModeBtn.classList.add('active');
      recruiterModeBtn.setAttribute('aria-pressed', 'true');
      roastModeBtn.classList.remove('active');
      roastModeBtn.setAttribute('aria-pressed', 'false');

      roastViewContainer.hidden = true;
      recruiterViewContainer.hidden = false;
    }
  }

  // ----------------------------------------------------
  // Share & Copy Summary Card
  // ----------------------------------------------------
  async function copySummaryToClipboard() {
    if (!currentAnalysisData) return;
    const { user, score, roast } = currentAnalysisData;

    const summaryText = [
      `🔥 GitRoast & Rescue Audit for @${user.login}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Health Score: ${score.overall}/100 (${score.badge} ${score.level})`,
      `Potential Score: ${score.potential}/100 (+${score.improvement} pts recoverable)`,
      ``,
      `Roast Verdict: "${roast.headline}"`,
      ``,
      `Audit your GitHub: ${window.location.origin}/?user=${encodeURIComponent(user.login)}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summaryText);
      const originalText = copyRoastBtn.innerHTML;
      copyRoastBtn.innerHTML = '<span aria-hidden="true">✅</span> Copied to Clipboard!';
      setTimeout(() => {
        copyRoastBtn.innerHTML = originalText;
      }, 2500);
    } catch {
      alert(summaryText);
    }
  }

  // ----------------------------------------------------
  // Helpers & Animations
  // ----------------------------------------------------
  function showLoading() {
    loadingSection.hidden = false;
    loadingSection.setAttribute('aria-busy', 'true');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    let step = 0;
    loadingText.textContent = LOADING_MESSAGES[0].title;
    loadingSubtext.textContent = LOADING_MESSAGES[0].sub;

    loadingInterval = setInterval(() => {
      step = (step + 1) % LOADING_MESSAGES.length;
      loadingText.textContent = LOADING_MESSAGES[step].title;
      loadingSubtext.textContent = LOADING_MESSAGES[step].sub;
    }, 1200);
  }

  function hideLoading() {
    loadingSection.hidden = true;
    loadingSection.setAttribute('aria-busy', 'false');
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
  }

  function showError(title, message) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    errorSection.hidden = false;
  }

  function hideError() {
    errorSection.hidden = true;
  }

  function showInputError(msg) {
    inputError.textContent = msg;
  }

  function clearInputError() {
    inputError.textContent = '';
  }

  function animateNumber(element, start, end, duration) {
    const range = end - start;
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(start + range * eased);
      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    }

    requestAnimationFrame(step);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
