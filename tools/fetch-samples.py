"""Fetch public research fixtures locally; do not redistribute them in releases."""
import base64, hashlib, json, pathlib, urllib.request
root = pathlib.Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'evidence/sample-manifest.json').read_text())
destination = root / 'local-samples'
destination.mkdir(exist_ok=True)
for row in manifest:
    request = urllib.request.Request('https://api.github.com/repos/thorsted/PRONOM_Research/git/blobs/' + row['sha'], headers={'User-Agent': 'quickcad-recovery-research'})
    with urllib.request.urlopen(request, timeout=30) as response:
        item = json.load(response)
    if item['encoding'] != 'base64':
        raise ValueError('Unexpected encoding')
    data = base64.b64decode(item['content'])
    assert len(data) == row['size']
    assert hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest() == row['sha']
    assert hashlib.sha256(data).hexdigest() == row['sha256']
    (destination / pathlib.Path(row['name']).name).write_bytes(data)
    print(row['name'], len(data), 'verified')
