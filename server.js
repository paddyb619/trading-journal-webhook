const express = require("express");

const app = express();
app.use(express.json());

let latestAlert = null;

// Simple home page so we know the server is running
app.get("/", (req, res) => {
  res.send("Trading Journal webhook is running");
});

// TradingView sends alerts here
app.post("/webhook", (req, res) => {
  latestAlert = req.body;

  console.log("TradingView alert received:");
  console.log(latestAlert);

  res.status(200).json({
    success: true
  });
});

// iPhone app gets the latest alert here
app.get("/latest", (req, res) => {
  if (!latestAlert) {
    return res.status(404).json({
      message: "No TradingView alert received yet"
    });
  }

  res.json(latestAlert);
});

// Test live DAX 1-minute candles
app.get("/dax-test", async (req, res) => {
    try {
        const url =
            "https://api.londonstrategicedge.com/vault/candles?symbol=DE30%2FEUR&timeframe=1m&limit=100&order=desc";

        const response = await fetch(url, {
            headers: {
                "x-api-key": process.env.LSE_API_KEY
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({
                error: "Market data request failed",
                status: response.status
            });
        }

        const candles = await response.json();
      const closes = candles
    .slice()
    .reverse()
    .map(candle => candle.close);

function calculateEMA(values, period) {
    const multiplier = 2 / (period + 1);
    let ema = values[0];

    for (let i = 1; i < values.length; i++) {
        ema = (values[i] - ema) * multiplier + ema;
    }

    return ema;
}

const ema20 = calculateEMA(closes, 20);
const ema50 = calculateEMA(closes, 50);

const trend = ema20 > ema50 ? "Bullish" : "Bearish";        
      
      res.json({
    symbol: "DE30/EUR",
    ema20: ema20,
    ema50: ema50,
    trend: trend
});

    } catch (error) {
        console.error("DAX fetch failed:", error);

        res.status(500).json({
            error: "Failed to fetch DAX data"
        });
    }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
