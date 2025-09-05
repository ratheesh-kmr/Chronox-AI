const mongoose = require("mongoose");

const labelSchema = mongoose.Schema(
    {
        labelName: {
            type: String,
            required: [true, "Please add a label name"],
            trim: true,
        },
        color: {
            type: String,
            required: [true, "Please add a color"],
            trim: true,
        },
        description:{
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Label = mongoose.model("Label", labelSchema);
module.exports = Label;

