import {auth, clearSession} from "./sessionRepository.js";
import {loadSampleData} from "./sampleData.js";

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

    document.getElementById('sampleDataButton').onclick = function () {
        loadSampleData();
    }

    if(session.role() === 'writer') {
        document.getElementById("loggedInName").innerHTML = session.username;
        hideLoginBox();
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
    let result = auth(formData.get("username"), formData.get("password"));

    if (result == null) {
        document.getElementById("wrongLoginNotification").classList.remove("is-hidden");
    } else {

        window.location.reload();
    }


}

export async function logout() {
    clearSession();
    window.location.reload();
}

function hideLoginBox() {
    document.getElementById("loginForm").classList.add("is-hidden");
    document.getElementById("loggedInBox").classList.remove("is-hidden");
}

function showLoginBox() {
    document.getElementById("loggedInBox").classList.add("is-hidden");
    document.getElementById("loginForm").classList.remove("is-hidden");
}

