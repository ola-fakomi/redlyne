# Security Policy

## Supported versions

| Version | Supported |
| ------- | --------- |
| 0.x     | Yes       |

## Reporting a vulnerability

Please do **not** open a public GitHub issue for security vulnerabilities.

Report security issues privately by emailing the maintainer, Ola Fakomi, at the address in the GitHub profile. Include:

- A description of the vulnerability and its potential impact.
- Steps to reproduce or a minimal proof of concept.
- The version of Redlyne where you found it.

You will receive a response within 72 hours. If the issue is confirmed, a fix will be released as soon as possible and you will be credited in the release notes unless you prefer otherwise.

## Scope

Redlyne is a Chrome extension that:
- Makes no network calls. All data stays in the browser.
- Reads and writes only to `localStorage` (theme preference) and the clipboard (on user action).
- Applies temporary CSS to the active page via a constructable stylesheet.
- Adds temporary `data-redlyne-id` and `data-redlyne-track` attributes to elements.

The main security concern is **prompt injection**: content on the page could attempt to inject instructions into the copied prompt. The generator sanitizes all page-derived strings before inserting them (see `src/prompt/generator.ts`). Reports about bypasses to this sanitization are especially welcome.
