var UserName = ""; 
var Role = "" ;
const roles = {
    admin :"admin" , 
    owner: "owner" , 
    operator:"operator"
}
function set_user_name (username){
UserName = username ; 
}
function get_user_name (){
return UserName ; 
}

function set_role (role){
Role = role ; 
}
function get_role (){
return Role ; 
}
