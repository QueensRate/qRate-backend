import express from "express" //importing the express library in order to use Express features like routing and middleware

/* 
Creating a router instance, which is basically an Express mini app that only handles routes. I can 
attach HTTP methods handlers like .get(), .post(), .delete(), etc to this router. This is used for modular
routing, so instead of putting all my routes in server.js, I'm going to break them into files like reviews.route.js
*/
const router = express.Router() 

/* 
This is defining a route that listens for GET requests on /.

(req, res) => res.send("Hello world") is the handler function where req is the request object, res is the respond object
This code will send the string "Hello World" when someone hits this route
*/
router.route("/").get((req, res) => res.send("Hello world"))

//exports this app so it can be imported in other js files and connected in my main app
export default router