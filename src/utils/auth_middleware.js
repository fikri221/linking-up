import verifyToken from "./verify_token.js";

const authMiddleware = (header) => {
  const authHeader = header.authorization;

  if (authHeader) {
    // Check if the token exists in the header
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        // Verify the token
        const user = verifyToken(token);
        return user;
      } catch (err) {
        throw new Error("Invalid/Expired token");
      }
    }
    throw new Error("Authentication token must be 'Bearer [token]'");
  }
  throw new Error("Authorization header must be provided");
};

export default authMiddleware;
