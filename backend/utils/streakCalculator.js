// Works out the current daily study streak from a list of DailyStat documents
// A day "counts" if totalStudySeconds > 0 for that date

function calculateStreak(dailyStats) {
  const studiedDates = new Set(
    dailyStats.filter((d) => d.totalStudySeconds > 0).map((d) => d.date),
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const dateStr = cursor.toISOString().split("T")[0];
    if (studiedDates.has(dateStr)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      // Allow "today" to be empty without breaking the streak, since the day isn't over yet
      const isToday = dateStr === new Date().toISOString().split("T")[0];
      if (isToday) {
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

module.exports = { calculateStreak };
