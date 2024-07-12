const mongoose = require("mongoose")

const stateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your State"],
        minLength: [2, "Name should have more than 2 characters"]
    },
    isoCode: {
        type: String,
        required: [true, "Please Enter the ISO Code"],
    },
    countryCode: {
        type: String,
        required: [true, "Please Enter the Country Code"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

stateSchema.pre('findOneAndDelete', async function (next) {
    const stateId = this.getQuery()['_id'];
    await mongoose.model('User').deleteMany({ state: stateId });
    next();
});

module.exports = mongoose.model("State", stateSchema)