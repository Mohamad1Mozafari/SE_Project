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

app.get ("http://localhost:3000/login" , async(req, res)=>{
        let {username , password} =req.body ;   
    try {
            let pool = await sql.connect (config);
            let query_st = "SELECT * FROM USER WHERE username = "+username+" AND "+password+";";
            let result = await pool.request().query (query_st)
            if (!result){
                console.log("pass or user name is wrong")
            }
    }catch (error){
        console.log (error);
        res.status 
    }
});

app.listen(3000,()=>{

    console.log("Server running on port 3000");

});


//function sign up , reports , systemlogs , ... 