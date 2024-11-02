const express = require("express");
const axios = require("axios");
const cors = require("cors");
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

// CORS-Konfiguration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 600,
};

app.use(cors(corsOptions));
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
