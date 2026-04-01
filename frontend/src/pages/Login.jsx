import { useState } from "react";
import { createPartnershipLead, subscribePhone } from "../api";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subscriberMessage, setSubscriberMessage] = useState("");
  const [subscriberError, setSubscriberError] = useState("");
  const [subscriberLoading, setSubscriberLoading] = useState(false);

  const [leadForm, setLeadForm] = useState({
    contact_name: "",
    email: "",
    university: "",
    phone_number: "",
    preferred_timing: "",
    message: "",
  });
  const [leadMessage, setLeadMessage] = useState("");
  const [leadError, setLeadError] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);

  const handleSubscriberSubmit = async (event) => {
    event.preventDefault();
    setSubscriberLoading(true);
    setSubscriberError("");
    setSubscriberMessage("");

    try {
      const response = await subscribePhone({ phone_number: phoneNumber });
      setSubscriberMessage(response.data.message);
      setPhoneNumber("");
    } catch (error) {
      setSubscriberError(error.response?.data?.detail || "We could not save that number right now.");
    } finally {
      setSubscriberLoading(false);
    }
  };

  const handleLeadChange = (event) => {
    const { name, value } = event.target;
    setLeadForm((current) => ({ ...current, [name]: value }));
  };

  const handleLeadSubmit = async (event) => {
    event.preventDefault();
    setLeadLoading(true);
    setLeadError("");
    setLeadMessage("");

    try {
      const response = await createPartnershipLead(leadForm);
      setLeadMessage(response.data.message);
      setLeadForm({
        contact_name: "",
        email: "",
        university: "",
        phone_number: "",
        preferred_timing: "",
        message: "",
      });
    } catch (error) {
      setLeadError(error.response?.data?.detail || "We could not save your request right now.");
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <main className="landing-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Text-first campus alerts</p>
          <h1>CampusScan sends the best of campus life straight to your phone.</h1>
          <p className="hero-text">
            Built with Fordham University as the test case, CampusScan scans club and campus
            announcement emails — collected by student ambassadors who are plugged into every
            mailing list — and texts quick alerts about what is happening today, including free
            food and club events.
          </p>
          <div className="hero-highlights">
            <span>Club mailing list coverage</span>
            <span>Daily event notifications</span>
            <span>Free food alerts</span>
          </div>
        </div>

        <form className="panel" onSubmit={handleSubscriberSubmit}>
          <p className="panel-label">Get CampusScan texts</p>
          <h2>Enter your phone number</h2>
          <p className="panel-text">
            We will use this number for campus event texts and daily highlights.
          </p>

          <label htmlFor="phone_number">Phone number</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            placeholder="(555) 123-4567"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
          />

          <button type="submit" disabled={subscriberLoading}>
            {subscriberLoading ? "Saving..." : "Start text alerts"}
          </button>

          {subscriberMessage && <p className="success-message">{subscriberMessage}</p>}
          {subscriberError && <p className="error-message">{subscriberError}</p>}
        </form>
      </section>

      <section className="info-grid">
        <article className="info-card">
          <p className="eyebrow">How it works</p>
          <h2>Ambassadors power the data.</h2>
          <p>
            Student ambassadors are plugged into every club and campus mailing list. They connect
            their Gmail so CampusScan can scan their inbox, pull event announcements, and turn
            them into alerts for the whole campus.
          </p>
        </article>

        <article className="info-card">
          <p className="eyebrow">What students get</p>
          <h2>Short messages, not another dashboard.</h2>
          <p>
            Students do not need to dig through newsletters. Text JOIN or sign up below and get a
            direct text about club meetings, campus events, and where the free food is.
          </p>
        </article>
      </section>

      <section className="partnership-section">
        <div className="section-copy">
          <p className="eyebrow">Bring it to your campus</p>
          <h2>Want CampusScan at another university?</h2>
          <p>
            If you work at a university, student organization, or campus office and want to connect
            your school, send your information here. We will follow up to schedule a meeting and
            talk through onboarding your campus.
          </p>
        </div>

        <form className="panel partnership-form" onSubmit={handleLeadSubmit}>
          <label htmlFor="contact_name">Your name</label>
          <input
            id="contact_name"
            name="contact_name"
            value={leadForm.contact_name}
            onChange={handleLeadChange}
            required
          />

          <label htmlFor="email">Work or school email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={leadForm.email}
            onChange={handleLeadChange}
            required
          />

          <label htmlFor="university">University</label>
          <input
            id="university"
            name="university"
            value={leadForm.university}
            onChange={handleLeadChange}
            required
          />

          <label htmlFor="lead_phone_number">Phone number</label>
          <input
            id="lead_phone_number"
            name="phone_number"
            type="tel"
            value={leadForm.phone_number}
            onChange={handleLeadChange}
          />

          <label htmlFor="preferred_timing">Best time for a meeting</label>
          <input
            id="preferred_timing"
            name="preferred_timing"
            placeholder="Next week, afternoons, Zoom preferred"
            value={leadForm.preferred_timing}
            onChange={handleLeadChange}
          />

          <label htmlFor="message">What should we know?</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            placeholder="Tell us about your campus, your student audience, or what kinds of alerts you want to send."
            value={leadForm.message}
            onChange={handleLeadChange}
          />

          <button type="submit" disabled={leadLoading}>
            {leadLoading ? "Sending..." : "Request a meeting"}
          </button>

          {leadMessage && <p className="success-message">{leadMessage}</p>}
          {leadError && <p className="error-message">{leadError}</p>}
        </form>
      </section>
    </main>
  );
}
