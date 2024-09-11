import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    friends: [
      {
        friend: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        newName: { type: String, default: null } 
      }
    ]
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
