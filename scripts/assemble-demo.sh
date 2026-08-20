#!/usr/bin/env bash
set -euo pipefail
ROOT=/workspace/artifacts/demo
FRAMES=$ROOT/frames
CLIPS=$ROOT/clips
mkdir -p "$CLIPS"

still() {
  local img=$1 out=$2 t=$3 zoom=${4:-1.08} ymode=${5:-center}
  python3 - "$img" "$out" "$t" "$zoom" "$ymode" <<'PY'
import sys, subprocess
img, out, t, zoom, ymode = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5]
sw, sh = int(1920*zoom), int(1080*zoom)
fade_out_st = max(t - 0.35, t*0.7)
if ymode == "top":
    yexpr = f"0+(in_h-1080)*0.15*t/{t}"
elif ymode == "down":
    yexpr = f"(in_h-1080)*t/{t}"
else:
    yexpr = f"(in_h-1080)/2"
xexpr = f"(in_w-1920)/2"
vf = (
    f"scale={sw}:{sh}:force_original_aspect_ratio=increase,"
    f"crop={sw}:{sh},"
    f"crop=1920:1080:{xexpr}:{yexpr},"
    f"fps=30,"
    f"fade=t=in:st=0:d=0.28,"
    f"fade=t=out:st={fade_out_st:.3f}:d=0.32,"
    f"format=yuv420p"
)
cmd = [
    "ffmpeg","-y","-loop","1","-i",img,"-t",f"{t:.3f}",
    "-vf", vf, "-r","30","-c:v","libx264","-preset","fast","-crf","18",
    "-pix_fmt","yuv420p","-an", out
]
print("still", out, t)
subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
PY
}

echo "== stills =="
still "$FRAMES/title.png"        "$CLIPS/01-title.mp4"      4.0  1.04  center
still "$FRAMES/01-front.png"     "$CLIPS/03-front.mp4"      8.0  1.10  top
still "$FRAMES/02-autopsy.jpg"   "$CLIPS/04-autopsy.mp4"    8.0  1.08  center
still "$FRAMES/03-obituaries.png" "$CLIPS/06-obits.mp4"     6.0  1.08  center
still "$FRAMES/05-morgue.png"    "$CLIPS/08-morgue.mp4"     6.0  1.08  center
still "$FRAMES/end.png"          "$CLIPS/09-end.mp4"        6.2  1.03  center

echo "== full pan =="
ffmpeg -y -loop 1 -i "$FRAMES/00-full.png" -t 10.5 \
  -vf "scale=1920:-1,crop=1920:1080:0:'min((ih-1080)*t/10.1,ih-1080)',fps=30,fade=t=in:st=0:d=0.3,fade=t=out:st=10.15:d=0.3,format=yuv420p" \
  -r 30 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an "$CLIPS/05-pan.mp4"

echo "== b-roll =="
ffmpeg -y -i "$ROOT/press.mp4" -t 5.2 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,fade=t=in:st=0:d=0.25,fade=t=out:st=4.9:d=0.28,format=yuv420p" \
  -r 30 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an "$CLIPS/02-press.mp4"
ffmpeg -y -i "$ROOT/portraits.mp4" -t 5.2 \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,fade=t=in:st=0:d=0.25,fade=t=out:st=4.9:d=0.28,format=yuv420p" \
  -r 30 -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -an "$CLIPS/07-portraits.mp4"

echo "== concat =="
cat > "$CLIPS/list.txt" <<EOF
file '01-title.mp4'
file '02-press.mp4'
file '03-front.mp4'
file '04-autopsy.mp4'
file '05-pan.mp4'
file '06-obits.mp4'
file '07-portraits.mp4'
file '08-morgue.mp4'
file '09-end.mp4'
EOF
ffmpeg -y -f concat -safe 0 -i "$CLIPS/list.txt" -c copy "$CLIPS/picture.mp4"

echo "== mix audio =="
# voice 55.63s, delay 0.7s → ~56.3s; picture ~59s; pad voice, keep picture length
ffmpeg -y -i "$CLIPS/picture.mp4" -i "$ROOT/narration.mp3" \
  -f lavfi -t 70 -i "anoisesrc=color=brown:sample_rate=48000:amplitude=0.018" \
  -filter_complex "\
    [1:a]aresample=48000,aformat=channel_layouts=stereo,adelay=700|700,apad,volume=1.2[voice];\
    [2:a]aformat=channel_layouts=stereo,volume=0.22[noise];\
    [voice][noise]amix=inputs=2:duration=first:dropout_transition=2,alimiter=limit=0.96[a]\
  " \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest \
  "$ROOT/moai-bao-demo.mp4"

cp -f "$ROOT/moai-bao-demo.mp4" /workspace/public/demo/moai-bao-demo.mp4
ffmpeg -i "$ROOT/moai-bao-demo.mp4" -f null - 2>&1 | grep -E 'Duration|Video:|Audio:'
ls -lh "$ROOT/moai-bao-demo.mp4"
