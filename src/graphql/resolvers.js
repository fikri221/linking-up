import ChatRoom from "../models/chat_room.js";
import Message from "../models/message.js";
import User from "../models/user.js";
import signToken from "../utils/sign_token.js";
import bcrypt from "bcryptjs";

// Salt
const SALT_ROUNDS = await bcrypt.genSalt(10);

// Define resolvers
const resolvers = {
  Query: {
    contacts: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        const users = await User.find({ username: { $ne: user.username } });
        return users;
      } catch (err) {
        console.log("Error retrieving contacts: ", err);
        throw new Error("Error retrieving contacts");
      }
    },
    messages: async (_, { chatRoomId }, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        // Fetch messages from MongoDB
        const messages = await Message.find({ chatRoomId }).populate("sender");
        return messages;
      } catch (err) {
        console.log("Error retrieving messages: ", err);
        throw new Error("Error retrieving messages");
      }
    },
    chatRooms: async (_, __, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        const chatRooms = await ChatRoom.find({
          participants: user.id,
        }).populate("participants");
        // .populate("messages");
        return chatRooms;
      } catch (err) {
        console.log("Error retrieving chat rooms: ", err);
        throw new Error("Error retrieving chat rooms");
      }
    },
  },

  Mutation: {
    // User handler
    signUp: async (_, { username, email, password }) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ email: email });
        if (user) {
          throw new Error("User already exists");
        }

        // Save new user
        const newUser = new User({
          username,
          email,
          password: await bcrypt.hash(password, SALT_ROUNDS),
        });
        await newUser.save();
        const token = signToken({
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        });

        return {
          ...newUser._doc,
          token,
        };
      } catch (err) {
        console.log("Error signing up: ", err);
        throw new Error("Error signing up");
      }
    },

    // Auth handler
    login: async (_, { email, password }) => {
      try {
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
          token: signToken({
            id: user._id,
            username: user.username,
            email: user.email,
          }),
        };
      } catch (err) {
        console.log("Error logging in: ", err);
        throw new Error("Error logging in");
      }
    },
    changePassword: async (_, { credentials }, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        const { old_password, new_password } = credentials;

        let userCreds = await User.findOne({ email: user.email });
        if (!userCreds) {
          throw Error("Email not found");
        }

        // Compare the old password with the hashed password in the database
        const isMatch = await bcrypt.compare(old_password, userCreds.password); // `user.password` should be the hashed password
        if (!isMatch) {
          throw Error("Old password is not valid");
        }

        // Continue with password change logic
        const hashedNewPassword = await bcrypt.hash(new_password, SALT_ROUNDS);

        userCreds.password = hashedNewPassword;
        await userCreds.save();
        return userCreds;
      } catch (err) {
        console.log("Error changing password: ", err);
        throw new Error("Error changing password");
      }
    },

    // Message handler
    addMessage: async (_, { senderId, recipientId, content }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
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
      } catch (err) {
        console.log("Error adding message: ", err);
        throw new Error("Error adding message");
      }
    },
    editMessage: async (_, { messageId, content }, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        const message = await Message.findByIdAndUpdate(
          { _id: messageId },
          { content }
        );
        if (!message) {
          throw new Error("Message not found");
        }
        return message;
      } catch (err) {
        console.log("Error editing message: ", err);
        throw new Error("Error editing message");
      }
    },
    deleteMessage: async (_, { messageId }, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        const message = await Message.deleteOne({ _id: messageId });
        // Check if the message is deleted
        if (message.deletedCount === 0) {
          throw new Error("Message not found or already deleted");
        }
        return true;
      } catch (err) {
        console.log("Error deleting message: ", err);
        throw new Error("Error deleting message");
      }
    },
    markMessageAsRead: async (_, { messageId }, { user }) => {
      if (!user) {
        throw new Error("Not authenticated");
      }
      try {
        // Find the message
        const message = await Message.findById(messageId);

        // Check if the message exists
        if (!message) {
          throw new Error("Message not found");
        }

        // Check if the message is already read
        if (message.isRead) {
          throw new Error("Message is already read");
        }

        // Check if the message is sent to the user
        if (message.sender.toString() !== user.id.toString()) {
          throw new Error("Message is not for you");
        }

        // Mark the message as read
        message.isRead = true;
        await message.save();

        return message;
      } catch (err) {
        console.log("Error marking message as read: ", err);
        throw new Error("Error marking message as read");
      }
    },
  },
};

export default resolvers;
