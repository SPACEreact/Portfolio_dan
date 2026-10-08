"""Download public portfolio originals and publish browser-compatible local MP4s."""
import argparse
import json
from pathlib import Path
import subprocess
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]


def probe(path):
    result = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=codec_name,pix_fmt', '-of', 'json', str(path)], check=True, capture_output=True, text=True)
    return json.loads(result.stdout)


def prepare(work, source_dir=None):
    out = ROOT / 'site' / 'media'
    out.mkdir(parents=True, exist_ok=True)
    target = out / (work['file'] + '.mp4')
    poster = ROOT / 'site' / work['poster']
    if target.exists() and poster.exists():
        info = probe(target)
        if float(info['format']['duration']) > 0:
            print('Cached:', work['title'], flush=True)
            return
    with tempfile.TemporaryDirectory() as temp:
        source = source_dir / (work['file'] + '.mp4') if source_dir else Path(temp) / 'original.mp4'
        if not source_dir:
            for attempt in range(3):
                try:
                    subprocess.run(['gdown', work['id'], '-O', str(source)], check=True, timeout=600)
                    probe(source)
                    break
                except (subprocess.SubprocessError, ValueError):
                    source.unlink(missing_ok=True)
                    if attempt == 2:
                        raise
                    time.sleep(5)
        input_info = probe(source)
        temporary = out / (work['file'] + '.tmp.mp4')
        subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-y', '-i', str(source), '-map', '0:v:0', '-map', '0:a:0?', '-vf', 'scale=1280:720:force_original_aspect_ratio=decrease:force_divisible_by=2', '-c:v', 'libx264', '-preset', 'fast', '-crf', '28', '-pix_fmt', 'yuv420p', '-threads', '2', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(temporary)], check=True, timeout=600)
        output_info = probe(temporary)
        if abs(float(input_info['format']['duration']) - float(output_info['format']['duration'])) > 0.5:
            raise RuntimeError('Incomplete video: ' + work['title'])
        subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-sseof', '-2', '-i', str(temporary), '-f', 'null', '-'], check=True, timeout=60)
        temporary.replace(target)
        if not poster.exists():
            poster.parent.mkdir(parents=True, exist_ok=True)
            timestamp = min(12, float(output_info['format']['duration']) / 3)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(timestamp), '-i', str(target), '-frames:v', '1', '-vf', 'scale=1280:-2', str(poster)], check=True)
        print('Ready:', work['title'], flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-dir', type=Path)
    parser.add_argument('--only', nargs='*')
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'site' / 'media.json').read_text())
    for work in manifest:
        if not args.only or work['file'] in args.only:
            prepare(work, args.source_dir)
    print('Media preparation complete.', flush=True)
