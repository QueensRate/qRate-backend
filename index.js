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
const port = process.env.PORT || 8000;  //defines the port that the express server will be listening on

//trying to connect to MongoDB with uri (which is the connection string)
(async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      wtimeoutMS: 2500,
    });

    await CourseReviewsDAO.injectDB(client);
    await ProfessorReviewsDAO.injectDB(client);
    await CoursesDAO.injectDB(client);
    await ProfessorsDAO.injectDB(client);

    app.get("/api/test", (req, res) => {
        res.send("Backend is working!");
      });      

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (e) {
    console.error("Failed to start server:", e);
    process.exit(1);
  }
})();

