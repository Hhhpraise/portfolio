// script.js - Complete Fixed Version

// Configuration
const CONFIG = {
    GITHUB_USERNAME: 'Hhhpraise',
    PUBLICATIONS_FILE: 'publications.txt',
    PUBLICATIONS_DOI: [],
    EXECUTABLE_PROJECTS: {},
    ITEMS_PER_PAGE: 9
};

// State Management
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

let languageChart = null;

// DOM Elements
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
    backToTop: document.querySelector('#back-to-top'),
    toastContainer: document.querySelector('#toast-container'),
    visitorCount: document.querySelector('#visitor-count'),
    lastUpdated: document.querySelector('#last-updated'),
    currentYear: document.querySelector('#current-year'),

    // Stats elements
    totalRepos: document.querySelector('#total-repos'),
    totalStars: document.querySelector('#total-stars'),
    totalForks: document.querySelector('#total-forks'),
    githubRepos: document.querySelector('#github-repos'),
    githubStars: document.querySelector('#github-stars'),
    githubFollowers: document.querySelector('#github-followers'),

    // Tab sections
    projectsTab: document.querySelector('#projects'),
    skillsTab: document.querySelector('#skills'),
    publicationsTab: document.querySelector('#publications'),
    publicationsContainer: document.querySelector('#publications-container'),
    publicationsEmpty: document.querySelector('#publications-empty'),

    // Logos
    logoIcon: document.querySelector('.logo-icon'),
    footerLogo: document.querySelector('.footer-logo')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApplication();
});

async function initApplication() {
    // Set current year
    elements.currentYear.textContent = new Date().getFullYear();

    // Check if mobile
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Initialize components
    initTheme();
    updateLogos();
    initEventListeners();
    initSkillsAnimation();

    // Load data
    await Promise.all([
        fetchGitHubData(),
        fetchPublications()
    ]);

    // Update visitor counter
    updateVisitorCounter();

    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome to my portfolio! 👋', 'info');
    }, 1000);

    // Console greeting
    console.log('%c🚀 Praise | Software Developer', 'font-size: 18px; font-weight: bold; color: #007aff;');
    console.log('%c✨ Clean, fast portfolio showcasing development work', 'color: #86868b;');
}

function checkMobile() {
    state.isMobile = window.innerWidth <= 768;
}

// Update logos with GitHub avatar
function updateLogos() {
    const avatarUrl = `https://github.com/${CONFIG.GITHUB_USERNAME}.png`;
    
    // Header logo
    if (elements.logoIcon) {
        elements.logoIcon.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Praise';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = 'var(--radius-md)';
        img.style.objectFit = 'cover';
        elements.logoIcon.appendChild(img);
    }
    
    // Footer logo
    if (elements.footerLogo) {
        elements.footerLogo.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = 'Praise';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.borderRadius = 'var(--radius-md)';
        img.style.objectFit = 'cover';
        elements.footerLogo.appendChild(img);
    }
}

// Theme Management
function initTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

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

    // Re-render chart if exists
    if (languageChart) {
        setTimeout(renderLanguageChart, 100);
    }
}

function getCachedData(key, maxAgeMinutes = 60) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        const maxAge = maxAgeMinutes * 60 * 1000;

        if (age < maxAge) {
            return data;
        }
        // Cache expired
        localStorage.removeItem(key);
        return null;
    } catch (error) {
        return null;
    }
}

function setCachedData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
    } catch (error) {
        console.log('Error caching data:', error);
    }
}

// Event Listeners
function initEventListeners() {
    // Mobile menu
    elements.mobileMenuBtn.addEventListener('click', () => {
        elements.mobileNav.classList.toggle('active');
    });

    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.dataset.tab;

            // Update active state
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Show tab
            [elements.projectsTab, elements.skillsTab, elements.publicationsTab]
                .forEach(t => t.classList.remove('active'));
            document.querySelector(`#${tab}`).classList.add('active');

            // Close mobile menu
            elements.mobileNav.classList.remove('active');

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Search
    elements.searchInput.addEventListener('input', (e) => {
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

    // Filters
    elements.filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            elements.filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');

            state.currentFilter = tag.dataset.filter;
            state.currentPage = 1;
            filterAndRenderProjects();
        });
    });

    // Sort
    elements.sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        state.currentPage = 1;
        filterAndRenderProjects();
    });

    // Pagination
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

    // Modal
    elements.modalClose.addEventListener('click', () => {
        elements.modalOverlay.classList.remove('active');
    });

    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            elements.modalOverlay.classList.remove('active');
        }
    });

    // Back to top
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    });

    elements.backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Skills Animation
function initSkillsAnimation() {
    const skillBars = document.querySelectorAll('.skill-fill');
    skillBars.forEach(bar => {
        const width = bar.dataset.width;
        setTimeout(() => {
            bar.style.width = `${width}%`;
        }, 500);
    });
}

// GitHub Data Fetching
async function fetchGitHubData() {
    try {
        // Try to get cached data first
        const cacheKey = `github_data_${CONFIG.GITHUB_USERNAME}`;
        const cached = getCachedData(cacheKey, 60); // 60 minutes cache

        if (cached && cached.repos && cached.user) {
            console.log('Using cached GitHub data');
            state.projects = cached.projects;
            state.languageData = cached.languageData || [];

            updateStats(cached.repos, cached.user);

            // Initial render
            filterAndRenderProjects();

            // Render chart if we have language data
            if (state.languageData.length > 0) {
                renderLanguageChart();
            }

            // Still try to fetch fresh data in background
            setTimeout(() => fetchFreshGitHubData(cacheKey), 1000);
            return;
        }

        // No cache, fetch fresh data
        await fetchFreshGitHubData(cacheKey);

    } catch (error) {
        console.error('Error in fetchGitHubData:', error);
        showToast('Using cached data - GitHub API rate limit may be exceeded', 'warning');

        // Try to show cached data even if fresh fetch fails
        const cacheKey = `github_data_${CONFIG.GITHUB_USERNAME}`;
        const cached = getCachedData(cacheKey, 60 * 24); // Allow 24h old cache in error case

        if (cached && cached.projects) {
            state.projects = cached.projects;
            state.languageData = cached.languageData || [];
            filterAndRenderProjects();
            if (state.languageData.length > 0) {
                renderLanguageChart();
            }
        } else {
            showToast('Unable to load projects. Please try again later.', 'error');
            elements.projectsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Unable to load projects</h3>
                    <p>GitHub API rate limit exceeded. Please try again in an hour.</p>
                </div>
            `;
        }
    }
}

// Add this new function to handle fresh GitHub data fetching:
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

    // Process repositories
    state.projects = await Promise.all(repos.map(async repo => {
        const isExecutable = CONFIG.EXECUTABLE_PROJECTS[repo.name] ||
                            (repo.topics && repo.topics.includes('executable'));

        let releaseInfo = null;
        if (isExecutable) {
            try {
                const releaseRes = await fetch(`https://api.github.com/repos/${CONFIG.GITHUB_USERNAME}/${repo.name}/releases/latest`);
                if (releaseRes.ok) releaseInfo = await releaseRes.json();
            } catch (e) {
                // No releases
            }
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
            liveDemo: repo.has_pages ? `https://${CONFIG.GITHUB_USERNAME}.github.io/${repo.name}/` : null,
            languages_url: repo.languages_url
        };
    }));

    // Update stats
    updateStats(repos, user);

    // Calculate language distribution
    await calculateLanguageDistribution();

    // Cache the results
    setCachedData(cacheKey, {
        repos: repos,
        user: user,
        projects: state.projects,
        languageData: state.languageData
    });

    // Initial render
    filterAndRenderProjects();
}

// Calculate language distribution from all repositories
async function calculateLanguageDistribution() {
    const languageMap = {};
    let totalBytes = 0;

    // Fetch language data for each repository (limit to first 10 to avoid rate limits)
    const reposToCheck = state.projects.slice(0, 10); // Check only first 10 repos

    for (const project of reposToCheck) {
        if (project.languages_url) {
            try {
                const response = await fetch(project.languages_url);
                if (response.ok) {
                    const languages = await response.json();

                    // Sum up language bytes
                    Object.entries(languages).forEach(([lang, bytes]) => {
                        languageMap[lang] = (languageMap[lang] || 0) + bytes;
                        totalBytes += bytes;
                    });
                }
            } catch (error) {
                console.log(`Failed to fetch languages for ${project.name}:`, error);
                // Continue with other repos
            }
        }
    }

    // If no language data, use project.language field as fallback
    if (Object.keys(languageMap).length === 0) {
        state.projects.forEach(project => {
            if (project.language && project.language !== 'Other') {
                languageMap[project.language] = (languageMap[project.language] || 0) + 1;
                totalBytes += 1;
            }
        });
    }

    // Convert to percentages and sort
    state.languageData = Object.entries(languageMap)
        .map(([lang, bytes]) => ({
            language: lang,
            percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
            bytes: bytes
        }))
        .sort((a, b) => b.bytes - a.bytes)
        .slice(0, 6); // Top 6 languages

    // Add "Other" category if we have data
    if (totalBytes > 0 && state.languageData.length > 0) {
        const topLanguagesBytes = state.languageData.reduce((sum, lang) => sum + lang.bytes, 0);
        const otherBytes = totalBytes - topLanguagesBytes;
        if (otherBytes > 0 && state.languageData.length >= 6) {
            // Replace the last item with "Other" if we have 6 languages already
            state.languageData[5] = {
                language: 'Other',
                percentage: Math.round((otherBytes / totalBytes) * 100),
                bytes: otherBytes
            };
        }
    }

    // Render the chart
    renderLanguageChart();
}


function updateStats(repos, user) {
    // Update hero stats with animation
    animateCounter(elements.totalRepos, 0, repos.length, 1000);
    
    const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

    animateCounter(elements.totalStars, 0, totalStars, 1000);
    animateCounter(elements.totalForks, 0, totalForks, 1000);

    // Update GitHub stats - handle missing data
    elements.githubRepos.textContent = user.public_repos || 0;
    elements.githubStars.textContent = totalStars || 0;
    elements.githubFollowers.textContent = user.followers || 0;
}

function animateCounter(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Project Filtering & Sorting
function sortProjects(projects) {
    return [...projects].sort((a, b) => {
        switch (state.sortBy) {
            case 'stars':
                return b.stars - a.stars;
            case 'created':
                return b.created - a.created;
            case 'name':
                return a.name.localeCompare(b.name);
            default: // 'updated'
                return b.updated - a.updated;
        }
    });
}

function filterAndRenderProjects() {
    let filtered = [...state.projects];

    // Apply search filter
    if (state.searchQuery) {
        filtered = filtered.filter(project =>
            project.name.toLowerCase().includes(state.searchQuery) ||
            project.description.toLowerCase().includes(state.searchQuery) ||
            project.topics.some(topic => topic.toLowerCase().includes(state.searchQuery)) ||
            project.language.toLowerCase().includes(state.searchQuery)
        );
    }

    // Apply category filter
    if (state.currentFilter !== 'all') {
        filtered = filtered.filter(project => {
            switch (state.currentFilter) {
                case 'python':
                    return project.language === 'Python';
                case 'javascript':
                    return project.language === 'JavaScript' || project.language === 'TypeScript';
                case 'web':
                    return project.topics.includes('web') || project.hasPages ||
                           ['HTML', 'CSS', 'JavaScript', 'TypeScript'].includes(project.language);
                case 'android':
                    return project.language === 'Java' || project.topics.includes('android') || 
                           project.topics.includes('kotlin') || project.language === 'Kotlin';
                case 'executable':
                    return project.isExecutable;
                default:
                    return true;
            }
        });
    }

    // Apply sorting
    state.filteredProjects = sortProjects(filtered);
    
    // Render
    renderProjects();
}

// Mobile-friendly project card rendering
function renderProjects() {
    if (state.projects.length === 0) {
        elements.projectsContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading projects...</p>
            </div>
        `;
        return;
    }

    const start = (state.currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const end = start + CONFIG.ITEMS_PER_PAGE;
    const pageProjects = state.filteredProjects.slice(start, end);

    if (pageProjects.length === 0) {
        elements.projectsContainer.innerHTML = '';
        elements.emptyState.style.display = 'block';
        elements.pagination.style.display = 'none';
        return;
    }

    elements.emptyState.style.display = 'none';

    // Render projects
    elements.projectsContainer.innerHTML = pageProjects.map((project, index) => {
        const isMobile = state.isMobile;
        
        return `
        <div class="project-card" style="animation-delay: ${index * 0.1}s" data-id="${project.id}">
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
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <span><i class="fas fa-code"></i> ${project.language}</span>
                        <span><i class="far fa-clock"></i> ${formatDate(project.updated)}</span>
                    </div>
                    ${project.topics.length > 0 ? `
                        <div class="project-tags">
                            ${project.topics.slice(0, 4).map(topic =>
                                `<span class="project-tag">${topic}</span>`
                            ).join('')}
                        </div>
                    ` : ''}
                ` : `
    <div class="mobile-project-info">
        <div class="project-meta">
            <span><i class="fas fa-code"></i> ${project.language}</span>
            <span><i class="far fa-clock"></i> ${formatDate(project.updated)}</span>
            <button class="description-toggle" data-id="${project.id}">
                <i class="fas fa-chevron-down"></i>
            </button>
        </div>
        <div class="mobile-description" id="desc-${project.id}" style="display: none;">
            <p class="project-description">${project.description}</p>
            ${project.topics.length > 0 ? `
                <div class="project-tags">
                    ${project.topics.slice(0, 3).map(topic =>
                        `<span class="project-tag">${topic}</span>`
                    ).join('')}
                </div>
            ` : ''}
        </div>
    </div>
`}
</div>
<div class="project-footer">
    <a href="${project.url}" target="_blank" class="project-btn code">
        <i class="fab fa-github"></i>
        <span>Code</span>
    </a>
    ${getProjectButtons(project, true)}
</div>
        </div>
    `}).join('');

    // Add click event for modal (non-mobile)
    // Add toggle events for mobile descriptions
if (state.isMobile) {
    document.querySelectorAll('.description-toggle').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const projectId = btn.dataset.id;
            const desc = document.getElementById(`desc-${projectId}`);
            const icon = btn.querySelector('i');

            if (desc.style.display === 'block') {
                desc.style.animation = 'slideUp 0.3s ease forwards';
                setTimeout(() => {
                    desc.style.display = 'none';
                    btn.classList.remove('expanded');
                }, 250);
                icon.className = 'fas fa-chevron-down';
            } else {
                desc.style.display = 'block';
                desc.style.animation = 'slideDown 0.3s ease forwards';
                btn.classList.add('expanded');
                icon.className = 'fas fa-chevron-up';
            }
        });
    });
}

    // Add toggle events for mobile descriptions
    if (state.isMobile) {
        document.querySelectorAll('.toggle-description').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = btn.dataset.id;
                const desc = document.getElementById(`desc-${projectId}`);
                const icon = btn.querySelector('i');
                const text = btn.querySelector('span');
                
                if (desc.style.display === 'block') {
                    desc.style.display = 'none';
                    icon.className = 'fas fa-chevron-down';
                    text.textContent = 'View Description';
                } else {
                    desc.style.display = 'block';
                    icon.className = 'fas fa-chevron-up';
                    text.textContent = 'Hide Description';
                }
            });
        });
    }

    // Update pagination
    updatePagination();
}

function getProjectIcon(project) {
    if (project.isExecutable) return 'fas fa-download';

    switch (project.language.toLowerCase()) {
        case 'python': return 'fab fa-python';
        case 'javascript': return 'fab fa-js';
        case 'typescript': return 'fab fa-js';
        case 'html': return 'fab fa-html5';
        case 'css': return 'fab fa-css3-alt';
        case 'java': return 'fab fa-java';
        case 'kotlin': return 'fab fa-android';
        case 'swift': return 'fab fa-swift';
        case 'php': return 'fab fa-php';
        case 'c#': return 'fas fa-code';
        case 'c++': return 'fas fa-code';
        default: return 'fas fa-code';
    }
}

function getProjectButtons(project, isMobile = false) {
    let buttons = '';

    if (isMobile) {
        // Compact buttons for mobile
        if (project.isExecutable && project.releaseInfo) {
            const downloadUrl = project.releaseInfo.assets?.[0]?.browser_download_url || project.releaseInfo.html_url;
            buttons += `
                <a href="${downloadUrl}" target="_blank" class="project-btn download">
                    <i class="fas fa-download"></i>
                    <span>DL</span>
                </a>
            `;
        } else if (project.liveDemo) {
            buttons += `
                <a href="${project.liveDemo}" target="_blank" class="project-btn demo">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Demo</span>
                </a>
            `;
        }
    } else {
        // Original desktop buttons
        if (project.isExecutable && project.releaseInfo) {
            const downloadUrl = project.releaseInfo.assets?.[0]?.browser_download_url || project.releaseInfo.html_url;
            const downloadText = project.releaseInfo.assets?.length ? 'Download' : 'View Release';
            buttons += `
                <a href="${downloadUrl}" target="_blank" class="project-btn download">
                    <i class="fas fa-download"></i>
                    <span>${downloadText}</span>
                </a>
            `;
        } else if (project.liveDemo) {
            buttons += `
                <a href="${project.liveDemo}" target="_blank" class="project-btn demo">
                    <i class="fas fa-external-link-alt"></i>
                    <span>Live Demo</span>
                </a>
            `;
        }
    }

    return buttons;
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

    // Generate page numbers
    let pagesHtml = '';
    const maxVisiblePages = 5;
    let startPage = Math.max(1, state.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        pagesHtml += `<button class="page-number" data-page="1">1</button>`;
        if (startPage > 2) pagesHtml += `<span class="page-dots">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        pagesHtml += `
            <button class="page-number ${i === state.currentPage ? 'active' : ''}" data-page="${i}">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) pagesHtml += `<span class="page-dots">...</span>`;
        pagesHtml += `<button class="page-number" data-page="${totalPages}">${totalPages}</button>`;
    }

    elements.pageNumbers.innerHTML = pagesHtml;

    // Add click events to page numbers
    document.querySelectorAll('.page-number').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentPage = parseInt(btn.dataset.page);
            renderProjects();
            window.scrollTo({ top: elements.projectsContainer.offsetTop - 100, behavior: 'smooth' });
        });
    });
}

// Project Modal
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
            ${project.topics.length > 0 ? `
                <div class="project-tags">
                    ${project.topics.map(topic => `<span class="project-tag">${topic}</span>`).join('')}
                </div>
            ` : ''}
            ${project.releaseInfo ? `
                <div class="release-info">
                    <h4><i class="fas fa-tag"></i> Latest Release</h4>
                    <p>Version ${project.releaseInfo.tag_name} • ${formatDate(new Date(project.releaseInfo.published_at), true)}</p>
                    ${project.releaseInfo.body ? `<p>${project.releaseInfo.body.substring(0, 200)}...</p>` : ''}
                </div>
            ` : ''}
            <div class="modal-actions">
                <a href="${project.url}" target="_blank" class="modal-btn primary">
                    <i class="fab fa-github"></i>
                    View on GitHub
                </a>
                ${project.isExecutable && project.releaseInfo ? `
                    <a href="${project.releaseInfo.html_url}" target="_blank" class="modal-btn">
                        <i class="fas fa-download"></i>
                        Download
                    </a>
                ` : ''}
                ${project.liveDemo ? `
                    <a href="${project.liveDemo}" target="_blank" class="modal-btn">
                        <i class="fas fa-external-link-alt"></i>
                        Live Demo
                    </a>
                ` : ''}
            </div>
        </div>
    `;

    elements.modalOverlay.classList.add('active');
}

// Language Chart with actual GitHub data
function renderLanguageChart() {
    const ctx = document.getElementById('languageChart');
    if (!ctx || state.languageData.length === 0) {
        // Show message if no language data
        const chartContainer = document.querySelector('.language-chart');
        if (chartContainer) {
            chartContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No language data available</p>';
        }
        return;
    }
    
    const chartContext = ctx.getContext('2d');
    const isDark = elements.body.classList.contains('dark-mode');

    // Prepare data
    const labels = state.languageData.map(l => l.language);
    const data = state.languageData.map(l => l.percentage);

    // Colors for different languages
    const languageColors = {
        'Python': '#3572A5',
        'JavaScript': '#F7DF1E',
        'TypeScript': '#3178C6',
        'HTML': '#E34C26',
        'CSS': '#563D7C',
        'Java': '#007396',
        'Kotlin': '#A97BFF',
        'Shell': '#89E051',
        'C++': '#00599C',
        'C#': '#239120',
        'PHP': '#777BB4',
        'Ruby': '#CC342D',
        'Go': '#00ADD8',
        'Rust': '#DEA584',
        'Swift': '#F05138',
        'Dart': '#00B4AB',
        'Other': isDark ? '#6C757D' : '#ADB5BD'
    };

    const backgroundColor = labels.map(label => 
        languageColors[label] || (isDark ? '#6C757D' : '#ADB5BD')
    );

    // Destroy existing chart properly
    if (languageChart && typeof languageChart.destroy === 'function') {
        try {
            languageChart.destroy();
        } catch (error) {
            console.log('Error destroying chart:', error);
        }
        languageChart = null;
    }

    try {
        languageChart = new Chart(chartContext, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
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
                            font: {
                                size: 11
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                },
                cutout: '65%',
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    } catch (error) {
        console.error('Error creating chart:', error);
        const chartContainer = document.querySelector('.language-chart');
        if (chartContainer) {
            chartContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">Chart could not be loaded</p>';
        }
    }
}


// Publications
async function fetchPublications() {
    try {
        const publications = [];

        // Fetch from DOI list
        for (const doi of CONFIG.PUBLICATIONS_DOI) {
            try {
                const pub = await fetchPublication(doi);
                if (pub) publications.push(pub);
            } catch (error) {
                console.log(`Failed to fetch publication ${doi}:`, error);
            }
        }

        // Try to load from file
        try {
            const response = await fetch(CONFIG.PUBLICATIONS_FILE);
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));

                for (const line of lines) {
                    const doi = extractDOI(line);
                    if (doi) {
                        const pub = await fetchPublication(doi);
                        if (pub) publications.push(pub);
                    }
                }
            }
        } catch (error) {
            // No publications file
        }

        state.publications = publications.sort((a, b) => b.year - a.year);
        renderPublications();

    } catch (error) {
        console.error('Error loading publications:', error);
        elements.publicationsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load publications</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

async function fetchPublication(doi) {
    try {
        const response = await fetch(`https://api.crossref.org/works/${doi}`);
        if (!response.ok) throw new Error('Failed to fetch publication');

        const data = await response.json();
        const pub = data.message;

        return {
            title: pub.title?.[0] || 'Untitled',
            authors: pub.author?.map(a => `${a.given || ''} ${a.family || ''}`).join(', ') || 'Unknown Authors',
            journal: pub['container-title']?.[0] || 'Unknown Journal',
            year: pub.published?.['date-parts']?.[0]?.[0] || 'N/A',
            doi: pub.DOI,
            url: pub.URL || `https://doi.org/${pub.DOI}`,
            abstract: pub.abstract ? pub.abstract.replace(/<[^>]*>/g, '') : null
        };
    } catch (error) {
        console.error(`Error fetching publication ${doi}:`, error);
        return null;
    }
}

function extractDOI(text) {
    const match = text.match(/10\.\d{4,}\/[^\s]+/);
    return match ? match[0] : null;
}

function renderPublications() {
    if (state.publications.length === 0) {
        elements.publicationsContainer.innerHTML = '';
        elements.publicationsEmpty.style.display = 'block';
        return;
    }

    elements.publicationsEmpty.style.display = 'none';
    elements.publicationsContainer.innerHTML = state.publications.map((pub, index) => `
        <div class="publication-card" style="animation-delay: ${index * 0.1}s">
            <div class="publication-header">
                <h3 class="publication-title">${pub.title}</h3>
                <p class="publication-authors">${pub.authors}</p>
                <p class="publication-journal">${pub.journal} • ${pub.year}</p>
            </div>
            ${pub.abstract ? `
                <div class="publication-abstract">
                    <p>${pub.abstract.substring(0, 200)}...</p>
                </div>
            ` : ''}
            <div class="publication-links">
                <a href="${pub.url}" target="_blank" class="publication-link primary">
                    <i class="fas fa-external-link-alt"></i>
                    View Paper
                </a>
                <a href="https://doi.org/${pub.doi}" target="_blank" class="publication-link">
                    <i class="fas fa-link"></i>
                    DOI
                </a>
            </div>
        </div>
    `).join('');
}

// Utility Functions
function formatDate(date, full = false) {
    if (!(date instanceof Date)) date = new Date(date);

    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 7 && !full) {
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days}d ago`;
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateVisitorCounter() {
    let count = localStorage.getItem('visitorCount') || '0';
    count = parseInt(count) + 1;
    localStorage.setItem('visitorCount', count.toString());
    elements.visitorCount.textContent = count.toLocaleString();

    // Update last updated time
    elements.lastUpdated.textContent = formatDate(new Date(), true);
}

// Export for debugging
window.state = state;
window.elements = elements;