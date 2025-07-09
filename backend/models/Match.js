import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  lostItemName: String,
  foundItemName: String,
  status: String,
  // add references or more fields as needed
});

export default mongoose.model('Match', MatchSchema);