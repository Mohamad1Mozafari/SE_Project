export default function report_bar (){

    let response = await fetch(
        "http://localhost:3000/capicity"
    );
    let capicity = await response.json();
    response = "";

    let response = await fetch(
        "http://localhost:3000/Occupied_space"
    );
    let Occupied_space = await response.json();
    response = "";

    
    let response = await fetch(
        "http://localhost:3000/Available_Spaces"
    );
    let Available_Spaces = await response.json();
    response = "";

    let response = await fetch(
        "http://localhost:3000/Today_Revenue"
    );
    let Today_Revenue = await response.json();
    response = "";

    let send_to_UI = {
        "capicity":capicity ,
        "Occupied_space": Occupied_space , 
        "Available_Spaces":Available_Spaces ,
        "Today_Revenue":Today_Revenue
    }
    return send_to_UI ;
}

export default function Recent_Activity (){
    // time \
    // spot ,
    // type 
    // name 
// id : 1030 
// time : 1213
// id:132
// time :1223
    let response =await fetch(url, {
            method: "GET"
    }
);

let result = await response.json();
const data = JSON.parse(data);
let arr_names = [];
let arr_time = [];
    const values = Object.values(data);
    numberOF_filed = 5 ; //id , time , spot , name , type
    let size = int (values.length) * numberOF_filed;
    let value = 0; 
    for (i=0 ; i < size ; i++){//send if exist a 10 result 
        value=i % numberOF_filed
        switch value {
            case 0 : {
                arr_names.push (values[i]);
            }
               case 1 : {
                arr_time.push (values[i]);
            }
            //... for time id and etc 
        }
    }
}