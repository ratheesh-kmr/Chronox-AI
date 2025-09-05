// utils/calculateDuration.js

/**
 * Calculate working duration between two dates
 * considering work hours (09:30–17:30) and excluding Sundays.
 *
 * @param {Date | string} start - Start datetime
 * @param {Date | string} end - End datetime
 * @param {boolean} isTaskAssignmentTime - If true, starts from now if assigning today
 * @returns {string} - Duration in hours, e.g. "7.5h"
 */
const calculateWorkingDuration = (start, end, isTaskAssignmentTime = false) => {
  if (!start || !end) return "0h";

  const WORK_START_HOUR = 9;
  const WORK_START_MIN = 30;
  const WORK_END_HOUR = 17;
  const WORK_END_MIN = 30;

  const isSameLocalDate = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const toLocalDateOnly = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  let startDate, endDate;

  if (isTaskAssignmentTime) {
    const today = new Date();
    const startDateOnly = toLocalDateOnly(start);

    if (isSameLocalDate(startDateOnly, today)) {
      startDate = new Date(); // start from now if assigning today
    } else {
      startDate = new Date(start);
      startDate.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
    }

    endDate = new Date(end);
    const endDateOnly = toLocalDateOnly(end);

    if (isSameLocalDate(endDateOnly, today)) {
      const endOfWorkDay = new Date();
      endOfWorkDay.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
      endDate = endOfWorkDay;
    } else {
      endDate.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
    }
  } else {
    startDate = new Date(start);
    endDate = new Date(end);
  }

  if (isNaN(startDate) || isNaN(endDate)) return "0h";
  if (endDate < startDate) return "0h";

  let totalMinutes = 0;

  const getWorkDayBounds = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(WORK_START_HOUR, WORK_START_MIN, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(WORK_END_HOUR, WORK_END_MIN, 0, 0);
    return { startOfDay, endOfDay };
  };

  let current = toLocalDateOnly(startDate);
  const endDateOnly = toLocalDateOnly(endDate);

  while (current <= endDateOnly) {
    // 🔹 Skip Sundays
    if (current.getDay() !== 0) {
      const { startOfDay, endOfDay } = getWorkDayBounds(current);

      if (isSameLocalDate(current, startDate)) {
        let actualStart;
        if (isTaskAssignmentTime && isSameLocalDate(current, new Date())) {
          const now = new Date();
          actualStart = now > startOfDay ? now : startOfDay;
        } else {
          actualStart = startDate > startOfDay ? startDate : startOfDay;
        }

        const actualEnd = isSameLocalDate(current, endDateOnly)
          ? (endDate < endOfDay ? endDate : endOfDay)
          : endOfDay;

        if (actualEnd > actualStart) {
          totalMinutes += (actualEnd - actualStart) / 60000;
        }
      } else if (isSameLocalDate(current, endDateOnly)) {
        const actualEnd = endDate < endOfDay ? endDate : endOfDay;
        if (actualEnd > startOfDay) {
          totalMinutes += (actualEnd - startOfDay) / 60000;
        }
      } else {
        totalMinutes += (endOfDay - startOfDay) / 60000;
      }
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
  }

  return `${(totalMinutes / 60).toFixed(1)}h`;
};

module.exports = calculateWorkingDuration;
