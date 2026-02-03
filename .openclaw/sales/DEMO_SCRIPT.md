# PhotonicTag Demo Script
**10-Minute SAP Connector Walkthrough for Fortune 500 Prospects**

---

## PRE-DEMO CHECKLIST

### Technical Setup (30 min before call)
- [ ] SAP S/4HANA demo environment running (login tested)
- [ ] PhotonicTag dashboard pre-loaded (demo account)
- [ ] Sample battery SKU selected: `LI-ION-18650-3500` (or similar realistic SKU)
- [ ] QR code scanner ready (mobile phone with camera)
- [ ] Screen sharing tested (Zoom/Teams/Google Meet)
- [ ] Backup slides ready (in case of technical issues)

### Audience Research (1 hour before call)
- [ ] Confirm attendee roles (supply chain, IT, compliance, procurement)
- [ ] Review company's SAP usage (S/4HANA version, modules deployed)
- [ ] Check recent news (plant openings, EU expansion, partnerships)
- [ ] Prepare 2-3 personalized talking points

---

## DEMO FLOW (10 Minutes Total)

### OPENING (30 seconds)

**[Screen: Title slide with PhotonicTag logo + company name]**

> "Thanks for joining, [Names]. I know you're busy, so I'll keep this to 10 minutes. Today I'm going to show you exactly how PhotonicTag takes data from your SAP S/4HANA system and generates an EU-compliant Digital Product Passport in under 60 seconds. No middleware, no custom code, no data migration. Just native SAP integration.
>
> By the end of this demo, you'll see:
> 1. How we pull data directly from SAP (Material Master, BOM, Batch, Quality)
> 2. How we auto-generate a compliant DPP with a QR code
> 3. What the end customer sees when they scan that QR code
>
> Sound good? Let me jump right in."

**Presenter Notes:**
- Keep energy high — this is a sprint, not a marathon
- Confirm they can see your screen before proceeding
- If >3 attendees, ask them to introduce themselves briefly (role, focus area)

---

## PART 1: SAP INTEGRATION DEMO (3 minutes)

### Step 1.1: SAP Material Master (45 sec)

**[Screen: SAP S/4HANA Material Master (Transaction MM03)]**

> "Okay, here we are in SAP S/4HANA. This is a standard Material Master view — transaction code MM03. I'm looking at a lithium-ion battery SKU: `LI-ION-18650-3500`.
>
> **Point out key fields:**
> - Material number, description, base unit of measure
> - Material type: ZFIN (finished goods)
> - Industry sector: Batteries
>
> This is where your team already maintains product data. The EU Battery Regulation requires us to capture this, plus manufacturing location, carbon footprint, material composition, and batch traceability.
>
> The problem? SAP doesn't have a 'Create DPP' button. The data exists, but it's scattered across 50+ tables in different modules."

**[Navigate to:]**
- **Tab: "General Data"** → Show material description, base UoM
- **Tab: "Classification"** → Show material characteristics (if configured)

**Presenter Notes:**
- Don't dwell on SAP UI details — they know SAP
- Emphasize the gap: "Data exists, but no native DPP function"

---

### Step 1.2: PhotonicTag SAP Connector (1 min)

**[Screen: PhotonicTag dashboard → "SAP Connection" tab]**

> "Now, here's the PhotonicTag dashboard. This is what we install as a SAP transport — a certified ABAP connector that sits inside your S/4HANA system.
>
> **Point to:**
> - **Connection Status:** Green checkmark (connected to SAP)
> - **Data Sources Mapped:** 47 SAP tables (MM, PP, QM, EHS modules)
> - **Last Sync:** Real-time (no batch processing needed)
>
> What you're seeing here is our pre-configured mapping. When you do the 8-day implementation, we spend Days 2-5 validating that these table mappings match your specific SAP configuration. But 90% of it is already done for you based on standard SAP table structures.
>
> For example:
> - **MARA** (Material Master) → Product name, description
> - **MARC** (Plant Data) → Manufacturing location
> - **STPO** (BOM Items) → Material composition
> - **MCH1** (Batch Master) → Batch traceability
> - **QALS** (Quality Notifications) → Certifications
>
> All of this happens automatically — no manual data entry."

**[Optional: Click "View Table Mappings"]**
Show a sample mapping:
```
EU DPP Field: "Manufacturing Country"  
SAP Table: MARC (Material Plant Data)  
Field: LAND1 (Country Key)  
```

**Presenter Notes:**
- If IT/BASIS admin is on the call, offer to show ABAP transport details afterward
- Emphasize "pre-configured" and "no custom code"

---

### Step 1.3: Live Data Pull from SAP (1 min 15 sec)

**[Screen: PhotonicTag → "Generate DPP" workflow]**

> "Alright, let me show you the magic. I'm going to generate a Digital Product Passport for this battery SKU in real time.
>
> **[Click: "New DPP" button]**
>
> I'll select the material number: `LI-ION-18650-3500` from the dropdown. Notice this dropdown is populated directly from your SAP Material Master — it's a live query, not a static import.
>
> **[Click: "Auto-Fill from SAP"]**
>
> Watch what happens. PhotonicTag is now:
> 1. Querying MARA for material description
> 2. Pulling plant data from MARC (this battery is manufactured in Plant 1000 — Munich)
> 3. Extracting BOM from STPO (material composition: 65% lithium, 20% cobalt, 15% graphite)
> 4. Grabbing batch records from MCH1 (last batch: 2024-02-15)
> 5. Pulling carbon footprint from your Sustainability module (8.2 kg CO₂e per unit)
>
> This all happens in… **[pause for dramatic effect]** …8 seconds.
>
> **[Screen: DPP form now populated with data]**
>
> Look at that. Every EU-required field is now auto-populated:
> - ✅ Product name & model
> - ✅ Manufacturing location (Munich, Germany)
> - ✅ Material composition (lithium, cobalt, graphite percentages)
> - ✅ Carbon footprint (8.2 kg CO₂e)
> - ✅ Batch traceability (Batch ID: LOT-2024-0215)
> - ✅ Recycling information (pulled from EHS module)
> - ✅ Warranty & lifespan (2 years, 1,000 cycles)
>
> Your team can review and edit any field if needed, but 95% of the time, it's correct as-is."

**Presenter Notes:**
- Time the "8 seconds" pause for effect — let them see the speed
- If a field is blank, explain: "This would be blank if you don't track it in SAP yet — we'll flag that during implementation."

---

## PART 2: PASSPORT GENERATION (2 minutes)

### Step 2.1: EU Compliance Validation (45 sec)

**[Screen: PhotonicTag → "Compliance Check" panel]**

> "Before we finalize this passport, PhotonicTag runs a compliance check against the EU Battery Regulation (2023/1542).
>
> **[Click: "Validate Compliance"]**
>
> Here's the result:
> - ✅ **Article 7 (Battery Information):** Complete
> - ✅ **Article 13 (Carbon Footprint):** Complete
> - ✅ **Article 14 (Material Composition):** Complete
> - ✅ **Annex VI (Traceability):** Complete
> - ⚠️ **Article 18 (Recycled Content):** Missing — you don't track this in SAP yet
>
> If anything is missing, we flag it here. In this case, Article 18 requires you to report recycled material percentage. That's not in your SAP system yet, so your team would need to add that field during implementation.
>
> For everything else? You're 95% compliant out of the box."

**Presenter Notes:**
- The missing field is intentional — shows you're not overselling
- Position the gap as solvable: "We'll help you configure that in SAP during the pilot."

---

### Step 2.2: Generate QR Code + Blockchain Anchor (1 min 15 sec)

**[Screen: PhotonicTag → "Finalize & Publish" button]**

> "Alright, we're ready to publish. When I click 'Finalize & Publish,' three things happen:
>
> 1. **QR Code Generation:** PhotonicTag creates a unique QR code for this passport
> 2. **Blockchain Anchoring:** We write a hash of the passport data to Ethereum/Polygon for immutability (tamper-proof audit trail)
> 3. **Public URL:** We publish the passport to a public-facing web page that anyone can scan
>
> **[Click: "Finalize & Publish"]**
>
> And… done. **[Show success message]**
>
> Here's the result:
> - **QR Code:** [Display QR code on screen]
> - **Passport ID:** DPP-LI-ION-18650-3500-001
> - **Blockchain Hash:** 0x7a3f2e... (truncated for brevity)
> - **Public URL:** photonictag.com/dpp/LI-ION-18650-3500-001
>
> This QR code can now be printed on the battery label, packaging, or shipping docs. When a customer, customs officer, or regulator scans it, they see the full passport."

**[Optional: Show QR Code in Design View]**
> "You can customize the QR code design — add your company logo, change colors, etc. Most customers print this on the battery casing or include it in the product manual."

**Presenter Notes:**
- If they ask about blockchain, explain: "We use public blockchain (Ethereum or Polygon) for cost efficiency. The hash is a cryptographic fingerprint — if anyone tampers with the passport data, the hash won't match."
- If they ask about private blockchain, explain: "We support private/permissioned chains (Hyperledger, Quorum) for enterprise customers who prefer it. That's a config option during setup."

---

## PART 3: QR SCAN FLOW (2 minutes)

### Step 3.1: Mobile Scan Demo (1 min)

**[Screen: Switch to mobile phone camera view (or screen share mobile browser)]**

> "Let me show you what the end user sees. I'm going to scan this QR code with my phone.
>
> **[Scan QR code with phone camera]**
>
> **[Screen: Public-facing DPP web page loads]**
>
> Here's the public passport. This is what a customer, recycler, or EU regulator sees when they scan the code.
>
> **Scroll through the page:**
> - **Product Info:** Lithium-Ion Battery, Model 18650-3500
> - **Manufacturer:** [Your Company Name], Munich, Germany
> - **Manufacturing Date:** Feb 15, 2024 (pulled from batch record)
> - **Material Composition:** 65% Lithium, 20% Cobalt, 15% Graphite (chart visualization)
> - **Carbon Footprint:** 8.2 kg CO₂e (bar chart comparing to industry average)
> - **Recycling Instructions:** "Return to authorized recycler. Contains recyclable lithium, cobalt, and graphite."
> - **Warranty:** 2 years / 1,000 charge cycles
> - **Batch Traceability:** LOT-2024-0215 (click to see full supply chain)
> - **Certifications:** CE, UL, IEC 62133 (pulled from QM module)
>
> **[Click: "Verify Authenticity" button]**
>
> This takes you to the blockchain explorer, where anyone can verify the passport hasn't been tampered with. See the timestamp? Feb 3, 2026 at 14:32 UTC. That's when we published it. The hash matches — this passport is authentic."

**Presenter Notes:**
- Keep scrolling smooth — don't linger too long on any one section
- If asked about multi-language support, explain: "Yes, the public page auto-detects browser language. We support 24 EU languages out of the box."

---

### Step 3.2: Regulatory Export (1 min)

**[Screen: PhotonicTag dashboard → "Export" options]**

> "One last thing — regulators don't want to scan QR codes manually. They want bulk data exports for audits.
>
> **[Click: "Export to EU Format"]**
>
> PhotonicTag can export your entire DPP catalog in the EU's required XML format. This is what you'd submit to customs or upload to the EU's EUDAMED-style database (once it's live in 2027).
>
> **[Show export options:]**
> - **Format:** EU XML Schema (v2.1), CSV, JSON
> - **Scope:** All SKUs, specific plant, date range
> - **Destination:** Download, SFTP, API endpoint
>
> For example, if German customs asks for DPP data on 10,000 batteries you imported last month, you click here, select the date range, and export. Done in 30 seconds.
>
> This is also how you'd integrate with your customers' procurement systems — they can pull DPP data via API instead of scanning QR codes manually."

**Presenter Notes:**
- If IT is on the call, mention: "We have REST APIs and SFTP options for system-to-system integration."
- If compliance is on the call, mention: "We maintain the EU schema as it evolves — you don't have to track regulatory updates."

---

## PART 4: QUESTIONS & OBJECTIONS (2.5 minutes)

**[Screen: Return to title slide or PhotonicTag dashboard]**

> "Alright, that's the end-to-end flow: SAP → DPP → QR code → public web page → regulatory export. 60 seconds from Material Master to published passport.
>
> What questions do you have? I've got 3-4 minutes before we hit 10 minutes total."

---

### Common Questions & Responses

#### Q1: "How long does the implementation really take?"
**A:**  
> "8 days is our average for the first production batch. Here's the breakdown:
> - **Day 1:** Kickoff + SAP transport installation (2 hours for your BASIS admin)
> - **Days 2-5:** Field mapping workshops — we pre-configure 90% of SAP tables, you validate the 10% that's custom to your business
> - **Day 6:** Test batch generation (100 sample passports for your QA team)
> - **Day 7:** Review & adjustments
> - **Day 8:** Bulk generation goes live (10,000+ SKUs per hour)
>
> The pilot is 3 months, but you'll have working passports by Day 8. The rest of the pilot is scaling, training, and fine-tuning."

---

#### Q2: "Does this work with SAP ECC or only S/4HANA?"
**A:**  
> "Great question. We're optimized for S/4HANA, but we support SAP ECC 6.0+ as well. The difference:
> - **S/4HANA:** Native ABAP transport, real-time data pull, 8-day implementation
> - **ECC:** Requires BAPIs or intermediate layer, 12-15 day implementation
>
> If you're on ECC and planning to migrate to S/4HANA, I'd recommend waiting until after the migration to implement PhotonicTag. But if you need DPPs now, we can make ECC work — just takes a bit longer."

---

#### Q3: "What if we have multiple SAP systems (e.g., different plants, different countries)?"
**A:**  
> "We support multi-system deployments. Two options:
> 1. **Centralized:** Install PhotonicTag in one 'master' SAP system and pull data from others via RFC/API
> 2. **Distributed:** Install PhotonicTag in each SAP system and aggregate DPPs in a central dashboard
>
> Most customers with 3+ SAP systems go with Option 1 (centralized). It's cleaner and easier to maintain. We'd design the architecture during the pilot scoping call."

---

#### Q4: "How do you handle data privacy / GDPR?"
**A:**  
> "Two layers:
> 1. **SAP Integration:** Our connector has read-only access to SAP tables. We never write data back to SAP, and we only pull the fields you explicitly map (no PII unless you configure it).
> 2. **Public Passports:** The QR code links to a public web page, so you control what's published. For example, you might show 'Manufactured in Germany' publicly, but keep the specific plant address internal. We have field-level privacy controls.
>
> We're also GDPR-compliant and offer EU data residency (your DPP data is stored in Frankfurt, not US servers)."

---

#### Q5: "What happens if the EU changes the regulation after we go live?"
**A:**  
> "Good question — the regulation is still evolving. Here's how we handle it:
> - **Regulatory Updates:** We monitor EU Commission guidance and update the PhotonicTag schema automatically. You get notified via email when there's a change.
> - **Backwards Compatibility:** Old passports remain valid. New passports use the updated schema.
> - **No Re-Implementation:** You don't have to rebuild anything. We push schema updates via SAP transport (like a software patch).
>
> For example, if the EU adds a new field like 'Country of Origin for Raw Materials,' we'd add that to the schema, map it to your SAP table, and you'd re-generate passports. No custom development needed."

---

#### Q6: "How much does it cost after the pilot?"
**A:**  
> "Annual production contracts range from $80K to $120K depending on:
> - Number of SKUs (unlimited, but we tier pricing by volume)
> - Number of users (10-25 named users)
> - Number of SAP systems (single vs. multi-plant)
> - Support level (standard 4-hour SLA vs. premium 1-hour SLA)
>
> The $25K pilot fee is credited toward your first year if you convert within 30 days of pilot completion. So effectively, Year 1 is $55K-$95K (after the $25K credit).
>
> Want me to send a detailed pricing sheet after this call?"

---

#### Q7: "Can we see a reference customer or case study?"
**A:**  
> "Absolutely. I can connect you with:
> 1. **[Customer Name]** — European Tier-1 automotive supplier, 60,000 SKUs, went live in 11 days
> 2. **[Customer Name]** — Industrial battery manufacturer, $2.3B revenue, integrated with multi-plant SAP system
>
> Both are happy to do 20-minute reference calls to share their experience. I'll intro you via email after this call.
>
> I can also send written case studies and G2 reviews (we're at 4.8/5 stars)."

---

## CLOSING (30 seconds)

> "Alright, we're at the 10-minute mark. Let me recap what you saw:
>
> 1. ✅ **SAP Integration:** Native connector pulls data from 47+ tables in real time
> 2. ✅ **Passport Generation:** 60 seconds from Material Master to published DPP
> 3. ✅ **QR Scan Flow:** Public-facing web page + blockchain verification
> 4. ✅ **Regulatory Export:** Bulk XML export for audits and customs
>
> **Next steps:**
> - I'll send you the pilot agreement template + SAP technical specs today
> - You review internally (legal, IT, procurement)
> - We schedule a 30-min architecture review with your BASIS team
> - Target pilot kickoff: [Date, 2-3 weeks out]
>
> Sound like a plan? Any blockers I should know about?"

**[Listen for objections or next-step requests]**

---

## POST-DEMO FOLLOW-UP (Within 24 Hours)

### Email Template:
```
Subject: PhotonicTag demo recap + next steps

Hi [Names],

Thanks for the time today! Here's a quick recap of what we covered:

**What You Saw:**
- SAP S/4HANA → DPP generation in 60 seconds
- QR code + blockchain verification
- Public web passport for end users
- Bulk export for EU regulatory compliance

**Next Steps (Per Our Discussion):**
1. ✅ Pilot Agreement Template (attached — redlined for legal review)
2. ✅ SAP Technical Specs (ABAP transport details, table mappings)
3. ✅ ROI Calculator (PhotonicTag vs. in-house build TCO)
4. 📅 Architecture review with your BASIS team (30 min) — here's my calendar: [Link]

**Reference Customers:**
I'm connecting you with [Customer Name]'s Head of Supply Chain for a peer reference call. Expect an intro email this week.

**Target Pilot Kickoff:** [Date, e.g., "Week of March 15, 2026"]

Let me know if you need anything else — happy to answer follow-up questions or schedule a deeper technical dive with your IT team.

Best,  
[Your Name]  
[Title], PhotonicTag  
[Phone] | [Email]
```

---

## DEMO OBJECTION HANDLING (If Raised During Demo)

### Objection 1: "Why not wait for SAP to build this natively?"
**Response:**  
> "Fair question. SAP has hinted at a DPP module for late 2026, but there's no confirmed release date or feature set. Even if it ships, you'd still need 6-9 months to implement it. That puts you past the Feb 2027 deadline.
>
> PhotonicTag is built to integrate with SAP's future module if it arrives. Think of us as the 'now' solution that gets you compliant, and if SAP releases something better in 2028, we'll help you migrate. But betting on vaporware when you're 377 days from a €10M fine? That's a risky strategy."

---

### Objection 2: "This looks too simple — what are you hiding?"
**Response:**  
> "Ha! I love the skepticism. The reason it looks simple is because we've done the hard work upfront:
> - 18 months building the SAP connector (our CTO is ex-SAP Labs)
> - Pre-mapped 47 SAP tables based on standard S/4HANA structures
> - Built the EU compliance schema from scratch (our CCO is ex-EU Parliament)
>
> The complexity is under the hood. What you're seeing is the final product after 10,000 hours of ABAP development. If you want to see the technical details — BAPI calls, table joins, error handling — I'm happy to show that in a separate deep-dive with your IT team."

---

### Objection 3: "We're already building this in-house."
**Response:**  
> "Got it. How far along are you?
>
> [Listen to their answer]
>
> Okay, so here's a thought: Even if you finish your in-house build, you'll need to maintain it — schema updates, regulatory changes, new SAP modules. That's 1-2 FTEs ongoing.
>
> PhotonicTag is a SaaS — we handle all the maintenance, updates, and regulatory tracking for you. Think of it like this: You *could* build your own CRM instead of using Salesforce, but why would you? DPP is a commodity compliance requirement, not a competitive differentiator. Let us handle the boring stuff so your team can focus on battery innovation."

---

## DEMO BACKUP PLAN (If Technical Issues Arise)

### If SAP connection fails:
> "Looks like we're having a connection issue with the demo SAP system. Let me show you the pre-recorded version so we don't waste your time."  
**[Switch to pre-recorded Loom video — have this ready!]**

### If PhotonicTag dashboard is down:
> "Our dashboard is having a hiccup — let me show you screenshots instead."  
**[Switch to backup slide deck with annotated screenshots of each step]**

### If QR scan fails:
> "Camera's not cooperating — here's what the public passport looks like."  
**[Screen share a pre-loaded public passport URL in browser]**

**Key Rule:** Never say "This never happens!" Just smoothly transition to backup and keep momentum.

---

## DEMO SUCCESS METRICS

Track these after each demo:

- [ ] **Attendee Engagement:** Did they ask questions? (Good sign)
- [ ] **Technical Depth:** Did IT/BASIS admin attend? (Buying signal)
- [ ] **Next Steps Scheduled:** Did they agree to architecture review? (Advancement)
- [ ] **Objections Raised:** What were the top 2-3 concerns? (Track for trends)
- [ ] **Pilot Request:** Did they ask for pricing/agreement? (Hot lead)

**Goal:** 60%+ of demos should result in a next meeting (architecture review, legal review, or pilot kickoff).

---

**END OF DEMO SCRIPT**
