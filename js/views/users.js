import {loadUsers, UserStore} from "../stores.js";
import {deleteUser, getUser, postUser, updateUser, usernameAvailable} from "../repositories/userRepository.js";
import {User} from "../model.js";


export async function setUpUsersView() {

    // noinspection JSUnresolvedFunction
    const calendars = bulmaCalendar.attach('[type="date"]', {
        type: 'date',
        dateFormat: 'yyyy-MM-dd',
        displayMode: 'inline',
    });

    document.getElementById("edit-user-form")
        .querySelector('input[name="username"]')
        .addEventListener("focusout", validateUsername);


    document.getElementById('index-button').onclick = function () {
        window.location.href = "index.html";
    };

    document.getElementById('modal-close-button').onclick = function () {
        closeEditModal();
    }

    document.getElementById('modal-cancel-button').onclick = function () {
        closeEditModal();
    }


    document.getElementById("addUserButton").onclick = async function () {

        clearUserStyle();
        openEditModal();


        document.getElementById('edit-user-form').onsubmit = function () {
            document.getElementById('modal-save-button').classList.add('is-loading');
            createUser().then((created) => {
                if (created) {
                    document.getElementById('modal-save-button').classList.remove('is-loading');
                    UserStore.putUser(created);
                    renderUsers();
                    document.getElementById('modal-close-button').click();

                } else {
                    document.getElementById('modal-save-button').classList.remove('is-loading');
                }
            });
            return false;
        }
    };

    loadUsers().then(() => {
        renderUsers();
    });
}

async function renderUsers() {

    let users = UserStore.getUsers();

    let usersList = document.getElementById("usersTableBody");
    usersList.innerHTML = "";
    for (let user of users) {
        //Clone template named table-row-template
        let row = document.getElementById("table-row-template").content.cloneNode(true);

        //Set the values of the row

        let yesIcon = "<span class=\"icon has-text-success\">\n" +
            "  <i class=\"fas fa-check-square\"></i>\n" +
            "</span>"

        let noIcon = "<span class=\"icon has-text-danger\">\n" +
            "  <i class=\"fas fa-square-xmark\"></i>\n" +
            "</span>"

        row.querySelector("#table-row-id").innerHTML = user.id;
        row.querySelector("#table-row-name").innerHTML = user.name || "<small>N/A</small>";
        row.querySelector("#table-row-username").innerHTML = user.username || "<small>N/A</small>";
        row.querySelector("#table-row-email").innerHTML = user.email || "<small>N/A</small>";
        row.querySelector("#table-row-born").innerHTML = user.birthDate || "<small>N/A</small>";
        row.querySelector("#table-row-active").innerHTML = user.active ? yesIcon : noIcon;
        row.querySelector("#table-row-role").innerHTML = user.role();


        //Set up the edit and delete buttons
        row.querySelector("#table-row-edit").onclick = async function (event) {
            event.target.classList.add('is-loading');
            let etagedUser = await getUser(user.id); //Get the user from the server to get a fresh copy and etag
            UserStore.updateUser(etagedUser);

            document.getElementById("edit-user-form")
                .querySelector('input[name="username"]')

            fillEditFormWithCurrentDetails(etagedUser);

            setUserAvailableStyle();

            openEditModal();
            event.target.classList.remove('is-loading');
            document.getElementById('edit-user-form').onsubmit = function () {
                document.getElementById('modal-save-button').classList.add('is-loading');
                update().then((updated) => {
                    if (updated) {
                        document.getElementById('modal-save-button').classList.remove('is-loading');
                        UserStore.updateUser(updated);
                        renderUsers();
                        document.getElementById('modal-close-button').click();

                    } else {
                        document.getElementById('modal-save-button').classList.remove('is-loading');
                    }
                });
                return false;
            }
        };

        row.querySelector("#table-row-delete").onclick = async function (event) {

            let confirmDelete = confirm("¿Estás seguro de que quieres eliminar este usuario?");

            if (confirmDelete) {
                event.target.classList.add("is-loading");
                deleteUser(user.id).then((deleted) => {
                    if (deleted) {
                        //remove the row from the table
                        UserStore.deleteUser(user);
                        renderUsers();
                    } else {
                        event.target.classList.remove("is-loading");
                        alert("Error deleting user with id: " + user.id);
                    }
                });
            }
        };

        usersList.appendChild(row);
    }

    document.getElementById("progressBar").classList.add("is-hidden");
}


function setUserAvailableStyle() {
    let usernameInput = document.getElementById("edit-user-form")
        .querySelector('input[name="username"]');

    usernameInput.classList.remove("is-danger");
    usernameInput.classList.add("is-success");

    document.getElementById("username-available-icon").classList.remove("is-hidden");
    document.getElementById("username-wrong-icon").classList.add("is-hidden");

    document.getElementById("username-available-text").classList.remove("is-hidden");
    document.getElementById("username-wrong-text").classList.add("is-hidden");
}

function clearUserStyle() {
    let usernameInput = document.getElementById("edit-user-form")
        .querySelector('input[name="username"]');

    usernameInput.classList.remove("is-success");
    usernameInput.classList.remove("is-danger");

    document.getElementById("username-available-icon").classList.add("is-hidden");
    document.getElementById("username-wrong-icon").classList.add("is-hidden");

    document.getElementById("username-available-text").classList.add("is-hidden");
    document.getElementById("username-wrong-text").classList.add("is-hidden");
}

function setUserUnavailableStyle() {

    let usernameInput = document.getElementById("edit-user-form")
        .querySelector('input[name="username"]');

    usernameInput.classList.remove('is-success');
    usernameInput.classList.add('is-danger');



    document.getElementById("username-available-icon").classList.add("is-hidden");
    document.getElementById("username-wrong-icon").classList.remove("is-hidden");

    document.getElementById("username-available-text").classList.add("is-hidden");
    document.getElementById("username-wrong-text").classList.remove("is-hidden");
}

/**
 * Validates the register form and returns a user with the result if the form is valid.
 * @returns {Object} The data retrieved from the form.
 */

function formDiff() {

    let ret = {};

    let id = document.getElementById("edit-user-form").querySelector('input[name="id"]').value;
    if(id !== "") {
        ret.id = parseInt(id);
    }

    let username = document.getElementById("edit-user-form")
        .querySelector('input[name="username"]');

    let usernameIsValid = document.getElementById("edit-user-form")
        .querySelector('input[name="username"]')
        .classList.contains('is-success');

    console.log(usernameIsValid);
    console.log(username.value);

    if (usernameIsValid && username && username.value) {
        ret.username = username.value;
    } else {
        alert("El nombre de usuario no es válido");
        return null;
    }

    let password = document.getElementById("edit-user-form")
        .querySelector('input[name="password"]');

    if (password && password.value) {
        ret.password = password.value;
    }

    let name = document.getElementById("edit-user-form")
        .querySelector('input[name="name"]');

    if (name && name.value) {
        ret.name = name.value;
    }

    let email = document.getElementById("edit-user-form")
        .querySelector('input[name="email"]');

    if (email && email.value) {
        ret.email = email.value;
    }

    const birthElement = document.getElementById("edit-user-form")
        .querySelector('input[name="birth"]');
    let birth = null;
    if (birthElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        birth = birthElement.bulmaCalendar.value()
    }

    if (birth) {
        ret.birthDate = birth;
    }

    let active = document.getElementById("edit-user-form")
        .querySelector('input[name="active"]');

    if (active && active.checked) {
        ret.active = true;
    } else {
        ret.active = false;
    }

    let role = document.getElementById("edit-user-form")
        .querySelector('select[name="role"]');

    if (role && role.value) {
        ret.role = role.value;
    }

    return ret;

}


/**
 * Function to extract the values from the form and create a new user object on the server.
 * It validates the form before sending the request.
 * @returns {Promise<User|null>} A promise that resolves to the new user object if the user was created successfully. Otherwise, it resolves to null.
 */
async function createUser() {
    let form = document.getElementById("edit-user-form");
    let formData = new FormData(form);

    if (formData.get("username") === "" || formData.get("email") === "" || formData.get("password") === "" || formData.get("role") === "") {
        alert("Faltan campos  obligatorios");
        return null;
    } else {
        let user = formDiff()
        if (user) {
            let createdUser = await postUser(user);
            if (createdUser) {
                return createdUser;
            } else {
                alert("El usuario no se ha podido crear");
                return null;
            }
        }
    }
}

/**
 * Function to extract the values from the form and update the user object on the server.
 * It validates the form before sending the request.
 * @returns {Promise<User|null>} A promise that resolves to the updated user object if the user was updated successfully. Otherwise, it resolves to null.
 */
async function update() {
    let user = formDiff()
    if (user) {
        console.log(UserStore.getUser(user.id))
        user.etag = UserStore.getUser(user.id).user.eTag;
        let createdUser = await updateUser(user);
        if (createdUser) {
            return createdUser;
        } else {
            alert("El usuario no se ha podido crear");
            return null;
        }
    }

}

/**
 * Fills the edit modal with the data of the current user
 * @param {User} user the current user
 * @returns {Promise<void>} a promise that resolves when the modal is filled
 */
async function fillEditFormWithCurrentDetails(user) {
    let form = document.getElementById("edit-user-form");

    //Fill form with current data
    form.elements.namedItem("id").value = user.id;
    form.elements.namedItem("name").value = user.name;
    form.elements.namedItem("username").value = user.username;
    form.elements.namedItem("email").value = user.email;
    form.elements.namedItem("birth").value = user.birthDate;
    form.elements.namedItem("role").value = user.role();
    form.elements.namedItem("active").checked = user.active;

}

/**
 * Función que muestra el modal de edición
 */
export function openEditModal() {
    document.getElementById('edit-user-modal').classList.add('is-active');
}

/**
 * Función que oculta el modal de edición
 */
export function closeEditModal() {
    document.getElementById('edit-user-form').reset();
    document.getElementById('edit-user-modal').classList.remove('is-active');
}

const validateUsername = function (event){

    let userId = document.getElementById("edit-user-form")
        .querySelector('input[name="id"]');
    let etagedUser;
    if(userId.value !== ''){
        etagedUser = UserStore.getUser(parseInt(userId.value));
    }
    let username = event.target.value;
    if (username) {
        if (etagedUser && etagedUser.found && etagedUser.user.username === username) {
            setUserAvailableStyle()
        } else {
            let validate = usernameAvailable(username).then(function (available) {
                if (available) {
                    setUserAvailableStyle()
                } else {
                    setUserUnavailableStyle()
                }
            })
        }
    }
}
