A service that scans campus club and announcement emails — sourced from student ambassadors
who are plugged into every mailing list — and sends event alerts to students who opt in via
text or the website.

thin-slice

1. Who is the user?
  Primary users (two roles):

  Ambassador:
  A college student who is subscribed to every club and campus mailing list.
  They connect their Gmail to CampusScan and become the data source for their school.
  Multiple ambassadors can exist per school for better coverage.
  They do not need to do anything after connecting — scanning is automatic.

  Subscriber:
  A college student who wants to know what is happening on campus.
  They do not connect any email. They just text JOIN to the CampusScan number
  or enter their phone number on the website.
  They receive a daily SMS digest every morning at 8AM.

  Secondary (later): Club organizers who want better turnout and less wasted food.

2. What's the problem?
  Students:
  Miss events they would have gone to if they had known about them
  Especially miss free food events and low-effort campus activities
  Do not want to search through emails or social media to find what is happening

  The core problem is: Good campus events are announced over club mailing lists that most
  students are not on. An ambassador who IS on those lists can be the bridge — their inbox
  becomes a shared signal that gets converted into plain-text alerts for everyone.

3. One end-to-end journey (thin slice)
  1. Ambassador clicks "Add Ambassador" in the admin dashboard
  2. Ambassador signs in with Google and grants Gmail read access
  3. Admin clicks "Scan Ambassador Inboxes" — backend reads ambassador's inbox,
     extracts events using keyword and date parsing, stores them
  4. A new student hears about CampusScan and texts JOIN to the Twilio number
     OR enters their phone number on the website
  5. Student receives a welcome text confirming they are subscribed
  6. Every morning at 8AM, CampusScan texts all active subscribers:
     - Today's events with time and location
     - Which ones have free food

4. What is explicitly out of scope (for this thin slice)?
  Calendar integration (Google Calendar add)
  Per-student Gmail login (students do not share their inbox — only ambassadors do)
  AI smart recommendations
  Club dashboards or organizer tools
  RSVP or attendance tracking
  Payments or ticketing
  Social features
  Editing events
  Supporting multiple email providers (Gmail only for now)
  Auto-scanning on a schedule (admin triggers scan manually for now)
