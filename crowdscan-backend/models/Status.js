//Stores crowd data per zone

const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
locationId: { type: String, required: true },
gateId: { type: String, required: true },
density: { type: Number, required: true },
timestamp: {
type: Date,
default: Date.now
}
});

module.exports = mongoose.model("Status", statusSchema);