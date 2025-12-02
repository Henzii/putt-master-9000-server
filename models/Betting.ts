import mongoose from "mongoose";
import type { Pool } from "../graphql/games/types";

export const pool = new mongoose.Schema<Pool>({
  status: String,
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
  },
  legs: [{
    type: String,
    selections: [{
      id: Number,
      type: String,
      value: String
    }]
  }]
});
