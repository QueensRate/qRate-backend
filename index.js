import dotenv from "dotenv"; //Imports the dotenv package
dotenv.config(); //configures the package so I can load my .env file into process.env and access env variables

import app from "./server.js"; //importing the express app from server.js
import mongodb from "mongodb"; //importing the mongodb driver for node.js
import CourseReviewsDAO from "./dao/CourseReviewsDAO.js" //importing the reviews 
import ProfessorReviewsDAO from "./dao/ProfessorReviewsDAO.js";
import CoursesDAO from "./dao/CoursesDAO.js" //importing the courses DAO so we can use it to fetch courses
import ProfessorsDAO from "./dao/ProfessorsDAO.js"

/* Extracting the MongoClient class from the mongodb package. This way, we can connect to the MongoDB database */
const MongoClient = mongodb.MongoClient;

const uri = process.env.MONGO_URI; //loading the full mongoDB connection string from env variable
const port = 8000;  //defines the port that the express server will be listening on

//trying to connect to MongoDB with uri (which is the connection string)
MongoClient.connect(
    uri, 
    {
        maxPoolSize: 50,    //maximum number of concurrent DB connections (for performance)
        wtimeoutMS: 2500,   //write timeout if mongo doesnt respond in time
        useNewUrlParser: true 
    }) 
    /* using MongoClient.connect() is a function that will return a promise. This doesn't mean it 
       returns the final result, but rather, it will return a promise object that represents the 
       eventual completion or failure of the asynchronous operation. Then we will need to have code
       for a .catch() or .then() methods to handle the result or error once the operation is done */ 

    //if the MongoDB connection fails, then we're going to...
    .catch(err => {
        console.error(err.stack) //we're going to log the error stack to the console
        process.exit(1) //exit the app with status code 1 (indicating failure)
    })

    //if the MongoDB connection succeeds, then...
    .then(async client => { 
        await CourseReviewsDAO.injectDB(client);
        await ProfessorReviewsDAO.injectDB(client);
        await CoursesDAO.injectDB(client); //injecting the MongoDB client into the DAO classes so they can use it to access the database
        await ProfessorsDAO.injectDB(client);
        app.listen(port, () => { //we're going to start the Express server using app.listen (app comes from server.js remember we imported it)
            console.log(`listening on port ${port}`) //log a message saying the server is up
        })
    }) 

