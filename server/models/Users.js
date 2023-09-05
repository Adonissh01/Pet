const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    lastName: {
        type: String,
        required: [true, "Please enter your Last Name"],
        required: true,
    },
    firstName: {
        type: String,
        required: [true, "Please enter your First Name"],
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: [true, "Please enter your email"],
        trim: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        trim: true,
        minLength: 8,
        maxLength: 80
    },

    passwordConfirm: {
        type: String,
        trim: true,
        minLength: 8,
        maxLength: 80
    },
    address: {
        type: String,
        required: [true, "Please enter your Address"],
        trim: true,
        unique: true,
        
    },
  

    passwordChangedAt: Date,
    passwordResetToken: String, //to be sent by email
    passwordResetExpires: Date,

},

    { timestamps: true }

);






userSchema.methods.generatePasswordResetToken = function () {

    const resetToken = crypto.randomBytes(32).toString("hex");

    //saved in the database in a hashed way
    this.passwordResetToken = crypto.createHash("sha256").update("resetToken").digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000 //in milliseconds, 10 min after now of validity
    return resetToken;
};


module.exports = mongoose.model("User", userSchema);