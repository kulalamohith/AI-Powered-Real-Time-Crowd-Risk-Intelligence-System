const Status = require("../models/Status");
const Location = require("../models/Location");
const mongoose = require("mongoose");
const generateRiskSummary = require("../utils/deepseekHelper");

// Ingest crowd data
exports.ingestCrowdData = async (req, res) => {
  try {
    const { locationId, gateId, density } = req.body;
    if (!locationId || !gateId || typeof density !== "number") {
      return res.status(400).json({ error: "locationId, gateId and density are required" });
    }

    await Status.create({ locationId, gateId, density });
    res.status(201).json({ message: "Crowd data recorded" });
  } catch (err) {
    console.error("Error saving crowd data:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get latest heatmap
exports.getHeatmap = async (req, res) => {
  try {
    const latest = await Status.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$gateId",
          density: { $first: "$density" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);
    res.json(latest);
  } catch (err) {
    console.error("Error fetching heatmap:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all zones
exports.getZones = async (req, res) => {
  try {
    const result = await mongoose.connection.db.collection("locations").find({}).toArray();
    console.log("Raw Mongo fetch:", result);
    res.json(result);
  } catch (err) {
    console.error("Error fetching zones:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Getting risk summary
exports.getRiskSummary = async (req, res) => {
  try {
    const officerMode = req.query.mode === "officer";
    // FetchING last 3 density readings per gate
    const trendData = await Status.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            locationId: "$locationId",
            gateId: "$gateId"
          },
          densities: { $push: "$density" }
        }
      },
      {
        $project: {
          locationId: "$_id.locationId",
          gateId: "$_id.gateId",
          densities: { $slice: ["$densities", 3] }
        }
      }
    ]);

    //Group gates under locations
    const locationMap = {};
    for (const entry of trendData) {
      const { locationId, gateId, densities } = entry;
      const latest = densities[0];
      const previous = densities[1] ?? latest;
      const trend = latest - previous;

      let tag = "Safe";
      let riskLevel = 1;
      let color = "green";
      
      if (latest >= 9 && trend >= 1.5) {
        tag = "Stampede Risk";
        riskLevel = 5;
        color = "red";
      }
      else if (latest >= 9) {
        tag = "Critical Risk";
        riskLevel = 4;
        color = "darkred";
      }
      else if (latest >= 8) {
        tag = "High Risk";
        riskLevel = 3;
        color = "orange";
      }
      else if (latest >= 6) {
        tag = "Moderate Risk";
        riskLevel = 2;
        color = "yellow";
      }
      else {
        tag = "Safe";
        riskLevel = 1;
        color = "green";
      }

      if (!locationMap[locationId]) locationMap[locationId] = [];
      locationMap[locationId].push({
        gateId,
        latest: latest.toFixed(1),
        trend: trend.toFixed(2),
        tag,
        riskLevel,
        color
      });
    }

    //  Building text summary per location
    let zoneText = "";
    for (const [locationId, gates] of Object.entries(locationMap)) {
      zoneText += ` Location: ${locationId}\n`;
      for (const gate of gates) {
        zoneText += ` - Gate ${gate.gateId}: Density ${gate.latest}, Trend ${gate.trend}, Status: ${gate.tag}\n`;
      }
      zoneText += "\n";
    }

    // Prompt for AI (u can give any related prompt)
    const prompt = `
You are a real-time crowd safety assistant.

Here is current gate-level data grouped by location:
${zoneText}

Risk Level Definitions:
- Safe (<6): Normal crowd density, no action needed
- Moderate Risk (6-7.9): Elevated density, monitor closely
- High Risk (8-8.9): High density, consider crowd control measures
- Critical Risk (≥9): Very high density, immediate attention required
- Stampede Risk (≥9 + increasing trend): Immediate danger, evacuate immediately

Generate a short summary ${officerMode ? "(tone: for police)" : "(tone: public)"}:

Highlight risky/stampede zones with specific risk levels
Suggest safe gates for evacuation
Provide specific actions for each risk level
give it in bullet points in neat manner
Use 4-5 lines max
`.trim();

    try {
      const summary = await generateRiskSummary(zoneText, prompt);
      res.json({ summary });
    } catch (err) {
      console.error("Error generating summary:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (err) {
    console.error("Error in risk summary:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get risk statistics
exports.getRiskStats = async (req, res) => {
  try {
    const trendData = await Status.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            locationId: "$locationId",
            gateId: "$gateId"
          },
          densities: { $push: "$density" }
        }
      },
      {
        $project: {
          locationId: "$_id.locationId",
          gateId: "$_id.gateId",
          densities: { $slice: ["$densities", 3] }
        }
      }
    ]);

    let stats = {
      total: 0,
      safe: 0,
      moderate: 0,
      high: 0,
      critical: 0,
      stampede: 0
    };

    for (const entry of trendData) {
      const { densities } = entry;
      const latest = densities[0];
      const previous = densities[1] ?? latest;
      const trend = latest - previous;

      stats.total++;
      
      if (latest >= 9 && trend >= 1.5) stats.stampede++;
      else if (latest >= 9) stats.critical++;
      else if (latest >= 8) stats.high++;
      else if (latest >= 6) stats.moderate++;
      else stats.safe++;
    }

    res.json({
      summary: stats,
      riskDistribution: {
        safe: `${((stats.safe / stats.total) * 100).toFixed(1)}%`,
        moderate: `${((stats.moderate / stats.total) * 100).toFixed(1)}%`,
        high: `${((stats.high / stats.total) * 100).toFixed(1)}%`,
        critical: `${((stats.critical / stats.total) * 100).toFixed(1)}%`,
        stampede: `${((stats.stampede / stats.total) * 100).toFixed(1)}%`
      }
    });
  } catch (err) {
    console.error("Error in risk stats:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// AI: Location Risk Summary
exports.locationRiskSummaryAI = async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }
    // for finding the location by name (case-insensitive)
    const locDoc = await Location.findOne({ locationName: { $regex: new RegExp('^' + location + '$', 'i') } });
    if (!locDoc) {
      return res.status(404).json({ error: 'Location not found' });
    }
    // Get all gates for this location
    const gates = locDoc.gates.map(g => g.gateId);
    // Get last 3 density readings for each gate  we use aggregation here for fetching last 3 entries in mongodb
    const trendData = await Status.aggregate([
      { $match: { locationId: locDoc.locationId, gateId: { $in: gates } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$gateId",
          densities: { $push: "$density" }
        }
      },
      {
        $project: {
          gateId: "$_id",
          densities: { $slice: ["$densities", 3] }
        }
      }
    ]);
    //  zoneText for AI
    let zoneText = `Location: ${locDoc.locationName}\n`;
    for (const entry of trendData) {
      const { gateId, densities } = entry;
      const latest = densities[0];
      const previous = densities[1] ?? latest;
      const trend = latest - previous;
      let tag = "Safe";
      if (latest >= 9 && trend >= 1.5) tag = "Stampede Risk";
      else if (latest >= 9) tag = "Critical Risk";
      else if (latest >= 8) tag = "High Risk";
      else if (latest >= 6) tag = "Moderate Risk";
      else tag = "Safe";
      zoneText += ` - Gate ${gateId}: Density ${latest.toFixed(1)}, Trend ${trend.toFixed(2)}, Status: ${tag}\n`;
    }
    // AI prompt
    const prompt = `You are a real-time crowd safety assistant.\nHere is current gate-level data for ${locDoc.locationName}:\n${zoneText}\nGenerate a short summary for this location. Highlight risky/stampede gates and suggest safe gates for evacuation. Use 3-4 lines max.`;
    const summary = await generateRiskSummary(zoneText, prompt);
    res.json({ summary });
  } catch (err) {
    console.error("Error in locationRiskSummaryAI:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// AI: Gate Safety Advisor
exports.gateSafetyAdvisorAI = async (req, res) => {
  try {
    const { location, gate } = req.body;
    if (!location || !gate) {
      return res.status(400).json({ error: 'Location and gate are required' });
    }
    // Find the location by name (case-insensitive)
    const locDoc = await Location.findOne({ locationName: { $regex: new RegExp('^' + location + '$', 'i') } });
    if (!locDoc) {
      return res.status(404).json({ error: 'Location not found' });
    }
    // Get all gates for this location
    const gates = locDoc.gates.map(g => g.gateId);
    if (!gates.includes(gate)) {
      return res.status(404).json({ error: 'Gate not found at this location' });
    }
    // Get last 3 density readings for all gates
    const trendData = await Status.aggregate([
      { $match: { locationId: locDoc.locationId, gateId: { $in: gates } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$gateId",
          densities: { $push: "$density" }
        }
      },
      {
        $project: {
          gateId: "$_id",
          densities: { $slice: ["$densities", 3] }
        }
      }
    ]);
    // Finding the requested gate's risk
    let gateStatus = null;
    let safestGate = null;
    let minDensity = Infinity;
    let summaryText = '';
    for (const entry of trendData) {
      const { gateId, densities } = entry;
      const latest = densities[0];
      const previous = densities[1] ?? latest;
      const trend = latest - previous;
      let tag = "Safe";
      if (latest >= 9 && trend >= 1.5) tag = "Stampede Risk";
      else if (latest >= 9) tag = "Critical Risk";
      else if (latest >= 8) tag = "High Risk";
      else if (latest >= 6) tag = "Moderate Risk";
      else tag = "Safe";
      if (gateId === gate) {
        gateStatus = { gateId, latest, trend, tag };
      }
      if (latest < minDensity) {
        minDensity = latest;
        safestGate = gateId;
      }
      summaryText += ` - Gate ${gateId}: Density ${latest.toFixed(1)}, Trend ${trend.toFixed(2)}, Status: ${tag}\n`;
    }
    // AI prompt
    const prompt = `You are a real-time crowd safety assistant.\nHere is current gate-level data for ${locDoc.locationName}:\n${summaryText}\nA user is currently at Gate ${gate}.\nIs this gate safe? If not, suggest the safest gate for evacuation. Use 2-3 lines max.`;
    const aiSummary = await generateRiskSummary(summaryText, prompt);
    res.json({
      summary: aiSummary,
      status: gateStatus ? gateStatus.tag : 'Unknown',
      safestGate: gateStatus && gateStatus.tag !== 'Safe' ? safestGate : null
    });
  } catch (err) {
    console.error("Error in gateSafetyAdvisorAI:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// AI: Predictive Risk (by trend)
exports.predictiveRiskAI = async (req, res) => {
  try {
    const { location, gate } = req.body;
    if (!location || !gate) {
      return res.status(400).json({ error: 'Location and gate are required' });
    }
    // Finding the location by name 
    const locDoc = await Location.findOne({ locationName: { $regex: new RegExp('^' + location + '$', 'i') } });
    if (!locDoc) {
      return res.status(404).json({ error: 'Location not found' });
    }
    // Get last 3 density readings for this gate
    const trendData = await Status.find({ locationId: locDoc.locationId, gateId: gate }).sort({ timestamp: -1 }).limit(3);
    if (!trendData.length) {
      return res.status(404).json({ error: 'No data for this gate' });
    }
    const densities = trendData.map(d => d.density);
    const latest = densities[0];
    const previous = densities[1] ?? latest;
    const trend = latest - previous;
    // Simple forecast: next = latest + trend
    const forecast = latest + trend;
    let tag = "Safe";
    if (forecast >= 9 && trend >= 1.5) tag = "Stampede Risk";
    else if (forecast >= 9) tag = "Critical Risk";
    else if (forecast >= 8) tag = "High Risk";
    else if (forecast >= 6) tag = "Moderate Risk";
    else tag = "Safe";
    // AI prompt
    const prompt = `You are a real-time crowd safety assistant.\nHere is the recent density data for Gate ${gate} at ${locDoc.locationName}:\nLatest: ${latest}, Previous: ${previous}, Trend: ${trend.toFixed(2)}\nForecasted density for next 10 minutes: ${forecast.toFixed(1)} (Status: ${tag})\nGenerate a short forecast summary for the user. Use 2-3 lines max.`;
    const summary = await generateRiskSummary('', prompt);
    res.json({ summary });
  } catch (err) {
    console.error("Error in predictiveRiskAI:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// AI: Custom AI Query
exports.customAIQuery = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    // Use current risk summary as context
    const trendData = await Status.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            locationId: "$locationId",
            gateId: "$gateId"
          },
          densities: { $push: "$density" }
        }
      },
      {
        $project: {
          locationId: "$_id.locationId",
          gateId: "$_id.gateId",
          densities: { $slice: ["$densities", 3] }
        }
      }
    ]);
    let context = '';
    for (const entry of trendData) {
      const { locationId, gateId, densities } = entry;
      const latest = densities[0];
      context += `Location: ${locationId}, Gate: ${gateId}, Latest Density: ${latest}\n`;
    }
    const prompt = `You are a real-time crowd safety assistant.\nHere is the latest crowd data:\n${context}\nUser question: ${query}\nAnswer in 2-4 lines.`;
    const summary = await generateRiskSummary(context, prompt);
    res.json({ summary });
  } catch (err) {
    console.error("Error in customAIQuery:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
