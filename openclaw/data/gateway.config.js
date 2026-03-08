export default {
  channels: {
    telegram: {
      enabled: true,
      dmPolicy: "pairing",
      groupPolicy: "open",
      groups: {
        "*": {
          requireMention: true,
          groupPolicy: "open",
        },
      },
    },
  },
};
