export const metadata = {
  title: "Terms & Conditions — CampusScan",
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh" }}>
      <div className="shell" style={{ maxWidth: 760 }}>
        <section className="hero-panel">
          <p className="eyebrow">Legal</p>
          <h1 className="headline" style={{ margin: "8px 0 8px", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ margin: 0, opacity: 0.75 }}>Last updated: April 13, 2025</p>
        </section>

        <section className="card" style={{ padding: 32, marginTop: 20, display: "grid", gap: 24 }}>
          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Program description</h2>
            <p>
              <strong>CampusScan</strong> is a recurring SMS alert service that sends college students a
              daily digest of campus events, club meetings, and free food alerts happening at their
              university. Messages are sent once per day at approximately 8:00 AM local time.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Message frequency</h2>
            <p>
              Subscribers receive <strong>approximately 1 message per day</strong>. On days with no
              qualifying events, no message is sent.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Message and data rates</h2>
            <p>
              <strong>Message and data rates may apply.</strong> Charges are determined by your mobile
              carrier and plan. CampusScan does not charge a fee to subscribe.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>How to opt in</h2>
            <p>You can subscribe to CampusScan in two ways:</p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              <li>
                Visit <strong>campusscan.com</strong>, search for your university, enter your phone number,
                and click &ldquo;Start text alerts.&rdquo;
              </li>
              <li>
                Text <strong>JOIN</strong> to the CampusScan number. You will receive a confirmation reply.
              </li>
            </ul>
            <p>By opting in, you consent to receive recurring automated text messages from CampusScan.</p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>How to opt out</h2>
            <p>
              Reply <strong>STOP</strong> to any CampusScan message at any time to unsubscribe. You will
              receive a confirmation that your number has been removed. No further messages will be sent.
            </p>
            <p>
              To resubscribe after opting out, text <strong>JOIN</strong> or visit campusscan.com.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Help</h2>
            <p>
              Reply <strong>HELP</strong> to any CampusScan message or email{" "}
              <a href="mailto:campus.scan0@gmail.com">campus.scan0@gmail.com</a> for support.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Eligibility</h2>
            <p>
              CampusScan is intended for college students in the United States. By subscribing, you
              confirm that you are the account holder or have permission from the account holder of the
              phone number provided.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Limitation of liability</h2>
            <p>
              CampusScan provides event information on a best-effort basis. We do not guarantee the
              accuracy, completeness, or timeliness of event details. CampusScan is not responsible for
              events that are cancelled, rescheduled, or inaccurately described in source communications.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Changes to these terms</h2>
            <p>
              We may update these terms at any time. Continued use of the service after updates are posted
              constitutes acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="headline" style={{ fontSize: "1.4rem", marginTop: 0 }}>Contact</h2>
            <p>
              <a href="mailto:campus.scan0@gmail.com">campus.scan0@gmail.com</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
