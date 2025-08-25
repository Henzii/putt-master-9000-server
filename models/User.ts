import mongoose from "mongoose";
import validator from "mongoose-unique-validator";

const measuredThrow = new mongoose.Schema(
  {
    startingPoint: {
      coordinates: [Number],
      acc: Number,
    },
    landingPoint: {
      coordinates: [Number],
      acc: Number,
    },
  },
  { timestamps: true }
);

const skeema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      unique: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    groupName: String,
    groupJoinedDate: {
      type: Date,
      default: null,
    },
    pushToken: String,
    accountType: {
      type: String,
      default: "pleb",
    },
    email: String,
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockFriendRequests: {
      type: Boolean,
      default: false,
    },
    blockStatsSharing: {
      type: Boolean,
      default: false,
    },
    restoreCode: String,
    achievements: [
      {
        _id: false,
        id: String,
        layout_id: String,
        game: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Game",
        },
      },
    ],
    measuredThrows: [measuredThrow],
  },
  { timestamps: true }
);

skeema.plugin(validator);
skeema.set("toJSON", {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString();
    delete returnedObj._id;
    delete returnedObj._v;
  },
});

export default mongoose.model("User", skeema);
