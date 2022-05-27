import {Reader, Session, Writer} from "../model.js";
import {apiBaseUrl, serverUrl} from "../main.js";
import {parseUser} from "./userRepository.js";
import {logout} from "../components/loginBox.js";

/**
 * Loads and parses the session data from the sessionStorage.
 * @returns {Session}
 */
export function loadSession() {
    let session = JSON.parse(sessionStorage.getItem('session'));
    if (session) {

        try {
            let user;
            switch (session._role) {
                case 'writer':
                    user = new Writer(
                        session._user._id,
                        session._user._username,
                        session._user._email,
                        session._user._active,
                        session._user._birthDate,
                        session._user._name,
                        session._user._eTag);
                    break;
                case 'reader':
                    user = new Reader(
                        session._user._id,
                        session._user._username,
                        session._user._email,
                        session._user._active,
                        session._user._birthDate,
                        session._user._name,
                        session._user._eTag);
                    break;
                case 'user':
                default:
                    user = null;
                    break;
            }

            return new Session(
                user,
                session._token,
                session._role);
        } catch (e){
            console.log("Corrupt session: " + e);
            clearSession();
            return new Session(null, null, "user");
        }

    } else return new Session(null, null, "user");
}

/**
 * Function to save the session in the sessionStorage
 * @param {Session} session the session to save
 */
export function saveSession(session) {
    sessionStorage.setItem('session', JSON.stringify(session));
}

/**
 * Clears the session from the session storage
 */
export function clearSession() {
    sessionStorage.removeItem('session');
}

/**
 * Function to log in a user.
 * @param username The username of the user.
 * @param password The password of the user.
 * @returns {Promise<Session|null>} A promise that resolves to the session of the user or null if the login failed.
 */
export async function auth(username, password) {
    let endpoint = serverUrl() + 'access_token';

    let data = {
        'username': username,
        'password': password,
        'scope': 'writer'
    };

    const formBody = Object.keys(data).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])).join('&');

    let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: formBody
    });

    if (response.status === 200) {
        let json = await response.json();
        let jwt = parseJwt(json.access_token);
        let role;
        if (jwt.scopes.includes("writer")) {
            role = "writer";
        } else {
            role = "reader";
        }

        let session = new Session(
            await getSelfUser(json.access_token, jwt.uid),
            json.access_token,
            role);

        saveSession(session);
        return session;
    } else {
        return null;
    }
}


/**
 * Function to update a user's profile
 * @param user A JSON object containing the user's new profile information
 * @returns {Promise<null|*>} A promise that resolves to the updated user or null if the update failed.
 */
export async function updateProfile(user) {
    let endpoint = apiBaseUrl() + '/users/' + user.id;

    let response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + loadSession().token,
            'If-Match': user.eTag
        },
        body: JSON.stringify(user)
    });

    if (response.ok) {
        let json = await response.json();
        let session = loadSession();
        session.user = await getSelfUser(session.token, session.user.id);
        saveSession(session);
        return session.user;
    } else if (response.status === 412) {
        throw new Error("Etag mismatch");
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Retrieves the user from the server
 * @param token the token of the user
 * @param userId the id of the user
 * @returns {User} the user object or null if the user does not exist
 */
async function getSelfUser(token, userId) {
    let endPoint = apiBaseUrl() + '/users' + '/' + userId;
    let response = await fetch(endPoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    });

    if (response.status === 200) {
        let json = await response.json();
        json.user.eTag = response.headers.get('ETag');
        return parseUser(json.user);
    } else {
        return null;
    }

}

/**
 * Function to extract a paylod from a JWT
 * @param token the JWT
 * @returns {any} the payload as an object
 */
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}