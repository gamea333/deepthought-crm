# DeepThought — Growth Charter CRM

A fullstack web application that renders personalized Growth Charter documents
from structured CRM node data. Built for the DeepThought Full-Stack Developer
Internship assignment.

---

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB installed locally OR a MongoDB Atlas free tier URI
- A free Gemini API key from https://aistudio.google.com

### Step 1 — Clone the repo
```bash
git clone https://github.com/gamea333/deepthought-crm.git
cd deepthought-crm
```

### Step 2 — Start MongoDB
```bash
mongod
```
MongoDB should be running on mongodb://localhost:27017

### Step 3 — Setup the backend
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
MONGODB_URI=mongodb://localhost:27017/deepthought-crm
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here

Start the backend:
```bash
node index.js
```
You should see: `MongoDB connected` and `Server running on port 5000`

### Step 4 — Setup the frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### Step 5 — Seed sample data
- Open http://localhost:5173
- Click **Seed Sample Data**
- You should see "Sureflow Formulations seeded successfully" in green
- Click **View Growth Charter** to see the rendered document

### Step 6 — Test Part B (Transcript Extraction)
- Click **Extract from Transcript**
- Click **Load Sample Transcript**
- Click **Extract Nodes** and wait 15–30 seconds
- Review the extracted node values table
- Click **Save and Generate Charter**
- A new Growth Charter renders for Apex Precision Components

---

## Architecture Overview

The frontend (React/Vite, port 5173) communicates with an Express backend
(port 5000) which reads and writes to MongoDB. There are two collections —
`accounts` (company profile) and `nodes` (one document per CRM classification
per company).

The Growth Charter rendering happens entirely on the frontend inside
`renderCharter.js`. The process has three steps: first, the verbatim table
is built dynamically by iterating over nodes that carry quote and interpretation
data — this powers the "Founder's Voice" section. Second, a placeholder map is
constructed by looking up each node's scored value (1–8) in render-map.json to
get the corresponding narrative text, and pulling companion fields (like actual
revenue numbers and founder name) directly from the node documents. Third, a
single regex pass (`/\{\{(\w+)\}\}/g`) replaces every `{{placeholder}}` in the
markdown template with its mapped value. The resulting markdown is converted to
HTML using marked.js and rendered in the browser.

For Part B, the backend receives a raw transcript, injects it into a structured
LLM prompt that defines all 10 nodes and their 8 options, and sends it to the
Gemini API. Gemini returns a JSON object with scored values and evidence quotes
for each node. The frontend displays these for review before saving to MongoDB,
after which the same renderer generates a Growth Charter for the new company.

---

## What context.md Drove in the Data Model

**Two-collection design** — context.md defines accounts and nodes as separate
entities. An account holds only company-level identity (name, description).
All classification data lives in nodes, each linked to an account via `accountId`.
This mirrors the CRM architecture described in context.md where a company
accumulates node scores over time as consultants score more dimensions.

**Compound unique index `{ accountId: 1, nodeId: 1 }`** — context.md states
"one value per node per account." The unique index enforces this at the database
level, preventing duplicate scoring of the same node for the same company.

**`companion` as a free-form object** — each node has different companion field
names. K1 carries `name`, `title`, `background`. D2 carries `currentValue`,
`targetValue`, `primaryMetric`. F2 carries `actualRevenue`, `revenueSource`.
A rigid schema would break this. A free-form object lets each node carry exactly
the specifics it needs, matching the Companion Fields Summary table in context.md.

**`verbatim` as a separate sub-object** — context.md distinguishes between
companion fields (specific data payloads) and verbatim fields (the founder's
actual words). Verbatim data powers an entirely different section of the charter
(The Founder's Voice) and is built through a different code path — iterated
dynamically rather than looked up by placeholder key. Keeping it as a separate
sub-object `{ quote, interpretation }` makes this distinction explicit in the
schema and makes the filter `nodes.filter(n => n.verbatim?.quote?.trim())`
clean and readable.

**Node order in the Founder's Voice table** — nodes are stored and retrieved
in insertion order, which naturally follows the D1 → D2 → D3 → D7 → I3 → I9 → I12
sequence defined in context.md, so the verbatim table reads in the same logical
order as the charter sections above it.

---

## What I Would Improve With More Time

**1. Node editor UI for consultants**
Add an in-browser interface where a DT consultant can score nodes directly —
a dropdown for each node's 8 options, text fields for companion data, and a
save button. Currently the only way to enter data is seeding from JSON or
running the Gemini extraction. A node editor would let consultants score
manually during or after a founder conversation without touching code or JSON.

**2. Retry UI with countdown timer**
The Gemini free tier rate limit (429) is a real UX problem. Instead of showing
an error, the app should automatically retry with a visible countdown:
"Rate limit hit — retrying in 47 seconds..." This keeps the user informed and
removes the need to manually click Extract Nodes again.

**3. Render map editable from the UI**
Currently render-map.json is a static file deployed with the code. If DeepThought
updates the narrative text for any node option, it requires a code change and
redeployment. Moving render-map into a MongoDB collection with a simple editor UI
would let non-technical team members update the charter language without touching
the codebase.

**4. Extraction diff view for existing companies**
When Part B extracts nodes for a company that already exists in the system, there
is no comparison between the old scores and the new extraction. A side-by-side
diff view — "Previous value: 3 | Extracted value: 5 | Evidence: [quote]" — would
let consultants make an informed decision about whether to update the score rather
than blindly overwriting existing data.
