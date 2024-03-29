const User = require("../models/Users");
const bcrypt = require("bcrypt");
// const crypto = require("crypto");
const validator = require("validator");

const { error } = require("console");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  try {
    const token = jwt.sign({ id }, "hellofromthegdnodejscourse1234", {
      expiresIn: "10h",
    });
    return token;
  } catch (error) {
    console.error('Error signing JWT:', error);
    // Handle the error, possibly by sending an error response
    throw error; // Rethrow the error for higher-level handling
  }
};

const createSendToken = (user, statusCode, res, msg) => {
  try {
    const token = signToken(user._id);

    res.status(statusCode).json({
      status: "success",
      token,
      userID: user._id,
      data: {
        message: msg,
        user,
      },
    });
  } catch (error) {
    // Handle the error, possibly by sending an error response
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


// signup function
exports.signingUp = async (req, res) => {
  try {
    //1-check if the email is already valid
    let email = req.body.email;
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "email is not valid" });
    }
    //2-check if a user already signed in using the same email
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res
        .status(400)
        .json({ message: "a user already signed in using this email" });
    }

 
    //4-check if the password and confirm password match
    let pass = req.body.password;
    let passConfirm = req.body.passwordConfirm;

    if (pass != passConfirm) {
      res
        .status(404)
        .json({ message: "password and passwordConfirm do not match" });
    } else {
      //5-create the user
      const hashedPassword = await bcrypt.hash(pass, 12);

      const newUser = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: hashedPassword,
        address: req.body.address
      });
console.log(newUser);
      // return res.status(201).json({ message: "User created succesfully.", data: { newUser } });
      let msg = "User created successfully";
    createSendToken(newUser, 201, res, msg);

    }
  } catch (err) {
  return  res.status(401).json({ message: "error" });
  }
};

//signin function
exports.signingIn = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    //   1-check if user already signed up on this website
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    // 2-check if the password is correct
    const comparePasswords = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!comparePasswords) {
      return res.status(404).json({ message: "Incorrect credentials." });

    } let msg = "You are logged in successfully";
     createSendToken(user, 200, res, msg); 
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    //1-Check if the user with the provided email exists
    const user = await User.findOne({
      $or: [
        { email: req.body.email },
       
        { phoneNumber: req.body.phoneNumber },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ message: "the user with this email does not exist" });
    }

    //2-Create the reset token(to be sent via email)
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3-Send the token via email, (create a url with a message to be sent):
    //http://127.0.0.1/api/auth/resetPassword/ahsbdsljdhytfdnbdndjjshshsbsbsb\flsljrjhtiwwqnaz => email that will be sent to the user

    //3.1 Create this url:{
    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetPassword/${resetToken}`;
    const msg = `Forgot your password? Reset it by visiting the following link: ${url}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Your password reset token is valid for 10 min",
        message: msg,
      });

      res.status(200).json({
        status: "success",
        message: "The reset link was delivered to your email succesfully",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        message:
          "An error has occurred while sending the email, please try again in a moment",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

//password reset
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await user.findOne({
      passwordResetToken: hashedToken,
      passwordResetToken: { $gt: Date.now() }, //$gt greater than or equal
    });

    if (!user) {
      return res.status(400).json({
        message: "The token is invalid, or expired. Please request a new one",
      });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({ message: "Password length is too short" });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Password & Password Confirm are not the same" });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    passwordChangedAt: Date.now();

    await user.save();

    return res
      .status(200)
      .json({ message: "Password has changed successfully" });
  } catch (err) {
    console.log(err);
  }
};
