import { Schema } from "mongoose";
import { checkSchema } from 'express-validator';
export const userValidateSchema = {
  googleId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  image: {
    type: String,
  },
  newimage: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["connected", "disconnected"],
    default: "disconnected",
  },
  contacts: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  blockedContacts: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  friendRequests: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  conversations: {
    type: [{ type: Schema.Types.ObjectId, ref: "Conversation" }],
  },
};

export const messageValidateSchema = {
  sender: {
    in: ['body'],
    isMongoId: true,
    errorMessage: 'Sender must be a valid ObjectId'
  },
  conversation: {
    in: ['body'],
    isMongoId: true,
    errorMessage: 'Conversation must be a valid ObjectId'
  },
  text: {
    in: ['body'],
    isString: true,
    errorMessage: 'Text must be a string'
  },
};


export const contactValidateSchema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contacts: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  blockedContacts: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
};
export const friendRequestsValidateSchema = {
  requester: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
};
export const conversationValidateSchema = {
  members: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    required: true,
  },
  messages: {
    type: [{ type: Schema.Types.ObjectId, ref: "Message" }],
    default: [],
  },
  type: {
    type: String,
    enum: ["direct", "group"],
    default: "direct",
  },
  name: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
};
