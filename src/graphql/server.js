import { ApolloServer } from "@apollo/server";
import typeDefs from "./typeDefs.js";
import resolvers from "./resolvers.js";

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default server;
