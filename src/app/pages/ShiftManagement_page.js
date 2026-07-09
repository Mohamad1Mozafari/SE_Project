
import dayjs from 'dayjs';
const currentDate = dayjs();
let toDay = currentDate.format('YYYY-MM-DD') ; 

export async function Create_shift (usernames , time , date){
    // usernames is type of array can incluade one and can include many
    //time type is morning , night , evening   
    const response = await fetch("http://localhost:3000/api/shift_management/Create_shift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames , time , date })
    });
    const result = await response.json();
return result ; 
}

export async function Morning_shift_load (){//6:00 AM - 2:00 PM
    const response = await fetch("http://localhost:3000/api/shift_management/Morning_shift_load", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
return result ; 
}
export async function Evening_shift_load (){//2:00 PM - 10:00 PM
    const response = await fetch("http://localhost:3000/api/shift_management/Evening_shift_load", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
return result ; 
}
export async function Night_shift_load (){//10:00 PM - 6:00 AM
    const response = await fetch("http://localhost:3000/api/shift_management/Night_shift_load", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
return result ; 
}

export async function Weekly_Schedule_load (){
    let toDay = currentDate.format('YYYY-MM-DD') ; 
    const d = new Date (toDay);
    const dayIndex = d.getDay();
    const dayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex];
    // you can not edit the prevous days before you but it can show them 
    // you must make part for the calcualte the working price of that 
    const response = await fetch("http://localhost:3000/api/shift_management/Weekly_Schedule_load", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
return result ; 
}

export async function Weekly_Schedule_edit(json_file){
    //look in here 
    // mine is json_file = '[{ "username": "op1", "day": "Monday" , "shift":"morning"}, {"username": "op1", "day": "Monday" , "shift":"evening" }, {"username": "op1", "day": "Monday" , "shift":"night"}]'
    const obj = JSON.parse(json_file);
    let shift  , day , username = "" ; 
    for (let i = 0; i < obj.length; i++) {
       shift  , day , username  = obj[i].username , obj[i].day , obj[i].shift ;
            const response = await fetch("http://localhost:3000/api/shift_management/Weekly_Schedule_edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shift  , day , username   })
    });
    const result = await response.json();
    if (result!="sucess"){
        // print error 
    }

}

return result ; 
}

