import jwt from "jsonwebtoken";

const signToken = (data) => {
  return jwt.sign(data, process.env.SECRET_KEY, { expiresIn: "1m" });
};

export default signToken;
