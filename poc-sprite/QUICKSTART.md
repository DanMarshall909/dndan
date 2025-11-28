# POC Quick Start Guide

## Prerequisites Check

The POC requires ComfyUI to be running. Since Docker commands need to be run from Windows (not WSL), follow these steps:

## Step 1: Start ComfyUI

**Option A: Using Docker Desktop (Windows)**

Open PowerShell or Command Prompt in Windows and navigate to the project:

```powershell
cd C:\code\dndan
docker compose up comfyui
```

Wait for ComfyUI to start (you'll see health check messages). Keep this terminal open.

**Option B: Verify ComfyUI is Already Running**

Check if ComfyUI is already running:
```bash
curl http://localhost:8188/system_stats
```

If you get a response with system stats, ComfyUI is ready!

## Step 2: Install Python Dependencies

In WSL (or Windows terminal in the poc-sprite directory):

```bash
cd /mnt/c/code/dndan/poc-sprite
pip install -r requirements.txt
```

## Step 3: Generate Sprites

```bash
python generate_sprites.py
```

Expected output:
```
==================================================
POC: Isometric Sprite Animation Generator
==================================================

[POC] Connecting to ComfyUI at http://localhost:8188...
✓ ComfyUI available

[POC] Generating Goblin...
  Frame 0/4: standing idle, centered pose... ✓ (8.2s)
  Frame 1/4: mid-stride walking, left foot f... ✓ (7.9s)
  ...
```

This will take approximately **90-120 seconds** to generate all sprites.

## Step 4: View Results

**Option A: Direct Open (Windows)**

From Windows Explorer, navigate to:
```
C:\code\dndan\poc-sprite\viewer.html
```

Double-click to open in your browser.

**Option B: Local Web Server**

```bash
cd /mnt/c/code/dndan/poc-sprite
python -m http.server 8080
```

Then open in browser: http://localhost:8080/viewer.html

## Step 5: Review Generated Sprites

Check the output directory:
```bash
ls -la output/
```

You should see:
```
output/
├── goblin/
│   ├── walk_0.png
│   ├── walk_1.png
│   ├── walk_2.png
│   ├── walk_3.png
│   ├── spritesheet.png
│   └── metadata.json
├── fighter/
│   └── ...
└── skeleton/
    └── ...
```

## Troubleshooting

### "ComfyUI not available"

1. **Check if Docker Desktop is running** (Windows system tray)
2. **Start ComfyUI** from Windows PowerShell:
   ```powershell
   cd C:\code\dndan
   docker compose up comfyui
   ```
3. **Wait for health check** - you'll see messages like:
   ```
   comfyui  | Successfully loaded model: v1-5-pruned-emaonly.safetensors
   ```
4. **Verify** from WSL:
   ```bash
   curl http://localhost:8188/system_stats
   ```

### "Module not found" errors

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Sprites look wrong or inconsistent

This is expected for first run! The POC helps us identify and fix these issues:

1. **Check the viewer.html** to see the sprites
2. **Note issues** (consistency, style, quality)
3. **We'll iterate** on prompts and parameters

### Generation is too slow

- Check GPU is available to ComfyUI
- Try reducing steps in `comfyui_client.py` (line 66: `"steps": 15` → `"steps": 10`)

## What to Evaluate

After successful generation, evaluate:

### ✅ Visual Quality
- [ ] Sprites clearly show the intended entity (goblin, fighter, skeleton)
- [ ] Walk animation looks smooth
- [ ] Characters are recognizable
- [ ] Pixel art style is cohesive

### ✅ Consistency
- [ ] Same character across all 4 frames
- [ ] No major visual glitches or artifacts
- [ ] Colors are consistent

### ✅ Technical
- [ ] All sprites are 32x32 pixels
- [ ] Backgrounds are transparent
- [ ] Sprite sheets pack correctly
- [ ] Metadata JSON is valid

### ✅ Performance
- [ ] Generation time is acceptable (~8s per frame)
- [ ] Total time for all sprites is reasonable (~90-120s)

## Next Steps

Based on results:

**If sprites look good** ✓
→ Proceed with full FastAPI service implementation

**If consistency issues** ⚠️
→ Add ControlNet workflow for better frame consistency

**If style issues** ⚠️
→ Adjust prompt templates and negative prompts

**If performance issues** ⚠️
→ Optimize ComfyUI workflow (reduce steps, smaller size)

---

## Manual Commands Reference

Start ComfyUI (Windows PowerShell):
```powershell
cd C:\code\dndan
docker compose up comfyui
```

Check ComfyUI status (WSL):
```bash
curl http://localhost:8188/system_stats
```

Generate sprites (WSL):
```bash
cd /mnt/c/code/dndan/poc-sprite
python generate_sprites.py
```

View sprites:
```bash
open viewer.html  # or use web server
```

Clean output for fresh run:
```bash
rm -rf output/*
```
