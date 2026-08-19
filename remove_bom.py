import os

def remove_bom(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()
    if content.startswith(b'\xef\xbb\xbf'):
        with open(filepath, 'wb') as f:
            f.write(content[3:])
            print(f"Removed BOM from {filepath}")

for root, _, files in os.walk('backend/src/main/java'):
    for file in files:
        if file.endswith('.java'):
            remove_bom(os.path.join(root, file))
