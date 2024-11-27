// Define your GraphQL schema
const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    password: String!
  }

  type Message {
    id: ID!
    chatRoomId: ChatRoom!
    content: String!
    createdAt: String!
    sender: User!
    isRead: Boolean!
  }

  type ChatRoom {
    id: ID!
    participants: [User!]!
    messages: [Message!]!
    createdAt: String!
  }

  type Query {
    users: [User!]!
    messages(chatRoomId: ID!): [Message]
  }

  input UserChangePasswordInput {
    old_password: String!
    new_password: String!
  }

  type Mutation {
    createUser(username: String!, email: String!, password: String!): User!

    login(email: String!, password: String!): User!
    changePassword(email: String!, credentials: UserChangePasswordInput): User!

    addMessage(senderId: ID!, recipientId: ID!, content: String!): Message!
    editMessage(messageId: ID!, content: String!): Message!
    deleteMessage(messageId: ID!): Boolean!
    markMessageAsRead(messageId: ID): Message!
  }
`;

export default typeDefs;
