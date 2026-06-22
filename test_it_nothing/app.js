async function insertStudent(){


    let name = document.getElementById("name").value;

    let age = document.getElementById("age").value;



    let response = await fetch("http://localhost:3000/students",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },


        body: JSON.stringify({

            name:name,

            age:Number(age)

        })

    });



    let result = await response.text();


    console.log(result);

    alert(result);

}




async function loadStudents(){


    let response = await fetch(
        "http://localhost:3000/students"
    );


    let students = await response.json();


    console.log(students);



    let table = document.getElementById("table");


    table.innerHTML="";



    students.forEach(student=>{


        table.innerHTML += `

        <tr>

        <td>${student.id}</td>

        <td>${student.name}</td>

        <td>${student.age}</td>

        </tr>

        `;


    });


}