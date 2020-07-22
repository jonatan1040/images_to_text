const mongoose = require("mongoose");
async function connectDb() {
  // const encrypt = require("mongoose-encryption");

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
        console.log("connection error: ", err);
      } else {
        console.log("connection successful");
      }
    }
  );

  //create a user mongoose schema
  const carsSchema = new mongoose.Schema(
    {
      _id: Number,
      //   _id: mongoose.Schema.ObjectId,
      number: String,
      carType: String,
      prohibited: Boolean,
    },
    {
      timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
        // type: Date,
        // default: new Date(),
      },
    }
  );

  //create a user mongoose modal
  const cars = mongoose.model(cars_collection, carsSchema);

  return cars;
}

async function saveToDb(car, cars, id) {
  //construct documents with user mongoose modal
  const newCar = await new cars({
    _id: Number,
    number: car.licenseNumber,
    carType: car.type,
    prohibited: car.prohibited,
  });

  newCar._id = id;
  console.log("newCar._id", newCar._id);

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
