import {apiBaseUrl} from "../main.js";
import {Reader, User, Writer} from "../model.js";
import {logout} from "../components/loginBox.js";
import {loadSession} from "./sessionRepository.js";


/**
 * Loads all users from the server and parses them into an array of User objects.
 * @returns {Promise<User[]>} A promise that resolves to an array of User objects.
 */
export async function getUsers() {
    let url = apiBaseUrl() + "/users";

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token
        }
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        return [];
    } else if (response.ok) {
        let data = await response.json();
        return data.users.map(user => new parseUser(user.user));
    } else {
        return [];
    }
}

/**
 * Loads a user from the server and parses it into a User object.
 * @param {int} userid The id of the user to load.
 * @returns {User} A User object.
 */
export async function getUser(userid) {
    let url = apiBaseUrl() + "/users/" + userid;

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token
        }
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        return null;
    } else if (response.ok) {
        let data = await response.json();
        data.user.eTag = response.headers.get("etag");
        return new parseUser(data.user);
    } else {
        return null;
    }
}

/** Creates a new user on the server.
 * @param {Object} user The json with the user data.
 * @returns {Promise<User|null>} A promise that resolves to the new User object or null if the user could not be created.
 */
export async function postUser(user) {
    let url = apiBaseUrl() + "/users";

    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token
        },
        body: JSON.stringify(user)
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        return null;
    } else if (response.ok) {
        let data = await response.json();
        data.user.eTag = response.headers.get("etag");
        return new parseUser(data.user);
    } else {
        return null;
    }
}

/** Updates a user on the server.
 * @param {Object} user The json with the user data.
 * @returns {Promise<User|null>} A promise that resolves to the updated User object or null if the user could not be updated.
 */
export async function updateUser(user) {
    let url = apiBaseUrl() + "/users/" + user.id;

    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": user.etag
        },
        body: JSON.stringify(user)
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        return null;
    } else if (response.ok) {
        let data = await response.json();
        data.user.eTag = response.headers.get("etag");
        return new parseUser(data.user);
    } else {
        return null;
    }
}

/**
 * Deletes a user from the server.
 * @param {int} userid The id of the user to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if the user was deleted, false otherwise.
 */
export async function deleteUser(userid) {
    let url = apiBaseUrl() + "/users/" + userid;

    let response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token
        }
    });

    if (response.status === 401 || response.status === 403) {
        logout();
        return false;
    } else
        return response.ok;
}
/**
 * Function to register a user on the server
 * @param user A json object containing the user information
 * @returns {Promise<Reader|null>} a promise that resolves to the created user, or null if the user could not be created
 */
export async function registerUser(user) {
    let url = apiBaseUrl() + "/users/register";
    let data = {
        "username": user.username,
        "name": user.name,
        "birthDate": user.birthDate,
        "email": user.email,
        "password": user.password
    }

    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let data = await response.json();
        data.user.eTag = response.headers.get("etag");
        return parseUser(data.user);
    } else {
        return null;
    }
}

/**
 * Checks if a user exists on the server by their username.
 * @param {string} username The username to check.
 * @returns {Promise<boolean>} A promise that resolves to true if the user exists, false otherwise.
 */
export async function usernameAvailable(username) {
    let url = apiBaseUrl() + "/users/username/" + username;

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    return !response.ok;

}

/**
 * Function to parse a user from a json object
 * @param user the json object to parse
 * @returns {User} the parsed user
 */
export function parseUser(user) {
    switch (user.role) {
        case "writer":
            return new Writer(user.id, user.username, user.email, user.active, user.birthDate, user.name,user.eTag,user.registerTime);
        case "reader":
            return new Reader(user.id, user.username, user.email, user.active, user.birthDate, user.name,user.eTag,user.registerTime);
        default:
            throw new Error("Unknown user role: " + user.role);
    }
}
