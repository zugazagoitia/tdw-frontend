import {loadSession, updateProfile} from "../repositories/sessionRepository.js";

/**
 * Function to set up the edit profile modal
 * @returns {Promise<void>} A promise that resolves when the modal is set up
 */
export async function setUpProfileEditModal(){
    // noinspection JSUnresolvedFunction
    const calendars = bulmaCalendar.attach('[type="date"]', {
        type: 'date',
        dateFormat: 'yyyy-MM-dd',
        displayMode: 'inline',
    });

    document.getElementById('user-modal-close-button').onclick = function () {
        closeProfileModal();
    }

    document.getElementById('user-modal-cancel-button').onclick = function () {
        closeProfileModal();
    }

    document.getElementById('editProfileButton').onclick = function () {
        openProfileModal();
    }

    changeSubmitFunction(()=>{
        startSpinner();
        let user = parseForm();
        console.log(loadSession().user)
        user.eTag = loadSession().user.eTag;
        updateProfile(user).then((updated) => {
            if (updated) {
                console.log("Profile updated");
                window.location.reload();
            }
            console.log(updated)
            stopSpinner();
        });
        return false;
    })

    populateModal();
}

function parseForm(){

    let user = {};

    let id = document.getElementById("edit-user-form").querySelector('input[name="id"]').value;
    if(id !== "") {
        user.id = parseInt(id);
    }


    let password = document.getElementById("edit-user-form")
        .querySelector('input[name="password"]');

    if (password && password.value) {
        user.password = password.value;
    }

    let name = document.getElementById("edit-user-form")
        .querySelector('input[name="name"]');

    if (name && name.value) {
        user.name = name.value;
    }

    let email = document.getElementById("edit-user-form")
        .querySelector('input[name="email"]');

    if (email && email.value) {
        user.email = email.value;
    }

    const birthElement = document.getElementById("edit-user-form")
        .querySelector('input[name="birth"]');
    let birth = null;
    if (birthElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        birth = birthElement.bulmaCalendar.value()
    }

    if (birth) {
        user.birthDate = birth;
    }

    return user;

}

async function populateModal(){
    let user = loadSession().user;
    let form = document.getElementById("edit-user-form");

    //Fill form with current data
    form.elements.namedItem("id").value = user.id;
    form.elements.namedItem("registerDate").value = user.registerDate;
    form.elements.namedItem("name").value = user.name;
    form.elements.namedItem("username").value = user.username;
    form.elements.namedItem("email").value = user.email;
    form.elements.namedItem("birth").value = user.birthDate;
    form.elements.namedItem("role").value = user.role();
}

/**
 * Función que muestra el modal de edición
 */
function openProfileModal() {
    document.getElementById('edit-user-modal').classList.add('is-active');
}

/**
 * Función que oculta el modal de edición
 */
function closeProfileModal() {
    populateModal();
    document.getElementById('edit-user-modal').classList.remove('is-active');
}


/**
 * Función que cambia el comportamiento del botón de aceptar del modal de edición
 */
function changeSubmitFunction(functionToCall){
    document.getElementById('edit-user-form').onsubmit = functionToCall;
}

/**
 * Función que cambia el texto del botón a un spinner
 */
function startSpinner() {
    document.getElementById('user-modal-save-button').classList.add('is-loading');
}

/**
 * Función que cambia el texto del botón a un texto normal
 */
function stopSpinner() {
    document.getElementById('user-modal-save-button').classList.remove('is-loading');
}
