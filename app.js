// DO NOT CHANGE!
//init app with express, util, body-parser, csv2json
const express = require('express');
const app = express();
const sys = require('util');
const path = require('path');
const bodyParser = require('body-parser');
const csvConverter = require("csvtojson").Converter;

//register body-parser to handle json from res / req
app.use(bodyParser.json());

//register public dir to serve static files (html, css, js)
app.use(express.static(path.join(__dirname, "public")));

// END DO NOT CHANGE!

/**************************************************************************
 ****************************** csv2json *********************************
 **************************************************************************/
const csvFilePath = './world_data.csv';
const csv = require('csvtojson');
let jsonArray;
let properties = [];
let highestId = 26;

// Async / await usage
async function createArray() {
	jsonArray = await csv().fromFile(csvFilePath);

	for (let key in jsonArray[0]) {
		properties.push(key);
	}
}

createArray();

/**************************************************************************
 ********************** handle HTTP METHODS ***********************
 **************************************************************************/
//---------------GET--------------//
//get all data json
app.get('/items', (req, res) => {
	res.json(jsonArray);
});
//get data of item by id
app.get('/items/:id', (req, res) => {
	if (+req.params.id <= 0 || +req.params.id > jsonArray.length) {
		res.send('No such id ' + +req.params.id + ' in database.');
	}
	for (let i = 0; i < jsonArray.length; i++) {
		if (+req.params.id === +jsonArray[i]['id']) {
			res.json(jsonArray[i]);
		}
	}
});
//get item data in specific id range
app.get('/items/:id1/:id2', function (req, res) {
	if (+req.params.id1 <= 0 || +req.params.id2 > jsonArray.length || +req.params.id1 > +req.params.id2) {
		res.send('Range not possible.');
	}
	let result = [];
	for (let i = 0; i < jsonArray.length; i++) {
		if (+req.params.id1 <= +jsonArray[i]['id']) {
			if (+req.params.id2 >= +jsonArray[i]['id']) {
				result.push(jsonArray[i]);
			}
		}
	}
	res.json(result);
});
//get all properties
app.get('/properties', function (req, res) {
	res.json(properties);
});
//get property by id
app.get('/properties/:num', function (req, res) {
	if (+req.params.num < 0 || +req.params.num > properties.length - 1) {
		res.send('No such property ' + +req.params.num + ' available');
	}
	for (let i = 0; i < properties.length; i++) {
		if (i === +req.params.num) {
			res.json(properties[i]);
			break;
		}
	}

});

//----------POST----------//
//add item to json array
app.post('/items', function (req, res) {
	let item = req.body;
	let newCountry = {};
	if (Object.keys(item).length !== 0) {
		for (let key in jsonArray[0]) {
			if (item[key] !== undefined) {
				newCountry[key] = item[key];
			}
		}
		if (highestId <= 99) {
			newCountry["id"] = "0" + highestId;
		} else {
			newCountry["id"] = "" + highestId;
		}
		highestId++;
		jsonArray.push(newCountry);
		res.send('Added country ' + item.name + ' to list!');
	}
});

//---------------DELETE-------------//
//delete last item from array
app.delete('/items', function (req, res) {
	if (jsonArray.length !== 0) {
		let name = jsonArray[jsonArray.length - 1]["name"];
		jsonArray.pop();
		highestId--;
		res.send('Deleted last country: ' + name + '!');
	}
});

//delete item by id
app.delete('/items/:id', function (req, res) {
	let contains = false;
	let id = +req.params.id;
	for (let i = 0; i < jsonArray.length; i++) {
		if (id === +jsonArray[i]["id"]) {
			contains = true;
		}
	}
	if (contains) {
		jsonArray.splice(id, 1);
		highestId--;
		res.send('Item: ' + id + ' deleted sucessfully.');
	} else {
		res.send('No such id ' + id + ' in database');
	}
});

// DO NOT CHANGE!
// bind server localhost to port 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
