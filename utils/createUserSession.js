const crypto = require("crypto");
const Token = require("../models/Token");
const { attachCookiesToResponse, createTokenUser } = require("../utils");
const CustomError = require("../errors");

const createUserSession = async ({ user, req, res }) => {
  const tokenUser = createTokenUser(user);

  let refreshToken = "";
  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    if (!existingToken.isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return tokenUser;
  }

  // new token
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  await Token.create({ refreshToken, ip, userAgent, user: user._id });

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  return tokenUser;
};

module.exports = createUserSession;
