const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const fs = require("fs");
const request = require("request");
const FormData = require("form-data");
const axios = require("axios");
const path = require("path");
const db = require("./db");
const assert = require("assert");
const ocrSpaceApi = require("ocr-space-api");

const app = express();
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
//   let cars = db.connectDb();

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
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

      axios(config)
        .then(async function (response) {
          //   check the file is valid format(image)
          console.log("response.data.OCRExitCode", response.data.OCRExitCode);
          console.log(
            "typeof response.data.OCRExitCode",
            typeof response.data.OCRExitCode
          );

          assert.equal(response.data.OCRExitCode, 99, "JOJOJOO");
          if (
            /1|2/g.test(response.data.OCRExitCode) &&
            response.data.IsErroredOnProcessing === false
          ) {
            console.log("here");
            //file is valid format
            if (response.data.ParsedResults[0].FileParseExitCode === 1) {
              let licensePlate = response.data.ParsedResults[0].ParsedText.replace(
                /[\s`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
                ""
              );
              let parking = false;
              let id = 1;
              let car = {
                licenseNumber: licensePlate,
                type: "",
                prohibited: false,
              };
              console.log("licensePlate", licensePlate);
              console.log("licensePlate.length", licensePlate.length);
              // text was parsed but its empty string
              if (licensePlate === "") {
                //get response but text is empty string
                console.log("text is empty string");
              }
              //text is NOT empty string
              else {
                console.log("here2");
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
                  console.log("SUM", sum);

                  //check if text is only numbers
                  if (/^[0-9]+$/.test(licensePlate)) {
                    if (licensePlate.length == 7 || licensePlate.length == 8) {
                      if (sum % 7 == 0) {
                        console.log("dbg");
                        parking = true;
                        car.prohibited = true;
                        car.type = "GAS";
                        await db.saveToDb(car, cars, id);
                        id++;
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
                          await db.saveToDb(car, cars, id);
                          id++;
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
                      await db.saveToDb(car, cars, id);
                      id++;
                    } else {
                      console.log("err, does not end with 25/26");
                      car.prohibited = false;
                    }
                  } else {
                    console.log("dbm");
                    parking = true;
                    car.prohibited = true;
                    car.type = "Military and law enforcement";
                    console.log("car", car);
                    await db.saveToDb(car, cars, id);
                    id++;
                    if (
                      licensePlate.endsWith("25") ||
                      licensePlate.endsWith("26")
                    ) {
                      console.log("dbp");
                      parking = true;
                      car.prohibited = true;
                      car.type = "Public transportation";
                      await db.saveToDb(car, cars, id);
                      id++;
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
                        await db.saveToDb(car, cars, id);
                        id++;
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
                          await db.saveToDb(car, cars, id);
                          id++;
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
                  console.log("this is my parking", parking);
                  if (parking === false) {
                    car.type =
                      "Car type is not Public transportation/Military and law enforcement/C/GAS";
                    await db.saveToDb(car, cars, id);
                    id++;
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
          }
        })
        .catch(function (error) {
          console.log("error", error);
        });
    }
    console.log("finish");
  } catch (err) {
    res.status(500).send(err);
    console.log("err", err);
  }
});

app.listen(port, () => {
  morgan(`server running on port ${port}`);
});
