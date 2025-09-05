const asyncHandler = require("express-async-handler");
const Label = require("../models/labelModel");

const getLabel = asyncHandler(async (req, res) => {
    const label = await Label.find({});
    res.status(200).json({ label });
});

const createLabel = asyncHandler(async (req, res) => {
    const { labelName, color, description } = req.body;
    const label = await Label.create({ labelName, color, description });
    res.status(200).json({ message: "Label Created", label });
});

const updateLabel = asyncHandler(async (req, res) => {
    const label = await Label.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    });
    if (!label) {
        res.status(404);
        throw new Error("Label not found");
    }
    res.status(200).json({ message: "Label Updated", label });
});

const deleteLabel = asyncHandler(async (req, res) => {
    const label = await Label.findByIdAndDelete(req.params.id);
    if (!label) {
        res.status(404);
        throw new Error("Label not found");
    }
    res.status(200).json({ message: "Label Deleted", label });
});

const deleteAllLabel = asyncHandler(async (req, res) => {
    const label = await Label.deleteMany({});
    if (!label) {
        res.status(404);
        throw new Error("Label not found");
    }
    res.status(200).json({ message: "All Label Deleted", label });
});

module.exports = { getLabel, createLabel, updateLabel, deleteLabel, deleteAllLabel };