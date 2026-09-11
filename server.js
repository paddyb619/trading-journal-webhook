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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
