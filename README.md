# Licensed parking lot entrants

Turn images into text and decide accordingly who can enter a parking lot

# How to install

1. install mongodb
2. git clone https://github.com/jonatan1040/images_to_text.git
3. cd images_to_text folder
4. npm i
5. node app.js
6. http://localhost:5000/

\*if you have nodemon package installed globaly you can run:
nodemon app.js

# Testing images

You can find image examples for negative and positive expected results in /uploads folder

# Quering

e.g.:
all the gas operatedvehicles which were declined in the last week

query mongoDB from CLI, connect to mongoDB and run:

{
carType: "Military and law enforcement",
prohibited: true,
created_at: {
$gte: "2020-07-23T12:35:35.554+00:00",
        $lte: "2020-07-23T12:45:35.554+00:00",
},
}

query mongoDB from compass GUI, open compass and filter:

{
carType:"Military and law enforcement",
prohibited: true,
created_at:{$gte:ISODate("2020-07-23T12:35:35.554+00:00"),
                $lte:ISODate("2020-07-23T12:45:35.554+00:00")
}
}
