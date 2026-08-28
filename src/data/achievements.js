/**
 * @typedef {Object} AchievementProgress
 * @property {number} currentValue
 * @property {number} targetValue
 * @property {boolean} isUnlocked
 * @property {Date|null} unlockedAt
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} iconReference
 * @property {string} categoryType
 * @property {string} categoryLabel
 * @property {string} associatedColor
 * @property {AchievementProgress} progress
 */

export const achievementsData = [
  // 📚 Course Progress
  {
    id: "ach-course-1",
    name: "First Step",
    description: "Enrolled in your first course.",
    iconReference: "school",
    categoryType: "course",
    categoryLabel: "Course Progress",
    associatedColor: "var(--ach-color-course)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-course-2",
    name: "Getting Somewhere",
    description: "Reached 50% or more progress in any course.",
    iconReference: "trending_up",
    categoryType: "course",
    categoryLabel: "Course Progress",
    associatedColor: "var(--ach-color-course)",
    progress: { currentValue: 0, targetValue: 50, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-course-3",
    name: "Finished What I Started",
    description: "Completed a full course.",
    iconReference: "workspace_premium",
    categoryType: "course",
    categoryLabel: "Course Progress",
    associatedColor: "var(--ach-color-course)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-course-4",
    name: "On a Roll",
    description: "Completed 3 full courses.",
    iconReference: "military_tech",
    categoryType: "course",
    categoryLabel: "Course Progress",
    associatedColor: "var(--ach-color-course)",
    progress: { currentValue: 0, targetValue: 3, isUnlocked: false, unlockedAt: null }
  },

  // 🧪 Quiz & Performance
  {
    id: "ach-quiz-1",
    name: "Tried My Best",
    description: "Submitted your first quiz.",
    iconReference: "quiz",
    categoryType: "quiz",
    categoryLabel: "Quiz & Performance",
    associatedColor: "var(--ach-color-quiz)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-quiz-2",
    name: "Nailed It",
    description: "Scored 100% on any quiz.",
    iconReference: "emoji_events",
    categoryType: "quiz",
    categoryLabel: "Quiz & Performance",
    associatedColor: "var(--ach-color-quiz)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-quiz-3",
    name: "High Achiever",
    description: "Scored 90% or more on 5 different quizzes.",
    iconReference: "verified",
    categoryType: "quiz",
    categoryLabel: "Quiz & Performance",
    associatedColor: "var(--ach-color-quiz)",
    progress: { currentValue: 0, targetValue: 5, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-quiz-4",
    name: "Cover to Cover",
    description: "Completed all lessons in any single course.",
    iconReference: "auto_stories",
    categoryType: "quiz",
    categoryLabel: "Quiz & Performance",
    associatedColor: "var(--ach-color-quiz)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },

  // 💬 Social & Community
  {
    id: "ach-social-1",
    name: "Speak Up",
    description: "Posted your first question or comment.",
    iconReference: "chat_bubble_outline",
    categoryType: "social",
    categoryLabel: "Social & Community",
    associatedColor: "var(--ach-color-social)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-social-2",
    name: "Always Has Something to Say",
    description: "Posted 10 comments or replies.",
    iconReference: "forum",
    categoryType: "social",
    categoryLabel: "Social & Community",
    associatedColor: "var(--ach-color-social)",
    progress: { currentValue: 0, targetValue: 10, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-social-3",
    name: "Making an Impact",
    description: "Had 10 community posts approved.",
    iconReference: "thumb_up",
    categoryType: "social",
    categoryLabel: "Social & Community",
    associatedColor: "var(--ach-color-social)",
    progress: { currentValue: 0, targetValue: 10, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-social-4",
    name: "Known Around Here",
    description: "Had 50 community posts approved.",
    iconReference: "stars",
    categoryType: "social",
    categoryLabel: "Social & Community",
    associatedColor: "var(--ach-color-social)",
    progress: { currentValue: 0, targetValue: 50, isUnlocked: false, unlockedAt: null }
  },

  // ⚡ XP & Levels
  {
    id: "ach-xp-1",
    name: "Getting Started",
    description: "Earned your first 100 XP.",
    iconReference: "star_outline",
    categoryType: "xp",
    categoryLabel: "XP & Levels",
    associatedColor: "var(--ach-color-xp)",
    progress: { currentValue: 0, targetValue: 100, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-xp-2",
    name: "Making Moves",
    description: "Earned a total of 500 XP.",
    iconReference: "star",
    categoryType: "xp",
    categoryLabel: "XP & Levels",
    associatedColor: "var(--ach-color-xp)",
    progress: { currentValue: 0, targetValue: 500, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-xp-3",
    name: "Moving Up",
    description: "Hit user level 5.",
    iconReference: "arrow_upward",
    categoryType: "xp",
    categoryLabel: "XP & Levels",
    associatedColor: "var(--ach-color-xp)",
    progress: { currentValue: 0, targetValue: 5, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-xp-4",
    name: "At the Top",
    description: "Reached user level 10.",
    iconReference: "military_tech",
    categoryType: "xp",
    categoryLabel: "XP & Levels",
    associatedColor: "var(--ach-color-xp)",
    progress: { currentValue: 0, targetValue: 10, isUnlocked: false, unlockedAt: null }
  },

  // 🔥 Streaks
  {
    id: "ach-streak-1",
    name: "Warming Up",
    description: "Maintain a learning streak for 3 consecutive days.",
    iconReference: "local_fire_department",
    categoryType: "streak",
    categoryLabel: "Streaks",
    associatedColor: "var(--ach-color-streak)",
    progress: { currentValue: 0, targetValue: 3, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-streak-2",
    name: "In the Zone",
    description: "Maintain a learning streak for 7 consecutive days.",
    iconReference: "whatshot",
    categoryType: "streak",
    categoryLabel: "Streaks",
    associatedColor: "var(--ach-color-streak)",
    progress: { currentValue: 0, targetValue: 7, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-streak-3",
    name: "Creature of Habit",
    description: "Maintain a learning streak for 30 consecutive days.",
    iconReference: "flame_member",
    categoryType: "streak",
    categoryLabel: "Streaks",
    associatedColor: "var(--ach-color-streak)",
    progress: { currentValue: 0, targetValue: 30, isUnlocked: false, unlockedAt: null }
  },

  // 🎭 Roles & Account Age
  {
    id: "ach-role-1",
    name: "Day One",
    description: "Account at least 30 days old.",
    iconReference: "calendar_today",
    categoryType: "role",
    categoryLabel: "Roles & Account",
    associatedColor: "var(--ach-color-role)",
    progress: { currentValue: 0, targetValue: 30, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-role-2",
    name: "Been Here Forever",
    description: "Account at least 1 year old.",
    iconReference: "history",
    categoryType: "role",
    categoryLabel: "Roles & Account",
    associatedColor: "var(--ach-color-role)",
    progress: { currentValue: 0, targetValue: 365, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-role-3",
    name: "Teacher's Got the Floor",
    description: "Became a course instructor.",
    iconReference: "assignment_ind",
    categoryType: "role",
    categoryLabel: "Roles & Account",
    associatedColor: "var(--ach-color-role)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },

  // 🏠 Engagement & Misc
  {
    id: "ach-eng-1",
    name: "Party Starter",
    description: "Created your first group chat.",
    iconReference: "group_add",
    categoryType: "engagement",
    categoryLabel: "Engagement & Misc",
    associatedColor: "var(--ach-color-engagement)",
    progress: { currentValue: 0, targetValue: 1, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-eng-2",
    name: "Always Hosting",
    description: "Created 5 group chats.",
    iconReference: "groups",
    categoryType: "engagement",
    categoryLabel: "Engagement & Misc",
    associatedColor: "var(--ach-color-engagement)",
    progress: { currentValue: 0, targetValue: 5, isUnlocked: false, unlockedAt: null }
  },
  {
    id: "ach-eng-3",
    name: "Bit of Everything",
    description: "Enrolled in courses from 3 different domains.",
    iconReference: "explore",
    categoryType: "engagement",
    categoryLabel: "Engagement & Misc",
    associatedColor: "var(--ach-color-engagement)",
    progress: { currentValue: 0, targetValue: 3, isUnlocked: false, unlockedAt: null }
  }
];