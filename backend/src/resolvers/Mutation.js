const { hasPermission } = require("../utils");

const Mutations = {
  async createMember(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error("You must be logged in to do that!");
    }
    const member = await ctx.db.mutation.createMember(
      {
        data: {
          ...args
        }
      },
      info
    );

    return member;
  },

  updateMember(parent, args, ctx, info) {
    // first, take a copy of updates.
    const updates = { ...args };
    // remove the ID from updates.
    delete updates.id;
    // run the update method.
    return ctx.db.mutation.updateMember(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },

  async deleteMember(parent, args, ctx, info) {
    const where = { id: args.id };
    //1. find member.
    const member = await ctx.db.query.member({ where }, `{ id }`);
    //2. check for permissions.
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ["ADMIN", "MEMBERDELETE"].includes(permission)
    );

    if (!hasPermissions) {
      throw new Error("You don't have permission to do that!");
    }
    //3. delete them.
    return ctx.db.mutation.deleteMember({ where }, info);
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    //hash their password.
    const password = await bcrypt.hash(args.password, 10);
    //create the user in the database.
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER", "ADMIN"] }
        }
      },
      info
    );
    //create the JWT for user.
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    //set JWT as a cookie on the response.
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 //1 year cookie
    });
    //return the user to the browser.
    return user;
  },

  async signin(parent, { email, password }, ctx, info) {
    // 1. check if there is a user with that email
    const user = await ctx.db.query.user({ where: { email } });
    if (!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if their password is correct
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Invalid Password!");
    }
    // 3. generate the JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the token
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
    // 5. Return the user
    return user;
  },

  signout(parent, args, ctx, info) {
    ctx.response.clearCookie("token");
    return { message: "Goodbye!" };
  }
};

module.exports = Mutations;
