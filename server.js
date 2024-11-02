const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Liste der IP-Adressen mit erhöhtem Limit
const whitelistedIPs = ["123.45.67.89", "98.76.54.32"]; // Ersetzen Sie diese mit Ihren gewünschten IP-Adressen

// Benutzerdefinierter Rate Limiter
const customLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 Minute
  max: (req) => {
    const clientIP = req.ip;
    return whitelistedIPs.includes(clientIP) ? 10 : 2; // 10 für Whitelist, 2 für andere
  },
  message: "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Anwenden des Limiters auf alle Routen
app.use(customLimiter);

// Middleware für CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Erlaubt alle Ursprünge
  res.header("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  
  // Wenn die Anfrage eine OPTIONS-Anfrage ist, antworte sofort
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next(); // Gehe zur nächsten Middleware
});

app.use(express.json());

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

app.post("/api/perplexity", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      req.body,
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
    res
      .status(500)
      .json({ error: "An error occurred while processing your request" });
  }
});

// Keep the server awake
app.get("/ping", (req, res) => {
  res.send("Pong!");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
