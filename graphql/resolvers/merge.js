const Event = require("../../models/event");
const User = require("../../models/user");
const Place = require("../../models/place");
const Post = require("../../models/post");
const { dateToString } = require("../../helpers/date");
const DataLoader = require("dataloader");

const eventLoader = new DataLoader((eventIds) => {
  return events(eventIds);
});

const placeLoader = new DataLoader((placeIds) => {
  return places(placeIds);
});

const userLoader = new DataLoader((userIds) => {
  return User.find({ _id: { $in: userIds } });
});

const posts = async (postIds) => {
  try {
    const posts = await Post.find({ _id: { $in: postIds } });
    return posts.map((post) => {
      return transformPost(post);
    });
  } catch (err) {
    throw err;
  }
};

const places = async (placeIds) => {
  try {
    const places = await Place.find({ _id: { $in: placeIds } });
    return places.map((place) => {
      return transformPlace(place);
    });
  } catch (err) {
    throw err;
  }
};

const singlePlace = async (placeId) => {
  try {
    const place = await placeLoader.load(placeId.toString());
    //const place = await Place.findById(placeId);
    // return transformPlace(place);
    return place;
  } catch (err) {
    throw err;
  }
};

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    events.sort((a, b) => {
      return (
        eventIds.indexOf(a._id.toString()) - eventIds.indexOf(b._id.toString())
      );
    });
    return events.map((event) => {
      return transformEvent(event);
    });
  } catch (err) {
    throw err;
  }
};

const singleEvent = async (eventId) => {
  try {
    // const event = await Event.findById(eventId);
    // return transformEvent(event);
    const event = await eventLoader.load(eventId.toString());
    return event;
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  try {
    const user = await userLoader.load(userId.toString());
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: () => eventLoader.loadMany(user._doc.createdEvents),
      createdPlaces: () => eventLoader.loadMany(user._doc.createdPlaces),
      createdPosts: () => eventLoader.loadMany(user._doc.createdPosts),
      // createdPlaces: places.bind(this, user._doc.createdPlaces),
      // createdEvents: events.bind(this, user._doc.createdEvents),
      // createdPosts: posts.bind(this, user._doc.createdPosts),
    };
  } catch (err) {
    throw err;
  }
};

const transformUser = (user) => {
  return {
    ...user._doc,
    _id: user.id,
    //todo: potential fix
    createdPlaces: places(user.createdPlaces),
    createdEvents: events(user.createdEvents),
    createdPosts: posts(user.createdPosts),
  };
};

const transformPlace = (place) => {
  return {
    ...place._doc,
    _id: place.id,
    creator: user.bind(this, place.creator),
  };
};

const transformPost = (post) => {
  return {
    ...post._doc,
    _id: post.id,
    creator: user.bind(this, post.creator),
  };
};

const transformEvent = (event) => {
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event.creator),
  };
};

const transformBooking = (booking) => {
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

exports.places = places;
exports.transformPost = transformPost;
exports.transformUser = transformUser;
exports.transformPlace = transformPlace;
exports.transformEvent = transformEvent;
exports.transformBooking = transformBooking;

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;
