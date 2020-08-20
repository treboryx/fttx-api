const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const CenterSchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  name: { type: String, required: [true, "Center name is required"] },
  position: {
    lat: {
      type: Number,
      required: [true, "Latitude is required"],
    },
    lng: {
      type: Number,
      required: [true, "Longtitude is required"],
    },
  },
  address: Object,
  img_url: String,
  verified: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  username: { type: String, default: "Unknown" },
  createdAt: Date,
});

// Populate the address object with information provided by geocoder using google's API.
CenterSchema.pre("save", async function (next) {
  const res = await geocoder.reverse({
    lat: this.position.lat,
    lon: this.position.lng,
  });

  this.address = {
    full: res[0].formattedAddress,
    streeNumber: res[0].streetNumber,
    streetName: res[0].streetName,
    city: res[0].city,
    country: res[0].country,
    countryCode: res[0].countryCode,
    zipcode: res[0].zipcode,
    administrationLevels: res[0].administrationLevels,
  };

  this.createdAt = Date.now();
  next();
});

module.exports = mongoose.model("Center", CenterSchema);