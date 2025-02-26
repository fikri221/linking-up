import mongoose from "mongoose";

const choiceSchema = new mongoose.Schema(
  {
    chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    question: String,
    choice: String,
    effect: String,
    createdAt: { type: Date, default: Date.now() },
  },
  { collection: "choices" }
);

const Choice = mongoose.model("Choice", choiceSchema);

export default Choice;
