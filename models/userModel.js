const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name Connot exceed 30 characters"],
        minLength: [2, "Name should have more than 2 characters"]
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: [true, "Please Enter Your Phone Number"],
    },
    phone2: {
        type: Number,
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter Your Email"]
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "male",
    },
    experience: {
        type: Number,
        required: [true, "Please Enter your experience"],
        maxLength: [2, "Experience cannot exceed 2 characters"],
        default: 1,
    },
    age: {
        type: Number,
        maxLength: [2, "Age cannot exceed 2 characters"],
        default: 1,
    },
    qualification: {
        type: String,
        required: [true, "Please Enter your Qualification"],
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        required: [true, "Please Enter your state"],
    },
    city: {
        type: String,
        required: [true, "Please Enter your city"],
    },
    registration: {
        type: String,
        required: [true, "Please Enter your Registration Number"],
        default: 1,
    },
    specialities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialities',
    }],
    university: {
        type: String,
        required: [true, "Please Enter your University / Collage name"],
    },
    hospital: {
        type: String,
    },
    address: {
        type: String,
        required: [true, "Please Enter your Address"],
    },
    website: {
        type: String,
    },
    map: {
        type: String,
    },
    avatar: {
        type: String,
    },
    certificate: {
        type: String,
    },
    nabh: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch
};

userSchema.methods.getResetPassword = function () {
    const resetToken = crypto.randomBytes(20).toString("hex")
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000
    return resetToken;
}

module.exports = mongoose.model("User", userSchema)