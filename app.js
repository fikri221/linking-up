import { startStandaloneServer } from "@apollo/server/standalone";
import server from "./src/graphql/server.js";
import connectDB from "./src/config/db.js"

connectDB();

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
