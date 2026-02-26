Prompt-ladder
Scaffold
A basic web app or script
Google login (or even just hardcoded test inbox at first)
Pull a few emails
  Super simple parsing:
  Look for keywords like: pizza, food, refreshments, event
Try to extract:
    Title (subject line) Date/time (even if hacky)
Print results on screen
Button: “Add to Calendar” (even if it only logs something)
Finished when: It can connect an inbox, see 1–2 detected events, and click something that
tries to add it to a calendar.

Deliverables
Simple UI:
List of detected events
Show: title, date, location (if found), “Free food” + emoji
Real calendar integration (Google Calendar API)
Real “Add to Calendar” works
Handle at least:
  5–10 recent emails
  1–2 formats of event emails
Finished when: You can Sign In → see events → click add → it appears on respective
calendar

Core Flow
Login → Scan → Review → Add to Calendar
Have to finalize:
Better email filtering:
  Better extraction:
  Only scan school domains or mailing lists
  More robust date/time parsing
  Fewer false positives
Deduplication:
Same event forwarded twice ≠ two events
Error handling:
If date not found → show “Needs review” instead of breaking

Data + validation
Is this email referring to an existing event?
Did the location change?
Did the time change?
Should I update the existing calendar entry instead of creating a new one?
Features here:
  Event matching (by title + date + club, etc.)
  Change detection Versioning / last-updated timestamp
  User prompt:
    This event’s location changed from Lowenstein 301 to Lowenstein 604.
    Update calendar?

UX polish
Highlight what changed:
  Location changed
  Time updated
One-click: Accept update
Subtle notification instead of spam

Docs + cleanup
How updates are detected
What happens when conflicts occur
Known limitations (Missed updates due to a vague email)
