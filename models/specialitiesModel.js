const mongoose = require("mongoose")

const SpecialitiesSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Speciality"],
        minLength: [2, "Name should have more than 2 characters"]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Specialities", SpecialitiesSchema)