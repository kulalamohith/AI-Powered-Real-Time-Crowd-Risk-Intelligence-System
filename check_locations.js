const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/crowdscan");

const Location = require("./crowdscan-backend/models/Location");

async function checkLocations() {
  try {
    const locations = await Location.find({});
    console.log("Current Locations in Database:");
    console.log(JSON.stringify(locations, null, 2));
    
    // Show all gates that should be monitored
    console.log("\nGates that should be monitored:");
    locations.forEach(location => {
      console.log(`\n ${location.locationName} (${location.locationId}):`);
      location.gates.forEach(gate => {
        console.log(`  - ${gate.gateId}: ${gate.name} (${gate.coordinates.lat}, ${gate.coordinates.lng})`);
      });
    });
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

checkLocations(); 