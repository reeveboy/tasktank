export const getToday = (now: any) => {
  let month = now.getMonth() + 1;
  let day = now.getDate();
  if (month < 10) month = "0" + month;
  if (day < 10) day = "0" + day;
  return new Date(now.getFullYear() + "-" + month + "-" + day);
};

export const getTodayString = (now: any) => {
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();

  return `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")}`;
};
