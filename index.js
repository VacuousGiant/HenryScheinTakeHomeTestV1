const Joi = require('joi');         //Module for input validation
const express = require('express'); //Load express module
const app = express();      //Get express object
app.use(express.json());            //Adding middleware to the pipeline

//Stored people
const people = [];
//Object for validation in POST
const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    emailAddress: Joi.string().email().required(),
    socialSecurityNumber: Joi.number().integer().positive().required()
});

/*      ENDPOINTS       */

//GET to return all person objects
app.get('/person', (req, res) =>
{
    //Return message if no people have been added
    if(people.length < 1) res.send("No people have been added to the app");
    //Else, send the list of people
    else res.send(people);
});

//GET person based on social security number
//If person does not exist, return 404 for missing object
app.get('/person/:socialSecurityNumber', (req, res) => {
    const person = people.find(c => c.socialSecurityNumber === parseInt(req.params.socialSecurityNumber));

    //If the person isn't found, return HTTP status code
    if(!person) res.status(404).send('404: The person with the provided SSN could not be found');
    //Otherwise, return person
    else res.send(person);
});

//POST person and return that person as JSON in the response
//verify all fields are present and properly formatted
//restrict duplicates
app.post('/person', (req,res)=>
{  
    const validationResult = schema.validate(req.body);

    //Input validation
    if(validationResult.error){
        res.status(400).send(validationResult.error.details[0].message);
        return;
    }

    //Create new object
    const person = req.body;
    people.push(person);

    //Conventional response to show success: return the object made in the body and the status code (201 for POST)
    res.status(201).send(person);
});

/*                      */

// Setting port from environment variable OR default 3000
// Can be set on windows using "set"
const port = process.env.PORT || 3000;

//Start the server (backtick ` allows you to use template string and dynamic value ${port})
app.listen(port, () => console.log(`Listening on port ${port}...`));