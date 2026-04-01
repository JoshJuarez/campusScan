export default function Footer() {
  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-logo">CampusScan</span>
            <p className="footer-tagline">
              Campus life, delivered to your phone every morning.
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-label">Product</p>
              <ul>
                <li>
                  <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
                </li>
                <li>
                  <button onClick={() => scrollTo("features")}>Features</button>
                </li>
                <li>
                  <button onClick={() => scrollTo("universities")}>
                    Bring to My Campus
                  </button>
                </li>
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
