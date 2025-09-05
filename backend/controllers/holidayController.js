const Holidays = require("../models/holidays");
const asyncHandler = require("express-async-handler");

const getHolidays = asyncHandler(async (req, res) => {
  const holidays = await Holidays.find({});
  res.status(200).json({ message: "Holidays Retrieved", holidays });
});

const createHolidays = asyncHandler(async (req, res) => {
  const { holidayName, holidayDate, description } = req.body;

  const holiday = await Holidays.create({
    holidayName,
    holidayDate,
    description,
  });
  res.status(201).json({ message: "Holiday Created", holiday });
});

const updateHolidays = asyncHandler(async (req, res) => {
  const holiday = await Holidays.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!holiday) {
    res.status(404);
    throw new Error("Holiday not found");
  }
  res.status(200).json({ message: "Holiday Updated", holiday });
});

const deleteHolidays = asyncHandler(async (req, res) => {
  const holiday = await Holidays.findByIdAndDelete(req.params.id);
  if (!holiday) {
    res.status(404);
    throw new Error("Holiday not found");
  }
  res.status(200).json({ message: "Holiday Deleted", holiday });
});

const deleteAllHolidays = asyncHandler(async (req, res) => {
  await Holidays.deleteMany({});
  res.status(200).json({ message: "All Holidays Deleted" });
});

module.exports = {
  getHolidays,
  createHolidays,
  updateHolidays,
  deleteHolidays,
  deleteAllHolidays,
};
