function generateRecurrenceDates(recurrence, taskEndDate) {
  const dates = [];

  if (
    recurrence?.type !== "None" &&
    recurrence?.startDate &&
    recurrence?.repeatCount > 0
  ) {
    let nextDate = new Date(taskEndDate || recurrence.startDate); // Start AFTER task end

    for (let i = 0; i < recurrence.repeatCount; i++) {
      // move to next occurrence based on type
      switch (recurrence.type) {
        case "Daily":
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case "Weekly":
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case "Monthly":
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case "Yearly":
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      // ✅ Skip Sundays
      while (nextDate.getDay() === 0) {
        nextDate.setDate(nextDate.getDate() + 1);
      }

      dates.push(new Date(nextDate));
    }
  }

  return dates;
}

module.exports = generateRecurrenceDates;
