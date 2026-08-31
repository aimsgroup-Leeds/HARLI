# HARLI — project website

Static website for **Real-time high-fidelity augmented reality in laparoscopic liver resection**, University of Leeds.

One self-contained HTML file. No build step, no framework, no dependencies beyond Google Fonts loaded over CDN.

```
.
├── index.html                  the entire site
├── .nojekyll                   tells Pages to serve files as-is
├── .github/workflows/pages.yml deploys on push to main
└── README.md
```

## Publishing

1. Create a repository on GitHub and push these files to `main`:

   ```bash
   git init
   git add .
   git commit -m "HARLI project site"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPO.git
   git push -u origin main
   ```

2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.

3. Push again, or run the workflow manually from the **Actions** tab. The site appears at
   `https://USERNAME.github.io/REPO/` within a minute or two.

If you'd rather skip Actions entirely, set **Source** to **Deploy from a branch**, pick `main` and `/ (root)`, and delete `.github/`. The `.nojekyll` file matters either way — without it Pages runs the files through Jekyll, which ignores anything starting with an underscore.

### Custom domain

Add a file named `CNAME` at the root containing only the domain, e.g. `harli.leeds.ac.uk`, then configure the DNS record with your IT service. Update the `canonical` and `og:url` tags in `index.html` to match.

## Before you publish

Search `index.html` for these and replace them:

| Find | Replace with |
| --- | --- |
| `USERNAME.github.io/REPO` | the real site URL, in the `canonical` and `og:url` tags |
| `To confirm from the Leeds project record` | delete the `class="tbc"` wrapper once the details are filled in |

The **Project record** section is a placeholder. Fill in the principal investigator, co-investigators, researchers, funder and grant reference, award value, dates, partners and publications, then remove `class="tbc"` from that `<div>` so the dashed outline and the "to confirm" label disappear.

## Publications

The **Publications** section contains one template entry, marked with `class="tbc"`. Fill in the title, author list, venue and year from the paper itself, then remove `class="tbc"` from the `<li>`. Duplicate the `<li>` for each additional paper. Empty `href="#"` link chips should be deleted rather than left dead.

### Reusing figures from papers

Before putting a figure, table or block of text from a published paper on this site, check the licence of that specific paper. arXiv preprints are **not** uniformly open — the default arXiv licence grants distribution of the paper as a whole but does not grant reuse of individual figures elsewhere. Papers deposited under CC BY are reusable with attribution; those under a publisher's copyright are not, even when the authors are the same people running this site. Where a figure is reusable, credit it with the full citation and the licence in the caption.

## Editing the content

Everything lives in `index.html`. The sections in order:

- **Hero** — headline, summary, fact file, and the interactive laparoscope viewport
- **The problem** — clinical framing, the three barriers, epidemiology figures
- **The framework** — the four project stages
- **Anatomy** — the eight Couinaud segments
- **Impact** — outcomes and co-design with surgeons, patients and industry
- **Project record** — placeholder for people and funding
- **Contact**

Colours, typefaces and spacing are CSS custom properties in the `:root` block at the top of the `<style>` element. Changing `--drape`, `--oxblood` and `--overlay` re-themes the whole page.

## About the illustrations

Everything visual on this page is original and generated in the browser. Nothing is taken from a published figure, and nothing is patient data.

- **Hero viewport** — hand-drawn SVG. Anterior view of the liver with the Couinaud segments, portal and hepatic venous trees, a lesion with its margin, and a resection following the segment VIII boundary. The camera layer shows only the falciform ligament and the gallbladder, which are the two Couinaud-relevant landmarks genuinely visible on the organ surface.
- **3D model** — a procedural mesh built at run time in `<canvas>` with no 3D library. A unit sphere is deformed into a hepatic shape, then each face is assigned a segment using the three hepatic venous planes and the portal plane. Area-weighted, this gives roughly 61% right lobe, 36% left, 2.5% caudate, which is close to real proportions. To retune it, edit `surface()` and the `P_RHV` / `P_MHV` / `P_LHV` constants in the second `<script>` block.
- **Pipeline figure** — hand-drawn SVG, schematic only.

Captions on the page state that these are illustrative rather than project output. Please keep that wording, or replace the graphics with real figures and update the captions accordingly.

If you swap in a figure from a paper, check that paper's licence first — see the note under Publications above.

## Accessibility

The overlay wipe is operable with the slider beneath it as well as by dragging, keyboard focus is visible throughout, and `prefers-reduced-motion` disables the page-load sweep and all transitions.
