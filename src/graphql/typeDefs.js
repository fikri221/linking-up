// Define your GraphQL schema
// dapat digunakan juga sebagai response data
const typeDefs = `#graphql
  type User {
    id: ID!
    username: String!
    email: String!
    token: String!
  }

  type Message {
    id: ID!
    chatRoomId: ChatRoom!
    content: String!
    createdAt: String!
    sender: User
    isRead: Boolean!
  }

  type ChatRoom {
    id: ID!
    participants: [User!]!
    messages: [Message!]!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
  }

  type Query {
    contacts: [User!]!
    messages(chatRoomId: ID!): [Message]
  }

  input UserChangePasswordInput {
    old_password: String!
    new_password: String!
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): User!

    login(email: String!, password: String!): AuthPayload!
    changePassword(email: String!, credentials: UserChangePasswordInput): User!

    addMessage(senderId: ID!, recipientId: ID!, content: String!): Message!
    editMessage(messageId: ID!, content: String!): Message!
    deleteMessage(messageId: ID!): Boolean!
    markMessageAsRead(messageId: ID): Message!
  }
`;

export default typeDefs;
