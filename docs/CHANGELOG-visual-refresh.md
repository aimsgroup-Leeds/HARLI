# HARLI visual refresh

Date: 24 September 2026  
Branch: `codex/demo-visual-refresh`  
Baseline: `cfb694de6956418899baba75ccb18f1b8ccd5bbd`

First visual revision: `d361136`

## Scope

- Keep HARLI's research objectives at the centre of the hero, with navigation to the research and anatomy sections. Compare a public Patient 04 laparoscopic RGB frame with a prepared 3D overlay using saved manual alignment and a keyboard-operable range control.
- Place one modest MICCAI 2026 AE-CAI × PRiSM workshop resource after the 13 publication records, linking to [Vis2Reg at frame 204](https://jarm1ng.github.io/Vis2Reg-Demo/?case=p4video&frame=204).
- Embed a native interactive liver viewer in the anatomy section through `assets/anatomy/viewer.js` and `viewer.css`. Lazily load locally bundled Three.js, OrbitControls and `meshes.json`. Support pointer/touch orbit, keyboard rotation, camera presets, zoom, transparency, structure layers, reset and optional wireframe.
- Replace the procedural Couinaud model with the eight source segments extracted from Xukun Zhang’s 3D-IRCADb case 01 annotation, with IV displayed as one region.
- Refine typography, spacing, colour, mobile navigation and responsive publication/team layouts through `assets/site.css` and `assets/site.js`.
- Link Jiaming Feng's team entry to [his homepage](https://jarm1ng.github.io/).
- Preserve the existing research framework, all 13 publication records, team details and contact content.
- Document image exports in [assets/demo/README.md](../assets/demo/README.md), and prepared model data and third-party notices in [assets/anatomy/README.md](../assets/anatomy/README.md).

Vis2Reg performs registration and does not generate the meshes. The native viewer reuses prepared model inputs, while the hero overlay uses saved manual alignment. Neither performs registration inference; internal anatomy remains illustrative and unvalidated.

## Revision history

Commit `d361136` contains the first visual revision. The follow-up revision removes the prominent workshop banner, external hero call to action and large demo promotion section; it replaces the static anatomy promotion with in-page model interaction. The first revision remains in Git history and the correction is recorded separately for review and rollback. Commit `c03a054` adds the project-focused native anatomy viewer. A further revision replaces only the Couinaud explainer with Xukun Zhang’s real segment annotations, using the author permission already confirmed by the user. Research prose, bibliography and team content remain unchanged.

## Review and release

Preview with `python3 -m http.server 8000` from the repository root. Review the comparison and model controls, workshop resource, image captions, mobile layout and existing research content. Also check asset loading under the `/HARLI/` project path. The changes remain on the feature branch and have not been merged into `main` or deployed.

The existing `.github/workflows/jekyll-gh-pages.yml` remains unchanged. Only integration into `main` triggers its automatic public-site deployment. Fetch and reconcile the latest upstream edits before merging the feature branch through a reviewed pull request; do not force-push or reset shared history.

## Verification of the first revision

The following checks were recorded for `d361136`. They predate the native viewer and do not verify the follow-up revision.

- Browser checks at 320, 390, 768, 820, 1024 and 1440 pixels: no horizontal overflow.
- Original/overlay range keyboard and pointer controls, mobile menu and Escape, schematic modes, segment selection and keyboard rotation verified in Chrome.
- All local images load under the `/HARLI/` project path; no browser script errors.
- Automated axe WCAG 2 A/AA and WCAG 2.1 AA scan: no violations in the tested page state. This is a targeted check, not a full accessibility certification.
- All 13 publication texts and URLs, team details and existing problem/framework/impact/contact copy compared against the baseline.
- Desktop and mobile screenshots inspected; `git diff --check` and JavaScript syntax checks passed.

## Follow-up verification (c03a054)

The corrected project page and native viewer were checked in Chrome:

- No external demo link or workshop branding in the hero; exactly one demo resource link after the papers.
- Mesh and rendering libraries load only when the viewer approaches the viewport, using local `/HARLI/` asset URLs.
- Rendered-image comparisons verified presets, pointer and keyboard rotation, zoom, layer visibility, transparency, wireframe and full reset. Browser shortcuts retain their normal behaviour.
- Native touch events verified page scrolling before activation and pinch zoom in rotation mode. The activation/exit control remains available on hybrid touch devices. Mouse-wheel scrolling passes through to the page.
- Missing model data, unavailable WebGL and graphics-context loss retain the static image; data/context retries restore the viewer. An idle viewer issues no render calls.
- No horizontal overflow at 320, 390, 768, 820, 1024 and 1440 pixels. Desktop/mobile screenshots reviewed; no script errors.
- axe WCAG 2 A/AA and WCAG 2.1 AA checks returned no violations at 390 and 1440 pixels with the anatomy content available. These targeted checks are not a full accessibility certification.
- All 13 publication texts/URLs, team details and existing problem/framework/impact/contact copy still match the baseline. Local links and ARIA references resolve; source geometry and libraries are unchanged copies.
- JavaScript syntax and `git diff --check` pass.

## Real Couinaud replacement verification

- Source annotation checksum and nonzero labels 1–8 verified. Each labelled region and the union are extracted from the real mask, retaining physical spacing and the NIfTI affine. All nine prepared surfaces are closed with finite vertices, valid face indices and no degenerate triangles.
- The model is about 2.46 MB of JSON (about 0.80 MB under gzip) and loads only when the expanded explainer is nearby. The source and display processing are documented in `assets/couinaud/README.md` and the optional conversion script.
- Rendered-image checks cover all eight segment selections, repeat-selection toggle, raycast selection, Segments/Mesh/Surface, reset, zoom, mouse and keyboard rotation, and browser-shortcut preservation.
- Actual mobile gestures verify page scrolling with touch rotation off, model rotation without page movement when enabled, and tap-to-isolate. Load failure/retry and shared Three.js library loading pass.
- Responsive checks at 320, 390, 768, 820, 1024 and 1440 pixels show no overflow; axe checks at 390 and 1440 show no violations in tested states; both native viewers work with no script errors or idle render calls.
- Existing project prose, all 13 publications and team details remain unchanged. Only Couinaud-specific source captions and controls replace the prior schematic description. Segment IV is kept combined because the source has no separate IVa/IVb label.

## Rollback

Revert the refresh pull request using GitHub's **Revert** action, or make a rollback branch from the latest `main` and revert the specific merge/squash commit. For a normal merge, use `git revert -m 1 <merge-commit>` only after confirming the first parent is `main`; for a squash merge, use `git revert <squash-commit>`. Resolve any conflicts with later edits, preview and review the rollback pull request. Do not reset `main` to the baseline: later contributions must remain in history.
