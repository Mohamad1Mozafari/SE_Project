const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();

app.use(cors());



const config = {

    user: "electronUser",

    password: "123456",

    server: "DESKTOP-0E5V6LI",

    database: "TestDB",

    options:{
        encrypt:false,
        trustServerCertificate:true
    },

    port:1433

};


app.get("/students", async(req,res)=>{


    try{


        let pool = await sql.connect(config);


        let result = await pool.request()
        .query("SELECT * FROM Student");


        res.json(result.recordset);


    }
    catch(error){

        console.log(error);

        res.status(500)
        .send(error);

    }


});

app.use(express.json());


// INSERT STUDENT
app.post("/students", async(req,res)=>{

    try{


        let {name, age} = req.body;


        let pool = await sql.connect(config);


        await pool.request()
        .input("name", sql.VarChar, name)
        .input("age", sql.Int, age)
        .query(`

            INSERT INTO Student(name, age)

            VALUES(@name, @age)

        `);


        res.send("Student inserted");


    }
    catch(error){

        console.log(error);

        res.status(500).send(error);

    }

});


app.listen(3000,()=>{

    console.log("Server running on port 3000");

});