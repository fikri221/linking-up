import mongoose from "mongoose";

const gameStateSchema = new mongoose.Schema(
  {
    chatRoomId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom" },
    players: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
    },
    aiState: {
      mood: {
        type: String,
        required: true,
      },
      difficulty: {
        type: String,
        required: true,
      },
    },
    turn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference the User model
      required: true,
    },
    createdAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: Date.now() },
  },
  { collection: "game_states" }
);

const GameState = mongoose.model("GameState", gameStateSchema);

export default GameState;
