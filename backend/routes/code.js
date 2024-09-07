const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

router.get("/generate-code", (req, res) => {
  console.log("Generating code...");
  const code = uuidv4();
  console.log(`Generated code: ${code}`);
  res.json({ code });
});

module.exports = router;
