import {Reader, User, Writer} from "./model.js";

export function loadSession(){
    let session = JSON.parse(sessionStorage.getItem('session'));
    console.log(session);
    if (session){
        switch (session._role){
            case 'user':
                return new User();
            case 'reader':
                return new Reader();
            case 'writer':
                return new Writer(session._username, session._password);
        }
        return session;
    } else return new Reader();
}

export function saveSession(session){
    sessionStorage.setItem('session', JSON.stringify(session));
}

export function login(username, password){
    //Check if user exists in local storage and if password is correct
    let user = JSON.parse(localStorage.getItem("user-"+username));
    if (user && user._password === password){
        let session;
        switch (user._role){
            case 'user':
                session = new User();
                break;
            case 'reader':
                session = new Reader();
                break;
            case 'writer':
                session = new Writer(user._username, user._password);
                break;
        }
        saveSession(session);
        return session;
    } else return null;
}

export function register(username,password,role){
    //Check if user exists in local storage
    let user = JSON.parse(localStorage.getItem("user-"+username));
    if (user){
        return null;
    } else {
        let user;
        switch (role){
            case 'user':
                user = new User();
                break;
            case 'reader':
                user = new Reader();
                break;
            case 'writer':
                user = new Writer(username, password);
                break;
        }
        localStorage.setItem("user-"+username, JSON.stringify(user));
    }
}