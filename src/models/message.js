import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
    content: String,
    isRead: Boolean,
    createdAt: { type: Date, default: Date.now() },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the User model
      required: true,
    },
  },
  { collection: "messages" }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
