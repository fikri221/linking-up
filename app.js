import { startStandaloneServer } from "@apollo/server/standalone";
import server from "./src/graphql/server.js";
import connectDB from "./src/config/db.js";
import authMiddleware from "./src/utils/auth_middleware.js";

connectDB();

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    // Mendapatkan nama operasi GraphQL
    const operationName = req.body.operationName;

    // Daftar operasi yang tidak memerlukan autentikasi
    const excludedOperations = ["Login", "SignUp"];

    if (excludedOperations.includes(operationName)) {
      // console.log("Operation excluded from auth:", operationName);
      return; // Tidak ada user dalam konteks
    }

    // Jalankan middleware autentikasi
    const user = authMiddleware(req.headers);
    return { user };
  },
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
