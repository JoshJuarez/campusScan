export const metadata = {
  title: "Privacy Policy — CampusScan",
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <div className="shell" style={{ maxWidth: 760 }}>
        <section className="hero-panel">
          <p className="eyebrow">Legal</p>
          <h1 className="headline" style={{ margin: "8px 0 8px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Privacy Policy
          </h1>
          <p style={{ margin: 0, opacity: 0.75 }}>Last updated: April 13, 2025</p>
        </section>

        <section className="card" style={{ padding: 32, marginTop: 20, display: "grid", gap: 24 }}>
          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>What we collect</h2>
            <p>
              When you subscribe to CampusScan alerts, we collect your <strong>phone number</strong> and
              optionally your <strong>university affiliation</strong>. We do not collect your name, email
              address, or any other personal information through the SMS subscription flow.
            </p>
            <p>
              If you contact us directly, we may retain the contents of that communication.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>How we use it</h2>
            <p>
              Your phone number is used <strong>only</strong> to send you the CampusScan daily digest — one
              SMS per day containing campus events and free food alerts relevant to your university. Your
              university selection is used to filter events to your campus.
            </p>
            <p>
              We do not use your phone number for marketing, advertising, or any purpose beyond delivering
              the service you subscribed to.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Sharing and third parties</h2>
            <p>
              We do not sell, rent, trade, or share your phone number or any personal information with third
              parties for their own marketing purposes.
            </p>
            <p>
              We use <strong>Twilio</strong> to deliver SMS messages. Twilio processes your phone number
              solely to route the message to your carrier. You can review Twilio&rsquo;s privacy practices
              at twilio.com/legal/privacy.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Data retention</h2>
            <p>
              Your phone number remains in our system as long as your subscription is active. If you
              unsubscribe by replying <strong>STOP</strong>, your subscription is deactivated. You may
              request complete deletion of your record by contacting us at the address below.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Cookies and analytics</h2>
            <p>
              The CampusScan website does not currently use tracking cookies or third-party analytics
              services.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Changes to this policy</h2>
            <p>
              If we make material changes to this policy, we will update the date at the top of this page.
              Continued use of the service after changes are posted constitutes acceptance of the updated
              policy.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a href="mailto:campus.scan0@gmail.com">campus.scan0@gmail.com</a>.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
