import ChatRoom from "../models/chat_room.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

// Salt
const SALT_ROUNDS = 12;

// JWT Secret Key
const SECRET_KEY = "just-a-secret";

// Define resolvers
const resolvers = {
  Query: {
    users: async () => {
      try {
        const users = await User.find();
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
    createUser: async (_, { username, email, password }) => {
      const newUser = new User({
        username,
        email,
        password: await bcrypt.hash(password, SALT_ROUNDS),
      });
      await newUser.save();
      return newUser;
    },

    // Auth handler
    login: async (_, { email, password }) => {
      if (!email) {
        throw Error("Email cannot be empty");
      }
      if (!password) {
        throw Error("Password cannot be empty");
      }
      let user = await User.findOne({ email: email });
      if (!user) {
        throw Error("Email not found");
      }
      if (!(await bcrypt.compare(password, user.password))) {
        throw Error("Incorrect password");
      }

      return user;
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
      try {
        let chatRoom = await ChatRoom.findOne({
          participants: { $all: [senderId, recipientId] },
        });

        if (!chatRoom) {
          chatRoom = new ChatRoom({
            participants: [senderId, recipientId],
            createdAt: new Date(),
          });
          await chatRoom.save();
        }

        console.log(chatRoom._id);

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
        return populatedMessage;
      } catch (err) {
        throw new Error("Error creating message");
      }
    },
  },
};

export default resolvers;
