export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-copy">&copy; {new Date().getFullYear()} Praise. Built with intention.</p>
        <div className="footer-links-row">
          <a href="https://github.com/Hhhpraise" target="_blank" rel="noopener" className="footer-link">GitHub</a>
          <a href="https://orcid.org/0009-0007-8597-9017" target="_blank" rel="noopener" className="footer-link">ORCID</a>
          <a href="mailto:hhhpraise33@gmail.com" className="footer-link">Email</a>
          <a href="#" className="footer-link">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
