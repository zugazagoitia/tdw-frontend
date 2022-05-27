import {auth, clearSession} from "../repositories/sessionRepository.js";

export async function setUpLoginBar(session) {
    document.addEventListener('DOMContentLoaded', () => {
        (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
            const $notification = $delete.parentNode;
            $delete.addEventListener('click', () => {
                $notification.classList.add('is-hidden');
            });
        });
    });

    document.getElementById('loginForm').onsubmit = function () {
        login();
        return false;
    }
    document.getElementById('logoutButton').onclick = function () {
        logout();
    }

    if (session.role !== 'user') {
        document.getElementById("loggedInName").innerHTML = session.user.username;
        hideLoginBox();
        if(session.role === 'writer') {
            let usersButton =
            document.getElementById("usersAdminButton");
           usersButton.classList.remove("is-hidden");
           usersButton.onclick = function () {
               window.location.href = "users.html";
           }
        }
    }

}

export async function login() {
    let loginForm = document.getElementById("loginForm");

    let formData = new FormData(loginForm);

    //Validate form data
    if (formData.get("username") === "" || formData.get("password") === "") {
        alert("Por favor, rellene todos los campos");
        return;
    }

    document.getElementById("loginButton").classList.add("is-loading");
    let result = await auth(formData.get("username"), formData.get("password"));
    document.getElementById("loginButton").classList.remove("is-loading");

    if (result == null) {
        document.getElementById("wrongLoginNotification").classList.remove("is-hidden");
    } else {
        window.history.replaceState({page: location.pathname}, document.title, window.location.pathname);
        window.history.pushState({page: location.pathname}, document.title, window.location.pathname);
        window.location.reload();
    }


}

export async function logout() {
    clearSession();
    //Redirect to index page using location.replace
    window.location.replace("./index.html");
}

function hideLoginBox() {
    document.getElementById("loginForm").classList.add("is-hidden");
    document.getElementById("loggedInBox").classList.remove("is-hidden");
}

function showLoginBox() {
    document.getElementById("loggedInBox").classList.add("is-hidden");
    document.getElementById("loginForm").classList.remove("is-hidden");
}

