import {registerUser, usernameAvailable} from "../repositories/userRepository.js";

export async function setUpRegisterForm() {

    const calendars = bulmaCalendar.attach('[type="date"]', {
        type: 'date',
        dateFormat: 'yyyy-MM-dd',
        displayMode: 'inline',
    });

    document.getElementById("registerBox")
        .querySelector('input[name="username"]')
        .addEventListener("focusout", function (event) {
            let username = event.target.value;
            if (username) {
                let validate = usernameAvailable(username).then(function (result) {
                    if (result) {
                        setUserAvailableStyle()
                    } else {
                        setUserUnavailableStyle()
                    }
                });
            }


        });

    document.getElementById('registerForm').onsubmit = function (event) {
        event.preventDefault();
        register();
        return false;
    }
}

function setUserAvailableStyle() {
    document.getElementById("registerBox")
        .querySelector('input[name="username"]')
        .classList.add('is-success');
    document.getElementById("username-available-icon").classList.remove("is-hidden");
    document.getElementById("username-wrong-icon").classList.add("is-hidden");

    document.getElementById("username-available-text").classList.remove("is-hidden");
    document.getElementById("username-wrong-text").classList.add("is-hidden");
}

function setUserUnavailableStyle() {
    document.getElementById("registerBox")
        .querySelector('input[name="username"]')
        .classList.add('is-danger');

    document.getElementById("username-available-icon").classList.add("is-hidden");
    document.getElementById("username-wrong-icon").classList.remove("is-hidden");

    document.getElementById("username-available-text").classList.add("is-hidden");
    document.getElementById("username-wrong-text").classList.remove("is-hidden");
}

/**
 * Validates the register form and returns an object with the result if the form is valid.
 * @returns {{password, name, birthDate, email, username}|null}  Returns an object with the result if the form is valid, null otherwise.
 */
function validateForm() {

    let username = document.getElementById("registerBox")
        .querySelector('input[name="username"]');

    let usernameIsValid = document.getElementById("registerBox")
        .querySelector('input[name="username"]')
        .classList.contains('is-success');

    if (!usernameIsValid || !username || !username.value) {
        return null;
    }

    let password = document.getElementById("registerBox")
        .querySelector('input[name="password"]');

    if (!password || !password.value) {
        return null;
    }

    let name = document.getElementById("registerBox")
        .querySelector('input[name="name"]');

    if (!name || !name.value) {
        return null;
    }

    let email = document.getElementById("registerBox")
        .querySelector('input[name="email"]');

    if (!email || !email.value) {
        return null;
    }

    let birth = document.getElementById("registerBox")
        .querySelector('input[name="birth"]');

    if (!birth || !birth.value) {
        return null;
    }

    return {
        username: username.value,
        password: password.value,
        name: name.value,
        email: email.value,
        birthDate: birth.value
    }
}

/**
 * Registers a new user in the database.
 * @returns false
 */
function register() {
    let user = validateForm();
    if (user) {
        //Add spinner to button
        let button = document.getElementById("registerButton");
        button.classList.add("is-loading");
        registerUser(user).then(function (result) {
            if (result) {
                //Remove spinner from button
                button.classList.remove('is-loading');
                //Show success message
                alert("Usuario registrado con éxito, cuando un writer lo apruebe podrá iniciar sesión");
            } else {
                //Remove spinner from button
                button.classList.remove('is-loading');
                //Show error message
                alert("Error al registrar usuario");
            }
        });
    }
    return false;
}