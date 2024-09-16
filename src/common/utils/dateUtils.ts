import { add, isFuture, isPast, set, startOfToday } from "date-fns";

export const getNextDailyOccurence = (date: Date) => {
  let newDate: Date;
  if (isFuture(date)) {
    newDate = add(date, { days: 1 });
  } else {
    // maybe it's still today
    newDate = set(startOfToday(), {
      hours: date.getHours(),
      minutes: date.getMinutes(),
    });
    if (isPast(newDate)) {
      // if in past, then it's tomorow
      newDate = add(newDate, { days: 1 });
    }
  }
  return newDate;
};

export const getNextMonthlyOccurence = (date: Date) => {
  let newDate: Date;
  if (isFuture(date)) {
    newDate = add(date, { months: 1 });
  } else {
    // maybe it's this month
    newDate = set(startOfToday(), {
      date: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
    });
    if (isPast(newDate)) {
      // if in past, then it's next month
      newDate = add(newDate, { months: 1 });
    }
  }
  return newDate;
};
