export default function vehicleExit_handler (plate_number){
    let resoponse = "nothing";
    let answer = await fetch(
        "http://localhost:3000/capicity"
    );

    const capicity = await answer.json();
    if (capicity==0){
        return "ERROR_capicity=0";
    }


    // try {
    //        let response = await fetch("http://localhost:3000/VehicleExit",
    // {

    //     method:"POST",

    //     headers:{
    //         "Content-Type":"application/json"
    //     },

    //     body: JSON.stringify({

    //         plate_number:plate_number
    //     })
    // });

    //         if (!response.ok){
    //     throw new Error(`HTTP Error: ${response.status}`);
    //     }
    // }catch (error) {
    //     console.error("Request failed:", error);
    // }

    //retrun json file 
   

    const get_result = await response.json();
    // get_result
     // is like this 
    // {
    //plate number , parking_spot , entry time  , exit time , parking duratoin ,  calculated fee 

    
    if (get_result['status']=="success"){
        let res_show_UI = true ; 
    }else {
        response = "exit the car ERORR"; 
        let res_show_UI = false ; 
    }
    let calculat_fee , parking_duratoin = 0 ;

calculat_fee , parking_duratoin =calculation_FEE(get_result['entry_time'] ,get_result['exit_time'] )
confirm_exist(plate_number); 
return get_reuslt , calculat_fee , parking_duratoin ;
// // console.log (username); 
// // console.log (password);
// const result = "this user with username :"+ username + "and this password "+password +"is login ";
// return result ;
}

function calculation_FEE (entry_time , exit_time , tarrif){
        let response = await fetch(
        "http://localhost:3000/tarrif_charge"
    );
    let tarrif_charge = await response.json();/// is that need every time we calculate this or better once (when we calculate this ?)
// convert to min or hours the (entry_time - exist_time ) * trarrif 
// find the duratoin 
let calculat_fee = 0 ;
let duratoin = 0 ; 
return  calculat_fee , duratoin ; 
}

function confirm_exist(){
     let response = await fetch("http://localhost:3000/VehicleExit_confrim_del",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            plate_number:plate_number
        })
    });
    let isSucess = false ; 
if (response.txt()=='success'){
    isSucess= true ; 
}else {
    isSucess = false ; 
}
return isSucess ; 
}
