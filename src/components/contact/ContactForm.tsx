import { CONFIG } from '../../config';
import Magnet from '../reactbits/Magnet';

export default function ContactForm() {
  return (
    <form className="contact-form" id="contact-form" action={`https://formspree.io/f/${CONFIG.FORMSPREE_ID}`} method="POST">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" className="form-input" placeholder="Your name" required />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" name="email" className="form-input" placeholder="you@example.com" required />
      </div>
      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" className="form-textarea" placeholder="Tell me about your project..." required />
      </div>
      <Magnet padding={60} magnetStrength={4}>
        <button type="submit" className="form-submit">Send Message</button>
      </Magnet>
      <span className="form-success" id="form-success">Message sent! I'll get back to you soon.</span>
    </form>
  );
}
