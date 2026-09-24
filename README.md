# HARLI — project website

Website for **Real-time high-fidelity augmented reality in laparoscopic liver resection**, University of Leeds.

- [Project website](https://aimsgroup-leeds.github.io/HARLI/)
- [MICCAI 2026 AE-CAI × PRiSM demo — Vis2Reg](https://jarm1ng.github.io/Vis2Reg-Demo/?case=p4video&frame=204)
- [Demo source repository](https://github.com/Jarm1ng/Vis2Reg-Demo)

## Files and local preview

The site uses plain HTML, CSS and JavaScript, with Google Fonts loaded from a CDN. No package installation or local build step is needed.

```text
index.html                           research content and page structure
assets/site.css                      refreshed styling and responsive layouts
assets/site.js                       image comparison and mobile navigation
assets/demo/                         exported images from the public demo
assets/demo/README.md                 asset sources and reuse notice
.github/workflows/jekyll-gh-pages.yml existing GitHub Pages deployment
docs/CHANGELOG-visual-refresh.md      scope, baseline and rollback notes
```

From the repository root, run:

```bash
python3 -m http.server 8000
```

Open [the local preview](http://localhost:8000/). Check desktop and narrow mobile layouts, navigation, the image comparison slider, publication links and the demo link before submitting changes.

## Editing the page

Research text, the four-stage framework, all 13 publication records, team details and contact links remain in `index.html`. The visual refresh adds:

- A hero comparison of the same Patient 04 laparoscopic RGB frame and registration overlay, with a range control.
- A `#demo` section linking directly to the MICCAI 2026 AE-CAI × PRiSM demo at frame 204.
- A real 3D preview in `#anatomy`, alongside the existing procedural Couinaud explainer.
- A link from Jiaming Feng's name to [his homepage](https://jarm1ng.github.io/).

Keep bibliography details, researcher roles and project claims consistent with their source records when editing. Update the publication count if records are added or removed. Prefer focused changes to research copy and styling so collaborators can review them separately.

## Images and attribution

The demo images are exports of the public Patient 04 demo assets, not generated replacement illustrations. See [the asset source and reuse notice](assets/demo/README.md) for provenance and export details; retain that notice when replacing or redistributing assets.

Captions distinguish the recorded laparoscopic view, demo registration output and 3D preview from the schematic research pipeline and browser-generated Couinaud model. Keep these distinctions: the demo illustrates registration research, not completion of every HARLI research stage or clinical validation of the full system. Do not describe every visual as a schematic or as unrelated to patient data.

For additional published figures, check the licence of the specific source and include the required attribution. A paper being publicly readable does not by itself grant permission to reuse its figures.

## Deployment and collaboration

The existing workflow, [jekyll-gh-pages.yml](.github/workflows/jekyll-gh-pages.yml), builds with Jekyll and deploys to GitHub Pages after a push to `main`; it also supports manual dispatch. This refresh leaves that workflow unchanged. A feature branch or pull request does not itself update the public site.

The refresh branch is `codex/demo-visual-refresh`, based on commit `cfb694de6956418899baba75ccb18f1b8ccd5bbd`. Before merging, fetch the latest `origin/main`, review changes made by other contributors and reconcile them on the feature branch. Preview the combined result and merge through a reviewed pull request. Do not force-push or reset shared history.

To undo a merged refresh, use GitHub's **Revert** action on its pull request and review the resulting reversal. Alternatively, create a new branch from the latest `main` and revert the specific integration commit: `git revert <squash-commit>` for a squash merge, or `git revert -m 1 <merge-commit>` for a merge commit after confirming parent 1 is `main`. Resolve conflicts while preserving subsequent edits, preview, and submit a rollback pull request. Reverting the refresh commit preserves history; resetting to the baseline could discard collaborators' later work.
