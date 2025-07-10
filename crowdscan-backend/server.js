const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config(); // Load variables from .env
connectDB();
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Allows parsing JSON in request bodies

// Test route
const crowdRoutes = require("./routes/crowdRoutes");
app.use("/api", crowdRoutes);
app.get("/", (req, res) => {
res.send(" CrowdScan backend is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log('Server is running on port $',{PORT});
});