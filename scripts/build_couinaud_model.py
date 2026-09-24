#!/usr/bin/env python3
"""Build HARLI's display meshes from Xukun Zhang's existing Couinaud mask.

Optional offline asset build: numpy, nibabel, scipy, scikit-image, trimesh,
fast-simplification. No registration, inference, or new segment labels.
"""
import argparse
import hashlib
import json
from pathlib import Path

import nibabel as nib
import numpy as np
import trimesh
from skimage.measure import marching_cubes
from scipy.ndimage import gaussian_filter

SOURCE_SHA = '9e0b1c470bf2c9676612b1b66aa439f26c7c55a03acc5cf0abe86ef27e97dbf1'
SOURCE_COMMIT = 'd39722743db456e84082095cc7842f78663371f0'
NAMES = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']


def extract(mask, affine, face_limit):
    # A tight crop and an explicit background border keep every label closed.
    occupied = np.argwhere(mask)
    lo = occupied.min(axis=0)
    hi = occupied.max(axis=0) + 1
    crop = mask[tuple(slice(a, b) for a, b in zip(lo, hi))]
    crop = np.pad(crop.astype(np.float32), 3)
    spacing = np.sqrt(np.sum(affine[:3, :3] ** 2, axis=0))
    field = gaussian_filter(crop, sigma=0.6 / spacing)
    vertices, faces, _, _ = marching_cubes(field, level=0.5, step_size=1,
                                          allow_degenerate=False)
    vertices += lo - 3
    ras = (vertices[:, 0, None] * affine[:3, 0] +
           vertices[:, 1, None] * affine[:3, 1] +
           vertices[:, 2, None] * affine[:3, 2] + affine[:3, 3])
    if not np.isfinite(ras).all():
        raise ValueError('Non-finite transformed coordinates.')
    # RAS -> display left/superior/anterior. The same right-handed transform is
    # applied to all parts: patient's right appears on the viewer's left.
    world = np.column_stack((-ras[:, 0], ras[:, 2], ras[:, 1]))
    mesh = trimesh.Trimesh(vertices=world, faces=faces, process=False)
    mesh.fix_normals()
    initial_faces = len(mesh.faces)
    # Display-only smoothing and decimation; never invent a missing segment.
    trimesh.smoothing.filter_taubin(mesh, lamb=0.5, nu=0.5, iterations=8)
    # Increase the face budget when a collapse would leave an open surface.
    # The original closed surface remains the fallback; never fill invented gaps.
    target = face_limit
    while target < len(mesh.faces):
        candidate = mesh.simplify_quadric_decimation(face_count=target, aggression=5)
        if candidate.is_watertight:
            mesh = candidate
            break
        target *= 2
    mesh.fix_normals()
    return mesh, {'source_faces': initial_faces, 'display_faces': len(mesh.faces),
                  'watertight': bool(mesh.is_watertight),
                  'voxel_count': int(mask.sum())}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('--output', type=Path, default=Path('assets/couinaud/model.json'))
    args = parser.parse_args()
    digest = hashlib.sha256(args.input.read_bytes()).hexdigest()
    if digest != SOURCE_SHA:
        raise ValueError('Expected the pinned 3Dircadb-1 annotation; update provenance for a different case.')
    image = nib.load(args.input)
    data = np.asanyarray(image.dataobj)
    if not np.array_equal(np.unique(data), np.arange(9)):
        raise ValueError('Expected background 0 and source labels 1 through 8.')

    surfaces = []
    qc = {}
    for label, name in enumerate(NAMES, 1):
        mesh, quality = extract(data == label, image.affine, face_limit=7000)
        surfaces.append((label, name, mesh))
        qc[name] = quality
    whole, qc['surface'] = extract(data > 0, image.affine, face_limit=14000)
    centre = whole.bounds.mean(axis=0)
    scale = float(np.max(whole.extents) / 2)

    def pack(mesh):
        return {'positions': np.round((mesh.vertices - centre) / scale, 5).reshape(-1).tolist(),
                'indices': mesh.faces.reshape(-1).tolist()}

    result = {
        'source': {
            'author': 'Xukun Zhang et al.', 'dataset': '3D-IRCADb', 'case': '01',
            'repository': 'https://github.com/xukun-zhang/Couinaud-Segmentation',
            'commit': SOURCE_COMMIT, 'path': 'Datasets/3Dircadb/label/3Dircadb-1.nii.gz',
            'sha256': digest, 'label_ids': list(range(1, 9)),
            'label_convention': 'Source IDs 1–8 displayed as I–VIII; IV is not subdivided.',
            'voxel_shape': list(image.shape),
            'voxel_spacing_mm': [float(x) for x in image.header.get_zooms()],
            'nifti_affine': image.affine.tolist(),
            'display_axes': ['patient left', 'superior', 'anterior'],
            'display_centre_mm': centre.tolist(), 'display_scale_mm': scale,
            'processing': 'Per-label scalar smoothing sigma 0.6 mm and marching cubes at 0.5, native voxel grid/affine; Taubin 8 iterations (lambda=0.5, nu=0.5); quadric decimation (aggression 5), initial targets 7000 faces/segment and 14000 whole surface, doubled as needed to retain closed surfaces; joint uniform normalization; 5 decimal places.'
        },
        'segments': [dict(id=label, name=name, **pack(mesh)) for label, name, mesh in surfaces],
        'surface': pack(whole)
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, separators=(',', ':')))
    args.output.with_name('build-report.json').write_text(json.dumps(qc, indent=2))
    print(json.dumps({'output': str(args.output), 'bytes': args.output.stat().st_size,
                      'quality': qc}, indent=2))


if __name__ == '__main__':
    main()
