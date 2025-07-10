const mongoose = require("mongoose");
require("dotenv").config();

const Location = require("./models/Location");

const locations = [
  {
    locationId: "stadium1",
    locationName: "M. Chinnaswamy Stadium",
    locationType: "stadium",
    gates: [
      { gateId: "G1", name: "North Gate", coordinates: { lat: 12.9784, lng: 77.5996 } },
      { gateId: "G2", name: "South Gate", coordinates: { lat: 12.9762, lng: 77.5990 } },
      { gateId: "G3", name: "East Gate", coordinates: { lat: 12.9775, lng: 77.6010 } },
      { gateId: "G4", name: "West Gate", coordinates: { lat: 12.9770, lng: 77.5975 } }
    ]
  },
  {
    locationId: "metro1",
    locationName: "MG Road Metro Station",
    locationType: "metro",
    gates: [
      { gateId: "G1", name: "Entry Gate 1", coordinates: { lat: 12.9758, lng: 77.6101 } },
      { gateId: "G2", name: "Entry Gate 2", coordinates: { lat: 12.9760, lng: 77.6095 } },
      { gateId: "G3", name: "Exit Gate 1", coordinates: { lat: 12.9762, lng: 77.6103 } },
      { gateId: "G4", name: "Exit Gate 2", coordinates: { lat: 12.9756, lng: 77.6098 } }
    ]
  },
  {
    locationId: "mall1",
    locationName: "Orion Mall",
    locationType: "mall",
    gates: [
      { gateId: "G1", name: "Main Entrance", coordinates: { lat: 13.0116, lng: 77.5556 } },
      { gateId: "G2", name: "Parking Entrance", coordinates: { lat: 13.0120, lng: 77.5560 } },
      { gateId: "G3", name: "Food Court Entrance", coordinates: { lat: 13.0118, lng: 77.5558 } },
      { gateId: "G4", name: "Emergency Exit", coordinates: { lat: 13.0114, lng: 77.5552 } }
    ]
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/crowdscan");
    await Location.deleteMany({});
    await Location.insertMany(locations);
    console.log("Seeded locations with realworld data");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    mongoose.connection.close();
  }
}

seed(); 