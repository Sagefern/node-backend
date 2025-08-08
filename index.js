const express = require('express'); 
const req = require('express/lib/request');
const { redirect } = require('express/lib/response');
const {Pool} = require('pg');//Import the Pool class

const app = express(); 
const port = 3000; 

// Configure the database connection pool
const pool = new Pool({
    user: 'postgres', //Your PostgreSQL username
    host: 'localhost',
    database: 'restaurants_db', //The database you created
    password:'postgres', //Your PostgreSQL password
    port: 5432,
})

app.use(express.json()); 

// Refactor GET /restaurants
app.get('/restaurants', async (req, res) => { 
    try { 
        const result = await pool.query('SELECT * FROM restaurants ORDER BY id ASC'); 
        res.json(result.rows); 
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: "An internal server error occurred" }); 
    } 
});
//async: Marks the function as asynchronous, allowing us to use await. 
// • await pool.query(...): Pauses the function to "wait" for the database to send back the 
// results. 
// • result.rows: The pg library returns a result object, and our list of restaurants is inside the 
// rows property. 
// • try...catch: This is essential for catching any potential database errors.

//  Refactor GET /restaurants/:id
app.get('/restaurants/:id', async (req, res) => { 
    const { id } = req.params; 
    try { 
        const result = await pool.query('SELECT * FROM restaurants WHERE id = $1', [id]); 
        if (result.rows.length === 0) { 
            return res.status(404).json({ error: "Restaurant not found" }); 
        } 
        res.json(result.rows[0]); 
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: "An internal server error occurred" }); 
    } 
    });
    //• WHERE id = $1: The $1 is a placeholder for the first value in the array that follows. 
//• [id]: The pg library safely substitutes $1 with the id from this array, neutralizing malicious 
//input. 


//Refactor POST /restaurants (Create)
app.post('/restaurants', async (req, res) => { 
    const { name, cuisine, rating } = req.body; 
    if (!name || !cuisine || typeof rating !== 'number') { 
        return res.status(400).json({ error: "name, cuisine, and numeric rating are required" }); 
    } 
    try { 
        const result = await pool.query( 
            'INSERT INTO restaurants (name, cuisine, rating) VALUES ($1, $2, $3) RETURNING *', 
            [name, cuisine, rating] 
    ); 
    res.status(201).json(result.rows[0]); 
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: "An internal server error occurred" }); 
    } 
}); 
// • RETURNING *: This powerful PostgreSQL feature tells the database to return the entire row 
// that was just inserted, including the new id. 


//Refactor PUT /restaurants/:id (Update)  
app.put('/restaurants/:id', async (req, res) => { 
    const { id } = req.params; 
    const { name, cuisine, rating } = req.body; 
    // For simplicity, this example requires all fields. A more robust solution 
    // would dynamically build the query for partial updates. 
    if (!name || !cuisine || typeof rating !== 'number') { 
        return res.status(400).json({ error: "name, cuisine, and numeric rating are required" }); 
    } 
    try { 
        const result = await pool.query( 
            'UPDATE restaurants SET name = $1, cuisine = $2, rating = $3 WHERE id = $4 RETURNING *', 
            [name, cuisine, rating, id] 
        ); 
        if (result.rows.length === 0) { 
            return res.status(404).json({ error: "Restaurant not found" }); 
        } 
        res.json(result.rows[0]); 
    } catch (err) { 
        console.error(err); 
        res.status(500).json({ error: "An internal server error occurred" }); 
    } 
});

// Step 7: Refactor DELETE /restaurants/:id (Delete)  
app.delete('/restaurants/:id', async (req,res) => {
    const {id} = req.params;
    try{
        const result = await pool.query('DELETE FROM restaurants WHERE id = $1 RETURNING *',
            [id]);
    if (result.rowCount === 0){
         // result.rowCount: This property tells you how many rows were affected by the query. If it's 0, 
        //no record was found to delete. 
            return res.status(404).json({ error: "Restaurant not found" }); 
        }
        res.json(result.rows[0]); //returns the deleted item
    }catch (err){
        console.error(err);
        res.status(500).json({error: "An internal server error occurred"});
    }

});

//Created index.js where CRUD API endpoints are changed to query database 
app.listen(port, () => {  
console.log(`Server running at http://localhost:${port}`);
});