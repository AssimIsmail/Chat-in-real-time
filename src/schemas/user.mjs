import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String, default: null },
   // newName: { type: String, default: null },
    status: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "disconnected",
    },
    // contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // blockedContacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "FriendRequest" }],
    // conversations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
