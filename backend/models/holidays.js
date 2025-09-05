const mongoose = require("mongoose");

const holidaySchema = mongoose.Schema(
  {
    holidayName: {
      type: String,
    },
    holidayDate: {
      type: Date,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("holiday", holidaySchema);
