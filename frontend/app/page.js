"use client";

import { useEffect, useRef, useState } from "react";
import HowItWorks from "../components/HowItWorks";
import Features from "../components/Features";
import Footer from "../components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function LandingPage() {
  const [universities, setUniversities] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [subscriberMessage, setSubscriberMessage] = useState("");
  const [subscriberError, setSubscriberError] = useState("");
  const [subscriberLoading, setSubscriberLoading] = useState(false);

  const [leadForm, setLeadForm] = useState({
    contact_name: "", email: "", university: "", phone_number: "", preferred_timing: "", message: "",
  });
  const [leadMessage, setLeadMessage] = useState("");
  const [leadError, setLeadError] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);

  const partnershipRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/universities`)
      .then((r) => r.json())
      .then((data) => setUniversities(data.universities || []))
      .catch(() => setUniversities([]));
  }, []);

  const filtered = query.trim()
    ? universities.filter((u) => u.toLowerCase().includes(query.trim().toLowerCase()))
    : universities;

  const handleSelectUniversity = (u) => {
    setSelectedUniversity(u);
    setQuery(u);
  };

  const handleNotListed = () => {
    partnershipRef.current?.scrollIntoView({ behavior: "smooth" });
    setLeadForm((f) => ({ ...f, university: query.trim() }));
  };

  const handleSubscriberSubmit = async (e) => {
    e.preventDefault();
    setSubscriberLoading(true);
    setSubscriberError("");
    setSubscriberMessage("");
    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneNumber, university: selectedUniversity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not save that number.");
      setSubscriberMessage(data.message);
      setPhoneNumber("");
    } catch (err) {
      setSubscriberError(err.message || "We could not save that number right now.");
    } finally {
      setSubscriberLoading(false);
    }
  };

  const handleLeadChange = (e) => {
    const { name, value } = e.target;
    setLeadForm((f) => ({ ...f, [name]: value }));
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setLeadLoading(true);
    setLeadError("");
    setLeadMessage("");
    try {
      const res = await fetch(`${API_URL}/partnerships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not save your request.");
      setLeadMessage(data.message);
      setLeadForm({ contact_name: "", email: "", university: "", phone_number: "", preferred_timing: "", message: "" });
    } catch (err) {
      setLeadError(err.message || "We could not save your request right now.");
    } finally {
      setLeadLoading(false);
    }
  };

  const panelState = selectedUniversity ? "subscribe" : "picker";

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Text-first campus alerts</p>
          <h1>CampusScan sends the best of campus life straight to your phone.</h1>
          <p className="hero-text">
            CampusScan scans club and campus announcement emails — collected by student ambassadors
            plugged into every mailing list — and texts quick daily alerts about what is happening
            today, including free food and club events.
          </p>
          <div className="hero-highlights">
            <span>Club mailing list coverage</span>
            <span>Daily event notifications</span>
            <span>Free food alerts</span>
          </div>
        </div>

        <div className="panel">
          {panelState === "picker" && (
            <>
              <p className="panel-label">Find your campus</p>
              <h2>Is CampusScan at your university?</h2>
              <p className="panel-text">
                Search for your school. If we are already there you can sign up for text alerts right away.
              </p>
              <label htmlFor="university-search">Your university</label>
              <div className="university-search-wrap">
                <input
                  id="university-search"
                  type="text"
                  placeholder="Search for your school..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setSelectedUniversity(null); }}
                  autoComplete="off"
                />
                {query.trim() && !selectedUniversity && (
                  <ul className="university-dropdown">
                    {filtered.length > 0 ? (
                      filtered.map((u) => (
                        <li key={u} onClick={() => handleSelectUniversity(u)}>{u}</li>
                      ))
                    ) : (
                      <li className="university-dropdown-empty">
                        No results for &ldquo;{query.trim()}&rdquo;
                      </li>
                    )}
                  </ul>
                )}
              </div>
              <button type="button" className="not-listed-link" onClick={handleNotListed}>
                My school is not listed — bring CampusScan to my campus
              </button>
            </>
          )}

          {panelState === "subscribe" && (
            <form onSubmit={handleSubscriberSubmit}>
              <button
                type="button"
                className="back-button"
                onClick={() => { setSelectedUniversity(null); setQuery(""); setSubscriberMessage(""); setSubscriberError(""); }}
              >
                ← Back
              </button>
              <p className="panel-label">Get CampusScan texts</p>
              <h2>{selectedUniversity}</h2>
              <p className="panel-text">
                Enter your phone number and we will text you daily campus event alerts and free food updates.
              </p>
              <label htmlFor="phone_number">Phone number</label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <button type="submit" disabled={subscriberLoading}>
                {subscriberLoading ? "Saving..." : "Start text alerts"}
              </button>
              {subscriberMessage && <p className="success-message">{subscriberMessage}</p>}
              {subscriberError && <p className="error-message">{subscriberError}</p>}
            </form>
          )}
        </div>
      </section>

      <HowItWorks />
      <Features />

      {/* Partnership section */}
      <section id="universities" className="section section--light" ref={partnershipRef}>
        <div className="section-inner partnership-layout">
          <div className="section-copy">
            <p className="eyebrow">Bring it to your campus</p>
            <h2 className="section-heading">
              Want CampusScan at your{" "}
              <span className="section-heading--accent">university?</span>
            </h2>
            <p>
              If you work at a university, student organization, or campus office, send your
              information here. We will follow up to schedule a meeting and talk through onboarding
              your campus.
            </p>
          </div>

          <form className="panel partnership-form" onSubmit={handleLeadSubmit}>
            <label htmlFor="contact_name">Your name</label>
            <input id="contact_name" name="contact_name" value={leadForm.contact_name} onChange={handleLeadChange} required />

            <label htmlFor="email">Work or school email</label>
            <input id="email" name="email" type="email" value={leadForm.email} onChange={handleLeadChange} required />

            <label htmlFor="university">University</label>
            <input id="university" name="university" value={leadForm.university} onChange={handleLeadChange} required />

            <label htmlFor="lead_phone_number">Phone number</label>
            <input id="lead_phone_number" name="phone_number" type="tel" value={leadForm.phone_number} onChange={handleLeadChange} />

            <label htmlFor="preferred_timing">Best time for a meeting</label>
            <input id="preferred_timing" name="preferred_timing" placeholder="Next week, afternoons, Zoom preferred" value={leadForm.preferred_timing} onChange={handleLeadChange} />

            <label htmlFor="message">What should we know?</label>
            <textarea id="message" name="message" rows="4" placeholder="Tell us about your campus and what kinds of alerts you want to send." value={leadForm.message} onChange={handleLeadChange} />

            <button type="submit" disabled={leadLoading}>
              {leadLoading ? "Sending..." : "Request a meeting"}
            </button>
            {leadMessage && <p className="success-message">{leadMessage}</p>}
            {leadError && <p className="error-message">{leadError}</p>}
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}
