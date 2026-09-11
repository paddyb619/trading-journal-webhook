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

const currentPrice = closes[closes.length - 1];

// How close price is to EMA20 right now
const distanceFromEMA20 =
    Math.abs(currentPrice - ema20) / ema20;

// Look at the previous 8 candles
const recentCloses = closes.slice(-9, -1);

// Was price previously clearly away from EMA20?
const movedAway =
    trend === "Bullish"
        ? recentCloses.some(price => price > ema20 * 1.001)
        : recentCloses.some(price => price < ema20 * 0.999);

// Has price now returned close to EMA20?
const returnedToEMA =
    distanceFromEMA20 <= 0.0005;

// A pullback requires BOTH
const pullback =
    movedAway && returnedToEMA; 

const previousPrice = closes[closes.length - 2];

const confirmation =
    trend === "Bullish"
        ? currentPrice > previousPrice
        : currentPrice < previousPrice;

function calculateRSI(values, period = 14) {
    let gains = 0;
    let losses = 0;

    for (let i = values.length - period; i < values.length; i++) {
        const change = values[i] - values[i - 1];

        if (change > 0) {
            gains += change;
        } else {
            losses += Math.abs(change);
        }
    }

    const averageGain = gains / period;
    const averageLoss = losses / period;

    if (averageLoss === 0) return 100;

    const rs = averageGain / averageLoss;
    return 100 - (100 / (1 + rs));
}

const rsi = calculateRSI(closes, 14);

const momentum =
    rsi > 55 ? "Bullish" :
    rsi < 45 ? "Bearish" :
    "Neutral";      
      
      res.json({
    symbol: "DE30/EUR",
    ema20: ema20,
    ema50: ema50,
    trend: trend,
    rsi: rsi,
    momentum: momentum,
    currentPrice: currentPrice,
    pullback: pullback,
    confirmation: confirmation
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
