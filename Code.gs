function syncCryptoData() {
  const MOCK_MODE = false; // Use real CoinGecko API
  //If code is giving time-limit reach please use const MOCK_MODE = true; for mock sample to check the working of code

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const currentSheet = ss.getSheetByName("Current Prices");
    const historySheet = ss.getSheetByName("Price History");
    const dashboardSheet = ss.getSheetByName("Dashboard");

    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    let allCoins;

    if (MOCK_MODE) {
      allCoins = Array.from({ length: 15 }, (_, i) => ({
        id: `coin${i + 1}`,
        symbol: `c${i + 1}`,
        name: `Coin ${i + 1}`,
        current_price: 100 + i * 10,
        market_cap: 1000000000 + i * 100000000,
        price_change_percentage_24h: (Math.random() * 20 - 10).toFixed(2),
        last_updated: new Date().toISOString()
      }));
    } else {
      const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1";
      const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (response.getResponseCode() !== 200) {
        throw new Error(`CoinGecko API error ${response.getResponseCode()}:\n${response.getContentText()}`);
      }
      allCoins = JSON.parse(response.getContentText());
    }

    // === Update Current Prices ===
    currentSheet.getRange(2, 1, currentSheet.getLastRow(), 8).clearContent();
    allCoins.forEach((coin, i) => {
      currentSheet.getRange(i + 2, 1, 1, 8).setValues([[
        coin.id,
        coin.symbol,
        coin.name,
        coin.current_price,
        coin.market_cap,
        coin.price_change_percentage_24h,
        coin.last_updated,
        timestamp
      ]]);
    });

    // === Append to Price History ===
    const historyRows = allCoins.map(coin => ([
      timestamp,
      coin.id,
      coin.symbol,
      coin.name,
      `${coin.id}-${timestamp.replace(/[^0-9]/g, "")}`,
      coin.current_price,
      coin.market_cap,
      coin.price_change_percentage_24h
    ]));
    historySheet.getRange(historySheet.getLastRow() + 1, 1, historyRows.length, 8).setValues(historyRows);

    // === Archive history older than 1 day ===
    const today = new Date();
    const data = historySheet.getDataRange().getValues();
    const headers = data[0];
    const filtered = [headers];
    for (let i = 1; i < data.length; i++) {
      const rowDate = new Date(data[i][0]);
      const age = (today - rowDate) / (1000 * 60 * 60 * 24);
      if (age <= 1) filtered.push(data[i]);
    }
    historySheet.clearContents();
    historySheet.getRange(1, 1, filtered.length, 8).setValues(filtered);

    // === Dashboard View (Top 5) ===
    if (dashboardSheet) {
      dashboardSheet.clear();
      const currentData = currentSheet.getDataRange().getValues().slice(1).filter(r => r[3] && r[5]);

      const topByPrice = [...currentData].sort((a, b) => b[3] - a[3]).slice(0, 5);
      const topByChange = [...currentData].sort((a, b) => b[5] - a[5]).slice(0, 5);

      dashboardSheet.getRange("A1").setValue("Top 5 by Price");
      dashboardSheet.getRange("D1").setValue("Top 5 by 24h % Change");

      const priceChartData = [["Name", "Price"], ...topByPrice.map(r => [r[2], r[3]])];
      dashboardSheet.getRange(2, 1, priceChartData.length, 2).setValues(priceChartData);

      const changeChartData = [["Name", "% Change"], ...topByChange.map(r => [r[2], r[5]])];
      dashboardSheet.getRange(2, 4, changeChartData.length, 2).setValues(changeChartData);

      const chart1 = dashboardSheet.newChart()
        .setChartType(Charts.ChartType.COLUMN)
        .addRange(dashboardSheet.getRange(2, 1, priceChartData.length, 2))
        .setPosition(2, 7, 0, 0)
        .setOption("title", "Top 5 by Price (USD)")
        .build();
      dashboardSheet.insertChart(chart1);

      const chart2 = dashboardSheet.newChart()
        .setChartType(Charts.ChartType.COLUMN)
        .addRange(dashboardSheet.getRange(2, 4, changeChartData.length, 2))
        .setPosition(20, 7, 0, 0)
        .setOption("title", "Top 5 by 24h % Change")
        .build();
      dashboardSheet.insertChart(chart2);
    }

    MailApp.sendEmail(Session.getActiveUser().getEmail(), "Crypto Sync Success", `Synced ${allCoins.length} real crypto coins at ${timestamp}`);
  } catch (err) {
    Logger.log("ERROR: " + err.message);
    MailApp.sendEmail(Session.getActiveUser().getEmail(), "Sync Failed", err.message);
    throw err;
  }
}
function doGet() {
  syncCryptoData();
  return ContentService.createTextOutput("Crypto data synced successfully.");
}

