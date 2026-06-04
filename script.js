// ===== CONFIG =====
const CONFIG = {
    GITHUB_USER: 'Hhhpraise',
    ORCID_ID: '0009-0007-8597-9017',
    FORMSPREE_ID: 'xwpvqdqn',
    ITEMS_PER_PAGE: 9,
    CAROUSEL_INTERVAL: 7000,
    EXECUTABLE_ALLOWLIST: []
};

// ===== STATE =====
const state = {
    projects: [],
    pageProjects: [],
    catalogProjects: [],
    filteredCatalog: [],
    currentPage: 1,
    currentFilter: 'all',
    searchQuery: '',
    sortBy: 'stars',
    carouselIndex: 0,
    carouselTimer: null
};

// ===== DOM SHORTCUTS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    $('#current-year').textContent = new Date().getFullYear();
    initNav();
    fetchGitHubProjects();
    fetchPublications();
    initGSAPAnimations();
    initContactForm();
});

// ===== NAV =====
function initNav() {
    const nav = $('#nav');
    const navLinks = $$('#nav-links .nav-link');
    const mobileMenu = $('#mobile-menu');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        updateActiveNavLink(navLinks);
    });

    $('#nav-mobile-btn').addEventListener('click', () => mobileMenu.classList.add('open'));
    $('#mobile-close').addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                mobileMenu.classList.remove('open');
            }
        });
    });
}

function updateActiveNavLink(navLinks) {
    const sections = [...$$('section[id]')];
    let current = '';
    sections.forEach(section => {
        if (section.getBoundingClientRect().top < 200) current = section.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

// ===== GITHUB DATA =====
async function fetchGitHubProjects() {
    try {
        const [reposRes, userRes] = await Promise.all([
            fetch(`https://api.github.com/users/${CONFIG.GITHUB_USER}/repos?per_page=100&sort=updated`),
            fetch(`https://api.github.com/users/${CONFIG.GITHUB_USER}`)
        ]);

        if (!reposRes.ok) throw new Error('GitHub API error');

        const repos = await reposRes.json();
        const user = await userRes.json();

        if (!Array.isArray(repos)) throw new Error('Invalid response');

        state.projects = repos
            .filter(r => !r.fork)
            .map(r => ({
                name: r.name,
                description: r.description || 'No description',
                language: r.language || 'Code',
                stars: r.stargazers_count,
                forks: r.forks_count,
                updated: new Date(r.updated_at),
                created: new Date(r.created_at),
                url: r.html_url,
                homepage: r.homepage,
                hasPages: r.has_pages,
                topics: r.topics || [],
                liveDemo: r.has_pages ? `https://${CONFIG.GITHUB_USER}.github.io/${r.name}/` : (r.homepage || null),
                isDownloadable: false,
                downloadUrl: null,
                downloadSize: null
            }));

        await checkDownloadableRepos();
        state.projects.sort((a, b) => b.stars - a.stars);

        updateAboutStats(user);
        initCarousel();
        renderBentoGrid();
        initRepoCatalog();
        initBentoGSAP();
    } catch (err) {
        console.error('GitHub fetch error:', err);
        handleGitHubError();
    }
}

async function checkDownloadableRepos() {
    const toCheck = state.projects.filter(p =>
        p.topics.includes('executable') ||
        CONFIG.EXECUTABLE_ALLOWLIST.includes(p.name)
    );

    if (!toCheck.length) return;

    await Promise.allSettled(
        toCheck.map(p =>
            fetch(`https://api.github.com/repos/${CONFIG.GITHUB_USER}/${p.name}/releases/latest`)
                .then(r => r.ok ? r.json() : null)
                .then(release => {
                    if (release && release.assets && release.assets.length > 0) {
                        p.isDownloadable = true;
                        p.downloadUrl = release.assets[0].browser_download_url;
                        p.downloadSize = formatFileSize(release.assets[0].size);
                    }
                })
                .catch(() => {})
        )
    );
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

function handleGitHubError() {
    const bento = $('#bento-grid');
    bento.innerHTML = '<div class="bento-item span-2 span-2-row bento-loading"><p style="color:var(--text-muted);text-align:center;">Projects loading...<br><span style="font-size:0.8125rem;color:var(--text-dim);">GitHub API rate limit may apply. Refresh to try again.</span></p></div>';
    showToast('Could not load projects. Rate limit may apply.');
}

function updateAboutStats(user) {
    const totalStars = state.projects.reduce((s, p) => s + p.stars, 0);
    animateValue($('#about-repos'), 0, user.public_repos || state.projects.length, 1200);
    animateValue($('#about-stars'), 0, totalStars, 1200);
    animateValue($('#about-followers'), 0, user.followers || 0, 1200);
}

function animateValue(el, start, end, duration) {
    if (!el) return;
    const startTime = performance.now();
    function step(ts) {
        const progress = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(start + (end - start) * eased).toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ===== CAROUSEL =====
function initCarousel() {
    const pages = state.projects.filter(p => p.hasPages && p.liveDemo && p.name !== 'portfolio');
    const section = $('#live-pages');

    if (!pages.length) {
        if (section) section.style.display = 'none';
        return;
    }

    if (section) section.style.display = '';
    state.pageProjects = pages;

    renderCarouselSlides();
    renderCarouselDots();
    bindCarouselControls();
    goToCarouselSlide(0, false);
    startCarouselAuto();
}

function buildCarouselSlideHTML(project, i) {
    const urlLabel = project.liveDemo.replace('https://', '');
    return `
        <div class="carousel-browser">
            <div class="carousel-browser-bar">
                <span class="browser-dot r"></span><span class="browser-dot y"></span><span class="browser-dot g"></span>
                <div class="browser-address"><i class="fas fa-lock" style="font-size:0.5rem;"></i>${urlLabel}</div>
            </div>
            <div class="carousel-viewport" id="vp-${i}">
                <div class="iframe-scaler" id="scaler-${i}">
                    <iframe id="carousel-iframe-${i}" src="" data-src="${project.liveDemo}" scrolling="no" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" title="${project.name}" style="width:1280px;height:800px;border:none;background:#fff;display:block;"></iframe>
                </div>
                <div class="iframe-blocker" onclick="openCarouselDemo(${i})" title="Click to open full preview"></div>
                <div class="carousel-shimmer" id="shimmer-${i}">
                    <div class="shimmer-line"></div><div class="shimmer-line"></div><div class="shimmer-line"></div>
                </div>
            </div>
        </div>
        <div class="carousel-info">
            <span class="carousel-lang"><i class="fas fa-code"></i> ${project.language}</span>
            <h3 class="carousel-project-name">${project.name.replace(/-/g, ' ')}</h3>
            <p class="carousel-project-desc">${project.description}</p>
            <div class="carousel-stats">
                <span><i class="fas fa-star"></i>${project.stars}</span>
                <span><i class="fas fa-code-branch"></i>${project.forks}</span>
            </div>
            ${project.topics.length ? `<div class="carousel-tags">${project.topics.slice(0,4).map(t => `<span class="carousel-tag">${t}</span>`).join('')}</div>` : ''}
            <div class="carousel-cta">
                <a href="${project.liveDemo}" target="_blank" rel="noopener" class="carousel-cta-open"><i class="fas fa-external-link-alt"></i> Open live site</a>
                <a href="${project.url}" target="_blank" rel="noopener" class="carousel-cta-source"><i class="fab fa-github"></i> View source</a>
            </div>
        </div>`;
}

function renderCarouselSlides() {
    const stage = $('#carousel-stage');
    if (!stage) return;
    stage.innerHTML = state.pageProjects.map((p, i) => {
        const el = document.createElement('div');
        el.className = 'carousel-slide from-right';
        el.dataset.index = i;
        el.innerHTML = buildCarouselSlideHTML(p, i);
        return el.outerHTML;
    }).join('');
    requestAnimationFrame(scaleCarouselIframes);
    window.addEventListener('resize', scaleCarouselIframes);
}

function scaleCarouselIframes() {
    state.pageProjects.forEach((_, i) => {
        const vp = document.getElementById(`vp-${i}`);
        const scaler = document.getElementById(`scaler-${i}`);
        if (!vp || !scaler) return;
        const scale = vp.offsetWidth / 1280;
        scaler.style.transform = `scale(${scale})`;
        scaler.style.transformOrigin = 'top left';
    });
}

function loadCarouselIframe(i) {
    if (i < 0 || i >= state.pageProjects.length) return;
    const iframe = document.getElementById(`carousel-iframe-${i}`);
    const shimmer = document.getElementById(`shimmer-${i}`);
    if (!iframe || iframe.dataset.loaded) return;
    iframe.src = iframe.dataset.src;
    iframe.dataset.loaded = 'true';
    iframe.addEventListener('load', () => { if (shimmer) shimmer.classList.add('hidden'); }, { once: true });
    setTimeout(() => { if (shimmer && !shimmer.classList.contains('hidden')) shimmer.classList.add('hidden'); }, 8000);
}

function openCarouselDemo(i) {
    const project = state.pageProjects[i];
    if (project && project.liveDemo) window.open(project.liveDemo, '_blank');
}

function renderCarouselDots() {
    const container = $('#carousel-dots');
    if (!container) return;
    container.innerHTML = state.pageProjects.map((_, i) =>
        `<button class="carousel-dot" data-index="${i}" aria-label="Slide ${i+1}"></button>`
    ).join('');
    $$('.carousel-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            goToCarouselSlide(parseInt(dot.dataset.index));
        });
    });
}

function updateCarouselDots() {
    $$('.carousel-dot').forEach((dot, i) => dot.classList.toggle('active', i === state.carouselIndex));
}

function bindCarouselControls() {
    $('#carousel-prev').addEventListener('click', () => {
        goToCarouselSlide((state.carouselIndex - 1 + state.pageProjects.length) % state.pageProjects.length);
    });
    $('#carousel-next').addEventListener('click', () => {
        goToCarouselSlide((state.carouselIndex + 1) % state.pageProjects.length);
    });

    const stage = $('#carousel-stage');
    stage.addEventListener('mouseenter', stopCarouselAuto);
    stage.addEventListener('mouseleave', startCarouselAuto);

    let touchX = 0;
    stage.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
        const delta = touchX - e.changedTouches[0].clientX;
        if (Math.abs(delta) < 40) return;
        goToCarouselSlide(delta > 0
            ? (state.carouselIndex + 1) % state.pageProjects.length
            : (state.carouselIndex - 1 + state.pageProjects.length) % state.pageProjects.length);
    });

    document.addEventListener('keydown', e => {
        if (!isCarouselInView()) return;
        if (e.key === 'ArrowRight') goToCarouselSlide((state.carouselIndex + 1) % state.pageProjects.length);
        if (e.key === 'ArrowLeft') goToCarouselSlide((state.carouselIndex - 1 + state.pageProjects.length) % state.pageProjects.length);
    });
}

function isCarouselInView() {
    const el = $('#live-pages');
    if (!el) return false;
    const { top, bottom } = el.getBoundingClientRect();
    return top < window.innerHeight && bottom > 0;
}

function goToCarouselSlide(index, animate = true) {
    const slides = $$('.carousel-slide');
    slides.forEach((slide, i) => {
        slide.classList.remove('active', 'from-right', 'from-left');
        if (i === index) {
            if (animate) {
                const dir = index > state.carouselIndex ? 'right' : 'left';
                slide.classList.add(dir === 'right' ? 'from-right' : 'from-left');
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    slide.classList.remove('from-right', 'from-left');
                    slide.classList.add('active');
                }));
            } else {
                slide.classList.add('active');
            }
        }
    });
    state.carouselIndex = index;
    updateCarouselDots();
    loadCarouselIframe(index);
    loadCarouselIframe((index + 1) % state.pageProjects.length);
    loadCarouselIframe((index - 1 + state.pageProjects.length) % state.pageProjects.length);
    resetCarouselProgress();
}

function startCarouselAuto() {
    stopCarouselAuto();
    resetCarouselProgress();
    state.carouselTimer = setInterval(() => {
        goToCarouselSlide((state.carouselIndex + 1) % state.pageProjects.length);
    }, CONFIG.CAROUSEL_INTERVAL);
}

function stopCarouselAuto() {
    clearInterval(state.carouselTimer);
    const fill = $('#carousel-progress-fill');
    if (fill) { fill.style.transition = 'none'; fill.style.width = '0%'; }
}

function resetCarouselProgress() {
    const fill = $('#carousel-progress-fill');
    if (!fill) return;
    fill.style.transition = 'none';
    fill.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${CONFIG.CAROUSEL_INTERVAL}ms linear`;
        fill.style.width = '100%';
    }));
}

// ===== BENTO GRID =====
function renderBentoGrid() {
    const display = state.projects.slice(0, 6);
    const bento = $('#bento-grid');
    if (!display.length) {
        bento.innerHTML = '<div class="bento-item span-2 span-2-row bento-loading"><p style="color:var(--text-dim);">No projects yet.</p></div>';
        return;
    }

    const layouts = [
        ['span-2 span-2-row', '', '', 'span-2', '', 'span-2'],
        ['span-2', 'span-2', '', 'span-2 span-2-row', '', ''],
        ['', 'span-2 span-2-row', 'span-2', '', 'span-2', ''],
        ['span-2', '', 'span-2', '', 'span-2 span-2-row', ''],
        ['', '', 'span-2 span-2-row', 'span-2', '', 'span-2'],
    ];
    const layout = layouts[Math.floor(Math.random() * layouts.length)];

    bento.innerHTML = display.map((p, i) => {
        const cls = layout[i] || '';
        const demoBtn = p.liveDemo
            ? `<a href="${p.liveDemo}" target="_blank" rel="noopener" class="bento-link bento-link-demo" onclick="event.stopPropagation()">Live <i class="fas fa-external-link-alt"></i></a>`
            : '';
        const dlBtn = p.isDownloadable
            ? `<a href="${p.downloadUrl || p.url}" target="_blank" rel="noopener" class="bento-link bento-link-demo" onclick="event.stopPropagation()"><i class="fas fa-download"></i> Download</a>`
            : '';
        return `
        <div class="bento-item ${cls}" onclick="window.open('${p.url}', '_blank')" title="${p.name}">
            <div class="bento-item-bg"><img src="https://github.com/${CONFIG.GITHUB_USER}.png" alt="" loading="lazy" onerror="this.style.display='none'"></div>
            <div class="bento-item-gradient"></div>
            <div class="bento-item-inner">
                <span class="bento-lang">${p.language}</span>
                <h3 class="bento-title">${p.name.replace(/-/g, ' ')}</h3>
                <p class="bento-desc">${p.description}</p>
                <div class="bento-meta">
                    <span><i class="fas fa-star"></i> ${p.stars}</span>
                    <span><i class="fas fa-code-branch"></i> ${p.forks}</span>
                </div>
                <div class="bento-links">
                    <a href="${p.url}" target="_blank" rel="noopener" class="bento-link bento-link-source" onclick="event.stopPropagation()"><i class="fab fa-github"></i> Source</a>
                    ${demoBtn}${dlBtn}
                </div>
            </div>
        </div>`;
    }).join('');
}

function initBentoGSAP() {
    $$('.bento-item').forEach((item, i) => {
        gsap.from(item, {
            scrollTrigger: { trigger: '#work', start: 'top 75%' },
            opacity: 0, y: 40, scale: 0.96, duration: 0.7, delay: i * 0.1, ease: 'power3.out'
        });
    });
}

// ===== REPO CATALOG =====
function initRepoCatalog() {
    const bentoNames = new Set(state.projects.slice(0, 6).map(p => p.name));
    state.catalogProjects = state.projects.filter(p => !bentoNames.has(p.name));

    const searchInput = $('#catalog-search');
    const clearBtn = $('#catalog-search-clear');
    const sortSelect = $('#catalog-sort-select');

    searchInput.addEventListener('input', () => {
        clearTimeout(searchInput._debounce);
        searchInput._debounce = setTimeout(() => {
            state.searchQuery = searchInput.value.toLowerCase().trim();
            state.currentPage = 1;
            filterAndRenderCatalog();
        }, 250);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        state.currentPage = 1;
        filterAndRenderCatalog();
    });

    sortSelect.addEventListener('change', () => {
        state.sortBy = sortSelect.value;
        state.currentPage = 1;
        filterAndRenderCatalog();
    });

    $$('.catalog-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.catalog-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            state.currentPage = 1;
            filterAndRenderCatalog();
        });
    });

    $('#catalog-prev').addEventListener('click', () => {
        if (state.currentPage > 1) { state.currentPage--; renderCatalogPage(); }
    });
    $('#catalog-next').addEventListener('click', () => {
        const total = Math.ceil(state.filteredCatalog.length / CONFIG.ITEMS_PER_PAGE);
        if (state.currentPage < total) { state.currentPage++; renderCatalogPage(); }
    });
    $('#catalog-empty-clear').addEventListener('click', () => {
        searchInput.value = '';
        state.searchQuery = '';
        state.currentFilter = 'all';
        state.currentPage = 1;
        $$('.catalog-filter').forEach(b => b.classList.toggle('active', b.dataset.filter === 'all'));
        filterAndRenderCatalog();
    });

    filterAndRenderCatalog();
}

function filterAndRenderCatalog() {
    let filtered = [...state.catalogProjects];

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
                case 'python': return p.language === 'Python';
                case 'javascript': return ['JavaScript', 'TypeScript'].includes(p.language);
                case 'java': return p.language === 'Java' || p.language === 'Kotlin';
                case 'web': return p.topics.includes('web') || p.hasPages || ['HTML', 'CSS', 'JavaScript', 'TypeScript'].includes(p.language);
                case 'android': return p.language === 'Java' || p.language === 'Kotlin' || p.topics.includes('android');
                case 'demo': return !!p.liveDemo;
                case 'downloadable': return p.isDownloadable;
                default: return true;
            }
        });
    }

    state.filteredCatalog = filtered.sort((a, b) => {
        switch (state.sortBy) {
            case 'updated': return b.updated - a.updated;
            case 'name': return a.name.localeCompare(b.name);
            default: return b.stars - a.stars;
        }
    });

    renderCatalogPage();
}

function renderCatalogPage() {
    const grid = $('#catalog-grid');
    const empty = $('#catalog-empty');
    const pagination = $('#catalog-pagination');

    if (!state.filteredCatalog.length) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        pagination.style.display = 'none';
        return;
    }

    empty.style.display = 'none';

    const start = (state.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const pageItems = state.filteredCatalog.slice(start, start + CONFIG.ITEMS_PER_PAGE);

    grid.innerHTML = pageItems.map(p => {
        const dlBadge = p.isDownloadable ? `<span class="catalog-card-dl-badge"><i class="fas fa-download"></i> ${p.downloadSize || 'DL'}</span>` : '';
        const demoBtn = p.liveDemo ? `<a href="${p.liveDemo}" target="_blank" rel="noopener" class="catalog-card-btn catalog-card-btn-demo"><i class="fas fa-external-link-alt"></i> Live</a>` : '';
        const dlBtn = p.isDownloadable ? `<a href="${p.downloadUrl || p.url}" target="_blank" rel="noopener" class="catalog-card-btn catalog-card-btn-download"><i class="fas fa-download"></i> Download</a>` : '';
        return `
        <div class="catalog-card">
            <div class="catalog-card-header">
                <h3 class="catalog-card-name">${p.name.replace(/-/g, ' ')}${dlBadge}</h3>
                <span class="catalog-card-stars"><i class="fas fa-star"></i> ${p.stars}</span>
            </div>
            <span class="catalog-card-lang">${p.language}</span>
            <p class="catalog-card-desc">${p.description}</p>
            ${p.topics.length ? `<div class="catalog-card-tags">${p.topics.slice(0,4).map(t => `<span class="catalog-card-tag">${t}</span>`).join('')}</div>` : ''}
            <div class="catalog-card-actions">
                <a href="${p.url}" target="_blank" rel="noopener" class="catalog-card-btn catalog-card-btn-source"><i class="fab fa-github"></i> Source</a>
                ${demoBtn}${dlBtn}
            </div>
        </div>`;
    }).join('');

    renderCatalogPagination();
}

function renderCatalogPagination() {
    const total = Math.ceil(state.filteredCatalog.length / CONFIG.ITEMS_PER_PAGE);
    const container = $('#catalog-pagination');
    const numbers = $('#catalog-page-numbers');

    if (total <= 1) { container.style.display = 'none'; return; }
    container.style.display = 'flex';

    $('#catalog-prev').disabled = state.currentPage === 1;
    $('#catalog-next').disabled = state.currentPage === total;

    const maxVisible = 5;
    let start = Math.max(1, state.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    let html = '';
    if (start > 1) { html += `<button class="pagination-number" data-page="1">1</button>`; if (start > 2) html += '<span class="pagination-dots">...</span>'; }
    for (let i = start; i <= end; i++) { html += `<button class="pagination-number ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`; }
    if (end < total) { if (end < total - 1) html += '<span class="pagination-dots">...</span>'; html += `<button class="pagination-number" data-page="${total}">${total}</button>`; }

    numbers.innerHTML = html;
    $$('.pagination-number').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentPage = parseInt(btn.dataset.page);
            renderCatalogPage();
            $('#work').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ===== PUBLICATIONS (ORCID) =====
async function fetchPublications() {
    const list = $('#publications-list');
    const empty = $('#publications-empty');

    try {
        const res = await fetch(`https://pub.orcid.org/v3.0/${CONFIG.ORCID_ID}/works`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error('ORCID API error');

        const data = await res.json();
        const works = (data.group || []).map(group => {
            const summary = group['work-summary'] && group['work-summary'][0];
            if (!summary) return null;
            const extIds = summary['external-ids'] && summary['external-ids']['external-id'] || [];
            const doi = extIds.find(id => id['external-id-type'] === 'doi');
            return {
                title: summary.title && summary.title.title && summary.title.title.value || 'Untitled',
                journal: summary['journal-title'] && summary['journal-title'].value || '',
                year: summary['publication-date'] && summary['publication-date'].year && summary['publication-date'].year.value || '',
                doi: doi ? doi['external-id-value'] : null
            };
        }).filter(Boolean).sort((a, b) => (b.year || 0) - (a.year || 0));

        if (!works.length) throw new Error('No works found');

        list.innerHTML = works.map((pub, i) => `
            <div class="publication-card" style="animation-delay:${i * 0.1}s">
                <h3 class="publication-card-title">${pub.title}</h3>
                <p class="publication-card-meta">${pub.journal}${pub.journal && pub.year ? ' &middot; ' : ''}${pub.year}</p>
                ${pub.doi ? `<div class="publication-card-links"><a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener" class="publication-card-link publication-card-link-primary"><i class="fas fa-external-link-alt"></i> Read Paper</a><a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener" class="publication-card-link publication-card-link-secondary"><i class="fas fa-link"></i> DOI</a></div>` : ''}
            </div>
        `).join('');

    } catch (err) {
        console.error('Publications error:', err);
        list.innerHTML = '';
        empty.style.display = 'block';
    }
}

// ===== GSAP ANIMATIONS =====
function initGSAPAnimations() {
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero-eyebrow', { opacity: 0, y: 20, duration: 0.6 })
        .from('.hero-title-line', { opacity: 0, y: 60, duration: 0.9, stagger: 0.15 }, '-=0.3')
        .from('.hero-subtitle', { opacity: 0, y: 30, duration: 0.7 }, '-=0.4')
        .from('.hero-actions', { opacity: 0, y: 20, duration: 0.6 }, '-=0.2')
        .from('.hero-scroll', { opacity: 0, duration: 0.8 }, '-=0.2');

    $$('section .section-label, section .section-title, section .section-subtitle').forEach(el => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: 'top 85%' },
            opacity: 0, y: 40, duration: 0.8, ease: 'power3.out'
        });
    });

    gsap.from('.about-visual', {
        scrollTrigger: { trigger: '#about', start: 'top 70%' },
        opacity: 0, x: -60, duration: 1, ease: 'power3.out'
    });
    gsap.from('.about-text', {
        scrollTrigger: { trigger: '#about', start: 'top 70%' },
        opacity: 0, x: 60, duration: 1, ease: 'power3.out', delay: 0.2
    });
    gsap.from('.publication-card', {
        scrollTrigger: { trigger: '#publications', start: 'top 75%' },
        opacity: 0, y: 30, duration: 0.6, stagger: 0.1, ease: 'power3.out'
    });
    gsap.from('.catalog-card', {
        scrollTrigger: { trigger: '#catalog-grid', start: 'top 85%' },
        opacity: 0, y: 30, duration: 0.5, stagger: 0.05, ease: 'power3.out'
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const form = $('#contact-form');
    const success = $('#form-success');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('.form-submit');
        const orig = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        try {
            const res = await fetch(`https://formspree.io/f/${CONFIG.FORMSPREE_ID}`, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                success.classList.add('visible');
                form.reset();
                showToast('Message sent! Talk soon.');
            } else {
                showToast('Failed to send. Email me at hhhpraise33@gmail.com');
            }
        } catch {
            showToast('Network error. Email me at hhhpraise33@gmail.com');
        }
        btn.textContent = orig;
        btn.disabled = false;
    });
}

// ===== TOAST =====
function showToast(message) {
    const container = $('#toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
