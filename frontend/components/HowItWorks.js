"use client";

import { useEffect, useRef } from "react";

const steps = [
  {
    number: "01",
    title: "Ambassadors connect",
    description:
      "Student ambassadors on every club mailing list link their Gmail to CampusScan so we can read their inbox for event announcements.",
  },
  {
    number: "02",
    title: "We scan every morning",
    description:
      "At 7:45 AM, CampusScan automatically scans every ambassador inbox, extracts events, and flags anything with free food.",
  },
  {
    number: "03",
    title: "Students get a text",
    description:
      "Subscribers receive a short daily text with what is happening on campus today — no app, no email, just a simple SMS.",
  },
];

function StepCard({ step }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="step-card" ref={ref}>
      <p className="step-number">{step.number}</p>
      <h3 className="step-title">{step.title}</h3>
      <p className="step-description">{step.description}</p>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section section--light">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">Simple by design</p>
          <h2 className="section-heading">
            How <span className="section-heading--accent">CampusScan</span> works
          </h2>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
