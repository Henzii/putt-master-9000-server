import mongoose from "mongoose";

export const pool = new mongoose.Schema({
  status: String,
  type: String,
  bets: [{
    totalStake: Number,
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User'
    },
    selections: [[Number]],
    lines: [[{
      leg: Number,
      selections: [Number],
      stake: Number
    }]]
  }],
  result: {
    winningSelection: [Number]
  }
});
