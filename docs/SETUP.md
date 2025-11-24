# D&D AN - Setup Guide

Complete guide to setting up API keys and running the game.

## Prerequisites

- Node.js 18.19+ (or 20+ for LangChain without warnings)
- npm 9+
- A terminal/command prompt

## Quick Start (Minimal Setup)

The **only required** API key is **Anthropic Claude** for the AI Dungeon Master and NPC agents.

### Step 1: Get Anthropic API Key

1. Go to: https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **Create Key**
5. Copy your API key (starts with `sk-ant-api03-...`)

### Step 2: Set Environment Variable

**On Linux/Mac/WSL:**
```bash
export VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
# or
export ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

**On Windows (PowerShell):**
```powershell
$env:VITE_ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
# or
$env:ANTHROPIC_API_KEY="sk-ant-api03-your-key-here"
```

**On Windows (CMD):**
```cmd
set VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
# or
set ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

### Step 3: Run the Game

```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

Open browser to: http://localhost:3000

**That's it!** The game will use placeholder images for now.

---

## Advanced Setup (With Image Generation)

Want AI-generated pixel art scenes? Choose one of these providers:

### Option A: OpenAI DALL-E 3 (Easiest)

**Pros:** Easy setup, great quality, consistent results
**Cons:** Higher cost (~$0.04 per image)
**Best for:** Quick setup, production use

#### Setup:

1. **Get API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Click **Create new secret key**
   - Copy your key (starts with `sk-...`)

2. **Set Environment Variables:**
   ```bash
   export VITE_IMAGE_PROVIDER=openai
   export OPENAI_API_KEY=sk-your-openai-key-here
   export VITE_OPENAI_API_KEY=sk-your-openai-key-here
   ```

3. **Restart Servers**

#### Pricing:
- DALL-E 3: $0.040 per 1024x1024 image
- Expect ~$1-2 per hour of gameplay (20-50 images)

---

### Option B: Replicate (Best for Pixel Art)

**Pros:** Specialized pixel art models, flexible, affordable
**Cons:** Slower generation (~5-10 seconds), setup required
**Best for:** Authentic retro pixel art style

#### Setup:

1. **Get API Key:**
   - Go to: https://replicate.com/account/api-tokens
   - Sign up with GitHub
   - Copy your API token

2. **Set Environment Variables:**
   ```bash
   export VITE_IMAGE_PROVIDER=replicate
   export REPLICATE_API_KEY=r8_your-replicate-key-here
   export VITE_REPLICATE_API_KEY=r8_your-replicate-key-here
   ```

3. **Restart Servers**

#### Pricing:
- SDXL: ~$0.01 per image
- Expect ~$0.50 per hour of gameplay

---

### Option C: Stability AI (Good Balance)

**Pros:** Official Stable Diffusion, good control, fair pricing
**Cons:** Requires careful prompt tuning
**Best for:** Custom control, batch generation

#### Setup:

1. **Get API Key:**
   - Go to: https://platform.stability.ai/
   - Sign up and add credits
   - Navigate to **API Keys**
   - Copy your key

2. **Set Environment Variables:**
   ```bash
   export VITE_IMAGE_PROVIDER=stability
   export STABILITY_API_KEY=sk-your-stability-key-here
   export VITE_STABILITY_API_KEY=sk-your-stability-key-here
   ```

3. **Restart Servers**

#### Pricing:
- SDXL: ~$0.02 per image
- Expect ~$1 per hour of gameplay

---

## Complete Environment Setup

### Using .env File (Recommended)

1. **Copy the example:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   # REQUIRED - AI Dungeon Master
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
   ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

   # OPTIONAL - Image Generation
   VITE_IMAGE_PROVIDER=placeholder  # Change to: openai, replicate, or stability

   # Only set the key for your chosen provider:

   # For OpenAI:
   # OPENAI_API_KEY=sk-your-openai-key
   # VITE_OPENAI_API_KEY=sk-your-openai-key

   # For Replicate:
   # REPLICATE_API_KEY=r8_your-replicate-key
   # VITE_REPLICATE_API_KEY=r8_your-replicate-key

   # For Stability AI:
   # STABILITY_API_KEY=sk-your-stability-key
   # VITE_STABILITY_API_KEY=sk-your-stability-key
   ```

3. **Restart servers** to pick up changes

### Using System Environment Variables

**Linux/Mac (.bashrc or .zshrc):**
```bash
# Add to ~/.bashrc or ~/.zshrc
export VITE_ANTHROPIC_API_KEY="sk-ant-api03-your-key"
export ANTHROPIC_API_KEY="sk-ant-api03-your-key"
export VITE_IMAGE_PROVIDER="placeholder"
```

Then: `source ~/.bashrc` or `source ~/.zshrc`

**Windows (System Environment Variables):**
1. Search "Environment Variables"
2. Click "Environment Variables" button
3. Add new variables under "User variables"
4. Restart terminal/IDE

---

## Verifying Setup

### Test Backend Server

Start the backend:
```bash
npm run server
```

**Expected output:**
```
=== D&D AN Server Configuration ===

✅ Anthropic API Key: Found
📸 Image Provider: placeholder

=== Configuration Complete ===

[Server] D&D AN backend running on port 3001
[Server] Health check: http://localhost:3001/api/health
```

**If you see errors:**
- ❌ Anthropic key missing → Server will EXIT
- ⚠️ Image provider key missing → Falls back to placeholder

### Test Frontend

Start the frontend:
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.4.21  ready in 964 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

Open http://localhost:3000 - game should load!

---

## Troubleshooting

### "Anthropic API key is REQUIRED but not found!"

**Problem:** The server can't find your Claude API key.

**Solution:**
1. Check you set the environment variable in the **same terminal** you're running `npm run server`
2. Verify the key starts with `sk-ant-api03-`
3. Try setting **both** variables:
   ```bash
   export VITE_ANTHROPIC_API_KEY=your-key
   export ANTHROPIC_API_KEY=your-key
   ```

### "OpenAI provider selected but API key not found!"

**Problem:** You set `VITE_IMAGE_PROVIDER=openai` but no OpenAI key.

**Solution:**
1. Either add the OpenAI key: `export OPENAI_API_KEY=sk-...`
2. Or switch back to placeholder: `export VITE_IMAGE_PROVIDER=placeholder`

The game will automatically fall back to placeholder if keys are missing.

### "Scene generation failed"

**Problem:** Image generation API returned an error.

**Possible causes:**
- Invalid API key
- Insufficient credits
- Rate limit exceeded
- API service down

**Solution:**
1. Check your API key is correct
2. Verify you have credits: Check your provider's dashboard
3. Switch to placeholder mode temporarily:
   ```bash
   export VITE_IMAGE_PROVIDER=placeholder
   ```

### "Failed to initialize game" (Browser)

**Problem:** Frontend can't connect to backend or API issue.

**Solution:**
1. Ensure backend is running (`npm run server` in another terminal)
2. Check backend didn't exit with errors
3. Open browser console (F12) for detailed error messages
4. Check backend terminal for error logs

---

## Cost Estimation

### Free Tier (Placeholder Mode)
- **Cost:** $0.00
- **Setup time:** 5 minutes
- **Images:** 1x1 pixel placeholders (instant)
- **AI DM:** Full Claude narrative (costs apply, see below)

### Minimal (Claude Only)
- **Cost:** ~$0.10-0.50 per hour
- **Claude API:** $3 per million input tokens, $15 per million output tokens
- **Typical usage:** 50-200 AI requests per hour = $0.10-0.50

### With OpenAI Images
- **Cost:** ~$1.50-2.50 per hour total
- **Claude:** $0.10-0.50
- **DALL-E 3:** $0.04 × 20-50 images = $0.80-2.00

### With Replicate Images (Cheapest)
- **Cost:** ~$0.60-1.00 per hour total
- **Claude:** $0.10-0.50
- **SDXL:** $0.01 × 20-50 images = $0.20-0.50

### With Stability AI Images
- **Cost:** ~$1.10-1.50 per hour total
- **Claude:** $0.10-0.50
- **SDXL:** $0.02 × 20-50 images = $0.40-1.00

---

## Recommended Setup

### For Development/Testing
```bash
export VITE_ANTHROPIC_API_KEY=your-claude-key
export VITE_IMAGE_PROVIDER=placeholder
```
**Cost:** ~$0.10-0.50 per hour
**Time to setup:** 5 minutes

### For Best Experience
```bash
export VITE_ANTHROPIC_API_KEY=your-claude-key
export VITE_IMAGE_PROVIDER=replicate
export REPLICATE_API_KEY=your-replicate-key
```
**Cost:** ~$0.60-1.00 per hour
**Time to setup:** 10 minutes
**Result:** Authentic pixel art scenes

### For Production/Demo
```bash
export VITE_ANTHROPIC_API_KEY=your-claude-key
export VITE_IMAGE_PROVIDER=openai
export OPENAI_API_KEY=your-openai-key
```
**Cost:** ~$1.50-2.50 per hour
**Time to setup:** 10 minutes
**Result:** Highest quality, most reliable

---

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Never commit API keys** to git
3. **Use environment variables** for production
4. **Rotate keys** if they're exposed
5. **Monitor usage** in your provider dashboards
6. **Set spending limits** on API accounts

---

## Need Help?

- **Documentation:** Check `/docs` folder
- **Issues:** https://github.com/DanMarshall909/dndan/issues
- **API Docs:**
  - Anthropic: https://docs.anthropic.com/
  - OpenAI: https://platform.openai.com/docs
  - Replicate: https://replicate.com/docs
  - Stability AI: https://platform.stability.ai/docs

---

## Summary Checklist

- [ ] Install Node.js 18.19+
- [ ] Run `npm install`
- [ ] Get Anthropic API key from https://console.anthropic.com/
- [ ] Set `VITE_ANTHROPIC_API_KEY` or `ANTHROPIC_API_KEY`
- [ ] (Optional) Choose image provider and get API key
- [ ] (Optional) Set image provider environment variables
- [ ] Run `npm run server` - should see ✅ for Anthropic key
- [ ] Run `npm run dev` in another terminal
- [ ] Open http://localhost:3000
- [ ] Play! 🎲

**Minimum required: Just Anthropic key. Everything else is optional!**
