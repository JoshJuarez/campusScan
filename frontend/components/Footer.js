import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">CampusScan</span>
            <p className="footer-tagline">Campus life, delivered to your phone every morning.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-label">Product</p>
              <ul>
                <li><Link href="/#how-it-works">How It Works</Link></li>
                <li><Link href="/#features">Features</Link></li>
                <li><Link href="/#universities">Bring to My Campus</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-col-label">Legal</p>
              <ul>
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} CampusScan. All rights reserved.</p>
          <p>Text JOIN to get started.</p>
        </div>
      </div>
    </footer>
  );
}
