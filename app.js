const express = require('express'); 
const app = express(); 
const port = 3000; 
app.get('/', (req, res) => {  
res.send('Hello from Node.js!');  
}); 
// 1. app.get('/', …)- Calls Express’s get() method on your app instance- Registers a route that listens for HTTP GET requests at the root URL (`/`)
// 2. (req, res) => { … }- This is the route-handler function (an arrow function)  - `req` is the incoming request object (e.g. headers, query, body)  - `res` is the outgoing response object you use to send data back
// 3. res.send('Hello from Node.js!'); - Uses Express’s send() method to write that string into the HTTP response body- Automatically sets the Content-Type and ends the response so the client sees 
// “Hello from Node.js!”

app.get('/about', (req, res) => {
res.send('This API is created by Charlotte!');
});
//An API endpoint is a specific URL or URI within an API that serves as the access point for clients to interact with a server. 

let restaurants = [ 
{ id: 1, name: "Pizza Palace", cuisine: "Italian", rating: 4.5 }, 
{ id: 2, name: "Sushi Central", cuisine: "Japanese", rating: 4.8 } 
]; 

app.get('/restaurants', (req, res) => { 
res.json(restaurants); 
}); 

app.get('/restaurants/:id', (req, res) => {  
    const id = parseInt(req.params.id, 10); 
    const rest = restaurants.find(r => r.id === id); 
    if (!rest) {  
    return res.status(404).json({ error: "Restaurant not found" });  
    }  
    res.json(rest);  
}); 

//The 10 in parseInt(req.params.id, 10) specifies the radix (base) for parsing the string. 10 means decimal (normal numbers). This avoids bugs if the string starts with 0 (which could be interpreted as octal in some cases).
//const is used because the value of id does not change after it's assigned. Using const makes the code safer and clearer by preventing accidental reassignment.

app.use(express.json()); 
//Adds middleware to parse incoming JSON request bodies, so req.body works for JSON data
let nextId = 3; 
app.post('/restaurants', (req, res) => { 
    const { name, cuisine, rating } = req.body;  
    if (!name || !cuisine || typeof rating !== 'number') {  
    return res.status(400).json({ error: "name, cuisine, and numeric rating are required" });  
    }  
    const newRest = { id: nextId++, name, cuisine, rating };  
    restaurants.push(newRest); 
    res.status(201).json(newRest);  
}); 

app.delete('/restaurants/:id', (req, res) => {  
    const id = parseInt(req.params.id, 10);  
    const idx = restaurants.findIndex(r => r.id === id);  
    if (idx === -1) {  
    return res.status(404).json({ error: "Restaurant not found" });  
    }  
    const removed = restaurants.splice(idx, 1)[0]; 
    res.json(removed);  
}); 

app.put('/restaurants/:id', (req, res) => {  
    const id = parseInt(req.params.id, 10);  
    const rest = restaurants.find(r => r.id === id);  
    if (!rest) {  
    return res.status(404).json({ error: "Restaurant not found" });  
    }  
// Merge updates; allow partial updates  
    const { name, cuisine, rating } = req.body;  
    if (name) rest.name = name;
    //If a new name is given, update the restaurant's name.  
    if (cuisine) rest.cuisine = cuisine;  
    if (rating !== undefined) rest.rating = rating; res.json(rest);  
}); 

app.listen(port, () => {  
console.log(`Server running at http://localhost:${port}`);
});