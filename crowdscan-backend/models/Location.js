const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
locationId: { type: String, required: true },
locationName: { type: String, required: true }, // eg. "Cricket Stadium"
locationType: { type: String, required: true }, // "stadium", "metro", etc.
gates: [
{
gateId: { type: String, required: true }, // G1, G2, etc.
name: { type: String, required: true }, // "North Gate"
coordinates: {
lat: { type: Number },
lng: { type: Number }
}
}
]
});

module.exports = mongoose.model("Location", locationSchema);