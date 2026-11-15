"""Build phone GLBs from the original textured models (requires Pillow)."""
import io
import json
import struct
from pathlib import Path
from PIL import Image

models = Path(__file__).resolve().parents[1] / "public/models"
dest = models.parent / "mobile-models"
dest.mkdir(exist_ok=True)
pixels = 0
for source in sorted(models.glob("*.glb")):
    data = source.read_bytes()
    size, = struct.unpack_from("<I", data, 12)
    doc = json.loads(data[20:20 + size])
    images = doc.get("images", [])
    if not images:
        continue
    binary = memoryview(data)[28 + size:]
    payload = bytearray()
    by_view = {image["bufferView"]: image for image in images}
    for index, view in enumerate(doc["bufferViews"]):
        offset = view.get("byteOffset", 0)
        part = binary[offset:offset + view["byteLength"]]
        if index in by_view:
            image = Image.open(io.BytesIO(part))
            pixels += image.width * image.height
            image.thumbnail((512, 512), Image.Resampling.LANCZOS)
            encoded = io.BytesIO()
            image.save(encoded, format="PNG" if by_view[index]["mimeType"] == "image/png" else "JPEG", quality=85)
            part = encoded.getvalue()
        payload.extend(bytes(-len(payload) % 4))
        view.update(byteOffset=len(payload), byteLength=len(part))
        payload.extend(part)
    doc["buffers"][0]["byteLength"] = len(payload)
    payload.extend(bytes(-len(payload) % 4))
    meta = json.dumps(doc, separators=(",", ":")).encode()
    meta += b" " * (-len(meta) % 4)
    (dest / source.name).write_bytes(struct.pack("<4sIIII", b"glTF", 2, 28+len(meta)+len(payload), len(meta), 0x4E4F534A) + meta + struct.pack("<II",len(payload),0x004E4942) + payload)
print("Original texture RGBA MiB:",pixels*4/1024**2)
