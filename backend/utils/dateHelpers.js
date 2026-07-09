// Small helpers so every controller formats dates the same way

function todayStr() {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
}

function startOfWeekStr() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

function startOfMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

module.exports = { todayStr, startOfWeekStr, startOfMonthStr };
