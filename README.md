# HARLI — project website

Website for **Real-time high-fidelity augmented reality in laparoscopic liver resection**, University of Leeds.

- [Project website](https://aimsgroup-leeds.github.io/HARLI/)

## Files and local preview

The site uses plain HTML, CSS and JavaScript, with Google Fonts loaded from a CDN. The interactive anatomy viewer lazily loads locally bundled Three.js, OrbitControls and model data. No package installation or local build step is needed.

```text
index.html                           research content and page structure
assets/site.css                      refreshed styling and responsive layouts
assets/site.js                       image comparison and mobile navigation
assets/anatomy/viewer.js              native interactive 3D anatomy viewer
assets/anatomy/viewer.css             viewer layout and controls
assets/anatomy/patient04-meshes.json   prepared liver and internal anatomy meshes
assets/anatomy/README.md              model sources and third-party notices
assets/couinaud/                     real Couinaud surfaces, viewer and source notes
scripts/build_couinaud_model.py       optional reproducible mask-to-mesh conversion
assets/demo/                         exported laparoscopic and model images
assets/demo/README.md                 asset sources and reuse notice
.github/workflows/jekyll-gh-pages.yml existing GitHub Pages deployment
docs/CHANGELOG-visual-refresh.md      scope, baseline and rollback notes
```

From the repository root, run:

```bash
python3 -m http.server 8000
```

Open [the local preview](http://localhost:8000/). Check desktop and narrow mobile layouts, navigation, the image comparison slider, anatomy controls, publication links and the workshop demo link before submitting changes. Also preview under the `/HARLI/` project path used by GitHub Pages.

## Editing the page

Research text, the four-stage framework, all 13 publication records, team details and contact links remain in `index.html`. The visual refresh adds:

- A project-focused hero with links into the research and anatomy sections, plus a comparison of the same Patient 04 laparoscopic RGB frame and manually aligned 3D overlay.
- The real Couinaud model directly beneath the original eight-segment heading in `#anatomy`, visible without expanding a panel. It uses 3D-IRCADb case 01 annotations shared by Xukun Zhang et al.; IV is displayed as one source region.
- A separate `#internal-anatomy` section titled “Explore the anatomy beneath the surface.” for the project liver/tumour/vena-cava model, with rotation, presets, zoom, transparency, layers, reset and wireframe.
- One modest `#demo` resource after the 13 publication records, linking to the [MICCAI 2026 AE-CAI × PRiSM workshop demonstration](https://jarm1ng.github.io/Vis2Reg-Demo/?case=p4video&frame=204).
- A link from Jiaming Feng's name to [his homepage](https://jarm1ng.github.io/).

Keep bibliography details, researcher roles and project claims consistent with their source records when editing. Update the publication count if records are added or removed. Prefer focused changes to research copy and styling so collaborators can review them separately.

## Images, models and attribution

The hero images and internal-anatomy viewer reuse the prepared Patient 04 assets from the project's existing [demonstration repository](https://github.com/Jarm1ng/Vis2Reg-Demo). See the [image source notice](assets/demo/README.md) and [model source notice](assets/anatomy/README.md) for provenance and reuse details; retain these notices when replacing or redistributing assets.

Vis2Reg is a registration method: it aligns existing 3D anatomy with a 2D laparoscopic view and does not generate the meshes. The interactive viewer displays prepared model inputs; the hero overlay uses saved manual alignment. Neither runs registration inference. Internal anatomy is illustrative and unvalidated.

Keep captions clear about the recorded laparoscopic image, prepared 3D meshes and manually aligned overlay. The research pipeline diagram remains schematic. The Couinaud viewer instead uses a CT-derived annotated case, with no generated vessels or artificial segment boundaries. Its [source notice](assets/couinaud/README.md) records the existing author permission, pinned annotation, label convention and display processing. These visualisations do not establish completion or clinical validation of every HARLI research stage.

For additional published figures, check the licence of the specific source and include the required attribution. A paper being publicly readable does not by itself grant permission to reuse its figures.

## Deployment and collaboration

The existing workflow, [jekyll-gh-pages.yml](.github/workflows/jekyll-gh-pages.yml), builds with Jekyll and deploys to GitHub Pages after a push to `main`; it also supports manual dispatch. This refresh leaves that workflow unchanged. A feature branch or pull request does not itself update the public site.

The refresh branch is `codex/demo-visual-refresh`, based on commit `cfb694de6956418899baba75ccb18f1b8ccd5bbd`. The first visual revision is preserved in commit `d361136`; the project-focused revision is a separate follow-up change. These changes have not been merged into `main` or deployed. Before merging, fetch the latest `origin/main`, review changes made by other contributors and reconcile them on the feature branch. Preview the combined result and merge through a reviewed pull request. Do not force-push or reset shared history.

To undo a merged refresh, use GitHub's **Revert** action on its pull request and review the resulting reversal. Alternatively, create a new branch from the latest `main` and revert the specific integration commit: `git revert <squash-commit>` for a squash merge, or `git revert -m 1 <merge-commit>` for a merge commit after confirming parent 1 is `main`. Resolve conflicts while preserving subsequent edits, preview, and submit a rollback pull request. Reverting the refresh commit preserves history; resetting to the baseline could discard collaborators' later work.
