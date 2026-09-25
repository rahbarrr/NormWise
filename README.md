# NormWise

> **AI-Powered Indian Standards Intelligence for Procurement**  
> Identify applicable Indian Standards (IS), verify their current status, and understand why they apply.

---

## 📌 Overview
**NormWise** is a specialized standards intelligence platform built for public sector undertakings (PSUs), government procurement officers, technical evaluation teams, and vendors. It bridges natural language procurement requirements with statutory Bureau of Indian Standards (BIS) specifications, mandatory Quality Control Orders (QCOs), and ready-to-use GeM (Government e-Marketplace) tender clauses.

### Key Value Propositions
- **Traceability & Evidence:** Every recommendation cites the specific clause, Technical Committee (e.g., MED 03, ETD 35, CED 22), and Gazette of India statutory order.
- **Statutory QCO Verification:** Identifies whether BIS ISI mark or Compulsory Registration Scheme (CRS) certification is legally mandated.
- **GeM Tender-Ready Clauses:** Generates copy-pasteable compliance clauses formatted for Additional Terms & Conditions (ATC).
- **Human Compliance Queue:** Provides an escalation workflow for standards undergoing committee review or draft amendment.

---

## 🚀 Tech Stack
- **Framework:** React.js 19 + Vite
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons:** Lucide React
- **Routing:** React Router v7
- **Architecture:** Modular component architecture prepared for Node.js + Express + MongoDB backend integration

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation
```bash
# Clone the repository
git clone https://github.com/rahbarrr/NormWise.git
cd NormWise

# Install dependencies
npm install

# Run development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🧭 Application Structure & Routes

| Route | View | Description |
|---|---|---|
| `/` | **Dashboard** | Executive summary, requirement input, example chips, statistics, and recent recommendations table |
| `/recommend` | **New Recommendation** | Procurement wizard with department selection and mandatory QCO toggles |
| `/analyze` | **Analysis Pipeline** | Step-by-step technical attribute parsing and BIS Gazette verification engine |
| `/results` | **Recommendation Results** | Evidence-backed standard report, statutory QCO order, testing clauses, and GeM tender clause |
| `/evidence` | **Evidence Matrix** | Clause-by-clause traceability matrix and NABL proof parameters |
| `/review` | **Human Review Queue** | Verification queue for compliance officers to review committee amendments |
| `/history` | **Audit History** | Full searchable history of all procurement evaluations |
| `/saved` | **Saved Library** | Bookmarked standards and boilerplate tender clauses |
| `/settings` | **Settings** | Department profile and GeM integration configuration |
| `/help` | **Documentation & FAQ** | Standards intelligence guide, BIS Act 2016, and QCO legal overview |

---

## 🏛️ Aligned Frameworks
- **Bureau of Indian Standards (BIS) Act, 2016**
- **General Financial Rules (GFR), 2017**
- **Government e-Marketplace (GeM) Procurement Guidelines**
- **Department for Promotion of Industry and Internal Trade (DPIIT) Quality Control Orders**

---

## 📄 License
Demonstration Prototype — Phase 1 MVP.
