export default function report_bar_capicity(){  
    let response = await fetch(
        "http://localhost:3000/capicity"
    );
    let capicity = await response.json();
    return capicity ; 
}

export default function report_bar_Occupied_space(){  
    let response = await fetch(
        "http://localhost:3000/Occupied_space"
    );
    let Occupied_space = await response.json();
    return Occupied_space; 
}

export default function report_bar_Available_Spaces(){  
    let response = await fetch(
        "http://localhost:3000/Available_Spaces"
    );
    let Available_Spaces = await response.json();
    return Available_Spaces ; 
}

export default function report_bar_Today_Revenue(){  
    let response = await fetch(
        "http://localhost:3000/Today_Revenue"
    );
    let Today_Revenue = await response.json();
    return Today_Revenue; 
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
/// this is 10 max result and it must show 
 let response = await fetch(
        "http://localhost:3000/recent_activity"
    );

let result = await response.json();

const data = JSON.parse(data);
return data
}