const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const crypto = require("crypto");
const createUserSession = require("../utils/createUserSession");

const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  await user.save();

  const tokenUser = await createUserSession({ user, req, res });

  res.status(StatusCodes.CREATED).json({
    msg: "Account created and logged in successfully",
    user: tokenUser,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("User not found.");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const tokenUser = await createUserSession({ user, req, res });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(0),
    sameSite: "none",
  };

  res.cookie("accessToken", "logout", cookieOptions);
  res.cookie("refreshToken", "logout", cookieOptions);

  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

const resetPassword = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ email });

  if (user) {
    user.password = password;
    await user.save();
  }

  res.send("reset password");
};

const verifyAuth = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

module.exports = {
  register,
  login,
  logout,
  resetPassword,
  verifyAuth,
};
