# Crafternia

## *When I was 8, I lost my dad's origami crane instructions...*

---

## 💔 The WHY — A Problem That Hits Home

**Do you remember that feeling?**

That magical afternoon when you opened a model kit, a sewing pattern, or an origami book — and spread the instruction sheet across the table. Each step was **perfectly illustrated**. Each piece was shown **in complete isolation**. You could *see* exactly what you needed at every moment.

**That world is gone.**

Today, when a child asks *"How do I make a paper crane?"*, they're met with:
- 27-minute YouTube tutorials with unskippable ads
- Blog posts with 18 paragraphs of SEO filler before the actual instructions  
- Pinterest boards that lead to broken links
- Instagram reels that flash by too fast to follow

**The beautiful simplicity of visual instruction sheets died with the 90s.** The IKEA manuals. The Gundam model kits. The Simplicity sewing patterns. That universal visual language that transcended words.

### Why did it die?

Because professional instruction sheets were **expensive** to create:
- You needed expert makers to design the breakdown
- Professional photographers to capture each step  
- Graphic designers for layout
- Print production costs

Only big companies could afford this. For everyone else — for the grandmother teaching her grandchild, for the hobbyist with a brilliant idea, for the teacher in a underfunded classroom — they were left with text descriptions and hope.

**Until now.**

---

## ✨ The WHAT — Crafternia: Dissect Your Imagination

> **Crafternia** is an AI-powered Infinite Craft Workbench that resurrects the lost art of visual craft instruction sheets.

Give it any craft idea — *"Paper crane"*, *"Clay turtle"*, *"Santa clause earrings"* — and Crafternia transforms it into a complete, professional-quality visual instruction guide.

### What You Get

| Component | What It Does |
|-----------|--------------|
| **Master Reference** | Studio-quality photograph of your finished craft |
| **Materials List** | Everything you need, nothing you don't |
| **Step-by-Step Cards** | Chronological breakdown of the build |
| **Isolated Step Images** | Knolling-style visuals showing *only* the components for each step |

The result looks like a professionally designed IKEA manual — but for *any craft you can imagine*.

### 8 Craft Categories

📄 Papercraft • 🏺 Clay • 🧵 Fabric • 🎭 Costumes & Props • 🪵 Woodcraft • 💎 Jewelry • 🧒 Kids Crafts • 🎨 Coloring Book • 🎨 Drawing etc

---

## 🤖 The HOW — A Symphony of Specialized AI Agents

**This is where the magic happens.**

Crafternia is built on a **multi-agent architecture** where specialized AI agents *communicate* and *collaborate* to solve a complex creative problem.

### The Agent Orchestra

```
┌─────────────────────────────────────────────────────────────────┐
│                    🎭 AGENT ORCHESTRATOR                        │
│         Routes tasks • Manages communication • Tracks state     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│ 📷 VISUALIZER │     │ 🔬 DISSECTION │     │ 📐 PATTERN    │
│    AGENT      │     │    AGENT      │     │    AGENT      │
│               │     │               │     │               │
│ Generates     │     │ Analyzes &    │     │ Creates       │
│ master images │     │ breaks down   │     │ templates &   │
│ & step photos │     │ complexity    │     │ pattern sheets│
└───────────────┘     └───────────────┘     └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │ 🎨 CATEGORY AGENTS    │
                    │                       │
                    │ PapercraftAgent       │
                    │ ClayAgent             │
                    │ WoodcraftAgent        │
                    │ JewelryAgent          │
                    │ KidsCraftsAgent       │
                    │ CostumePropsAgent     │
                    │ ColoringBookAgent     │
                    │ DrawingAgent          │
                    └───────────────────────┘
```

### 🔗 Agent Communication Protocol (A2A)

Every agent speaks the same language through our **Agent-to-Agent Protocol**:

```typescript
interface A2AMessage {
    taskId: string;      // Unique task identifier
    sender: string;      // Who's sending
    recipient: string;   // Who's receiving  
    type: MessageType;   // REQUEST | RESPONSE | ERROR | STATUS
    payload: any;        // The actual data
    timestamp: number;   // When it happened
}
```

**Every interaction is tracked. Every handoff is logged. Complete observability.**

### 🎻 How The Agents Collaborate

**User Request:** *"Make a paper fox"*

1. **Orchestrator** receives the request, identifies the category (Papercraft)
2. **Orchestrator** routes to **PapercraftAgent** based on capability matching
3. **PapercraftAgent** generates domain-specific prompts:
   - Master image prompt with papercraft-specific instructions
   - Dissection prompt understanding paper-specific materials
   - Step image prompts with knolling/fold-line guidance
4. **Each step's output becomes input for the next** — agents build on each other's work
5. **Results flow back** through standardized A2AMessage responses

### 🧠 Why Specialized Agents Matter

A clay craft and a papercraft have *completely different* visual requirements:

| Papercraft Agent | Clay Agent |
|-----------------|------------|
| Flat pattern pieces | Rolled shapes, slabs |
| Fold lines, scoring | Fingerprint textures |
| Cut templates | Sculpting marks |
| Glue tabs | Blending surfaces |

**One generic prompt cannot do both well.** Specialized agents mean specialized excellence.

---

## 🏆 Judging Criteria Match

| Criteria | How Crafternia Delivers |
|----------|------------------------|
| **Business Value** | Democratizes professional-quality craft instruction creation |
| **Observability** | A2A Protocol with full message tracking, task IDs, timestamps |
| **Functionality** | Works end-to-end: idea → master image → dissection → step images |
| **Creativity** | Resurrects a dead medium with AI + spatial canvas |
| **Impact** | Makes crafting accessible to millions who can't follow tutorials |

---

## 🎬 The Demo Flow (2 minutes)

1. **[0:00-0:15]** Show the problem: "Try to learn papercraft from YouTube" → chaos
2. **[0:15-0:30]** Enter Crafternia → type "Paper fox", select category
3. **[0:30-0:50]** Watch the master image generate — show agent logs
4. **[0:50-1:10]** Click "Dissect" — see agents collaborate to break it down
5. **[1:10-1:40]** Watch step images populate — each one perfectly isolated
6. **[1:40-1:55]** Navigate the infinite canvas — drag, zoom, explore
7. **[1:55-2:00]** Tagline: **"Dissect your imagination. Build reality."**

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript** — Modern, type-safe frontend
- **React Flow** (@xyflow/react) — Infinite canvas with pan/zoom
- **Google Gemini AI** — Powers all generation
  - `gemini-3-pro-image-preview` for image generation
  - `gemini-2.5-flash` for text reasoning
- **TailwindCSS** — Beautiful dark-mode UI
- **Vite** — Lightning-fast development

---

## 💡 The Vision

> *Every grandparent should be able to create a professional instruction guide for their grandchild.*
> 
> *Every teacher should have beautiful visual aids without a design budget.*
> 
> *Every hobbyist should be able to share their craft with the world in a format that actually works.*

**Crafternia isn't just an app. It's the resurrection of a superior instructional format — powered by an orchestra of AI agents working together.**

---

## 👋 Team

**Crafternia** — Built with imagination, dissected with AI.

*Hackathon Submission — December 2025*
