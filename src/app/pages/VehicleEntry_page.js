export default function vehicleEntry (plate_number , time , space_choosed ){
    let resoponse = "nothing";
    let answer = await fetch(
        "http://localhost:3000/capicity"
    );
    let temp = await answer.json();
    temp = JSON.parse(temp) ; 
    let free_space_array = temp ; 
    let response = await fetch("http://localhost:3000/login",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            plate_number:plate_number,
            time:time , 
            space_choosed , space_choosed

        })

    });

    let result = await response.text();
    if (result=="successful_enter"){
        let res_show_UI = true ; 
    }else {
        response = "enter the car ERORR"; 
        let res_show_UI = false ; 
    }
    return res_show_UI ;

// // console.log (username); 
// // console.log (password);
// const result = "this user with username :"+ username + "and this password "+password +"is login ";
// return result ;
}
