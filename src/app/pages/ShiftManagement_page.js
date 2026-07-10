import dayjs from 'dayjs';

const currentDate = dayjs();
let toDay = currentDate.format('YYYY-MM-DD'); 

export async function Create_shift(usernames, time, date) {
    const response = await fetch("http://localhost:3000/api/shift_management/Create_shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames, time, date })
    });
    const result = await response.json();
    return result; 
}

export async function Morning_shift_load() { // 6:00 AM - 2:00 PM
    const response = await fetch("http://localhost:3000/api/shift_management/Morning_shift_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result; 
}

export async function Evening_shift_load() { // 2:00 PM - 10:00 PM
    const response = await fetch("http://localhost:3000/api/shift_management/Evening_shift_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result; 
}

export async function Night_shift_load() { // 10:00 PM - 6:00 AM
    const response = await fetch("http://localhost:3000/api/shift_management/Night_shift_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result; 
}

export async function Weekly_Schedule_load() {
    const response = await fetch("http://localhost:3000/api/shift_management/Weekly_Schedule_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result; 
}

export async function Previous_Week_Schedule_load() {
    const response = await fetch("http://localhost:3000/api/shift_management/Previous_Week_Schedule_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result;
}

export async function Next_Week_Schedule_load() {
    const response = await fetch("http://localhost:3000/api/shift_management/Next_Week_Schedule_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result;
}

export async function Shift_Coverage_load() {
    const response = await fetch("http://localhost:3000/api/shift_management/Shift_Coverage_load", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result;
}

export async function Weekly_Schedule_edit(json_file) {
    const obj = JSON.parse(json_file);
    let finalResult = "success"; 
    
    for (let i = 0; i < obj.length; i++) {
        // Corrected variable assignment logic
        const username = obj[i].username;
        const day = obj[i].day;
        const shift = obj[i].shift;
        
        const response = await fetch("http://localhost:3000/api/shift_management/Weekly_Schedule_edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shift, day, username })
        });
        
        const result = await response.json();
        if (result !== "success") {
            console.error(`Failed to update ${username} for ${day} ${shift}:`, result);
            finalResult = "error";
        }
    }
    return finalResult; 
}