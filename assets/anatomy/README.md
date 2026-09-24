# HARLI inline anatomy viewer

The HARLI project page loads this viewer locally when the anatomy section
approaches the viewport. It does not embed, redirect to, or depend on the
Vis2Reg demo server. Three.js and the geometry are fetched only on demand.
There is no animation loop or automatic rotation: frames are drawn on input,
resize and return to the viewport.

## Source and scientific scope

`patient04-meshes.json` is an unmodified copy of `data/meshes.json` from the
author's public release of [Vis2Reg-Demo](https://github.com/Jarm1ng/Vis2Reg-Demo),
source commit `ac0418ca7251e9065fab3f1710f4adceca7d4596`. It contains the prepared
Patient 04 liver surface, two illustrative tumours, and the vena cava. No
recordings, per-frame registration files or additional local research cases
are bundled.

Vis2Reg is a registration method. It does **not** generate these meshes.
The viewer displays geometry prepared in advance; it performs neither
registration nor segmentation. Internal structure placement is illustrative,
not a validated ground-truth spatial relationship or clinical navigation aid.
The sidebar labels describe only the structures actually in the mesh file;
there are no inferred Couinaud segment labels.

The initial display uses the rotational component of the source demo's saved
frame-204 pose (from `data/frames.json`) to retain the same orientation as the
static preview. Translation and scale from that pose are discarded, and the
model is centred for viewing. “Front”, “Side” and “Top” are camera presets
relative to this display, not standardized patient-coordinate assertions.
The geometry, topology and source structure colours are unchanged.

The existing `../demo/anatomy.webp` is the static fallback. Its export
provenance is documented in [the image README](../demo/README.md).

This repository grants no new general reuse or redistribution licence for
the demonstration data. See the source project's
[DATA_NOTICE.md](https://github.com/Jarm1ng/Vis2Reg-Demo/blob/ac0418ca7251e9065fab3f1710f4adceca7d4596/DATA_NOTICE.md).

## Third-party rendering code

`vendor/three.min.js` and `vendor/OrbitControls.js` are unmodified copies from
the same public demo's `lib/` directory. Three.js r128 is distributed under
the MIT licence; the complete notice is retained in
[`vendor/LICENSE.threejs.txt`](vendor/LICENSE.threejs.txt).
This licence covers the library, not the anatomy assets.

## Integration and interaction

Include `viewer.css`, the HTML component with `id="anatomy-viewer"`, and
`viewer.js` with `defer`. Asset URLs are resolved relative to the viewer
script, so deployment under the GitHub Pages `/HARLI/` prefix works.

Mouse drag and arrow keys rotate the model. Buttons, `+` / `−` keys and
pinching zoom. Mouse-wheel scrolling is always passed to the page. On touch
devices, page scrolling remains available until “Enable touch rotation” is
pressed; “Done rotating” returns to page scrolling. Reset restores the front
view, all four structures, 65% liver transparency and solid surfaces.

If model loading or WebGL fails, the static image and a retry button remain
available. A lost WebGL context also returns to the fallback; retry creates
a new canvas and viewer. The static image is available without JavaScript.
