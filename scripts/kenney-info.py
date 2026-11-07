#!/usr/bin/env python3
"""Print the real size and the materials of Kenney GLB models.

Use it before you build a new asset, to match the kit's scale and colours.
Sizes apply each node's scale and translation, so they match what the scene shows.
Colours are the glTF base colour factors, in linear RGB.

Usage:
  python3 scripts/kenney-info.py washer trashcan desk
  python3 scripts/kenney-info.py --all
"""
import glob
import json
import os
import struct
import sys

KIT = os.path.join(os.path.dirname(__file__), '..', 'prototype', 'office-look', 'public', 'kenney', 'furniture')


def read_gltf(path):
    data = open(path, 'rb').read()
    length = struct.unpack('<I', data[12:16])[0]
    return json.loads(data[20:20 + length])


def size(g):
    lo, hi = [9e9] * 3, [-9e9] * 3

    def walk(i, s, t):
        n = g['nodes'][i]
        sc, tr = n.get('scale', [1, 1, 1]), n.get('translation', [0, 0, 0])
        t2 = [t[k] + tr[k] * s[k] for k in range(3)]
        s2 = [s[k] * sc[k] for k in range(3)]
        if 'mesh' in n:
            for p in g['meshes'][n['mesh']]['primitives']:
                a = g['accessors'][p['attributes']['POSITION']]
                for k in range(3):
                    for v in (a['min'][k] * s2[k] + t2[k], a['max'][k] * s2[k] + t2[k]):
                        lo[k], hi[k] = min(lo[k], v), max(hi[k], v)
        for c in n.get('children', []):
            walk(c, s2, t2)

    for r in g['scenes'][0]['nodes']:
        walk(r, [1, 1, 1], [0, 0, 0])
    return [round(hi[k] - lo[k], 2) for k in range(3)]


def main(names):
    if names == ['--all']:
        names = sorted(os.path.basename(f)[:-4] for f in glob.glob(os.path.join(KIT, '*.glb')))
    if not names:
        print(__doc__)
        return 1
    for name in names:
        path = os.path.join(KIT, name + '.glb')
        if not os.path.exists(path):
            print(f'{name}: not found (run `pnpm unpack` in prototype/office-look)')
            continue
        g = read_gltf(path)
        w, h, d = size(g)
        mats = ', '.join(
            f"{m.get('name')} {[round(x, 3) for x in m.get('pbrMetallicRoughness', {}).get('baseColorFactor', [])[:3]]}"
            for m in g.get('materials', []))
        print(f'{name}: {w} wide, {h} tall, {d} deep | {mats}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
