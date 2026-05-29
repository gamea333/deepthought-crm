const express = require('express');
const Account = require('../models/Account');
const Node = require('../models/Node');

const PROMPT_TEMPLATE = `You are a CRM analyst for DeepThought, a B2B consulting company that helps manufacturing MSMEs grow. Given a conversation transcript with a company founder, extract values for the following CRM nodes. Each node has 8 possible options — pick the one that best matches what the founder described.

NODES:

D1 — KPI Selection (which number, if it moved, would change their business most):
1. More leads into the pipeline
2. Better conversion rate of leads
3. Revenue per existing customer (upsell)
4. New offerings to existing customers (cross-sell)
5. Customer satisfaction and retention
6. Turnaround time
7. Quality and compliance
8. Margins — reducing waste

D2 — A-to-B Clarity (where is the number today, where does it need to be):
1. Both A and B are precise — tracked rigorously, data-backed target
2. A is measured, B is a stretch target
3. A is measured, B is what the market demands
4. A is felt but not tracked — B is clear
5. Both are approximate — a range, not a number
6. A is known, B depends on what's realistic
7. B defined from benchmarks, A is where they fall short
8. First time quantifying this gap

D3 — Business Unlock (what moves if the KPI moves):
1. Revenue crosses a major milestone
2. Growth model starts compounding
3. New market or geography becomes viable
4. Business becomes investable or exit-ready
5. Profitability step-changes
6. Team scales — leadership layer emerges
7. Competitive position locks in
8. Business becomes what the founder envisioned

D7 — Founder Outcome (what changes for the founder personally):
1. Focus on vision and strategy, not daily execution
2. Business runs without me in every room
3. Best people grow into leaders
4. Company proves it can compound
5. Creates something worth more than my time
6. Builds the leadership layer
7. Builds what I originally set out to build
8. Enjoys running the business again

I3 — Improvement Ownership (who should drive this):
1. Dedicated person, no other responsibilities
2. Senior leader carving out time
3. The founder, with a supporting system
4. A small dedicated team
5. Each department head owns their piece
6. Someone external brings structure
7. Right person doesn't exist yet
8. Right person exists but is buried in operations

I9 — Prior Attempt Learning (what broke before):
1. Needed a dedicated person
2. Lacked a method
3. Needed shorter review cycles
4. Needed external structure
5. Lacked founder involvement in reviews
6. Started too large
7. Tracked outcomes not activities
8. First real attempt

I12 — Intervention Type (what kind of fix):
1. Process works, needs tech acceleration
2. Process works, manual bottlenecks
3. Process exists but not delivering
4. Process built for different scale
5. Parts exist, parts missing
6. No designed process — ad-hoc
7. Process hit a ceiling, need new approach
8. Function doesn't exist yet

K1 — Decision-Maker (who is the founder/leader):
Extract name, title, and background if mentioned.

F2 — Revenue Scale:
1. ₹500Cr+  2. ₹200–500Cr  3. ₹100–200Cr  4. ₹50–100Cr
5. ₹25–50Cr  6. ₹10–25Cr  7. Below ₹10Cr  8. Not disclosed
Extract actual revenue if mentioned.

C7 — Systems Maturity:
1. Full ERP integrated  2. ERP in core functions  3. ERP partial
4. Structured but no ERP  5. Piecemeal digital tools  6. Systems planned
7. Founder memory only  8. Actively resistant
Extract specific systems if mentioned.

INSTRUCTIONS:
- For each node, return the option number (1-8) that best matches the transcript
- Include the specific quote that supports your classification
- If a node cannot be determined, set value to null and note "not surfaced"
- For K1, F2, and C7, also extract companion field data
- For D2, extract currentValue and targetValue if mentioned

OUTPUT FORMAT (respond with valid JSON only, no other text, no markdown code fences):
{
  "account": {
    "companyName": "extracted company name",
    "businessDescription": "one-line description of what the company does"
  },
  "nodes": {
    "D1": { "value": 1, "evidence": "quote from transcript" },
    "D2": { "value": 4, "evidence": "quote", "companion": { "primaryMetric": "...", "currentValue": "...", "targetValue": "..." } },
    "D3": { "value": 1, "evidence": "quote" },
    "D7": { "value": 2, "evidence": "quote" },
    "I3": { "value": 8, "evidence": "quote" },
    "I9": { "value": 2, "evidence": "quote" },
    "I12": { "value": 6, "evidence": "quote" },
    "K1": { "value": 3, "companion": { "name": "...", "title": "...", "background": "..." } },
    "F2": { "value": 4, "companion": { "actualRevenue": "...", "revenueSource": "founder-stated" } },
    "C7": { "value": 5, "companion": { "systemsInUse": "..." } }
  }
}

TRANSCRIPT:
{{TRANSCRIPT}}`;

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    if (!transcript || !String(transcript).trim()) {
      return res.status(400).json({ success: false, error: 'Transcript is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured' });
    }

    const fullPrompt = PROMPT_TEMPLATE.replace('{{TRANSCRIPT}}', transcript);

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Gemini API error: ${response.status}`,
        raw: errBody,
      });
    }

    const result = await response.json();
    let text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const parsedJSON = JSON.parse(text);
      return res.json({ success: true, data: parsedJSON });
    } catch {
      return res.json({
        success: false,
        error: 'LLM returned unparseable output',
        raw: text,
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const NODE_NAMES = {
  D1: 'KPI Selection',
  D2: 'A-to-B Clarity',
  D3: 'Business Unlock',
  D7: 'Founder Outcome',
  I3: 'Improvement Ownership',
  I9: 'Prior Attempt Learning',
  I12: 'Intervention Type',
  K1: 'Decision-Maker Identification',
  F2: 'Revenue Scale',
  C7: 'Systems Maturity',
};

const fromExtractionRouter = express.Router();

fromExtractionRouter.post('/from-extraction', async (req, res) => {
  try {
    const { account, nodes } = req.body;

    if (!account || !nodes) {
      return res.status(400).json({ success: false, error: 'account and nodes are required' });
    }

    const createdAccount = await Account.create(account);

    for (const [nodeId, nodeData] of Object.entries(nodes)) {
      if (nodeData == null || nodeData.value == null) continue;

      await Node.create({
        accountId: createdAccount._id,
        nodeId,
        name: NODE_NAMES[nodeId] || nodeId,
        value: nodeData.value,
        companion: nodeData.companion || {},
        verbatim: {
          quote: nodeData.evidence || '',
          interpretation: '',
        },
        scoredBy: 'gemini-extraction',
      });
    }

    res.json({ success: true, accountId: createdAccount._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
module.exports.fromExtractionRouter = fromExtractionRouter;
