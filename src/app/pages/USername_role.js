// js_files/USername_role.js

export const ROLES = {
    ADMIN: "admin",
    OWNER: "owner",
    OPERATOR: "operator"
};

// Encapsulated state using sessionStorage to persist through page refreshes
export function set_user_name(username) {
    if (username) {
        sessionStorage.setItem("user_name", username);
    }
}

export function get_user_name() {
    return sessionStorage.getItem("user_name") || "";
}

export function set_role(role) {
    // Validate role against known roles before storing
    if (Object.values(ROLES).includes(role)) {
        sessionStorage.setItem("user_role", role);
    }
}

export function get_role() {
    return sessionStorage.getItem("user_role") || "";
}

// Clear session data on logout
export function clear_session() {
    sessionStorage.removeItem("user_name");
    sessionStorage.removeItem("user_role");
}