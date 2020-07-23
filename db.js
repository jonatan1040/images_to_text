const mongoose = require("mongoose");
const timeZone = require("mongoose-timezone");

async function connectDb() {
  // Connection URL
  const url = "mongodb://localhost:27017";

  // Database Name
  const dbName = "parking";

  // collection Name
  const cars_collection = "cars";

  await mongoose.connect(
    `${url}/${dbName}`,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    },
    function (err) {
      if (err) {
        console.log("DB connection error:\n ", err);
      } else {
        console.log("DB connection successful");
      }
    }
  );

  //create a user mongoose schema
  const carsSchema = new mongoose.Schema(
    {
      _id: { type: mongoose.Types.ObjectId, auto: true },
      number: String,
      carType: String,
      prohibited: Boolean,
    },
    {
      timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
        type: Date,
      },
    }
  );

  carsSchema.plugin(timeZone);

  //create a user mongoose modal
  const cars = mongoose.model(cars_collection, carsSchema);

  return cars;
}

async function saveToDb(car, cars) {
  console.log("MYcars", cars);
  //construct documents with user mongoose modal
  const newCar = await new cars({
    number: car.licenseNumber,
    carType: car.type,
    prohibited: car.prohibited,
  });

  //save the user document into mongodb
  await newCar.save(function (err, myNewCar) {
    if (err) {
      console.log(err);
    } else {
      console.log(`my new car is ${myNewCar}`);
    }
  });
}

module.exports = { connectDb, saveToDb };
