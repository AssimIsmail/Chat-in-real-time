import mongoose from 'mongoose';

const conversationmessaeSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  messageType: { 
    type: String, 
    enum: ['text', 'photo', 'audio', 'video'], 
    required: true 
  },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Convergroup = mongoose.model('Convergroup', conversationmessaeSchema);

export default Convergroup;
