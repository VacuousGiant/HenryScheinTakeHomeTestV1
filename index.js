const Joi = require('joi');         //Module for input validation
const express = require('express'); //Load express module
const app = express();      //Get express object
app.use(express.json());            //Adding middleware to the pipeline

//Stored people
const people = [];
//Object for validation in POST and PUT
const schema = Joi.object({
    firstName: Joi.string().regex(/^[A-Za-z]*$/).messages({'string.pattern.base': `firstName must only be letters.`}).required(),
    lastName: Joi.string().regex(/^[A-Za-z]*$/).messages({'string.pattern.base': `lastName must only be letters.`}).required(),
    dateOfBirth: Joi.date().required(),
    emailAddress: Joi.string().email().required(),
    socialSecurityNumber: Joi.string().regex(/^[0-9]{9}$/).messages({'string.pattern.base': `socialSecurityNumber must be a number and have 9 digits.`}).required()
});

//Function for validating people
function validatePerson(person)
{
    return schema.validate(person);
}

/*      ENDPOINTS       */

//Endpoint for Bad JSON formatting from client
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.log("User has provided invalid JSON");
        return res.status(400).send("Error 400: Invalid JSON format sent"); // Bad request
    }
    next();
});

//GET to return all person objects
app.get('/person', (req, res) =>
{
    //Return message if no people have been added (404)
    if(people.length < 1) return res.status(404).send("Error 404: No people have been added to the app");
    //Else, send the list of people
    res.status(200).send(people);
});

//GET person based on social security number
//If person does not exist, return 404 for missing object
app.get('/person/:socialSecurityNumber', (req, res) => {
    const person = people.find(c => c.socialSecurityNumber === req.params.socialSecurityNumber);

    //If the person isn't found, return HTTP status code
    if(!person) return res.status(404).send('Error 404: The person with the provided SSN could not be found');
    //Otherwise, return person
    res.status(200).send(person);
});

//POST person and return that person as JSON in the response
//verify all fields are present and properly formatted
//restrict duplicates
app.post('/person', (req,res)=>
{  
    try
    {
        //Input validation
        const { error } = validatePerson(req.body);     

        if(error) return res.status(400).send(error.details[0].message);

        //Check for duplicates
        var duplicate = false;
        for(var i = 0; i < people.length; i++) {
            if (people[i].socialSecurityNumber === req.body.socialSecurityNumber) {
                duplicate = true;
                break;
            }
        }
        if(duplicate) return res.status(400).send('Error 400: A person with the given SSN is already registered');
    
        //Create new object
        const person = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: req.body.dateOfBirth,
            emailAddress: req.body.emailAddress,
            socialSecurityNumber: req.body.socialSecurityNumber,
        };
        people.push(person);

        //Conventional response to show success: return the object made in the body and the status code (201 for POST)
        res.status(201).send(person);
    }
    catch(err){ res.status(500).send("Error 500: Unknown server-side error"); }
});

app.put('/person/:socialSecurityNumber', (req, res) =>
{
    try
    {
        // Look up person with given ID
        // If not existing, return 404 resource not found status code
        const person = people.find(c => c.socialSecurityNumber === req.params.socialSecurityNumber);
        if(!person) {res.status(404).send('Error 404: The person with the provided SSN could not be found'); return;}

        // Validate the update request
        // If invalid, return 400 bad request
        //const validationResult = validateperson(req.body);
        const { error } = validatePerson(req.body);
        if(error) return res.status(400).send(error.details[0].message);

        //Don't allow socialSecurityNumber to be updated
        if(req.body.socialSecurityNumber !== person.socialSecurityNumber) return res.status(400).send("Error 400: Cannot update SSN");

        // Update person
        person.firstName= req.body.firstName,
        person.lastName= req.body.lastName,
        person.dateOfBirth= req.body.dateOfBirth,
        person.emailAddress= req.body.emailAddress,
        person.socialSecurityNumber= req.body.socialSecurityNumber,

        // Return the updated person
        res.status(200).send(person);
    }
    catch(err){res.status(500).send("Error 500: Unknown server-side error");}   
});

app.delete('/person/:socialSecurityNumber', (req, res) =>
{
    //Look up the person with given ID
    // If not existing, return 404 resource not found status code
    const person = people.find(c => c.socialSecurityNumber === req.params.socialSecurityNumber);
    if(!person) return res.status(404).send('ERROR 404: The person with the given SSN was not found'); 

    //Delete
    const index = people.indexOf(person);
    people.splice(index, 1);   //Remove the person
    //Return the person
    res.status(200).send(person);
});

/*                      */

// Setting port from environment variable OR default 3000
// Can be set on windows using "set"
const port = process.env.PORT || 3000;

//Start the server
app.listen(port, () => console.log(`Listening on port ${port}...`));