const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");
const path = require("path");
const db = require("./db");
const ejs = require("ejs");
const assert = require("assert").strict;

const app = express();
app.use("/css", express.static(path.join(__dirname, "css")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(express.static("uploads"));
app.use(cors());
app.use(morgan("dev"));
const port = 5000;

let cars;
(async function () {
  cars = await db.connectDb();
})();

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  try {
    if (!req.files) {
      res.send("No file uploaded");
    } else {
      //Use the name of the input field (filename) to retrieve the uploaded file
      let sampleFile = req.files.filename;

      //Use the mv() method to place the file in upload directory ("uploads")
      sampleFile.mv("./uploads/" + sampleFile.name);
      let filePath = path.join(__dirname, `/uploads/${sampleFile.name}`);

      let data = new FormData();
      data.append("language", "eng");
      data.append("isOverlayRequired", "false");
      data.append("file", fs.createReadStream(`${filePath}`));
      data.append("iscreatesearchablepdf", "true");
      data.append("issearchablepdfhidetextlayer", "true");
      data.append("scale", "true");
      data.append("isTable", "true");

      let config = {
        method: "post",
        url: "https://api.ocr.space/parse/image",
        headers: {
          apikey: "2d4577781488957",
          ...data.getHeaders(),
        },
        data: data,
      };

      let myCars = [];
      function cloneObject(carObject) {
        let clone = {};
        for (let key in carObject) {
          clone[key] = carObject[key];
        }
        myCars.push(clone);
      }

      let licensePlate = "";
      let car = {
        licenseNumber: licensePlate,
        type: "",
        prohibited: false,
      };

      axios(config)
        .then(async function parking(response) {
          let parking = false;
          //   check the file is valid format(image)
          assert.strictEqual(
            response.data.OCRExitCode,
            1 || 2,
            "file is NOT valid format"
          );
          if (
            /1|2/g.test(response.data.OCRExitCode) &&
            response.data.IsErroredOnProcessing === false
          ) {
            assert.strictEqual(
              response.data.ParsedResults[0].FileParseExitCode,
              1,
              "FileParseExitCode (parsing engine) did not Successed parsing"
            );
            //file is valid format
            if (response.data.ParsedResults[0].FileParseExitCode === 1) {
              licensePlate = response.data.ParsedResults[0].ParsedText.replace(
                /[\s`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
                ""
              );
              car.licenseNumber = licensePlate;
              console.log("licensePlate", licensePlate);
              console.log("licensePlate.length", licensePlate.length);
              // text was parsed but its empty string
              assert.notStrictEqual(licensePlate, "", "text is empty string");
              if (licensePlate === "") {
                //get response but text is empty string
                console.log("text is empty string");
              }
              //text is NOT empty string
              else {
                //licensePlate is only alphabet letters
                if (/^[a-zA-Z]+$/.test(licensePlate)) {
                  //get only text WITHOUT numbers
                  console.log("licensePlate has ONLY letters", licensePlate);
                }
                // licensePlate is clean from special chars, string can be only numbers or letters+numbers
                else {
                  console.log(
                    "license is only numbers or (numbers and letters)",
                    licensePlate
                  );

                  let sum = 0;
                  let licensePlateNumberOnly = licensePlate.replace(
                    /[\s`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/a-zA-Z]/gi,
                    ""
                  );
                  for (i = 0; i < licensePlateNumberOnly.length; i++) {
                    sum += parseInt(licensePlateNumberOnly[i]);
                  }
                  assert.notStrictEqual(sum, 0, "sum is zero");
                  //check if text is only numbers
                  if (/^[0-9]+$/.test(licensePlate)) {
                    if (licensePlate.length == 7 || licensePlate.length == 8) {
                      if (sum % 7 == 0) {
                        console.log("dbg");
                        parking = true;
                        car.prohibited = true;
                        car.type = "GAS";
                        await db.saveToDb(car, cars);
                        cloneObject(car);
                      } else {
                        console.log("err, not divided by 7");
                        car.prohibited = false;
                      }
                      if (licensePlate.length == 7) {
                        if (
                          licensePlate.endsWith("85") ||
                          licensePlate.endsWith("86") ||
                          licensePlate.endsWith("87") ||
                          licensePlate.endsWith("88") ||
                          licensePlate.endsWith("89") ||
                          licensePlate.endsWith("00")
                        ) {
                          console.log("dbc");
                          parking = true;
                          car.prohibited = true;
                          car.type = "C";
                          cloneObject(car);
                          await db.saveToDb(car, cars);
                        }
                      } else {
                        console.log("err, not 7 in length");
                        car.prohibited = false;
                      }
                    } else {
                      console.log("err, not 7 or 8 in length");
                      car.prohibited = false;
                    }
                    if (
                      licensePlate.endsWith("25") ||
                      licensePlate.endsWith("26")
                    ) {
                      console.log("dbp");
                      parking = true;
                      car.prohibited = true;
                      car.type = "Public transportation";
                      cloneObject(car);
                      await db.saveToDb(car, cars);
                    } else {
                      console.log("err, does not end with 25/26");
                      car.prohibited = false;
                    }
                  } else {
                    console.log("dbm");
                    parking = true;
                    car.prohibited = true;
                    car.type = "Military and law enforcement";
                    cloneObject(car);
                    await db.saveToDb(car, cars);
                    if (
                      licensePlate.endsWith("25") ||
                      licensePlate.endsWith("26")
                    ) {
                      console.log("dbp");
                      parking = true;
                      car.prohibited = true;
                      car.type = "Public transportation";
                      cloneObject(car);
                      await db.saveToDb(car, cars);
                    } else {
                      console.log("err, does not end with 25/26");
                      car.prohibited = false;
                    }
                    if (licensePlate.length == 7 || licensePlate.length == 8) {
                      if (sum % 7 == 0) {
                        console.log("dbg");
                        parking = true;
                        car.prohibited = true;
                        car.type = "GAS";
                        cloneObject(car);
                        await db.saveToDb(car, cars);
                      } else {
                        console.log("err, not divided by 7");
                        car.prohibited = false;
                      }
                      if (licensePlate.length == 7) {
                        if (
                          licensePlate.endsWith("85") ||
                          licensePlate.endsWith("86") ||
                          licensePlate.endsWith("87") ||
                          licensePlate.endsWith("88") ||
                          licensePlate.endsWith("89") ||
                          licensePlate.endsWith("00")
                        ) {
                          console.log("dbc");
                          parking = true;
                          car.prohibited = true;
                          car.type = "C";
                          cloneObject(car);
                          await db.saveToDb(car, cars);
                        }
                      } else {
                        console.log("err, not 7 in length");
                        car.prohibited = false;
                      }
                    } else {
                      console.log("err, not 7 or 8 in length");
                      car.prohibited = false;
                    }
                  }
                  if (parking === false) {
                    car.type =
                      "Car type is not Public transportation/Military and law enforcement/C/GAS";
                    cloneObject(car);
                    await db.saveToDb(car, cars);
                  }
                }
              }
            }
            //file is valid format but text can not be parsed
            else {
              console.log(
                "myInsideErrorMessage",
                response.data.ParsedResults[0].ErrorMessage
              );
              console.log(
                "myInsideErrorDetails",
                response.data.ParsedResults[0].ErrorDetails
              );
            }
          } else {
            //file is not valid format
            console.log("myErrorMessage", response.data.ErrorMessage);
            console.log("myErrorDetails", response.data.ErrorDetails);
            console.log("response.data.OCRExitCode", response.data.OCRExitCode);
          }
          car.type = "";
          car.prohibited = false;
          console.log("this is all my cars:\n", myCars);
          res.send(myCars);
          myCars = [];
        })
        .catch(function (error) {
          console.error("error", error);
        });
    }
  } catch (err) {
    res.status(500).send(err);
    console.error("err", err);
  }
});

app.get("/query", (req, res) => {
  res.render("query");
});

app.post("/results", (req, res) => {
  if (req.body.carType == undefined) {
    req.body.carType = "";
  }
  if (req.body.prohibited == undefined) {
    req.body.prohibited = "";
  }

  let query = {
    number: req.body.number,
    carType: req.body.carType,
    prohibited: req.body.prohibited,
    created_at: req.body.createdAt,
    updated_at: req.body.updated_at,
  };

  for (property in query) {
    if (query[property] === "") {
      delete query[property];
    } else if (property === "created_at" || property === "updated_at") {
      if (query[property][0] === "" && query[property][1] === "") {
        delete query[property];
      } else if (query[property][0] !== "" && query[property][1] === "") {
        query[property] = { $gte: query[property][0] + "+00:00" };
      } else if (query[property][0] === "" && query[property][1] !== "") {
        query[property] = { $lte: query[property][1] + "+00:00" };
      } else {
        query[property] = {
          $gte: query[property][0] + "+00:00",
          $lte: query[property][1] + "+00:00",
        };
      }
    }
  }

  (async function () {
    let results = await db.findFromDb(cars, query);
    res.render("results", { results });
  })();
});

app.listen(port, () => {
  morgan(`server running on port ${port}`);
});
