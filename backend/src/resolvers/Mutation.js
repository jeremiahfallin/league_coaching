const { hasPermission } = require("../utils");

const Mutations = {
  async createMatch(parent, args, ctx, info) {
    const match = await ctx.db.mutation.createMatch(
      {
        data: {
          team: {
            connect: {
              id: ctx.request.teamID
            }
          },
          player: {
            connect: {
              id: ctx.request.playerID
            }
          },
          ...args
        }
      },
      info
    );
    return match;
  },

  async createPlayer(parent, args, ctx, info) {
    const player = await ctx.db.mutation.createPlayer(
      {
        data: {
          team: {
            connect: {
              id: ctx.request.teamID
            }
          },
          ...args
        }
      },
      info
    );

    return player;
  },

  async createTeam(parent, args, ctx, info) {
    const team = await ctx.db.mutation.createTeam(
      {
        data: {
          player: {
            connect: {
              id: ctx.request.playerID
            }
          },
          ...args
        }
      },
      info
    );

    return team;
  }
};

module.exports = Mutations;
