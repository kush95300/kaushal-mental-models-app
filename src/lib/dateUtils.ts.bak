export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

export const formatFriendlyDate = (dateString: string | Date): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime()))
    return typeof dateString === "string" ? dateString : "";

  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

export const shouldAutoPromote = (dateString: string | Date): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  // Normalize comparison by stripping time
  const checkDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // >= Today AND <= Tomorrow
  return (
    checkDate.getTime() >= today.getTime() &&
    checkDate.getTime() <= tomorrow.getTime()
  );
};

export const isOverdue = (dateString: string | Date): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;

  const checkDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return checkDate.getTime() < today.getTime();
};

export const getCalendarGrid = (currentDate: Date) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  const days = [];

  // Padding for previous month
  for (let i = 0; i < startingDayOfWeek; i++) {
    const paddingDate = new Date(year, month, -startingDayOfWeek + 1 + i);
    days.push({ date: paddingDate, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({ date: date, isCurrentMonth: true });
  }

  // Padding for next month to complete the last week
  const remainingSlots = 42 - days.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingSlots; i++) {
    const paddingDate = new Date(year, month + 1, i);
    days.push({ date: paddingDate, isCurrentMonth: false });
  }

  return days;
};

export const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
