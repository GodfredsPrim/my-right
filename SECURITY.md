# Security notes

This project handles potentially sensitive support conversations. Treat all user content and uploads as untrusted.

- Keep service-role keys and AI keys server-side only.
- Do not place case content in localStorage, URLs, browser logs, or ordinary analytics.
- Keep evidence buckets private and issue short-lived signed URLs only after authorization.
- Validate every request with a schema and enforce authorization server-side.
- Treat AI safety output as a signal for escalation, never as a professional determination.
- Never let user messages or uploaded documents override system policy or tool permissions.
- Audit case access, assignment, status changes, evidence access, and administrative actions.

The included migration is a foundation, not a claim of completed compliance. Before production, add the full authenticated RLS policy suite, automated denied-access tests, rate limiting, malware scanning, retention workflows, and an operational incident response process.