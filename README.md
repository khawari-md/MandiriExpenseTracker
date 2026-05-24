# Automated Transaction Data Pipeline & Interactive Expense Dashboard

An end-to-end automated data pipeline that extracts unformatted transaction emails from Bank Mandiri (QRIS, BI Fast, Transfers, and QRIS Tap MRT), parses the unstructured text using regular expressions (Regex), enforces data deduplication, and visualizes the financial metrics into an interactive Looker Studio dashboard.

## 📌 Business & Problem Statement
Manual expense tracking is time-consuming, prone to human error, and difficult to scale. While banks send real-time email notifications for every transaction, the data remains trapped in unstructured text format within the inbox. 

This project solves this by creating an automated backend pipeline that converts raw unstructured emails into a structured database warehouse (Google Sheets) and serves it as a production-ready analytics dashboard (Looker Studio) optimized for daily financial tracking.

## 🛠️ Tech Stack & Architecture
* **Data Source:** Gmail (Bank Mandiri Notification Emails)
* **Ingestion & ETL Engine:** Google Apps Script (JavaScript-based)
* **Data Transformation:** Regular Expressions (Regex) & Batch Processing
* **Data Warehouse:** Google Sheets
* **Data Visualization:** Looker Studio

### Data Pipeline Workflow:
1.  **Ingestion:** Google Apps Script periodically queries the Gmail API for specific transaction subjects.
2.  **Parsing (ETL):** Custom Regex patterns extract unique transaction IDs (No. Referensi), amounts, dates, and merchant names.
3.  **Deduplication:** A validation layer checks the existing database to prevent duplicate entries based on the transaction ID.
4.  **Loading:** Validated data is appended to the data warehouse.
5.  **Visualization:** Looker Studio fetches the structured data to update metrics interactively.

## ⚡ Key Features & Engineering Challenges Solved

### 1. Robust Text Parsing (Handling Inconsistent Schemas)
Different transaction types (e.g., standard QRIS vs. MRT QRIS Tap) have varying text layouts. Standard parsing breaks when comma delimiters are missing (e.g., *FamilyMart* vs *Warkop* receipts). This pipeline implements generalized look-around regex to capture strings dynamically until a newline or delimiter is met:

```javascript
// Example: Dynamic parsing for QRIS Merchant Names
var matchPenerima = body.match(/Penerima\s*[\r\n]+\s*([^\r\n,]+)/i);
```

### 2. Scalability & Timeout Mitigation (Batch Processing)
Google Apps Script enforces a strict 6-minute execution limit. Processing historical data (up to 10,000 emails) at once triggers a timeout failure. This pipeline implements **Batch Processing** and a **Time-Safe Execution Check** (capping runs at 4.6 minutes) combined with time-driven triggers to ingest large history incrementally without data loss.

### 3. Strict Data Integrity
To ensure a reliable data source, the pipeline enforces a Primary Key constraint using the Bank's `No. Referensi` or `BI Fast ID` (supporting alphanumeric strings). Duplicate rows are filtered out before reaching the sheet array.

## 📂 Repository Structure
* `Mandiri.gs` : The core Google Apps Script file handling Gmail queries, Regex mapping, and sheet insertion.
* `README.md` : Project documentation.

## 📊 Sample Analytical Insights from Dashboard
By transforming raw logs into structured records, the Looker Studio dashboard uncovers key behavioral insights:
* **Velocity Tracking:** Identifying peak spending hours and weekend vs. weekday spending behaviors.
* <img width="1187" height="275" alt="image" src="https://github.com/user-attachments/assets/25b97a21-5ba9-4419-848b-48b2c1bb52b7" />
* **Merchant Concentration Risk:** Bar charts mapping total capital allocation per vendor (e.g., high-frequency small-ticket items at convenience stores vs. low-frequency large-ticket bank transfers).
* <img width="368" height="244" alt="image" src="https://github.com/user-attachments/assets/cca5dd60-ff32-4fce-937c-3833b8471df9" />
* **Fixed vs. Variable Cost Categorization:** Automatically flags e-money top-ups as logistical/transportation overhead while isolating food/beverage retail transactions.
* <img width="134" height="191" alt="image" src="https://github.com/user-attachments/assets/90a9b6e4-1a35-4f58-8a68-2ec90c61bee8" />


## 🚀 How to Setup Your Own Pipeline
1.  Create a Google Sheet and rename your target sheet tab to `Data`.
2.  Set up the first row headers: `ID Transaksi`, `Tanggal`, `Merchant`, `Deskripsi`, `Jenis`, `Nominal`.
3.  Go to `Extensions` > `Apps Script`, paste the `Code.gs` provided in this repository.
4.  Authorize Gmail and Sheets permissions.
5.  Set a Time-driven trigger in Apps Script to run `catatMandiriFinal()` every 10 minutes.
6.  Connect your Google Sheet to Looker Studio and start building your charts!

---
Developed by **Khawari Muhammad Dzakwan**
Connect with me on [LinkedIn](https://www.linkedin.com/in/khawari-muhammad/) | [Portfolio]()
