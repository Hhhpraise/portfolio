// script.js — Complete version with Showcase Carousel

// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
    GITHUB_USERNAME: 'Hhhpraise',
    PUBLICATIONS_FILE: 'publications.txt',
    PUBLICATIONS_DOI: [],
    EXECUTABLE_PROJECTS: {},
    ITEMS_PER_PAGE: 9,
    SHOWCASE_INITIAL: 5,     // slides shown on first load
    SHOWCASE_INTERVAL: 7000  // ms per slide before auto-advance
};

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
    projects: [],
    filteredProjects: [],
    publications: [],
    currentPage: 1,
    currentFilter: 'all',
    searchQuery: '',
    sortBy: 'updated',
    isDarkMode: false,
    languageData: [],
    isMobile: window.innerWidth <= 768
};

// Showcase-specific state — kept separate for clarity
const showcase = {
    all: [],         // all hasPages projects, sorted by updated desc
    loaded: [],      // currently rendered slides
    index: 0,        // active slide index
    dir: 'right',    // direction of last navigation
    timer: null
};

let languageChart = null;

// ─── DOM Elements ────────────────────────────────────────────────────────────
const elements = {
    body: document.body,
    themeToggle: document.querySelector('.theme-toggle'),
    mobileMenuBtn: document.querySelector('.mobile-menu-btn'),
    mobileNav: document.querySelector('.mobile-nav'),
    navLinks: document.querySelectorAll('.nav-link, .mobile-nav-link'),
    searchInput: document.querySelector('#project-search'),
    clearSearch: document.querySelector('#clear-search'),
    filterTags: document.querySelectorAll('.filter-tag'),
    sortSelect: document.querySelector('#sort-select'),
    projectsContainer: document.querySelector('#projects-container'),
    emptyState: document.querySelector('#empty-state'),
    pagination: document.querySelector('#pagination'),
    prevPage: document.querySelector('#prev-page'),
    nextPage: document.querySelector('#next-page'),
    pageNumbers: document.querySelector('#page-numbers'),
    modalOverlay: document.querySelector('#modal-overlay'),
    modalClose: document.querySelector('#modal-close'),
    modalBody: document.querySelector('#modal-body'),
    previewModalOverlay: document.querySelector('#preview-modal-overlay'),
    previewCloseBtn: document.querySelector('#preview-close-btn'),
    previewOpenBtn: document.querySelector('#preview-open-btn'),
    previewTitle: document.querySelector('#preview-title'),
    previewIframe: document.querySelector('#preview-iframe'),
    previewLoading: document.querySelector('#preview-loading'),
    backToTop: document.querySelector('#back-to-top'),
    toastContainer: document.querySelector('#toast-container'),
    visitorCount: document.querySelector('#visitor-count'),
    lastUpdated: document.querySelector('#last-updated'),
    currentYear: document.querySelector('#current-year'),
    totalRepos: document.querySelector('#total-repos'),
    totalStars: document.querySelector('#total-stars'),
    totalForks: document.querySelector('#total-forks'),
    githubRepos: document.querySelector('#github-repos'),
    githubStars: document.querySelector('#github-stars'),
    githubFollowers: document.querySelector('#github-followers'),
    projectsTab: document.querySelector('#projects'),
    skillsTab: document.querySelector('#skills'),
    publicationsTab: document.querySelector('#publications'),
    publicationsContainer: document.querySelector('#publications-container'),
    publicationsEmpty: document.querySelector('#publications-empty'),
    logoIcon: document.querySelector('.logo-icon'),
    footerLogo: document.querySelector('.footer-logo')
};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

async function initApplication() {
    elements.currentYear.textContent = new Date().getFullYear();
    checkMobile();
    window.addEventListener('resize', checkMobile);

    initTheme();
    updateLogos();
    initEventListeners();
    initSkillsAnimation();

    await Promise.all([
        fetchGitHubData(),
        fetchPublications()
    ]);

    updateVisitorCounter();

    setTimeout(() => {
        showToast('Welcome to my portfolio! 👋', 'info');
    }, 1000);

    console.log('%c🚀 Praise | Software Developer', 'font-size: 18px; font-weight: bold; color: #007aff;');
    console.log('%c✨ Clean, fast portfolio showcasing development work', 'color: #86868b;');
}

function checkMobile() {
    state.isMobile = window.innerWidth <= 768;
}

// ─── Logos ───────────────────────────────────────────────────────────────────
function updateLogos() {
    const avatarUrl = `https://github.com/${CONFIG.GITHUB_USERNAME}.png`;

    [elements.logoIcon, elements.footerLogo].forEach(el => {
        if (!el) return;
        el.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Praise';
        img.style.cssText = 'width:100%;height:100%;border-radius:var(--radius-md);object-fit:cover;';
        el.appendChild(img);
    });
}

// ─── Theme ───────────────────────────────────────────────────────────────────
function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme  = localStorage.getItem('theme');

    state.isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (state.isDarkMode) {
        elements.body.classList.add('dark-mode');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    elements.themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    state.isDarkMode = !state.isDarkMode;
    elements.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', state.isDarkMode ? 'dark' : 'light');
    elements.themeToggle.innerHTML = state.isDarkMode
        ? '<i class="fas fa-sun"></i>'
        : '<i class="fas fa-moon"></i>';

    if (languageChart) {
        setTimeout(renderLanguageChart, 100);
    }
}

// ─── Cache ───────────────────────────────────────────────────────────────────
function getCachedData(key, maxAgeMinutes = 60) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAgeMinutes * 60 * 1000) return data;

        localStorage.removeItem(key);
        return null;
    } catch {
        return null;
    }
}

function setCachedData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) {
        console.log('Cache write failed:', e);
    }
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
function initEventListeners() {
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileNav.classList.toggle('active');
    });

    elements.navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const tab = link.dataset.tab;

            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            [elements.projectsTab, elements.skillsTab, elements.publicationsTab]
                .forEach(t => t.classList.remove('active'));
            document.querySelector(`#${tab}`).classList.add('active');

            elements.mobileNav.classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    elements.searchInput.addEventListener('input', e => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        state.currentPage = 1;
        filterAndRenderProjects();
    });

    elements.clearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchQuery = '';
        state.currentPage = 1;
        filterAndRenderProjects();
    });

    elements.filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            elements.filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            state.currentFilter = tag.dataset.filter;
            state.currentPage = 1;
            filterAndRenderProjects();
        });
    });

    elements.sortSelect.addEventListener('change', e => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        filterAndRenderProjects();
    });

    elements.prevPage.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderProjects();
        }
    });

    elements.nextPage.addEventListener('click', () => {
        const totalPages = Math.ceil(state.filteredProjects.length / CONFIG.ITEMS_PER_PAGE);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderProjects();
        }
    });

    elements.modalClose.addEventListener('click', () => {
        elements.modalOverlay.classList.remove('active');
    });

    elements.modalOverlay.addEventListener('click', e => {
        if (e.target === elements.modalOverlay) elements.modalOverlay.classList.remove('active');
    });

    elements.previewCloseBtn.addEventListener('click', closePreviewModal);

    elements.previewModalOverlay.addEventListener('click', e => {
        if (e.target === elements.previewModalOverlay) closePreviewModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && elements.previewModalOverlay.classList.contains('active')) {
            closePreviewModal();
        }
    });

    window.addEventListener('scroll', () => {
        elements.backToTop.classList.toggle('visible', window.scrollY > 300);
    });

    elements.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ─── Skills Animation ────────────────────────────────────────────────────────
function initSkillsAnimation() {
    document.querySelectorAll('.skill-fill').forEach(bar => {
        setTimeout(() => {
            bar.style.width = `${bar.dataset.width}%`;
        }, 500);
    });
}

// ─── GitHub Data ─────────────────────────────────────────────────────────────
async function fetchGitHubData() {
    const cacheKey = `github_data_${CONFIG.GITHUB_USERNAME}`;

    try {
        const cached = getCachedData(cacheKey, 60);

        if (cached && cached.repos && cached.user) {
            console.log('Using cached GitHub data');
            state.projects     = cached.projects;
            state.languageData = cached.languageData || [];

            updateStats(cached.repos, cached.user);
            filterAndRenderProjects();
            initShowcase(state.projects);       // ← showcase from cache

            if (state.languageData.length > 0) renderLanguageChart();

            // Refresh in background
            setTimeout(() => fetchFreshGitHubData(cacheKey), 1000);
            return;
        }

        await fetchFreshGitHubData(cacheKey);

    } catch (error) {
        console.error('fetchGitHubData error:', error);
        showToast('Using cached data — GitHub API rate limit may be exceeded', 'warning');

        const cached = getCachedData(cacheKey, 60 * 24);
        if (cached && cached.projects) {
            state.projects     = cached.projects;
            state.languageData = cached.languageData || [];
            filterAndRenderProjects();
            initShowcase(state.projects);       // ← showcase from stale cache
            if (state.languageData.length > 0) renderLanguageChart();
        } else {
            showToast('Unable to load projects. Please try again later.', 'error');
            elements.projectsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load projects</h3>
                    <p>GitHub API rate limit exceeded. Please try again in an hour.</p>
                </div>`;
        }
    }
}

async function fetchFreshGitHubData(cacheKey) {
    const [repos, user] = await Promise.all([
        fetch(`https://api.github.com/users/${CONFIG.GITHUB_USERNAME}/repos?per_page=100`).then(r => r.json()),
        fetch(`https://api.github.com/users/${CONFIG.GITHUB_USERNAME}`).then(r => r.json())
    ]);

    if (!Array.isArray(repos)) {
        if (repos.message && repos.message.includes('rate limit')) {
            throw new Error('GitHub API rate limit exceeded');
        }
        throw new Error(repos.message || 'Invalid GitHub API response');
    }

    state.projects = await Promise.all(repos.map(async repo => {
        const isExecutable = CONFIG.EXECUTABLE_PROJECTS[repo.name] ||
            (repo.topics && repo.topics.includes('executable'));

        let releaseInfo = null;
        if (isExecutable) {
            try {
                const r = await fetch(
                    `https://api.github.com/repos/${CONFIG.GITHUB_USERNAME}/${repo.name}/releases/latest`
                );
                if (r.ok) releaseInfo = await r.json();
            } catch { /* no releases */ }
        }

        return {
            id: repo.id,
            name: repo.name,
            description: repo.description || 'No description provided.',
            language: repo.language || 'Other',
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            updated: new Date(repo.updated_at),
            created: new Date(repo.created_at),
            url: repo.html_url,
            hasPages: repo.has_pages,
            topics: repo.topics || [],
            isExecutable,
            releaseInfo,
            liveDemo: repo.has_pages
                ? `https://${CONFIG.GITHUB_USERNAME}.github.io/${repo.name}/`
                : null,
            languages_url: repo.languages_url
        };
    }));

    updateStats(repos, user);
    await calculateLanguageDistribution();

    setCachedData(cacheKey, {
        repos,
        user,
        projects: state.projects,
        languageData: state.languageData
    });

    filterAndRenderProjects();
    initShowcase(state.projects);               // ← showcase from fresh fetch
}

// ─── Language Distribution ───────────────────────────────────────────────────
async function calculateLanguageDistribution() {
    const langMap   = {};
    let totalBytes  = 0;

    for (const project of state.projects.slice(0, 10)) {
        if (!project.languages_url) continue;
        try {
            const r = await fetch(project.languages_url);
            if (!r.ok) continue;
            const langs = await r.json();
            Object.entries(langs).forEach(([lang, bytes]) => {
                langMap[lang] = (langMap[lang] || 0) + bytes;
                totalBytes += bytes;
            });
        } catch {
            continue;
        }
    }

    if (!Object.keys(langMap).length) {
        state.projects.forEach(p => {
            if (p.language && p.language !== 'Other') {
                langMap[p.language] = (langMap[p.language] || 0) + 1;
                totalBytes++;
            }
        });
    }

    state.languageData = Object.entries(langMap)
        .map(([language, bytes]) => ({
            language,
            bytes,
            percentage: totalBytes ? Math.round((bytes / totalBytes) * 100) : 0
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 6);

    if (totalBytes && state.languageData.length >= 6) {
        const topBytes  = state.languageData.reduce((s, l) => s + l.bytes, 0);
        const otherBytes = totalBytes - topBytes;
        if (otherBytes > 0) {
            state.languageData[5] = {
                language: 'Other',
                percentage: Math.round((otherBytes / totalBytes) * 100),
                bytes: otherBytes
            };
        }
    }

    renderLanguageChart();
}

// ─── Stats ───────────────────────────────────────────────────────────────────
function updateStats(repos, user) {
    animateCounter(elements.totalRepos, 0, repos.length, 1000);

    const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0);
    const totalForks = repos.reduce((s, r) => s + r.forks_count, 0);

    animateCounter(elements.totalStars, 0, totalStars, 1000);
    animateCounter(elements.totalForks, 0, totalForks, 1000);

    elements.githubRepos.textContent      = user.public_repos || 0;
    elements.githubStars.textContent      = totalStars || 0;
    elements.githubFollowers.textContent  = user.followers || 0;
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = timestamp => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// ─── Project Filter / Sort / Render ──────────────────────────────────────────
function sortProjects(projects) {
    return [...projects].sort((a, b) => {
        switch (state.sortBy) {
            case 'stars':   return b.stars - a.stars;
            case 'created': return b.created - a.created;
            case 'name':    return a.name.localeCompare(b.name);
            default:        return b.updated - a.updated;
        }
    });
}

function filterAndRenderProjects() {
    let filtered = [...state.projects];

    if (state.searchQuery) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(state.searchQuery) ||
            p.description.toLowerCase().includes(state.searchQuery) ||
            p.topics.some(t => t.toLowerCase().includes(state.searchQuery)) ||
            p.language.toLowerCase().includes(state.searchQuery)
        );
    }

    if (state.currentFilter !== 'all') {
        filtered = filtered.filter(p => {
            switch (state.currentFilter) {
                case 'python':
                    return p.language === 'Python';
                case 'javascript':
                    return p.language === 'JavaScript' || p.language === 'TypeScript';
                case 'web':
                    return p.topics.includes('web') || p.hasPages ||
                        ['HTML', 'CSS', 'JavaScript', 'TypeScript'].includes(p.language);
                case 'android':
                    return p.language === 'Java' || p.language === 'Kotlin' ||
                        p.topics.includes('android') || p.topics.includes('kotlin');
                case 'executable':
                    return p.isExecutable;
                default:
                    return true;
            }
        });
    }

    state.filteredProjects = sortProjects(filtered);
    renderProjects();
}

function renderProjects() {
    if (state.projects.length === 0) {
        elements.projectsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading projects...</p>
            </div>`;
        return;
    }

    const start        = (state.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const pageProjects = state.filteredProjects.slice(start, start + CONFIG.ITEMS_PER_PAGE);

    if (!pageProjects.length) {
        elements.projectsContainer.innerHTML = '';
        elements.emptyState.style.display    = 'block';
        elements.pagination.style.display    = 'none';
        return;
    }

    elements.emptyState.style.display = 'none';

    elements.projectsContainer.innerHTML = pageProjects.map((project, index) => {
        const isMobile = state.isMobile;
        return `
        <div class="project-card" style="animation-delay:${index * 0.1}s" data-id="${project.id}">
            <div class="project-header">
                <div class="project-title">
                    <i class="${getProjectIcon(project)}"></i>
                    <h3>${project.name}</h3>
                </div>
                <div class="project-stars">
                    <i class="fas fa-star"></i>
                    <span>${project.stars}</span>
                </div>
            </div>
            <div class="project-body">
                ${!isMobile ? `
                    <p class="project-description" data-id="${project.id}">${project.description}</p>
                    <button class="description-toggle" data-id="${project.id}">
                        <span>Read more</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="project-meta">
                        <span><i class="fas fa-code"></i> ${project.language}</span>
                        <span><i class="far fa-clock"></i> ${formatDate(project.updated)}</span>
                    </div>
                    ${project.topics.length ? `
                        <div class="project-tags">
                            ${project.topics.slice(0, 4).map(t => `<span class="project-tag">${t}</span>`).join('')}
                        </div>` : ''}
                ` : `
                    <div class="mobile-project-info">
                        <div class="project-meta">
                            <span><i class="fas fa-code"></i> ${project.language}</span>
                            <span><i class="far fa-clock"></i> ${formatDate(project.updated)}</span>
                            <button class="description-toggle" data-id="${project.id}">
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                        <div class="mobile-description" id="desc-${project.id}" style="display:none">
                            <p class="project-description">${project.description}</p>
                            ${project.topics.length ? `
                                <div class="project-tags">
                                    ${project.topics.slice(0, 3).map(t => `<span class="project-tag">${t}</span>`).join('')}
                                </div>` : ''}
                        </div>
                    </div>`}
            </div>
            <div class="project-footer">
                <a href="${project.url}" target="_blank" class="project-btn code">
                    <i class="fab fa-github"></i>
                    <span>Code</span>
                </a>
                ${getProjectButtons(project, isMobile)}
            </div>
        </div>`;
    }).join('');

    // Description toggles
    document.querySelectorAll('.description-toggle').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const id = btn.dataset.id;

            if (state.isMobile) {
                const desc = document.getElementById(`desc-${id}`);
                const icon = btn.querySelector('i');
                if (desc.style.display === 'block') {
                    desc.style.display = 'none';
                    btn.classList.remove('expanded');
                    icon.className = 'fas fa-chevron-down';
                } else {
                    desc.style.display = 'block';
                    btn.classList.add('expanded');
                    icon.className = 'fas fa-chevron-up';
                }
            } else {
                const description = document.querySelector(`.project-description[data-id="${id}"]`);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                if (description.classList.contains('expanded')) {
                    description.classList.remove('expanded');
                    btn.classList.remove('expanded');
                    text.textContent = 'Read more';
                } else {
                    description.classList.add('expanded');
                    btn.classList.add('expanded');
                    text.textContent = 'Show less';
                }
            }
        });
    });

    // Hide toggle if description fits without clamping
    document.querySelectorAll('.description-toggle').forEach(btn => {
        const id   = btn.dataset.id;
        const desc = document.querySelector(`.project-description[data-id="${id}"]`);
        if (desc) {
            btn.style.display = desc.scrollHeight <= desc.offsetHeight ? 'none' : 'inline-flex';
        }
    });

    // Preview demo buttons
    document.querySelectorAll('.preview-demo-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            showPreviewModal(btn.dataset.demoUrl, btn.dataset.projectName);
        });
    });

    updatePagination();
}

function getProjectIcon(project) {
    if (project.isExecutable) return 'fas fa-download';
    switch (project.language.toLowerCase()) {
        case 'python':     return 'fab fa-python';
        case 'javascript': return 'fab fa-js';
        case 'typescript': return 'fab fa-js';
        case 'html':       return 'fab fa-html5';
        case 'css':        return 'fab fa-css3-alt';
        case 'java':       return 'fab fa-java';
        case 'kotlin':     return 'fab fa-android';
        case 'swift':      return 'fab fa-swift';
        case 'php':        return 'fab fa-php';
        default:           return 'fas fa-code';
    }
}

function getProjectButtons(project, isMobile = false) {
    if (isMobile) {
        if (project.isExecutable && project.releaseInfo) {
            const url = project.releaseInfo.assets?.[0]?.browser_download_url || project.releaseInfo.html_url;
            return `<a href="${url}" target="_blank" class="project-btn download"><i class="fas fa-download"></i><span>DL</span></a>`;
        }
        if (project.liveDemo) {
            return `<a href="${project.liveDemo}" target="_blank" class="project-btn demo"><i class="fas fa-external-link-alt"></i><span>Demo</span></a>`;
        }
    } else {
        if (project.isExecutable && project.releaseInfo) {
            const url  = project.releaseInfo.assets?.[0]?.browser_download_url || project.releaseInfo.html_url;
            const text = project.releaseInfo.assets?.length ? 'Download' : 'View Release';
            return `<a href="${url}" target="_blank" class="project-btn download"><i class="fas fa-download"></i><span>${text}</span></a>`;
        }
        if (project.liveDemo) {
            return `<button class="project-btn demo preview-demo-btn" data-demo-url="${project.liveDemo}" data-project-name="${project.name}"><i class="fas fa-external-link-alt"></i><span>Live Preview</span></button>`;
        }
    }
    return '';
}

function updatePagination() {
    const totalPages = Math.ceil(state.filteredProjects.length / CONFIG.ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        elements.pagination.style.display = 'none';
        return;
    }

    elements.pagination.style.display = 'flex';
    elements.prevPage.disabled = state.currentPage === 1;
    elements.nextPage.disabled = state.currentPage === totalPages;

    const maxVisible = 5;
    let start = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let end   = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    let html = '';
    if (start > 1) {
        html += `<button class="page-number" data-page="1">1</button>`;
        if (start > 2) html += `<span class="page-dots">...</span>`;
    }
    for (let i = start; i <= end; i++) {
        html += `<button class="page-number ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (end < totalPages) {
        if (end < totalPages - 1) html += `<span class="page-dots">...</span>`;
        html += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
    }

    elements.pageNumbers.innerHTML = html;

    document.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentPage = parseInt(btn.dataset.page);
            renderProjects();
            window.scrollTo({ top: elements.projectsContainer.offsetTop - 100, behavior: 'smooth' });
        });
    });
}

// ─── Project Modal ────────────────────────────────────────────────────────────
function showProjectModal(project) {
    elements.modalBody.innerHTML = `
        <div class="modal-project">
            <div class="project-header">
                <div class="project-title">
                    <i class="${getProjectIcon(project)}"></i>
                    <h3>${project.name}</h3>
                </div>
                <div class="project-stats">
                    <span><i class="fas fa-star"></i> ${project.stars}</span>
                    <span><i class="fas fa-code-branch"></i> ${project.forks}</span>
                </div>
            </div>
            <div class="project-meta">
                <span><i class="fas fa-code"></i> ${project.language}</span>
                <span><i class="far fa-calendar"></i> Created: ${formatDate(project.created, true)}</span>
                <span><i class="fas fa-sync-alt"></i> Updated: ${formatDate(project.updated, true)}</span>
            </div>
            <p class="project-description">${project.description}</p>
            ${project.topics.length ? `
                <div class="project-tags">
                    ${project.topics.map(t => `<span class="project-tag">${t}</span>`).join('')}
                </div>` : ''}
            ${project.releaseInfo ? `
                <div class="release-info">
                    <h4><i class="fas fa-tag"></i> Latest Release</h4>
                    <p>Version ${project.releaseInfo.tag_name} • ${formatDate(new Date(project.releaseInfo.published_at), true)}</p>
                    ${project.releaseInfo.body ? `<p>${project.releaseInfo.body.substring(0, 200)}...</p>` : ''}
                </div>` : ''}
            <div class="modal-actions">
                <a href="${project.url}" target="_blank" class="modal-btn primary">
                    <i class="fab fa-github"></i> View on GitHub
                </a>
                ${project.isExecutable && project.releaseInfo ? `
                    <a href="${project.releaseInfo.html_url}" target="_blank" class="modal-btn">
                        <i class="fas fa-download"></i> Download
                    </a>` : ''}
                ${project.liveDemo ? `
                    <a href="${project.liveDemo}" target="_blank" class="modal-btn">
                        <i class="fas fa-external-link-alt"></i> Live Demo
                    </a>` : ''}
            </div>
        </div>`;

    elements.modalOverlay.classList.add('active');
}

// ─── Live Preview Modal ───────────────────────────────────────────────────────
function showPreviewModal(url, projectName) {
    elements.previewTitle.textContent = `${projectName} - Live Preview`;
    elements.previewOpenBtn.href = url;
    elements.previewModalOverlay.classList.add('active');
    elements.previewLoading.classList.remove('hidden');
    elements.previewIframe.classList.remove('loaded');
    elements.previewIframe.src = url;

    const handleLoad = () => {
        setTimeout(() => {
            elements.previewLoading.classList.add('hidden');
            elements.previewIframe.classList.add('loaded');
        }, 500);
        elements.previewIframe.removeEventListener('load', handleLoad);
    };
    elements.previewIframe.addEventListener('load', handleLoad);

    setTimeout(() => {
        if (!elements.previewIframe.classList.contains('loaded')) {
            elements.previewLoading.querySelector('p').textContent = 'Preview taking longer than expected...';
        }
    }, 10000);
}

function closePreviewModal() {
    elements.previewModalOverlay.classList.remove('active');
    setTimeout(() => {
        elements.previewIframe.src = '';
        elements.previewIframe.classList.remove('loaded');
        elements.previewLoading.classList.remove('hidden');
        elements.previewLoading.querySelector('p').textContent = 'Loading preview...';
    }, 300);
}

// ─── Language Chart ───────────────────────────────────────────────────────────
function renderLanguageChart() {
    const ctx = document.getElementById('languageChart');
    if (!ctx || !state.languageData.length) {
        const container = document.querySelector('.language-chart');
        if (container) container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">No language data available</p>';
        return;
    }

    const isDark = elements.body.classList.contains('dark-mode');

    const languageColors = {
        Python:     '#3572A5',
        JavaScript: '#F7DF1E',
        TypeScript: '#3178C6',
        HTML:       '#E34C26',
        CSS:        '#563D7C',
        Java:       '#007396',
        Kotlin:     '#A97BFF',
        Shell:      '#89E051',
        'C++':      '#00599C',
        'C#':       '#239120',
        PHP:        '#777BB4',
        Ruby:       '#CC342D',
        Go:         '#00ADD8',
        Rust:       '#DEA584',
        Swift:      '#F05138',
        Dart:       '#00B4AB',
        Other:      isDark ? '#6C757D' : '#ADB5BD'
    };

    if (languageChart && typeof languageChart.destroy === 'function') {
        try { languageChart.destroy(); } catch { /* ignore */ }
        languageChart = null;
    }

    try {
        languageChart = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: state.languageData.map(l => l.language),
                datasets: [{
                    data: state.languageData.map(l => l.percentage),
                    backgroundColor: state.languageData.map(l =>
                        languageColors[l.language] || (isDark ? '#6C757D' : '#ADB5BD')
                    ),
                    borderWidth: 1,
                    borderColor: isDark ? '#2c2c2e' : '#ffffff',
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: isDark ? '#f5f5f7' : '#1d1d1f',
                            font: { size: 11 },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.parsed}%`
                        }
                    }
                },
                cutout: '65%',
                animation: { animateScale: true, animateRotate: true }
            }
        });
    } catch (error) {
        console.error('Chart error:', error);
        const container = document.querySelector('.language-chart');
        if (container) container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem">Chart could not be loaded</p>';
    }
}

// ─── Publications ─────────────────────────────────────────────────────────────
async function fetchPublications() {
    try {
        const publications = [];

        for (const doi of CONFIG.PUBLICATIONS_DOI) {
            try {
                const pub = await fetchPublication(doi);
                if (pub) publications.push(pub);
            } catch { /* skip */ }
        }

        try {
            const response = await fetch(CONFIG.PUBLICATIONS_FILE);
            if (response.ok) {
                const lines = (await response.text())
                    .split('\n')
                    .filter(l => l.trim() && !l.startsWith('#'));

                for (const line of lines) {
                    const doi = extractDOI(line);
                    if (doi) {
                        const pub = await fetchPublication(doi);
                        if (pub) publications.push(pub);
                    }
                }
            }
        } catch { /* no file */ }

        state.publications = publications.sort((a, b) => b.year - a.year);
        renderPublications();

    } catch (error) {
        console.error('Publications error:', error);
        elements.publicationsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load publications</h3>
                <p>Please try again later</p>
            </div>`;
    }
}

async function fetchPublication(doi) {
    const r = await fetch(`https://api.crossref.org/works/${doi}`);
    if (!r.ok) throw new Error('Failed to fetch publication');
    const { message: pub } = await r.json();
    return {
        title:    pub.title?.[0] || 'Untitled',
        authors:  pub.author?.map(a => `${a.given || ''} ${a.family || ''}`).join(', ') || 'Unknown Authors',
        journal:  pub['container-title']?.[0] || 'Unknown Journal',
        year:     pub.published?.['date-parts']?.[0]?.[0] || 'N/A',
        doi:      pub.DOI,
        url:      pub.URL || `https://doi.org/${pub.DOI}`,
        abstract: pub.abstract ? pub.abstract.replace(/<[^>]*>/g, '') : null
    };
}

function extractDOI(text) {
    const match = text.match(/10\.\d{4,}\/[^\s]+/);
    return match ? match[0] : null;
}

function renderPublications() {
    if (!state.publications.length) {
        elements.publicationsContainer.innerHTML = '';
        elements.publicationsEmpty.style.display = 'block';
        return;
    }

    elements.publicationsEmpty.style.display = 'none';
    elements.publicationsContainer.innerHTML = state.publications.map((pub, i) => `
        <div class="publication-card" style="animation-delay:${i * 0.1}s">
            <div class="publication-header">
                <h3 class="publication-title">${pub.title}</h3>
                <p class="publication-authors">${pub.authors}</p>
                <p class="publication-journal">${pub.journal} • ${pub.year}</p>
            </div>
            ${pub.abstract ? `
                <div class="publication-abstract">
                    <p>${pub.abstract.substring(0, 200)}...</p>
                </div>` : ''}
            <div class="publication-links">
                <a href="${pub.url}" target="_blank" class="publication-link primary">
                    <i class="fas fa-external-link-alt"></i> View Paper
                </a>
                <a href="https://doi.org/${pub.doi}" target="_blank" class="publication-link">
                    <i class="fas fa-link"></i> DOI
                </a>
            </div>
        </div>`).join('');
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatDate(date, full = false) {
    if (!(date instanceof Date)) date = new Date(date);
    const diff = Date.now() - date;
    const days = Math.floor(diff / 86400000);

    if (!full && days < 7) {
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days}d ago`;
    }

    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity   = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateVisitorCounter() {
    const count = (parseInt(localStorage.getItem('visitorCount') || '0') + 1);
    localStorage.setItem('visitorCount', count.toString());
    elements.visitorCount.textContent = count.toLocaleString();
    elements.lastUpdated.textContent  = formatDate(new Date(), true);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SHOWCASE CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Entry point. Called after state.projects is populated.
 * Filters to hasPages projects, seeds the first 5, wires up controls.
 */
function initShowcase(projects) {
    const section = document.getElementById('featured-showcase');
    if (!section) return;

    // All live-pages projects sorted by most recently updated, excluding
    // the portfolio repo itself (it can't sensibly iframe itself).
    showcase.all = projects
        .filter(p => p.hasPages && p.liveDemo && p.name !== 'portfolio')
        .sort((a, b) => b.updated - a.updated);

    if (!showcase.all.length) {
        section.style.display = 'none';
        return;
    }

    section.style.display = '';

    // Seed the first N slides
    showcase.loaded = showcase.all.slice(0, CONFIG.SHOWCASE_INITIAL);
    showcase.index  = 0;
    showcase.dir    = 'right';

    renderShowcaseSlides();
    renderShowcaseDots();
    bindShowcaseControls();
    showcaseGoTo(0, false);
    showcaseStartAuto();
}

// ── Slide HTML builder ────────────────────────────────────────────────────────
function buildSlideHTML(project, i) {
    const urlLabel = project.liveDemo.replace('https://', '');

    return `
      <div class="browser-frame">
        <div class="browser-chrome-bar">
          <div class="bc-dots">
            <span class="bc-dot r"></span>
            <span class="bc-dot y"></span>
            <span class="bc-dot g"></span>
          </div>
          <div class="bc-address-bar">
            <i class="fas fa-lock"></i>
            <span>${urlLabel}</span>
          </div>
        </div>
        <div class="browser-viewport" id="bv-${i}">
          <div class="iframe-scaler" id="scaler-${i}">
            <iframe
              id="sc-iframe-${i}"
              src=""
              data-src="${project.liveDemo}"
              scrolling="no"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="${project.name} live preview"
            ></iframe>
          </div>
          <div class="iframe-blocker"
               onclick="showcaseOpenDemo(${i})"
               style="cursor:pointer"
               title="Click to open full preview"></div>
          <div class="viewport-shimmer" id="shimmer-${i}">
            <div class="shimmer-line"></div>
            <div class="shimmer-line"></div>
            <div class="shimmer-line"></div>
            <span>Loading preview…</span>
          </div>
        </div>
      </div>

      <div class="slide-info">
        <span class="slide-lang-pill">
          <i class="${getProjectIcon(project)}"></i>
          ${project.language}
        </span>
        <h3 class="slide-title">${project.name}</h3>
        <p class="slide-description">${project.description}</p>
        <div class="slide-stats-row">
          <span class="slide-stat-item"><i class="fas fa-star"></i> ${project.stars}</span>
          <span class="slide-stat-item"><i class="fas fa-code-branch"></i> ${project.forks}</span>
          <span class="slide-stat-item"><i class="fas fa-clock"></i> ${formatDate(project.updated)}</span>
        </div>
        ${project.topics.length ? `
          <div class="slide-topics-row">
            ${project.topics.slice(0, 4).map(t => `<span class="slide-topic-tag">${t}</span>`).join('')}
          </div>` : ''}
        <div class="slide-cta-row">
          <a href="${project.liveDemo}" target="_blank" class="slide-cta-primary">
            <i class="fas fa-external-link-alt"></i> Open live site
          </a>
          <a href="${project.url}" target="_blank" class="slide-cta-secondary">
            <i class="fab fa-github"></i> Source
          </a>
        </div>
      </div>`;
}

// ── Render all loaded slides from scratch ─────────────────────────────────────
function renderShowcaseSlides() {
    const stage = document.getElementById('showcase-stage');
    stage.innerHTML = showcase.loaded.map((p, i) => {
        const el = document.createElement('div');
        el.className      = 'showcase-slide from-right';
        el.dataset.index  = i;
        el.innerHTML      = buildSlideHTML(p, i);
        return el.outerHTML;
    }).join('');

    requestAnimationFrame(showcaseScaleAll);
    window.addEventListener('resize', showcaseScaleAll);
}

// ── Append a single new slide to the DOM ──────────────────────────────────────
function appendShowcaseSlide(project, i) {
    const stage = document.getElementById('showcase-stage');
    const el    = document.createElement('div');
    el.className     = 'showcase-slide from-right';
    el.dataset.index = i;
    el.innerHTML     = buildSlideHTML(project, i);
    stage.appendChild(el);
    requestAnimationFrame(showcaseScaleAll);
}

// ── Scale every iframe to fit its viewport ───────────────────────────────────
function showcaseScaleAll() {
    showcase.loaded.forEach((_, i) => {
        const vp     = document.getElementById(`bv-${i}`);
        const scaler = document.getElementById(`scaler-${i}`);
        const iframe = document.getElementById(`sc-iframe-${i}`);
        if (!vp || !scaler) return;

        const scale = vp.offsetWidth / 1280;
        scaler.style.width          = '1280px';
        scaler.style.height         = '800px';
        scaler.style.transform      = `scale(${scale})`;
        scaler.style.transformOrigin = 'top left';

        if (iframe) {
            iframe.style.width  = '1280px';
            iframe.style.height = '800px';
        }
    });
}

// ── Lazy-load an iframe by index ──────────────────────────────────────────────
function showcaseLoadIframe(i) {
    if (i < 0 || i >= showcase.loaded.length) return;
    const iframe  = document.getElementById(`sc-iframe-${i}`);
    const shimmer = document.getElementById(`shimmer-${i}`);
    if (!iframe || iframe.dataset.loaded) return;

    iframe.src            = iframe.dataset.src;
    iframe.dataset.loaded = 'true';

    iframe.addEventListener('load', () => {
        iframe.classList.add('loaded');
        shimmer && shimmer.classList.add('hidden');
    }, { once: true });

    // Fallback: remove shimmer after 8 s regardless
    setTimeout(() => {
        if (shimmer && !shimmer.classList.contains('hidden')) {
            shimmer.classList.add('hidden');
            iframe.classList.add('loaded');
        }
    }, 8000);
}

// ── Dot indicators ────────────────────────────────────────────────────────────
function renderShowcaseDots() {
    const container = document.getElementById('sc-indicators');
    if (!container) return;

    container.innerHTML = showcase.loaded.map((_, i) => `
        <button class="sc-dot" data-index="${i}" aria-label="Slide ${i + 1}"></button>
    `).join('');

    bindDotClicks();
}

function appendShowcaseDot(i) {
    const container = document.getElementById('sc-indicators');
    if (!container) return;

    const btn = document.createElement('button');
    btn.className        = 'sc-dot new-dot';
    btn.dataset.index    = i;
    btn.setAttribute('aria-label', `Slide ${i + 1}`);
    container.appendChild(btn);

    // Brief pulse to signal the new slide
    requestAnimationFrame(() => btn.classList.remove('new-dot'));

    bindDotClicks();
}

function bindDotClicks() {
    document.querySelectorAll('.sc-dot').forEach(dot => {
        dot.replaceWith(dot.cloneNode(true)); // remove stale listeners
    });
    document.querySelectorAll('.sc-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const i = parseInt(dot.dataset.index);
            showcase.dir = i > showcase.index ? 'right' : 'left';
            showcaseGoTo(i);
        });
    });
}

function updateDots() {
    document.querySelectorAll('.sc-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === showcase.index);
    });
}

// ── Navigation controls ───────────────────────────────────────────────────────
function bindShowcaseControls() {
    const prev  = document.getElementById('sc-prev');
    const next  = document.getElementById('sc-next');
    const stage = document.getElementById('showcase-stage');

    prev?.addEventListener('click', () => {
        showcase.dir = 'left';
        showcaseGoTo((showcase.index - 1 + showcase.loaded.length) % showcase.loaded.length);
    });

     next?.addEventListener('click', () => {
        showcase.dir = 'right';
        const nextIndex = (showcase.index + 1) % showcase.loaded.length;
        showcaseGoTo(nextIndex);
        showcaseMaybeExpand(nextIndex);
    });

    stage?.addEventListener('mouseenter', showcaseStopAuto);
    stage?.addEventListener('mouseleave', showcaseStartAuto);

    // Touch / swipe
    let touchX = 0;
    stage?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    stage?.addEventListener('touchend', e => {
        const delta = touchX - e.changedTouches[0].clientX;
        if (Math.abs(delta) < 40) return;
        showcase.dir = delta > 0 ? 'right' : 'left';
        const next = delta > 0
            ? (showcase.index + 1) % showcase.loaded.length
            : (showcase.index - 1 + showcase.loaded.length) % showcase.loaded.length;
        showcaseGoTo(next);
    });

    // Keyboard when showcase is in view
    document.addEventListener('keydown', e => {
        if (!showcaseInViewport()) return;
        if (e.key === 'ArrowRight') { showcase.dir = 'right'; showcaseGoTo((showcase.index + 1) % showcase.loaded.length); }
        if (e.key === 'ArrowLeft')  { showcase.dir = 'left';  showcaseGoTo((showcase.index - 1 + showcase.loaded.length) % showcase.loaded.length); }
    });
}

function showcaseInViewport() {
    const el = document.getElementById('featured-showcase');
    if (!el) return false;
    const { top, bottom } = el.getBoundingClientRect();
    return top < window.innerHeight && bottom > 0;
}

// ── Go to slide (core navigation) ────────────────────────────────────────────
function showcaseGoTo(index, animate = true) {
    const slides = document.querySelectorAll('.showcase-slide');

    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'from-right', 'from-left');

        if (i === index) {
            if (animate) {
                // Set entry direction, then activate on next frame so transition fires
                slide.classList.add(showcase.dir === 'right' ? 'from-right' : 'from-left');
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    slide.classList.remove('from-right', 'from-left');
                    slide.classList.add('active');
                }));
            } else {
                slide.classList.add('active');
            }
        } else if (animate && i === showcase.index) {
            // Exit: old slide drifts opposite to entry direction
            slide.classList.add(showcase.dir === 'right' ? 'from-left' : 'from-right');
        }
    });

    showcase.index = index;
    updateDots();

    // Lazy-load current + neighbours
    showcaseLoadIframe(index);
    showcaseLoadIframe((index + 1) % showcase.loaded.length);
    showcaseLoadIframe((index - 1 + showcase.loaded.length) % showcase.loaded.length);

    // When the user reaches the last slide, queue the next project
    showcaseResetProgress();
}

// ── Expand: add next project when reaching last slide ─────────────────────────
function showcaseMaybeExpand(index) {
    // Only trigger when we're on the last slide and there are more available
    if (index !== showcase.loaded.length - 1) return;
    if (showcase.loaded.length >= showcase.all.length) return;

    const nextProject = showcase.all[showcase.loaded.length];
    if (!nextProject) return;

    const newIndex = showcase.loaded.length; // e.g. 5 → becomes slide index 5
    showcase.loaded.push(nextProject);

    appendShowcaseSlide(nextProject, newIndex);
    appendShowcaseDot(newIndex);

    // Pre-load the new iframe so it's ready when the user clicks next
    setTimeout(() => showcaseLoadIframe(newIndex), 200);
}

// ── Auto-advance ──────────────────────────────────────────────────────────────
function showcaseStartAuto() {
    showcaseStopAuto();
    showcaseResetProgress();
    showcase.timer = setInterval(() => {
        showcase.dir = 'right';
        showcaseGoTo((showcase.index + 1) % showcase.loaded.length);
    }, CONFIG.SHOWCASE_INTERVAL);
}

function showcaseStopAuto() {
    clearInterval(showcase.timer);
    const fill = document.getElementById('sc-progress-fill');
    if (fill) {
        fill.style.transition = 'none';
        fill.style.width      = '0%';
    }
}

function showcaseResetProgress() {
    const fill = document.getElementById('sc-progress-fill');
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.width      = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${CONFIG.SHOWCASE_INTERVAL}ms linear`;
        fill.style.width      = '100%';
    }));
}

// ── Opens the full preview modal when the iframe blocker is clicked ───────────
function showcaseOpenDemo(i) {
    const project = showcase.loaded[i];
    if (project?.liveDemo) showPreviewModal(project.liveDemo, project.name);
}

// ─── Debug exports ────────────────────────────────────────────────────────────
window.state    = state;
window.elements = elements;
window.showcase = showcase;