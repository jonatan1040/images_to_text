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
const assert = require("assertjs");
// const logger = require("morgan");
const ocrSpaceApi = require("ocr-space-api");

const app = express();
// const imageFilePath = "plat.png";

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
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let sampleFile = req.files.filename;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
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
      data.append("detectOrientation", "true");

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
        .then(function (response) {
          //   console.log(response.data.ParsedResults[0].ParsedText); //text is empty string
          console.log("data", response.data);

          //check the file is valid format(image)
          if (
            assert.isEmpty(response.data.ParsedResults[0].ErrorMessage, "") &&
            assert.isEmpty(response.data.ParsedResults[0].ErrorDetails, "")
          ) {
            let parsedText = response.data.ParsedResults[0].ParsedText;
            if (parsedText.isEmpty()) {
              //get response but text is empty string
              console.log("text is empty string");
            }
            // else {
            //   //text is NOT empty string
            //   let licensePlate =
            //     response.data.ParsedResults[0].TextOverlay.Lines[0].Words[0]
            //       .WordText;
            //   if (licensePlate.isAlpha(["en-US"])) {
            //     //get only text WITHOUT numbers
            //     console.log("licensePlate has ONLY letters");
            //   } else {
            //     console.log("got here");
            //   }
            // }
          } else {
            //file is not valid format
            console.log("ErrorMessage", response.data.ErrorMessage);
            console.log("ErrorDetails", response.data.ErrorDetails);
          }

          // let parsedText = response.data.ParsedResults[0].ParsedText
          // if (parsedText.isEmpty()){
          //     console.log("text is empty string");
          // }
          // else{
          //     let licensePlate = response.data.ParsedResults[0].TextOverlay.Lines[0].Words[0].WordText
          //     if(licensePlate.isAlpha(['en-US'])){

          //     }
          //     else{
          //         console.log("getting only text without numbers");
          //     }
          // }
          // console.log("ParsedText",response.data.ParsedResults[0].TextOverlay.Lines[0].Words[0]
          // .WordText);

          //when getting a text from api. case1: getting only text without number.
          //case2: getting 28-381-70. case3:sending word doc (not image)
          //cas4:getting different number then i sent. case5:clean text from special chars
          //case6:zhal is identify like 48089•! 12-345 -n

          //   let licensePlate = response.data.ParsedResults[0].ParsedText.replace(
          //     /[\s`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/a-zA-Z]/gi,
          //     ""
          //   );
          //   if (licensePlate.endsWith("25") || licensePlate.endsWith("26")) {
          //     res.send({ message: "public transportaion 25,26" });
          //   }
          //   if (/^[a-z]+$/i.test(licensePlate)) {
          //     res.send({ message: "has english alphabet letter" });
          //   }
          //   const endingList = ["85", "86", "87", "88", "89", "00"];
          //   if (
          //     licensePlate.length == 7 &&
          //     endingList.map((number) => licensePlate.endsWith(number))
          //   ) {
          //     res.send({
          //       message: "7 digit number && endswith 85,86,87,88,89,00",
          //     });
          //   }
        })
        .catch(function (error) {
          console.log("error", error);
        });
    }
  } catch (err) {
    res.status(500).send(err);
    console.log("err", err);
  }
});

app.listen(port, () => {
  morgan(`server running on port ${port}`);
});
