//get the user table records and send in here and when one of them are selected by the name or other thign you choose and edit thigs of that and send for the update 
export default function UserManagement (){

}

function delete_user(){

}

function edit_user(name_old , role_old , new_role , new_name , email , status){
// if one of them changed go use the post mehtod 
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

}


function add_user (){
    
}