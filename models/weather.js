var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var WeatherSchema = new Schema({
    user_id: { type: String },
    forcast: { type: String },
    icon: { type: String },
    currentTemp: { type: String },
    minTemp: { type: String },
    max: { type: String }
});

module.exports = mongoose.model("Weather", WeatherSchema);