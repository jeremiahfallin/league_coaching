const { forwardTo } = require("prisma-binding");
const { hasPermission } = require("../utils");

const Query = {
  members: forwardTo("db"),
  member: forwardTo("db"),
  membersConnection: forwardTo("db"),
  me(parent, args, ctx, info) {
    //check if there is a current user ID.
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },

  async members(parent, args, ctx, info) {
    //1. check if logged in.
    if (!ctx.request.userId) {
      throw new Error("You must be logged in!");
    }
    //2. check if the user has permission to query all members.
    hasPermission(ctx.request.user, ["ADMIN"]);
    //3. if yes, query all members.
    return ctx.db.query.members({}, info);
  }
};

module.exports = Query;
