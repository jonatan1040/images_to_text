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

images test list 

* 7 digits number is counted also letters (e.g: 13-40H-85, 12-40H-86)

none
P - Public transportation vehicles
M - Military and law enforcement vehicles
C - 7 digits numbers+ends with 85/86/87/88/89/00 vehicles
G - GAS operated vehicles


1		12-16-46		none		        not prohibited
2		12-34			none		        not prohibited
3		12-18-28		none		        not prohibited
4		27-46-25		P			prohibited
5		99-00-25		P			prohibited
6		86-38-26		P			prohibited
7		37-H6-74		M			prohibited
8		A5-38-33		M			prohibited
9		27-775G			M			prohibited
10		G5-48			M			prohibited	
11		45-38-185		C			prohibited
12		82-52-586		C			prohibited
13		67-20-287		C			prohibited
14		57-28-888		C			prohibited
15		62-73-089		C			prohibited
16		68-27-000		C			prohibited
17		56-572-85		C			prohibited
18		57-836-86		C			prohibited
19		67-017-87		C			prohibited
20		57-836-88		C			prohibited
21		57-073-89		C			prohibited
22		73-023-00		C			prohibited
23		13-700-12		G			prohibited
24		12-700-121		G			prohibited
25		13-40H-85		C			prohibited
26		11-40H-87		C			prohibited
27		12-40H-86		M/G/C		        prohibited
28		10-40H-88		M/G/C		        prohibited
29		10-30H-89		M/G/C		        prohibited
30		14-45H-00		M/G/C		        prohibited
31		121-20H-26		M/P/G		        prohibited
32		121-10H-25		M/P			prohibited
33		13-20H-26		M/P/G		        prohibited
34		14-20H-25		M/P/G		        prohibited
35		13-13-85		none		        not prohibited
36		13-12-86		none		        not prohibited
37		13-11-87		none		        not prohibited
38		13-10-88		none		        not prohibited
39		12-10-89		none		        not prohibited
40		13-73-00		none		        not prohibited
41		12H-13-25		M/P/G		        prohibited
42		12H-12-26		M/P/G		        prohibited
43		22-111-25		P/G			prohibited
44		21-111-26		P/G			prohibited
45		DOCX			file not valid


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
