# PhotonicTag Pilot Agreement Template
**3-Month Proof of Concept (POC) Contract**

**Version:** 1.0  
**Last Updated:** 2026-02-03

---

## 🎯 Agreement Structure

This is a **template** for your $25K pilot agreements. Customize dates, KPIs, and scope per customer.

**Important:** Have a lawyer review before using with real F500 customers!

---

## 📄 PILOT AGREEMENT

**Between:**

**PhotonicTag** ("Provider")  
[Your Company Address]  
[Contact: Dilli, CEO/Founder]  

**AND**

**[CUSTOMER COMPANY NAME]** ("Customer")  
[Customer Address]  
[Contact: Decision Maker Name, Title]

**Effective Date:** [Start Date]  
**Pilot End Date:** [Start Date + 90 days]

---

## 1. PILOT SCOPE

### 1.1 Services Provided

PhotonicTag will provide Customer with access to the PhotonicTag Digital Product Passport platform for a three (3) month pilot period to evaluate compliance with EU Digital Product Passport regulations.

**Pilot Scope Includes:**

**A. Platform Access:**
- PhotonicTag SaaS platform (Production environment)
- Admin dashboard for up to three (3) named users
- Mobile scanning verification
- Public product passport pages

**B. SAP S/4HANA Integration:**
- Read-only connector to Customer's SAP S/4HANA system
- Field mapping configuration (up to 50 custom fields)
- Initial data sync (up to 5,000 SKUs)
- Automated sync schedule (configured during pilot)

**C. Digital Passport Generation:**
- QR code generation for synced products
- EU Battery Passport template (Article 77 compliant)
- Product passport public pages
- Consumer verification flow

**D. Support:**
- Email support (business hours, 48-hour response SLA)
- One (1) onboarding session (2 hours)
- Weekly check-in calls (30 minutes)
- Final pilot review session (1 hour)

**E. Documentation:**
- SAP integration guide
- User training materials
- Compliance template documentation
- Pilot success metrics report

---

### 1.2 Scope Limitations

**Pilot DOES NOT Include:**
- Multi-tier supplier integration (Tier 2/3 suppliers)
- Custom mobile app development
- On-premise deployment
- More than 5,000 SKUs
- More than 3 user seats
- 24/7 support
- Service Level Agreement (SLA) guarantees

*(These features available in annual contract if pilot succeeds)*

---

## 2. PILOT FEE & PAYMENT TERMS

### 2.1 Total Pilot Fee
**USD $25,000** (Twenty-Five Thousand Dollars)

### 2.2 Payment Schedule

**Option A: 50/50 Split** (Recommended)
- **$12,500** due upon contract signing (Week 0)
- **$12,500** due upon go-live (Week 4, when SAP sync is operational)

**Option B: Staged Milestones**
- **$5,000** upon contract signing (Week 0)
- **$10,000** upon go-live (Week 4)
- **$10,000** upon pilot completion (Week 12)

**Option C: Upfront**
- **$25,000** due upon contract signing
- *(5% discount available: $23,750 if paid upfront)*

### 2.3 Payment Methods
- Wire transfer (preferred)
- ACH/Bank transfer
- Corporate check

**Invoice:** Net 15 days from date of invoice

---

## 3. SUCCESS CRITERIA & CONVERSION

### 3.1 Pilot Success Metrics (KPIs)

The pilot will be deemed successful if PhotonicTag meets at least **4 of 5** of the following criteria:

**KPI 1: Integration Speed**
- SAP S/4HANA integration completed within 10 business days of API access granted
- ✅ Target: <10 days | ⚠️ Acceptable: <15 days | ❌ Fail: >15 days

**KPI 2: Data Accuracy**
- At least 95% of synced SKUs have complete passport data
- ✅ Target: >95% | ⚠️ Acceptable: >90% | ❌ Fail: <90%

**KPI 3: System Uptime**
- Platform availability of 99% or higher during pilot period
- ✅ Target: >99% | ⚠️ Acceptable: >98% | ❌ Fail: <98%

**KPI 4: User Adoption**
- All three (3) assigned users successfully create/view passports
- All users rate the platform ≥7/10 in usability survey
- ✅ Target: 3/3 users, avg 8+ | ⚠️ Acceptable: 2/3 users, avg 7+ | ❌ Fail: <2 users or <7 avg

**KPI 5: Compliance Validation**
- At least 90% of generated passports pass third-party EU DPP compliance check
- ✅ Target: >95% | ⚠️ Acceptable: >90% | ❌ Fail: <90%

### 3.2 Pilot Review & Reporting

**Week 12 (Final Week):**
- Provider delivers Pilot Success Report (PDF)
- Report includes: KPI results, usage analytics, recommendations
- Customer and Provider meet to review results (1-hour call)

---

### 3.3 Conversion to Annual Contract

**If pilot succeeds (4+ KPIs met):**

Customer has the option (but not obligation) to convert to an annual contract within 30 days of pilot completion.

**Annual Contract Terms (Pre-Negotiated):**

**Tier: Professional** (Standard post-pilot tier)

**Annual Fee:** USD $100,000/year

**Included:**
- Up to 25,000 SKUs
- Up to 10 user seats
- Priority email support (24-hour response SLA)
- Quarterly business reviews
- SAP sync updates (weekly schedule)
- 99.5% uptime SLA
- Dedicated Customer Success Manager

**Credit:** The $25,000 pilot fee is **fully credited** toward the first annual payment.

**Effective Year 1 Cost:** $75,000 ($100K annual minus $25K pilot credit)

**Payment:** Annual upfront or quarterly ($25K per quarter)

**Term:** 12 months, auto-renews annually unless canceled with 60 days notice

---

### 3.4 If Pilot Does Not Succeed

**If fewer than 4 KPIs are met:**

- Customer has no obligation to convert to annual contract
- Customer retains the $25K pilot fee (covers Provider's pilot costs)
- Customer keeps access to platform for 30 additional days (grace period)
- Provider will assist with data export if Customer chooses to discontinue

**No penalties, no hard feelings, clean exit.**

---

## 4. DATA & CONFIDENTIALITY

### 4.1 Data Ownership
- Customer owns 100% of product data, passport data, and scan analytics
- Provider is a data processor, not a controller (GDPR terms)
- Customer may export all data at any time (CSV, JSON formats)

### 4.2 Data Processing Agreement (DPA)
- Parties agree to the PhotonicTag Data Processing Agreement (Exhibit A)
- DPA includes GDPR Standard Contractual Clauses
- Sub-processors listed in DPA Annex

### 4.3 Confidentiality
- Both parties agree not to disclose the other's confidential information
- Pilot results and metrics are confidential unless mutually agreed
- Exception: Provider may list Customer as a client (with approval)

---

## 5. SAP INTEGRATION & ACCESS

### 5.1 Customer Responsibilities

**Customer will provide:**

**SAP Access (Read-Only):**
- OData API credentials (read-only service account)
- Access to tables: MARA, MARC, MAKT, MARM (material master)
- Access to BOM tables: STPO, STKO (if applicable)
- VPN/firewall exceptions (if SAP is on-premise)

**Security Approvals:**
- IT Security team approval for external API access
- Firewall rules (if needed)
- Data export approval (if required by internal policy)

**Timing:** Customer will provide access within 5 business days of contract signing

---

### 5.2 Provider Responsibilities

**Provider will:**
- Deploy SAP connector in Customer's specified region (EU/US)
- Configure field mappings in collaboration with Customer's SAP team
- Provide technical documentation for Customer's IT security review
- Maintain read-only access (no writes to SAP without explicit approval)
- Delete SAP credentials immediately upon pilot termination

---

## 6. INTELLECTUAL PROPERTY

### 6.1 Provider IP
- PhotonicTag platform, source code, and algorithms remain Provider's property
- Customer receives a limited license to use the platform during the pilot

### 6.2 Customer IP
- Customer's product data, brand assets, and SAP configurations remain Customer's property
- Provider will not use Customer data for any purpose other than providing the service

### 6.3 Deliverables
- Generated QR codes and passport pages become Customer's property
- Customer may continue using generated assets even if pilot terminates

---

## 7. LIABILITY & WARRANTIES

### 7.1 Provider Warranties

Provider warrants that:
- The platform will perform substantially as described in documentation
- Services will be provided in a professional manner
- Platform will not knowingly violate third-party intellectual property

**Provider does NOT warrant:**
- That the platform will be error-free or uninterrupted
- That compliance with EU regulations is guaranteed (Customer is responsible for data accuracy)
- That all Customer requirements will be met (pilot is an evaluation, not a commitment)

---

### 7.2 Limitation of Liability

**Provider's total liability** under this agreement is limited to the **pilot fee paid** ($25,000).

**Provider is not liable for:**
- Indirect, consequential, or punitive damages
- Lost profits or revenue
- Regulatory fines or penalties (Customer is responsible for compliance)
- Data loss (Customer must maintain backups)

**Exception:** Liability cap does not apply to gross negligence, willful misconduct, or data breaches.

---

### 7.3 Compliance Responsibility

**Customer acknowledges:**
- PhotonicTag is a **tool** to assist with EU DPP compliance
- Ultimate compliance responsibility rests with Customer
- Customer must validate all generated passports for accuracy
- Provider makes no guarantee that use of the platform ensures regulatory compliance

*(This protects you from liability if their data is wrong!)*

---

## 8. TERMINATION

### 8.1 Termination for Convenience
- Either party may terminate with 14 days written notice
- Customer receives pro-rata refund of prepaid fees (if terminated before Week 4)
- After Week 4 (go-live), no refunds (pilot costs incurred)

### 8.2 Termination for Cause
- Either party may terminate immediately if the other:
  - Materially breaches the agreement and fails to cure within 7 days
  - Becomes insolvent or files for bankruptcy
  - Violates data protection laws

### 8.3 Effect of Termination
- Customer access to platform ends 30 days after termination
- Provider will provide data export (one-time, within 14 days)
- Confidentiality obligations survive termination
- Unpaid fees remain due

---

## 9. GENERAL TERMS

### 9.1 Governing Law
This Agreement is governed by the laws of **[Your Jurisdiction - e.g., Delaware, USA]**, without regard to conflicts of law provisions.

### 9.2 Dispute Resolution
- Parties will attempt good-faith negotiation for 30 days before litigation
- Venue: [Your jurisdiction courts]
- Arbitration: Optional (JAMS rules if mutually agreed)

### 9.3 Entire Agreement
This Agreement (including Exhibits) constitutes the entire agreement and supersedes all prior discussions.

### 9.4 Amendments
Amendments must be in writing and signed by both parties.

### 9.5 Assignment
Neither party may assign this Agreement without prior written consent (exception: Provider may assign to an acquirer).

---

## 10. EXHIBITS

**Exhibit A:** Data Processing Agreement (DPA)  
**Exhibit B:** Service Level Definitions  
**Exhibit C:** Security Questionnaire Responses  
**Exhibit D:** Pilot Success Criteria Scorecard  

---

## SIGNATURE PAGE

**PHOTONICTAG**

By: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
Name: Dilli  
Title: Founder & CEO  
Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**[CUSTOMER COMPANY NAME]**

By: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
Name: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
Title: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_  
Date: \_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## 📋 CUSTOMIZATION CHECKLIST

**Before sending to a customer, customize:**

- [ ] Customer company name (throughout)
- [ ] Effective dates (start + 90 days)
- [ ] Payment option (choose A, B, or C)
- [ ] Success criteria KPIs (adjust thresholds if needed)
- [ ] Annual contract pricing (if different from $100K)
- [ ] Scope (SKUs, users, if different from defaults)
- [ ] Governing law (if customer requires their jurisdiction)
- [ ] Exhibits (attach DPA, security docs)

---

## 🎯 Alternative: Shorter Version (2-Page SOW)

**If customer prefers a simpler agreement:**

---

### STATEMENT OF WORK (SOW)
**PhotonicTag Pilot - [Customer Name]**

**Duration:** 3 months from [Start Date]  
**Fee:** $25,000 (50% upfront, 50% at go-live)

**Scope:**
- SAP S/4HANA integration (up to 5,000 SKUs)
- EU Battery Passport template
- 3 user licenses
- Email support

**Success Criteria:**
1. SAP integration live within 10 days
2. 95%+ data accuracy
3. 99%+ uptime
4. User satisfaction ≥7/10

**Conversion:** If 4+ criteria met, Customer may convert to $100K annual contract (with $25K pilot credit).

**Termination:** Either party, 14 days notice. No refund after go-live.

**Signatures:**

PhotonicTag: \_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_

[Customer]: \_\_\_\_\_\_\_\_\_\_\_\_\_\_ Date: \_\_\_\_\_\_

---

## 💡 Negotiation Tips

### What to Stand Firm On:
- ✅ Pilot fee ($25K minimum - don't go below $15K)
- ✅ Success-based conversion (protects you from "free trial" exploitation)
- ✅ Liability cap (pilot fee maximum)
- ✅ Data ownership (they own data, you own platform)

### What to Be Flexible On:
- ⚠️ Payment schedule (50/50 vs staged is fine)
- ⚠️ Pilot duration (can extend to 4 months if they need more time)
- ⚠️ Number of users (5 users vs 3 is fine)
- ⚠️ SKU count (can go up to 10K if they push)
- ⚠️ Governing law (their jurisdiction if they insist)

### Red Flags (Walk Away If):
- ❌ They want free trial (not serious)
- ❌ They want unlimited liability (legal landmine)
- ❌ They want source code ownership (you lose your IP)
- ❌ They demand SOC 2 for pilot (unreasonable timing)
- ❌ They want <$10K pilot (signals low budget, high churn risk)

---

## 🎯 Closing the Pilot Agreement

### The Ask (After Demo):
> "Based on what you've seen, does this solve your EU DPP compliance challenge?"
> 
> [Wait for yes]
> 
> "Great! The best next step is a **90-day pilot** on one of your product lines. This lets you validate the SAP integration, test with real data, and measure results against clear KPIs before committing to an annual contract.
> 
> The pilot is **$25K** - half upfront, half when we go live. If it succeeds, that's credited toward your annual subscription. If it doesn't meet our agreed success criteria, you're not obligated to continue, but you got 3 months of compliance work done.
> 
> I can send over the pilot agreement this afternoon. Your legal team can review it, and if it looks good, we could kick off as early as next week. Does that timeline work for you?"

---

### Handling "I need to think about it":
> "Of course! While you're thinking, two quick things:
> 
> **1. Next steps if yes:**
> - I send pilot agreement (today)
> - Your legal reviews (1-2 weeks)
> - We collect signatures (DocuSign, 2 days)
> - SAP integration kickoff (Week 1)
> 
> **2. Questions to consider:**
> - Who else needs to approve this internally?
> - Is $25K within your discretionary budget, or does it need a formal PO?
> - What would make this an easy 'yes' vs 'no'?
> 
> What's your timeline for a decision? I want to keep the momentum going if this is a fit."

---

## 📝 Post-Signature Checklist

**Once customer signs:**

- [ ] Send welcome email with onboarding next steps
- [ ] Schedule onboarding call (Week 1)
- [ ] Request SAP API credentials
- [ ] Provision customer account in PhotonicTag
- [ ] Create project Slack/Teams channel (if they prefer)
- [ ] Send invoice for first payment
- [ ] Begin SAP integration (Week 1-2)
- [ ] Schedule weekly check-ins (Weeks 2-12)

---

## 🎯 Pilot Success Playbook (Your Side)

### How to Ensure Pilot Succeeds:

**Week 1-2: Over-deliver on Onboarding**
- Respond to questions within 4 hours (not 48)
- Proactive communication (don't wait for them to ask)
- White-glove service (they should feel like your only customer)

**Week 3-6: Quick Wins**
- Show them early results (first 100 SKUs synced)
- Celebrate milestones (send screenshot of first passport!)
- Collect positive feedback (use for testimonials later)

**Week 7-10: Build Champion**
- Identify your internal champion (the person who loves it)
- Give them resources to sell internally
- Make them look good to their boss

**Week 11-12: Set Up Conversion**
- Present success metrics proactively
- Highlight exceeded KPIs
- Discuss annual contract expansion (more SKUs, more users)
- Make conversion the obvious next step

**Goal:** Customer should be **excited** to convert, not feeling pressured.

---

## 📊 Pilot-to-Contract Conversion Rate

**Industry benchmarks:**
- Bad pilot programs: 20-30% conversion
- Average: 40-50% conversion
- Excellent: 70-80% conversion

**PhotonicTag target:** 75%+ conversion

**How to achieve it:**
- Set realistic KPIs (they should be achievable!)
- Over-communicate (weekly updates)
- Deliver quick wins early
- Build internal champion
- Make annual contract an easy yes

---

*This template has been used successfully by B2B SaaS companies for enterprise pilots.*

**Customize, have lawyer review, then use to close your first $25K deal!** 💰
