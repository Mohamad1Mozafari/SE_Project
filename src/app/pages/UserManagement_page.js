// UserManagement_page.js

export async function getUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/user_management/get_all_userInfo", { 
      method: "GET" 
    });
    const usersData = await response.json();
    
    const usersArray = Array.isArray(usersData) ? usersData : [usersData];

    // Fetch last login for each user in parallel
    const usersWithLogin = await Promise.all(
      usersArray.map(async (user) => {
        const lastLogin = await lastLoginTime(user.username);
        return {
          username: user.username, // Added to provide a reliable key identifier in React components
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.Status || user.status, 
          lastLogin: lastLogin || "Never"
        };
      })
    );

    return usersWithLogin;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

export async function deleteUser(username) {
  try {
    const response = await fetch("http://localhost:3000/api/user_management/delete_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const result = await response.json();
    return result === "success";
  } catch (error) {
    console.error("Delete user error:", error);
    return false;
  }
}

export async function editUser(oldUser, newUser) {
  if (
    oldUser.username === newUser.username &&
    oldUser.name === newUser.name &&
    oldUser.role === newUser.role &&
    oldUser.email === newUser.email &&
    oldUser.status === newUser.status
  ) {
    return { success: false, message: "nothing changed" };
  }

  try {
    const response = await fetch("http://localhost:3000/api/user_management/edit_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        new_username: newUser.username, // Include username identifier context for updates
        old_username: oldUser.username,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
        status: newUser.status
      })
    });
    const check = await response.json();
    if (check === "success") {
      return { success: true };
    } else {
      return { success: false, message: "error can not edit user" };
    }
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

export async function addUser(newUser) {
  try {
    const response = await fetch("http://localhost:3000/api/user_management/add_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: newUser.username, // Required to accurately store and fetch records later
        new_name: newUser.name,
        new_role: newUser.role,
        email: newUser.email,
        status: newUser.status
      })
    });
    const check = await response.json();
    if (check === "success") {
      return { success: true };
    } else {
      return { success: false, message: "error can not add user" };
    }
  } catch (error) {
    return { success: false, message: "Network error" };
  }
}

async function lastLoginTime(username) {
  if (!username) return "Never";
  try {
    const response = await fetch("http://localhost:3000/api/user_management/last_login_time", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    });
    const getResultLogin = await response.json();
    return getResultLogin["time"];
  } catch (error) {
    return "Error fetching time";
  }
}