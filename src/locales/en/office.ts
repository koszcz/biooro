// Text on signs in the office, and on the loading screen.
export const officeSigns = {
  launchTeam: ["LAUNCH", "TEAM"],
  weLoveFeedback: ["WE LOVE", "FEEDBACK"],
  inWriting: ["NOTICE", "IT IS ALL", "IN WRITING"],
  smartRange: ["SMART", "RANGE"],
  itListens: ["It listens", "so you don’t have to"],
  complaints: ["Customer Complaints"],
  safety: ["Product Safety"],
  showroom: ["Showroom"],
} as const satisfies Record<string, readonly string[]>;

/** The Biooro billboard by the car park, by tier. */
export const billboardText = {
  mundane: ["BIOORO", "Listening to your body,", "one flush at a time."],
  odd: ["BIOORO", "Listening to your body.", "Every flush. Every time."],
  wrong: ["BIOORO", "WE ARE", "LISTENING"],
} as const satisfies Record<string, readonly string[]>;

export const loadingText = {
  label: "Loading the office…",
} as const;
