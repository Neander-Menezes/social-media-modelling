const express = require("express");
const { queryReady } = require("../db");

const router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    await queryReady();
    return res.status(200).json({ status: "ok" });
  } catch (err) {
    return res.status(503).json({
      status: "unavailable",
      error: err.message,
    });
  }
});

module.exports = router;
