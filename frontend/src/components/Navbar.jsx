import { useEffect, useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    function onScroll() {
      const currentY = window.scrollY;
      setHidden(currentY > lastY && currentY > 64);
      lastY = currentY;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className={`navbar ${hidden ? "navbar--hidden" : ""}`}>
      <div className="navbar-inner">
        <a href="/" className="navbar-logo">
          CampusScan
        </a>

        <div className="navbar-links">
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => scrollTo("features")}>Features</button>
          <button onClick={() => scrollTo("universities")} className="navbar-cta">
            Bring to My Campus
          </button>
        </div>

        <button
          className="navbar-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span className={open ? "bar bar--top open" : "bar bar--top"} />
          <span className={open ? "bar bar--mid open" : "bar bar--mid"} />
          <span className={open ? "bar bar--bot open" : "bar bar--bot"} />
        </button>
      </div>

      {open && (
        <div className="navbar-mobile">
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => scrollTo("features")}>Features</button>
          <button onClick={() => scrollTo("universities")} className="navbar-cta">
            Bring to My Campus
          </button>
        </div>
      )}
    </nav>
  );
}
