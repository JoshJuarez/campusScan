"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isLanding = pathname === "/";

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id) {
    if (!isLanding) {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  return (
    <nav className={`navbar${hidden ? " navbar--hidden" : ""}`}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          CampusScan
        </Link>

        <div className="navbar-links">
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => scrollTo("features")}>Features</button>
          <Link href="/events">Discover</Link>
          {session && (["club_admin", "system_admin"].includes(session.userRole)) && (
            <Link href="/admin/review">Review</Link>
          )}
          {session?.userRole === "system_admin" && (
            <Link href="/admin">Dashboard</Link>
          )}
          <button
            className="navbar-cta"
            onClick={() => scrollTo("universities")}
          >
            Get Alerts
          </button>
          {session && (
            <button onClick={() => signOut()}>Sign Out</button>
          )}
        </div>

        <button
          className="navbar-hamburger"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>
      </div>

      {menuOpen && (
        <div className="navbar-mobile">
          <button onClick={() => scrollTo("how-it-works")}>How It Works</button>
          <button onClick={() => scrollTo("features")}>Features</button>
          <Link href="/events" onClick={() => setMenuOpen(false)}>Discover Events</Link>
          {session && ["club_admin", "system_admin"].includes(session.userRole) && (
            <Link href="/admin/review" onClick={() => setMenuOpen(false)}>Review Queue</Link>
          )}
          {session?.userRole === "system_admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          )}
          <button
            className="navbar-cta"
            onClick={() => scrollTo("universities")}
          >
            Get Alerts
          </button>
          {session && (
            <button onClick={() => signOut()}>Sign Out</button>
          )}
        </div>
      )}
    </nav>
  );
}
