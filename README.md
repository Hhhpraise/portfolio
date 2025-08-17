# 🚀 Praise's Developer Portfolio

![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success?style=flat-square&logo=github)
![License](https://img.shields.io/github/license/Hhhpraise/portfolio?style=flat-square)
![Last Commit](https://img.shields.io/github/last-commit/Hhhpraise/portfolio?style=flat-square)

A dynamic portfolio showcasing my projects, built with **HTML/CSS/JS** and powered by the GitHub API. Features dark mode, project filtering, and real-time GitHub data.

**Live Demo:** 👉 [https://hhhpraise.github.io/portfolio/](https://hhhpraise.github.io/portfolio/)

---

## 📚 Table of Contents

- [Features](#-features)
- [Technologies Used](#-technologies-used)
- [How It Works](#-how-it-works)
- [Deployment](#-deployment)
- [Customization](#-customization)
- [Accessibility](#-accessibility)
- [Known Issues / Limitations](#-known-issues--limitations)
- [Contributing](#-contributing)
- [Contact](#-contact)
- [License](#-license)

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

## 🧰 Technologies Used

- **Languages:** HTML, CSS, JavaScript
- **Libraries:** (Vanilla JS; optionally integrate with frameworks)
- **APIs:** [GitHub REST API](https://docs.github.com/en/rest)
- **Deployment:** GitHub Pages
- **Other:** Shields.io for badges

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
- **Profile Info:** Update `index.html` (name, profile pic, social links).
- **Styling:** Modify CSS variables in `<style>` (colors, fonts, etc.).
- **Filters:** Add/remove tech stack buttons in the HTML.

```html
<!-- Example: Change profile section -->
<div class="profile-header">
  <img src="your-new-pic.jpg" class="profile-pic">
  <div>
    <h1>Your Name</h1>
    <p>Your custom tagline</p>
  </div>
</div>
```

---

## ♿ Accessibility

- Keyboard navigation supported for major interactive elements.
- Sufficient color contrast for readability.
- Responsive layout for screen readers and mobile devices.
- If you have suggestions to further improve accessibility, please open an issue!

---

## 🚧 Known Issues / Limitations

- Browser compatibility best in latest Chrome/Firefox/Edge; older IE not supported.
- GitHub API rate limits may restrict frequent data refreshes.
- No server-side rendering; all data is fetched client-side.
- Filtering by tech stack depends on repo topics/language detection accuracy.

---

## 🤝 Contributing

Contributions are welcome!  
- **Bug reports:** Use [issues](../../issues) for bugs and feature requests.
- **Pull requests:** Fork the repo, make changes on a branch, then submit a PR.
- For major changes, open an issue first to discuss what you’d like to change.

---

## 📬 Contact

- Email: hhhpraise33@gmail.com
- Twitter: [@Hhhpraise](https://twitter.com/Hhhpraise)
- GitHub: [Hhhpraise](https://github.com/Hhhpraise)

---

## 📄 License

This project is licensed under the MIT License.  
See the [LICENSE](./LICENSE) file for details.
