# VoynichLabs website audit remediation plan

Date: 2026-10-08
Author: Codex GPT-6
Authorization: The user requested implementation of the published audit on 2026-10-08.

## Scope

Implement the six findings in `2026-10-08-code-audit.md`: article slugs, music deep links and fragment changes, native keyboard controls, responsive CLAW layout, and actual per-agent daily statistics. Address the associated maintenance concerns by reducing dashboard hydration data, deferring optional 3D code, reviewing dependency advisories, and repairing code-check diagnostics before enforcing the check. Preserve the existing albums, recordings, and visual designs.

## Architecture

Reuse existing player loading functions and add one shared fragment parser. Use native buttons with visible focus. Reuse the raw CLAW event source to derive small dashboard event records and shared per-agent counts; keep metrics and roster based on the same real records. Split optional tank rendering with React lazy loading. Keep content routes and Astro static deployment intact.

## Steps

1. Capture the existing check and dependency diagnostics; inspect affected code and data consumers.
2. Fix tag slugs and album fragments; replace track and pagination controls with buttons.
3. Make dashboard panels and controls responsive; compute daily agent activity from events.
4. Reduce island props and defer optional visualization bundles; review and apply compatible dependency repairs.
5. Repair code diagnostics and enforce passing checks where practical.
6. Build and preview affected pages; verify real keyboard, fragment, mobile, and data flows and record results.
7. Update the audit status and changelog, review the diff, then commit and push under the authorized main workflow.

## Documentation

Update `CHANGELOG.md` with behavior and verification. Add remediation results to the existing audit while retaining its original revision and evidence. Record remaining advisory limitations accurately.
