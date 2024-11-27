import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    }, // Array of ids
    createdAt: { type: Date, default: Date.now() },
  },
  { collection: "chat_rooms" }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

export default ChatRoom;
