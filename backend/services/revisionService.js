const WeeklyRevision = require("../models/WeeklyRevision");
const Topic = require("../models/Topic");
const { startOfWeekStr } = require("../utils/dateHelpers");
const { awardXP } = require("./xpService");

// Returns this week's revision list, creating it on first request of the week.
// The list is built from topics touched (updated) since Monday of this week —
// this is what makes it reset automatically every week without a cron job.
async function getOrCreateCurrentWeekRevision(userId) {
  const weekStart = startOfWeekStr();
  let revision = await WeeklyRevision.findOne({ user: userId, weekStart });

  if (!revision) {
    const weekStartDate = new Date(weekStart);
    const touchedTopics = await Topic.find({
      user: userId,
      updatedAt: { $gte: weekStartDate },
      status: { $in: ["In Progress", "Completed"] },
    });

    const topics = touchedTopics.map((t) => ({
      topicName: t.name,
      reviewed: false,
    }));
    revision = await WeeklyRevision.create({ user: userId, weekStart, topics });
  }

  return revision;
}

// Toggles one topic's reviewed state. If that completes the whole list,
// awards XP once and reports it back so the frontend can celebrate.
async function toggleRevisionTopic(userId, revisionId, topicIndex) {
  const revision = await WeeklyRevision.findOne({
    _id: revisionId,
    user: userId,
  });
  if (!revision || !revision.topics[topicIndex]) return null;

  const wasAllReviewed =
    revision.topics.length > 0 && revision.topics.every((t) => t.reviewed);

  revision.topics[topicIndex].reviewed = !revision.topics[topicIndex].reviewed;
  await revision.save();

  const isAllReviewedNow =
    revision.topics.length > 0 && revision.topics.every((t) => t.reviewed);
  const justCompleted = isAllReviewedNow && !wasAllReviewed;

  let xpResult = null;
  if (justCompleted) {
    xpResult = await awardXP(
      userId,
      "REVISION_COMPLETED",
      "Completed weekly revision",
    );
  }

  return {
    revision,
    allReviewed: isAllReviewedNow,
    justCompleted,
    xp: xpResult,
  };
}

module.exports = { getOrCreateCurrentWeekRevision, toggleRevisionTopic };
