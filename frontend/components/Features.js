const features = [
  { icon: "📬", tag: "SMS", title: "Text to subscribe", description: "Students text JOIN to the CampusScan number and they're in. No account, no app, no email — just a phone number." },
  { icon: "📅", tag: "Daily digest", title: "8 AM every morning", description: "A short, scannable text lands every morning with what's happening on campus that day." },
  { icon: "🍕", tag: "Free food", title: "Free food alerts", description: "CampusScan flags every email that mentions free food, pizza, or refreshments so students never miss a meal." },
  { icon: "📧", tag: "Inbox coverage", title: "Club mailing lists", description: "Ambassadors are on every list. CampusScan reads their inbox so students don't have to subscribe to dozens of newsletters." },
  { icon: "🏫", tag: "Multi-university", title: "Built to scale", description: "Each university gets its own ambassador network. Subscribers only receive alerts for events on their campus." },
  { icon: "🔒", tag: "Privacy", title: "Your number stays yours", description: "CampusScan only uses your phone number to send campus alerts. Text STOP at any time to unsubscribe instantly." },
];

export default function Features() {
  return (
    <section id="features" className="section section--cream">
      <div className="section-inner">
        <div className="section-header">
          <p className="eyebrow">Everything students need</p>
          <h2 className="section-heading">
            Built for <span className="section-heading--accent">campus life</span>
          </h2>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card-top">
                <span className="feature-icon">{f.icon}</span>
                <span className="feature-tag">{f.tag}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
