const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  members: forwardTo("db"),
  member: forwardTo("db"),
  membersConnection: forwardTo("db")
};

module.exports = Query;
