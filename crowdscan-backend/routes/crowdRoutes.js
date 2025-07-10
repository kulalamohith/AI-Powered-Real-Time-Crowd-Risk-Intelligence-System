const express = require("express");
const router = express.Router();

const { ingestCrowdData, getHeatmap, getZones, getRiskSummary, getRiskStats, locationRiskSummaryAI, gateSafetyAdvisorAI, predictiveRiskAI, customAIQuery } = require("../controllers/crowdController");

router.post("/crowd-data", ingestCrowdData);
router.get("/heatmap", getHeatmap);
router.get("/zones", getZones);
router.get("/risk-summary", getRiskSummary);
router.get("/risk-stats", getRiskStats);
router.post("/ai/location-risk", locationRiskSummaryAI);
router.post("/ai/gate-safety", gateSafetyAdvisorAI);
router.post("/ai/predictive-risk", predictiveRiskAI);
router.post("/ai/custom-query", customAIQuery);

module.exports = router;
