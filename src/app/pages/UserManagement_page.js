//get the user table records and send in here and when one of them are selected by the name or other thign you choose and edit thigs of that and send for the update 
export default function UserManagement (){
       let response = await fetch("http://localhost:3000/VehicleExit",{method:"GET"});
        let get_users = await response.json();
        let name , email  , role  , Status , Last_Login_Time , id ;
        name= get_users["name"];
        email= get_users["email"];
        role= get_users["role"];
        Status= get_users["Status"];
        id= get_users["id"];
        Last_Login_Time = last_login(id); 
        return name , email  , role  , Status , Last_Login_Time , id ;
}

function delete_user(){
let response = await fetch("http://localhost:3000/edit_user",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            "name":name,
            "role":role ,
            "email":email,
            "status":status 

        })
    });
    let check = await response.json();
    if (check=="success"){

    }else{
        
    }
}
function check_anithing_changed (old_name , old_role , new_role , new_name , new_email , new_status , old_email , old_status){
if ( old_role == new_role && old_name==new_name && new_email == old_email && new_status == old_status){
    return 0 ; 
}
return 1 ;
}
function edit_user(old_name , old_role , new_role , new_name , new_email , new_status , old_email , old_status){
// if one of them changed go use the post mehtod 
if (check_anithing_changed(old_name , old_role , new_role , new_name , new_email , new_status , old_email , old_status)){
    let massage = "nothing changed"
}
return massage ; 
let response = await fetch("http://localhost:3000/edit_user",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            "name_old":name_old,
            "role_old":role_old ,
            "new_name":new_name ,
            "new_role":new_role,
            "email":email,
            "status":status 

        })
    });
    let check = await response.json();
    if (check=="success"){

    }else {
        return "error can not edit user";
    }

}


function add_user (){
    let response = await fetch("http://localhost:3000/add_user",
    {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body: JSON.stringify({

            "name_old":name_old,
            "role_old":role_old ,
            "new_name":new_name ,
            "new_role":new_role,
            "email":email,
            "status":status 

        })
    });
        let check = await response.json();
    if (check=="success"){

    }else {
        return "error can not edit user";
    }
}
function last_login(id){
let response = await fetch("http://localhost:3000/add_user",{method:"POST"});
let get_rsult_login = await response.json();
return get_rsult_login["time"] ;
}