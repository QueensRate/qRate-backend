import express from "express" // bringing in the express library so we can use it to create the server 
import cors from "cors"; // bringing in CORS middleware, so that frontend can talk to backend

/* 
we will have all the review-related routes in the file route.js for modularity purposes. Here we're going
to need to import it into our server.js file. */
import reviews from "./api/reviews.route.js";

//creating an instance of the express application...app is the web server where we're going to define what happens when requests come in
const app = express();  

//applying CORS middleware to every incoming request, i.e allowing frontend-backend comms
app.use(cors());

//enabling express to automatically parse incoming JSON bodies
app.use(express.json());

//delegating review-related requests to a seperate file called reviews.js
/* Basically, any request with the base route /api/v1/reviews/ we will call reviews to handle those requests */
app.use("/api/v1/reviews", reviews);

/* This is the "catch all" route, where it will run if non of the other routes matched. Responds with a 404 Not Found status, and a JSON error message */
app.use("/", (req, res) => 
    res.status(404).json({error: "not found"}))

//this will make this express app available to be imported in another file (ex. like index.js)
export default app