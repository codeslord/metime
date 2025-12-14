# 🎨 Crafternia

> **Dissect your imagination. Build reality.**

**Powered by [BRIA FIBO](https://bria.ai/fibo)** — Showcasing JSON-native control and production-ready multiagent workflows

**[🚀 Try the Live App](https://crafternia.vercel.app/)** • **[🎥 Watch the Demo](https://youtu.be/DVyiDgaXrns)**

---

## 💔 The Problem — Why We Built This

> *Remember when we were kids? When I was eight years old, I got this origami kit with a beautiful instruction manual. I wanted to make a paper plane. I followed the guide — step by step, fold by fold — and it worked perfectly. I'm sure you all have memories of creating crafts using those clear, simple manuals.*
>
> *But today? For most of our creative ideas... those manuals simply don't exist.*

**That world is gone.**

Today, when someone asks *"How do I make a paper crane?"*, they face:
- 47-minute YouTube tutorials with unskippable ads
- Blog posts buried under SEO filler
- Pinterest boards leading to broken links
- Instagram reels that flash by too fast to follow

**The beautiful simplicity of visual instruction sheets died with the 90s.** Except the IKEA manuals. The Tamiya model kits. The Simplicity sewing patterns. All gone.

*"We all have a hobby. Whether it's woodworking, origami, or just tinkering — we love building things.*
>
> ***The beautiful art of visual instruction sheets is dead.***
>
> *Until now."*

### Why did it die?

Because professional instruction sheets were **expensive** — you needed expert makers, photographers, graphic designers, and print production. Only big companies could afford this.

**Crafternia brings it back for everyone — powered by BRIA FIBO's professional-grade visual AI.**

---

## ✨ The Solution — What Crafternia Does

Crafternia is an **AI-powered Infinite Craft Workbench** that transforms any craft idea into professional-quality visual instruction guides using **BRIA FIBO's JSON-native control and multiagent workflows**.

**Give it any idea:**
- *"Paper crane"*
- *"Clay turtle"*  
- *"Earrings in the shape of Santa Claus"*

**Get back:**

| Component | What It Does |
|-----------|--------------|
| 📷 **Master Reference Image** | Studio-quality photograph generated with FIBO's disentangled control |
| 📦 **Materials List** | AI-extracted from VLM dissection |
| 📋 **Step-by-Step Cards** | Progressive refinement using FIBO's Refine mode |
| 🎯 **Isolated Step Images** | Consistent background, progressive craft — human hands performing actions |

### 8 Supported Craft Categories

| | | | |
|:-:|:-:|:-:|:-:|
| 📄 Papercraft | 🏺 Clay | 🧵 Fabric | 🎭 Costumes & Props |
| 🪵 Woodcraft | 💎 Jewelry | 🧒 Kids Crafts | 🎨 Coloring Book |

Each category has a **specialized agent** with domain-specific prompts and refinement logic.

---

## 🤖 The Architecture — BRIA FIBO + Multiagent System

**This is the core innovation.** Crafternia showcases BRIA FIBO's unique capabilities through a **production-ready multiagent architecture** where specialized AI agents collaborate to generate visually consistent craft instructions.

### FIBO Integration Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                    🎭 AGENT ORCHESTRATOR                              │
│  Routes tasks to specialized category agents based on craft type      │
└─────────────────────────────┬─────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ 📷 MASTER IMAGE  │  │ 🔬 DISSECTION    │  │ 🎯 STEP IMAGES   │
│   GENERATION     │  │   VLM ANALYSIS   │  │   REFINEMENT     │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                    │                    │
         │                    │                    │
   ┌─────▼────────────────────▼────────────────────▼─────┐
   │         BRIA FIBO API (JSON-Native Control)         │
   ├─────────────────────────────────────────────────────┤
   │  • VLM-to-JSON Translator (1000+ word prompts)      │
   │  • Structured Prompt Generation (lighting, camera)  │
   │  • Refine Mode (same seed + progressive changes)    │
   │  • Disentangled Control (modify only specific parts)│
   └─────────────────────────────────────────────────────┘
```

### How FIBO Powers Each Step

#### 1. Master Image Generation
```typescript
// User prompt → VLM translates to structured JSON
const structuredPrompt = await createMasterPrompt(userPrompt, category);
const result = await BriaService.generateImage('', undefined, structuredPrompt);
// Returns: { imageUrl, structuredPrompt, seed }
```

**FIBO's VLM** creates a 1000+ word structured JSON with:
- **Objects**: Detailed craft components with materials
- **Lighting**: Studio photography (soft box, diffused)
- **Camera**: Angle, FOV, depth of field
- **Aesthetics**: Color palette, mood, texture
- **Background**: Neutral, professional setting

#### 2. Step Refinement (The Innovation)
```typescript
// Progressive refinement with FIBO's Refine mode
for each step:
  refinementInstruction = createRefinementInstruction(step, completionPercent);
  // Example: "show human hands folding paper, beginning the craft. 
  //  Keep the paper, table surface, and background exactly the same."
  
  result = await BriaService.refineImage(
    masterStructuredPrompt,  // Full JSON from master
    masterSeed,              // Same seed for consistency
    refinementInstruction    // Short text: what changes
  );
```

**Key insight**: FIBO's **disentangled control** allows us to:
- ✅ Keep background, lighting, materials **identical**
- ✅ Modify only craft progress and hand position
- ✅ Maintain compositional consistency (same seed)
- ✅ Show progressive construction naturally

#### 3. Final Step = Master Image
```typescript
// Step 6 uses exact master structured prompt
if (stepNumber === totalSteps) {
  return BriaService.generateImage('', undefined, masterStructuredPrompt, masterSeed);
  // Perfect visual match - full circle
}
```

### Category-Specific Agents

Each craft category has specialized refinement prompts:

| Category | Hand Actions | Preservation Context |
|----------|-------------|---------------------|
| **Papercraft** | "human hands folding paper" | Keep paper, table surface same |
| **Clay** | "human hands molding clay" | Keep work surface, tools same |
| **Woodcraft** | "human hands cutting wood" | Keep workbench, tools same |
| **Jewelry** | "human hands threading beads" | Keep jewelry mat, components same |
| **Kids Crafts** | "child's hands gluing pieces" | Keep craft table, supplies same |
| **Coloring** | "human hand drawing outlines" | Keep paper, coloring tools same |

**Why specialized agents?**
- A papercraft needs fold lines and flat patterns
- A clay craft needs sculpting textures and 3D forms
- **One generic prompt cannot do both well**

---

## 🏆 BRIA FIBO Hackathon Showcase

### Targeting These Tracks:

#### ✅ **Best JSON-Native or Agentic Workflow** (Primary)
- **VLM-to-JSON Pipeline**: Gemini 2.5 Flash → 1000+ word structured prompts
- **Multiagent Architecture**: 8 category-specific agents + orchestrator
- **Production-Ready**: Complete pipeline from idea → master → steps → export
- **Scalable**: Easy to add new categories, each with specialized logic

#### ✅ **Best Controllability** (Secondary)
- **Disentangled Control**: Modify hands/craft while preserving background
- **Structured Parameters**: Precise control over lighting, camera, aesthetics
- **FIBO Refine Mode**: Same seed + refinement instruction = perfect consistency
- **Category Awareness**: Prompts adapt to material properties (paper vs clay vs wood)

#### ✅ **Best New User Experience**
- **Infinite Canvas**: Spatial UI for organizing instructions
- **Progressive Refinement**: Clear visual progression from raw materials → finished
- **Export Ready**: Download complete instruction sets as production assets

### Technical Innovation

```
User Prompt → VLM Analysis
           ↓
  Structured JSON (1000+ words)
           ↓
  FIBO Master Generation (with seed)
           ↓
  VLM Dissection (materials + steps)
           ↓
  FIBO Refine Mode (5 steps)
  • Same seed for consistency
  • Same structured prompt base
  • Progressive refinement instructions
  • Human hands performing actions
           ↓
  Final Step = Master Exact Match
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | Modern UI framework |
| **TypeScript** | Type-safe development |
| **React Flow** (@xyflow/react) | Infinite canvas with pan/zoom |
| **BRIA FIBO** | **🌟 JSON-native image generation** |
| **Google Gemini AI** | VLM reasoning & structured prompts |
| • `gemini-2.5-flash` | Text reasoning, JSON generation, dissection |
| **TailwindCSS** | Dark-mode UI styling |
| **Vite** | Fast build tool & dev server |
| **Lucide React** | Beautiful icons |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- **BRIA API Key** — [Get one from Bria](https://bria.ai/)
- Gemini API Key (for VLM) — [Get one here](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-repo/Crafternia.git
cd Crafternia

# 2. Install dependencies
npm install

# 3. Configure environment
# Create a .env.local file in the root directory
echo "VITE_BRIA_API_KEY=your_bria_key_here" > .env.local
echo "VITE_GEMINI_API_KEY=your_gemini_key_here" >> .env.local

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
Crafternia/
├── services/
│   ├── briaService.ts          # FIBO API integration
│   │   ├── generateImage()     # Master generation
│   │   └── refineImage()       # Step refinement (FIBO Refine mode)
│   ├── promptEngineering.ts    # VLM-to-JSON translation
│   │   ├── createMasterPrompt() # Gemini → Structured JSON
│   │   └── (Simplified for FIBO Refine)
│   ├── agents/
│   │   ├── CategoryAgentBase.ts           # Base for all agents
│   │   │   ├── generateMasterImage()      # Uses FIBO
│   │   │   ├── generateStepImage()        # Uses FIBO Refine
│   │   │   ├── createRefinementInstruction()  # Category-aware
│   │   │   ├── getHandActionForCategory()     # Dynamic hand prompts
│   │   │   └── getPreservationContext()       # Background consistency
│   │   ├── categories/                    # 8 specialized agents
│   │   │   ├── PapercraftAgent.ts
│   │   │   ├── ClayAgent.ts
│   │   │   ├── WoodcraftAgent.ts
│   │   │   ├── JewelryAgent.ts
│   │   │   ├── KidsCraftsAgent.ts
│   │   │   ├── ColoringBookAgent.ts
│   │   │   └── CostumePropsAgent.ts
│   │   └── orchestrator/
│   │       └── AgentOrchestrator.ts       # Routes to category agents
│   └── agentService.ts        # Public API
├── components/                 # React UI components
├── pages/                      # Page components
└── types.ts                    # TypeScript definitions
```

---

## 🎬 How It Works (End-to-End)

### Example: "Make a clay turtle"

```
1️⃣  User types "clay turtle" → Selects Clay category
    └─> Agent Orchestrator routes to ClayAgent

2️⃣  MASTER GENERATION
    ClayAgent.generateMasterImage()
    └─> Gemini 2.5 Flash: Creates 1000+ word structured JSON
        {
          "objects": [{
            "name": "hand-sculpted clay turtle",
            "material": "polymer clay",
            "color": "earthy green with brown shell",
            ...
          }],
          "lighting": "soft diffused studio lighting",
          "camera": { "angle": "three-quarter view", "fov": 50 },
          "aesthetics": { "mood": "warm handmade", "texture": "matte clay" }
        }
    └─> BRIA FIBO: Generates master image (returns seed)
    
3️⃣  DISSECTION
    User clicks "Dissect"
    └─> Gemini 2.5 Flash: Analyzes master, generates 5 steps
        • Step 1: Roll clay balls for body parts
        • Step 2: Shape the shell dome
        • Step 3: Attach legs and head
        • Step 4: Add texture details with tool
        • Step 5: Final assembly

4️⃣  STEP REFINEMENT (FIBO Refine Mode)
    For Step 1 (20% complete):
      refinementInstruction = "Roll clay balls for body parts. 
        show human hands molding clay beginning the craft. 
        Keep work surface, tools, and background exactly the same."
      
      FIBO.refineImage(masterJSON, masterSeed, refinementInstruction)
      └─> Same composition, same background
          Only change: Shows hands + clay balls
    
    For Step 5 (100% complete):
      Uses exact masterJSON + masterSeed
      └─> Perfect visual match with master image!

5️⃣  EXPORT
    User downloads as ZIP or PDF
    • All images (seed-consistent)
    • Materials list
    • Step instructions
    • Ready for production use
```

---

## 💡 The Vision

> *Every grandparent should be able to create a professional instruction guide for their grandchild.*
> 
> *Every teacher should have beautiful visual aids without a design budget.*
> 
> *Every hobbyist should be able to share their craft in a format that actually works.*

**Crafternia isn't just an app. It's the resurrection of a superior instructional format — powered by BRIA FIBO's professional-grade visual AI and a scalable multiagent architecture.**

---

## 🎯 Why This Matters for BRIA FIBO

### Showcasing Core FIBO Capabilities:

1. **JSON-Native Control** 
   - VLM translates simple prompts to 1000+ word structured JSON
   - Professional parameters: lighting, camera, aesthetics
   - Production-ready structured output

2. **Disentangled Generation**
   - Modify hands/craft progress
   - Keep background/lighting/materials identical
   - True compositional control

3. **Refine Mode**
   - Same seed + same base JSON = consistency
   - Progressive refinement with short instructions
   - Perfect for production workflows

4. **Agentic Workflows**
   - 8 specialized category agents
   - Orchestrator routes intelligently
   - Scalable, production-ready architecture

---

## 📄 License

This project is created for the BRIA FIBO Hackathon — December 2024.

---

**Built with ❤️ powered by BRIA FIBO**

[🚀 Try the Live App](https://crafternia.vercel.app/) • [🎥 Watch the Demo](https://youtu.be/DVyiDgaXrns)
