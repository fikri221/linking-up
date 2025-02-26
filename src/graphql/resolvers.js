import ChatRoom from "../models/chat_room.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import signToken from "../utils/sign_token.js";
import bcrypt from "bcryptjs";
import cookie from "cookie";

const SALT_ROUNDS = await bcrypt.genSalt(10);

const resolvers = {
  Query: {
    contacts: async (_, __, { user }) => {
      if (!user) {
        console.warn("Unauthorized access attempt to contacts");
        throw new Error("Not authenticated");
      }
      try {
        console.log(`Fetching contacts for user: ${user.username}`);
        return await User.find({ username: { $ne: user.username } });
      } catch (err) {
        console.error("Error retrieving contacts:", err);
        throw new Error("Failed to retrieve contacts");
      }
    },
    
    messages: async (_, { chatRoomId }, { user }) => {
      if (!user) {
        console.warn("Unauthorized access attempt to messages");
        throw new Error("Not authenticated");
      }
      try {
        console.log(`Fetching messages for chatRoomId: ${chatRoomId}`);
        return await Message.find({ chatRoomId }).populate("sender");
      } catch (err) {
        console.error("Error retrieving messages:", err);
        throw new Error("Failed to retrieve messages");
      }
    },
    
    chatRooms: async (_, __, { user }) => {
      if (!user) {
        console.warn("Unauthorized access attempt to chatRooms");
        throw new Error("Not authenticated");
      }
      try {
        console.log(`Fetching chat rooms for user: ${user.id}`);
        return await ChatRoom.find({ participants: user.id }).populate("participants");
      } catch (err) {
        console.error("Error retrieving chat rooms:", err);
        throw new Error("Failed to retrieve chat rooms");
      }
    },
  },

  Mutation: {
    signUp: async (_, { username, email, password }) => {
      try {
        console.log(`Signing up user: ${email}`);
        let user = await User.findOne({ email });
        if (user) {
          throw new Error("User already exists");
        }
        const newUser = new User({
          username,
          email,
          password: await bcrypt.hash(password, SALT_ROUNDS),
        });
        await newUser.save();
        return { ...newUser._doc, token: signToken({ id: newUser._id, username, email }) };
      } catch (err) {
        console.error("Error signing up:", err);
        throw new Error("Signup failed");
      }
    },
    
    login: async (_, { email, password }, { res }) => {
      try {
        console.log(`User login attempt: ${email}`);
        let user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
          throw new Error("Invalid email or password");
        }
        const token = signToken({ id: user._id, username: user.username, email: user.email });
        return { username: user.username, token };
      } catch (err) {
        console.error("Error logging in:", err);
        throw new Error("Login failed");
      }
    },
    
    addMessage: async (_, { senderId, recipientId, content }, { user }) => {
      if (!user) {
        console.warn("Unauthorized access attempt to addMessage");
        throw new Error("Not authenticated");
      }
      try {
        console.log(`Adding message from ${senderId} to ${recipientId}`);
        let chatRoom = await ChatRoom.findOne({ participants: { $all: [senderId, recipientId] } });
        if (!chatRoom) {
          chatRoom = new ChatRoom({ participants: [senderId, recipientId], createdAt: new Date() });
          await chatRoom.save();
        }
        const message = new Message({
          chatRoomId: chatRoom._id,
          sender: senderId,
          content,
          isRead: false,
          createdAt: new Date(),
        });
        await message.save();
        return await Message.findById(message._id).populate("sender");
      } catch (err) {
        console.error("Error adding message:", err);
        throw new Error("Failed to add message");
      }
    },
  },
};

export default resolvers;
