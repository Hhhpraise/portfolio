# Praise — Software Developer Portfolio

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deployed-success?style=flat-square&logo=github)
![License](https://img.shields.io/github/license/Hhhpraise/portfolio?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/Hhhpraise/portfolio?style=flat-square)

A motion-rich developer portfolio built with vanilla HTML, CSS, and JavaScript. Showcases live GitHub Pages projects, academic publications from ORCID, and a searchable catalog of open-source repositories — all wrapped in a dark cinematic design with GSAP-powered scroll animations.

**Live:** [hhhpraise.github.io/portfolio](https://hhhpraise.github.io/portfolio/)

---

## Features

- **Live Pages Carousel** — Auto-advancing iframe previews of every deployed GitHub Pages project, with swipe and keyboard navigation
- **Bento Grid** — Top 6 starred repos in a randomized gapless grid with 5 layout variants for visual variety
- **Searchable Catalog** — Filter, search, and sort every public repository with paginated results
- **Downloadable Projects** — Repos with GitHub Releases get a download badge and direct download button
- **ORCID Publications** — Academic papers pulled automatically from your ORCID profile via the public API
- **GSAP Scroll Animations** — Staggered hero reveal, ScrollTrigger-driven section entrances, and counter animations
- **Responsive Design** — Desktop, tablet, and mobile layouts with priority reordering on small screens
- **Contact Form** — Working form via Formspree with toast notifications
- **Dark Theme** — Near-black palette with orange accent (`#ff3d00`), Satoshi display font, and Geist body font

## Tech Stack

| Category | Technology |
|---|---|
| Markup | HTML5, semantic elements, structured data (JSON-LD) |
| Styling | CSS3, CSS Custom Properties, Grid, Flexbox, responsive breakpoints |
| Scripting | Vanilla JavaScript (ES6+), no framework |
| Animation | GSAP 3.12.5 with ScrollTrigger plugin |
| Typography | Satoshi + Geist via Fontshare |
| Icons | Font Awesome 6.4.0 |
| APIs | GitHub REST API, ORCID Public API |
| Forms | Formspree |
| Hosting | GitHub Pages |

## Quick Start

```bash
git clone https://github.com/Hhhpraise/portfolio.git
cd portfolio
# Open index.html in your browser — no build step required
```

## Deployment

Push to the `main` branch. GitHub Pages serves from the repository root or `docs/` folder depending on your settings.

## Customization

1. **GitHub username** — Change `CONFIG.GITHUB_USER` in `script.js`
2. **ORCID ID** — Change `CONFIG.ORCID_ID` in `script.js`
3. **Formspree ID** — Change `CONFIG.FORMSPREE_ID` in `script.js` to your own form endpoint
4. **Downloadable repos** — Add repo names to `CONFIG.EXECUTABLE_ALLOWLIST` or tag repos with `executable` on GitHub
5. **Styling** — All colors, fonts, and spacing live in CSS custom properties at the top of `style.css`

## Contact

- GitHub: [Hhhpraise](https://github.com/Hhhpraise)
- Email: hhhpraise33@gmail.com
- ORCID: [0009-0007-8597-9017](https://orcid.org/0009-0007-8597-9017)

## License

MIT — see [LICENSE](./LICENSE) for details.
