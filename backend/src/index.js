require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");
const cors = require("cors");
const getCustomMatch = require("./getCustomMatch");

const server = createServer();

var whitelist = ["http://localhost:7777"];

var corsOptions = {
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};

server.express.use(cors(corsOptions));

// decode the JWT so we can get the user Id on each request
server.express.get("/addmatch", async (req, res) => {
  try {
    data = await getCustomMatch(req.query.match);
  } catch (err) {
    res.send({ message: "No match with that ID." });
  }
  res.send({ data });
});

server.start(
  {
    cors: {
      // credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
