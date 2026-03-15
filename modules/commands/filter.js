module.exports = {
  config: {
    name: "filter",
    version: "2.0.0",
    hasPermission: 1,
    prefix: true,
    premium: false,
    commandCategory: "group",
    credits: "KOJA-PROJECT",
    description: "Filter Facebook User",
    usages: "",
    cooldowns: 300,
  },

  run: async function ({ api, event }) {
    const { userInfo, adminIDs } = await api.getThreadInfo(event.threadID);
    let successCount = 0,
      failCount = 0,
      undefinedGenderUsers = [];

    // Collect users with undefined gender
    for (const user of userInfo) {
      if (user.gender === undefined) undefinedGenderUsers.push(user.id);
    }

    // Check if current user is admin
    const isAdmin = adminIDs.map((adm) => adm.id).includes(api.getCurrentUserID());

    // Stylish message wrapper function
    function stylishMessage(title, content) {
      return (
        `╭──────•◈•──────╮\n` +
        `|● 𝗙𝗶𝗹𝘁𝗲𝗿 𝗦𝘁𝗮𝘁𝘂𝘀\n` +
        `╰──────•◈•──────╯\n\n` +
        `╭─» ${title} «─╮\n` +
        `${content}\n` +
        `╰─────────────╯`
      );
    }

    if (undefinedGenderUsers.length === 0) {
      // No users to filter
      return api.sendMessage(
        stylishMessage(
          "No Users Found",
          "In your group, there are no users with undefined gender."
        ),
        event.threadID
      );
    } else {
      // There are users with undefined gender
      await api.sendMessage(
        stylishMessage(
          "Filter Starting",
          `Found ${undefinedGenderUsers.length} Facebook user(s) with undefined gender.\nPlease wait...`
        ),
        event.threadID,
        async () => {
          if (isAdmin) {
            await api.sendMessage(
              stylishMessage(
                "Action",
                "Starting filtering...\nMade by KOJA-PROJECT"
              ),
              event.threadID
            );

            for (const uid of undefinedGenderUsers) {
              try {
                await new Promise((res) => setTimeout(res, 1000));
                await api.removeUserFromGroup(parseInt(uid), event.threadID);
                successCount++;
              } catch {
                failCount++;
              }
            }

            await api.sendMessage(
              stylishMessage(
                "Filter Complete",
                `✅ Filtered successfully ${successCount} people.\n` +
                  (failCount
                    ? `❌ Failed to filter ${failCount} people.`
                    : "")
              ),
              event.threadID
            );
          } else {
            // Not admin, cannot filter
            await api.sendMessage(
              stylishMessage(
                "Permission Denied",
                "But bot is not admin, so it can't filter."
              ),
              event.threadID
            );
          }
        }
      );
    }
  },
};
