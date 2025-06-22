# Crypto Tracker – VR Automations Candidate Task

This Google Apps Script tracks the **top 15 cryptocurrencies** using the **CoinGecko API**, updates a Google Sheet with live data, maintains a historical log, and visualizes trends in a dashboard.

---

##  Features

- Fetches real-time data for **top 15 coins by market cap**
- Populates 3 tabs:
  - `Current Prices` — latest coin stats
  - `Price History` — log of each sync
  - `Dashboard` — top 5 coins with visuals
-  **Charts auto-generated** in Dashboard:
  - Top 5 coins by current price
  - Top 5 coins by 24h % change
-  Archives history older than 1 day
- Trigger-based automation every 30 mins
-  Sends email notification on success or failure

---

##  How It Works

###  `Current Prices`
Displays:
- ID, Symbol, Name
- Current Price (USD)
- Market Cap
- 24h Price Change (%)
- Last Updated
- Timestamp (local time)

###  `Price History`
Appends a row for each coin, every run, with:
- Timestamp
- Internal Ref Code: `coinID-YYYYMMDDHHMMSS`

###  `Dashboard`
- Shows **Top 5 by Price** and **Top 5 by 24h % Change**
- Each set is rendered as a **column chart**
- Data refreshes automatically

---

## 🛠️ How to Run

1. Open **Apps Script** editor from your Google Sheet
2. Paste the script into `Code.gs`
3. Set `MOCK_MODE = false` in the script
4. Run `syncCryptoData()` manually once
5. Set up a **time-driven trigger** to automate every 30 minutes

---

## ⏱ Trigger Setup

- **Event Source**: Time-driven
- **Type**: Every 30 minutes
- **Function**: `syncCryptoData`

 See: [`trigger.png`](trigger.png)

---

##  Email Notification

- Sends to the **active user** after each sync:
  -  On success: includes count + timestamp
  -  On failure: includes error message (e.g. API 429)

📸 See: [`email-success.png`](email-success.png)

---

##  Rate Limit Handling

- CoinGecko free API is limited (may return HTTP 429)
- To avoid this:
  - Don’t run too frequently
  - Add retry logic or use a paid API key

---

##  Files Included

- `Code.gs` — main script
- `README.md` — project documentation
- `trigger.png` — trigger setup screenshot
- `email-success.png` — email notification proof

---

##  Notes

- Charts are built only if not already present
- Script is fully self-contained and uses only free tools
