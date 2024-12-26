import ChatRoom from "../models/chat_room.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import signToken from "../utils/sign_token.js";
import bcrypt from "bcryptjs";

// Define resolvers
const resolvers = {
  Query: {
    contacts: async (_, __, { user }) => {
      try {
        const users = await User.find({ username: { $ne: user.username } });
        return users;
      } catch (err) {
        throw new Error("Error retrieving users");
      }
    },
    messages: async () => {
      try {
        // Fetch messages from MongoDB
        const messages = await Message.find().populate("sender");
        return messages;
      } catch (err) {
        throw new Error("Error retrieving messages");
      }
    },
  },

  Mutation: {
    // User handler
    signUp: async (_, { username, email, password }) => {
      // Check if user already exists
      let user = await User.findOne({ email: email });
      if (user) {
        throw new Error("User already exists");
      }

      // Salt
      const SALT_ROUNDS = await bcrypt.genSalt(10);

      // Save new user
      const newUser = new User({
        username,
        email,
        password: await bcrypt.hash(password, SALT_ROUNDS),
      });
      await newUser.save();
      const token = signToken({
        username: newUser.username,
        email: newUser.email,
      });

      return {
        ...newUser._doc,
        token,
      };
    },

    // Auth handler
    login: async (_, { email, password }) => {
      // Check if user is exist
      let user = await User.findOne({ email: email });
      if (!user) {
        throw new Error("Email not found");
      }
      if (!(await bcrypt.compare(password, user.password))) {
        throw new Error("Invalid password");
      }

      return {
        username: user.username,
        token: signToken({ username: user.username, email: user.email }),
      };
    },
    changePassword: async (_, { email, credentials }) => {
      const { old_password, new_password } = credentials;

      let user = await User.findOne({ email: email });
      if (!user) {
        throw Error("Email not found");
      }

      // Compare the old password with the hashed password in the database
      const isMatch = await bcrypt.compare(old_password, user.password); // `user.password` should be the hashed password
      if (!isMatch) {
        throw Error("Old password is not valid");
      }

      // Continue with password change logic
      const hashedNewPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

      user.password = hashedNewPassword;
      await user.save();
      return user;
    },

    // Message handler
    addMessage: async (_, { senderId, recipientId, content }) => {
      // Find the chat room where the users are inside
      let chatRoom = await ChatRoom.findOne({
        participants: { $all: [senderId, recipientId] },
      });

      // If the chat room is not found then create a new chat room
      if (!chatRoom) {
        chatRoom = new ChatRoom({
          participants: [senderId, recipientId],
          createdAt: new Date(),
        });
        await chatRoom.save();
      }

      // Insert first message into chat room
      const message = new Message({
        chatRoomId: chatRoom._id,
        sender: senderId,
        content,
        isRead: false,
        createdAt: new Date(),
      });
      await message.save();

      // Populate the sender field with user data before returning
      const populatedMessage = await Message.findById(message._id).populate(
        "sender"
      );

      if (!populatedMessage.sender) {
        throw new Error("Sender not found");
      }

      return populatedMessage;
    },
  },
};

export default resolvers;
