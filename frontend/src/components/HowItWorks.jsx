import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Ambassadors connect",
    description:
      "Student ambassadors — plugged into every club and campus mailing list — connect their Gmail inbox to CampusScan with one click.",
  },
  {
    number: "02",
    title: "We scan every morning",
    description:
      "CampusScan automatically scans ambassador inboxes daily, pulling event announcements and identifying free food, meetings, and activities.",
  },
  {
    number: "03",
    title: "Students get a text",
    description:
      "Every morning at 8 AM, subscribers receive a short digest of what's happening on campus that day. No app, no login — just a text.",
  },
];

function StepCard({ step }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="step-card"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <div className="step-number">{step.number}</div>
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
          <p className="eyebrow">Simple process</p>
          <h2 className="section-heading">
            How it <span className="section-heading--accent">works</span>
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
