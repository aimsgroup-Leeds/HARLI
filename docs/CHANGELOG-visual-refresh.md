# Demo visual refresh

Date: 24 September 2026  
Branch: `codex/demo-visual-refresh`  
Baseline: `cfb694de6956418899baba75ccb18f1b8ccd5bbd`

## Scope

- Replace the schematic hero with a comparison of a public Patient 04 laparoscopic RGB frame and its Vis2Reg registration overlay; retain a keyboard-operable range control.
- Add a MICCAI 2026 AE-CAI × PRiSM demo section linking to [Vis2Reg at frame 204](https://jarm1ng.github.io/Vis2Reg-Demo/?case=p4video&frame=204).
- Add a real 3D preview to the anatomy section and retain the procedural Couinaud model as an explicitly labelled schematic explainer.
- Refine typography, spacing, colour, mobile navigation and responsive publication/team layouts through `assets/site.css` and `assets/site.js`.
- Link Jiaming Feng's team entry to [his homepage](https://jarm1ng.github.io/).
- Preserve the existing research framework, all 13 publication records, team details and contact content.
- Document demo exports and their provenance in [assets/demo/README.md](../assets/demo/README.md).

## Review and release

Preview with `python3 -m http.server 8000` from the repository root. Review the comparison controls, demo link, image captions, mobile layout and existing research content. The changes are prepared on the feature branch; the public site is updated only after integration.

The existing `.github/workflows/jekyll-gh-pages.yml` remains unchanged. Only integration into `main` triggers its automatic public-site deployment. Fetch and reconcile the latest upstream edits before merging the feature branch through a reviewed pull request; do not force-push or reset shared history.

## Verification

- Browser checks at 320, 390, 768, 820, 1024 and 1440 pixels: no horizontal overflow.
- Original/overlay range keyboard and pointer controls, mobile menu and Escape, schematic modes, segment selection and keyboard rotation verified in Chrome.
- All local images load under the `/HARLI/` project path; no browser script errors.
- Automated axe WCAG 2 A/AA and WCAG 2.1 AA scan: no violations in the tested page state. This is a targeted check, not a full accessibility certification.
- All 13 publication texts and URLs, team details and existing problem/framework/impact/contact copy compared against the baseline.
- Desktop and mobile screenshots inspected; `git diff --check` and JavaScript syntax checks passed.

## Rollback

Revert the refresh pull request using GitHub's **Revert** action, or make a rollback branch from the latest `main` and revert the specific merge/squash commit. For a normal merge, use `git revert -m 1 <merge-commit>` only after confirming the first parent is `main`; for a squash merge, use `git revert <squash-commit>`. Resolve any conflicts with later edits, preview and review the rollback pull request. Do not reset `main` to the baseline: later contributions must remain in history.
