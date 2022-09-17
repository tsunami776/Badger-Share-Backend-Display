const authResolver = require("./auth");
const eventsResolver = require("./events");
const bookingResolver = require("./booking");
const placesResolver = require("./places");
const postsResolver = require("./posts");

const rootResolver = {
  ...authResolver,
  ...eventsResolver,
  ...bookingResolver,
  ...placesResolver,
  ...postsResolver,
};

module.exports = rootResolver;
