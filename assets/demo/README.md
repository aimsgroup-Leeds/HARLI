# Recorded imagery and anatomy preview

These assets were exported on 24 September 2026 from the project's existing
[Vis2Reg — Liver AR Studio](https://jarm1ng.github.io/Vis2Reg-Demo/)
for the HARLI project website, at the project author's request.

Source repository: <https://github.com/Jarm1ng/Vis2Reg-Demo>

Source commit: `ac0418ca7251e9065fab3f1710f4adceca7d4596`

Source release directory in the author's workspace:
`AECAI-PRiSM-demo/github-release/Vis2Reg-Demo/`.

## Assets and rendering

| File | Size | Content |
| --- | --- | --- |
| `laparoscopic-original.webp` | 1600 × 900 | Recorded Patient 04 laparoscopic image, frame 204 (22.8 s). |
| `laparoscopic-overlay.webp` | 1600 × 900 | The same frame with the demo's saved manual liver registration and illustrative internal anatomy. |
| `anatomy.webp` | 1600 × 900 | The same case's prepared 3D meshes, viewed with the viewer's front camera preset. |

The original frame source is `data/frames/f_000204.jpg` (960 × 540).
Its 1600-pixel-wide export is browser-resampled, not additional source detail.
The meshes are from `data/meshes.json`; saved poses and camera parameters are
from `data/frames.json`. Included structures are the liver, two illustrative
tumours and the vena cava.

Exports used a fresh Chrome browser context, with no stored manual edits,
opening `?case=p4video&frame=204`. After the image and model finished loading:

```js
Vis2Reg.setEditMode('off');
Vis2Reg.setDisplay({ opacity: 65, spin: false, fog: false });
Vis2Reg.setMode('reg');
// Wait until the camera transition has finished, then export:
await Vis2Reg.captureImage({ original: true, width: 1600 });
await Vis2Reg.captureImage({ original: false, width: 1600 });
// Export the 3D anatomy view:
Vis2Reg.presetView('front');
await Vis2Reg.captureImage({ original: false, width: 1600 });
```

`opacity: 65` is the viewer's liver *transparency* setting, so the liver material
has alpha 0.35. All anatomy layers were enabled; point-cloud display was disabled.
PNG exports were encoded with `cwebp -q 86 -m 6`. No generative image editing,
retouching, pose adjustment, anatomical modification or image cropping was used.

The prepared liver mesh is an **input to registration**. Vis2Reg is a 3D–2D
registration method; it does not generate the meshes. The page uses the model
independently in its native 3D anatomy viewer; see [its source notice](../anatomy/README.md).

## Scientific and reuse scope

The public demo contains only the prepared Patient 04 sequence. The four
LLR-LUS cases in the local research workspace are excluded from these assets.

The overlay replays **saved manual registration**. Internal anatomy positions
are illustrative and have not been validated as camera-view ground truth.
These images do not show live inference or establish registration accuracy;
this is a research visualization, not a clinical navigation tool.

Retain this context in captions adjacent to the imagery. A suitable short
caption is: “Recorded laparoscopy with a prepared 3D overlay. Manual alignment;
illustrative internal anatomy.”

This repository does not grant an additional general reuse or redistribution
license for these images or source demonstration data. See the source project's
[DATA_NOTICE.md](https://github.com/Jarm1ng/Vis2Reg-Demo/blob/ac0418ca7251e9065fab3f1710f4adceca7d4596/DATA_NOTICE.md).
The Three.js MIT license applies to the third-party rendering library, not to
the demonstration images, models or registration records.
