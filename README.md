# 🚀 Praise's Developer Portfolio

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?style=flat-square&logo=github)
![License](https://img.shields.io/github/license/Hhhpraise/hhhpraise.github.io?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/Hhhpraise/hhhpraise.github.io?style=flat-square)

A dynamic portfolio showcasing my projects, built with **HTML/CSS/JS** and powered by the GitHub API. Features dark mode, project filtering, and real-time GitHub data.

**Live Demo:** 👉 [https://hhhpraise.github.io/portfolio/](https://hhhpraise.github.io)



---

## ✨ Features

- **GitHub Integration**  
  Fetches your repositories automatically using the GitHub API.
- **Modern UI**  
  Clean design with dark/light mode toggle (saves preference).
- **Smart Filtering**  
  Search and filter projects by tech stack (JavaScript, Python, etc.).
- **Responsive**  
  Works on mobile, tablet, and desktop.
- **Animated**  
  Smooth transitions and interactive elements.

---

## 🛠️ How It Works

1. **Fetches Data**  
   Uses the GitHub API to get your repositories (sorted by recent updates).
2. **Generates Cards**  
   Creates project cards with:
   - Descriptions
   - Stars/forks
   - Tags (from repo topics/languages)
   - Links to code and live demos (if GitHub Pages enabled)
3. **Interactive UI**  
   - Theme toggle (🌓/🌞)
   - Search bar
   - Filter buttons
   - Scroll-to-top button

---

## 🚀 Deployment

This is a **GitHub Pages** site. To set up yours:
1. Fork this repo or create a new one named `<username>.github.io`.
2. Push your code to the `main` branch.
3. Enable GitHub Pages in repo settings (under "Pages").

---

## 🔧 Customization

Edit these parts to personalize:
- **Profile Info**: Update `index.html` (name, profile pic, social links).
- **Styling**: Modify CSS variables in `<style>` (colors, fonts, etc.).
- **Filters**: Add/remove tech stack buttons in the HTML.

```html
<!-- Example: Change profile section -->
<div class="profile-header">
  <img src="your-new-pic.jpg" class="profile-pic">
  <div>
    <h1>Your Name</h1>
    <p>Your custom tagline</p>
  </div>
</div>