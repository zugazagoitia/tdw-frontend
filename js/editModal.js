export async function populateFormLists(people,entities){

    let peopleList = document.getElementById('peopleList');
    let entityList = document.getElementById('entityList');

    for(let person of people){
        let option = document.createElement('option');
        option.value = person.name;
        option.textContent = person.name;
        peopleList.appendChild(option);
    }
    peopleList.size=people.length;

    for(let entity of entities){
        let option = document.createElement('option');
        option.value = entity.name;
        option.textContent = entity.name;
        entityList.appendChild(option);
    }
    entityList.size=entities.length;

}



/**
 * Muestra el campo de selección de personas en el formulario de edición
 * @returns {Promise<void>}
 */
export async function showPeopleList(){
    document.getElementById('peopleListBox').classList.remove('is-hidden');
}

/**
 * Muestra el campo de selección de entidades en el formulario de edición
 * @returns {Promise<void>}
 */
export async function showEntityList(){
    document.getElementById('entityListBox').classList.remove('is-hidden');
}

/**
 * Oculta el campo de selección de personas y entidades en el formulario de edición
 * @returns {Promise<void>}
 */
export async function hidePeopleAndEntityList(){
    document.getElementById('peopleListBox').classList.add('is-hidden');
    document.getElementById('entityListBox').classList.add('is-hidden');
}

/**
 * Función que muestra el modal de edición
 */
export function openEditModal() {
    document.getElementById('edit-data-modal').classList.add('is-active');
}

/**
 * Función que oculta el modal de edición
 */
export function closeEditModal() {
    document.getElementById('edit-data-modal').classList.remove('is-active');
}


/**
 * Función que cambia el comportamiento del botón de aceptar del modal de edición
 */
export function changeSubmitFunction(functionToCall){
    document.getElementById('edit-data-form').onsubmit = functionToCall;
}

