const CHARTER_TEMPLATE = `# Growth Charter
## {{companyName}}
### Prepared for {{founderName}}, {{founderTitle}}
*{{founderBackground}}*

---

### Company Snapshot
{{companyName}} is a {{businessDescription}}.

| | |
|---|---|
| **Revenue** | {{revenueRender}} ({{revenueActual}}, {{revenueSource}}) |
| **Systems** | {{systemsRender}}. *{{systemsDetail}}* |

---

### Growth Ambition
{{companyName}}'s highest-leverage growth opportunity is **{{kpiRender}}**.

**Where we are today:**
{{abClarityRender}}

- **Current:** {{currentValue}}
- **Target:** {{targetValue}}

**What this unlocks:**
{{unlockRender}}

---

### What This Means for {{founderName}}
{{outcomeRender}}

---

### The Execution Gap

**Who should own this improvement:**
{{ownershipRender}}

**What broke in previous attempts:**
{{priorAttemptRender}}

**What type of intervention is needed:**
{{interventionRender}}

---

### The Founder's Voice
{{verbatimTable}}

---

*Growth Charter generated from CRM nodes | {{companyName}} | {{generatedDate}}*`;

export function renderCharter(account, nodes, renderMap) {
  const get = (id) => nodes.find((n) => n.nodeId === id) || {};
  const getCompanion = (id, field) => get(id)?.companion?.[field] || '';
  const getRender = (id) => {
    const node = get(id);
    if (!node || !node.value) return '';
    return renderMap[id]?.[String(node.value)] || '';
  };

  const founderName = getCompanion('K1', 'name') || 'Founder';
  const verbatimNodes = nodes.filter(
    (n) => n.verbatim?.quote?.trim() && n.verbatim?.interpretation?.trim()
  );
  let verbatimTable = '';
  if (verbatimNodes.length > 0) {
    const rows = verbatimNodes
      .map((n) => `| "${n.verbatim.quote}" | ${n.verbatim.interpretation} |`)
      .join('\n');
    verbatimTable = `| What ${founderName} Said | What It Means |\n|---|---|\n${rows}`;
  } else {
    verbatimTable = '_No verbatim quotes captured._';
  }

  const placeholders = {
    companyName: account.companyName || '',
    businessDescription: account.businessDescription || '',
    founderName,
    founderTitle: getCompanion('K1', 'title'),
    founderBackground: getCompanion('K1', 'background'),
    revenueRender: getRender('F2'),
    revenueActual: getCompanion('F2', 'actualRevenue'),
    revenueSource: getCompanion('F2', 'revenueSource'),
    systemsRender: getRender('C7'),
    systemsDetail: getCompanion('C7', 'systemsInUse'),
    kpiRender: getRender('D1'),
    abClarityRender: getRender('D2'),
    currentValue: getCompanion('D2', 'currentValue'),
    targetValue: getCompanion('D2', 'targetValue'),
    unlockRender: getRender('D3'),
    outcomeRender: getRender('D7'),
    ownershipRender: getRender('I3'),
    priorAttemptRender: getRender('I9'),
    interventionRender: getRender('I12'),
    verbatimTable,
    generatedDate: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }),
  };

  const rendered = CHARTER_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return placeholders[key] !== undefined ? placeholders[key] : match;
  });

  return rendered;
}
