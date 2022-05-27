
/**
 * Populate the edit modal with the data from the model and set up minor stuff
 * @param people A list of people to populate the dropdown
 * @param entities A list of entities to populate the dropdown
 * @returns {Promise<void>} A promise that resolves when the modal is ready
 */
export async function setupEditModal(people, entities, products){


    const calendars = bulmaCalendar.attach('[type="date"]', {
        type: 'date',
        dateFormat: 'yyyy-MM-dd'
    });

    let peopleList = document.getElementById('peopleList');
    let entityList = document.getElementById('entityList');
    let productList = document.getElementById('productList');

    peopleList.innerHTML = '';
    entityList.innerHTML = '';
    productList.innerHTML = '';

    for(let person of people){
        let option = document.createElement('option');
        option.value = person.id;
        option.textContent = person.name;
        peopleList.appendChild(option);
    }
    peopleList.size=people.length;

    for(let entity of entities){
        let option = document.createElement('option');
        option.value = entity.id;
        option.textContent = entity.name;
        entityList.appendChild(option);
    }
    entityList.size=entities.length;

    for(let product of products){
        let option = document.createElement('option');
        option.value = product.id;
        option.textContent = product.name;
        productList.appendChild(option);
    }
    productList.size=products.length;

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
 * Muestra el campo de selección de productos en el formulario de edición
 * @returns {Promise<void>}
 */
export async function showProductList(){
    document.getElementById('productListBox').classList.remove('is-hidden');
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

/**
 * Función que cambia el texto del botón a un spinner
 */
export function changeSubmitButtonToSpinner() {
    document.getElementById('modal-save-button').classList.add('is-loading');
}

/**
 * Función que cambia el texto del botón a un texto normal
 */
export function changeSubmitButtonToText() {
    document.getElementById('modal-save-button').classList.remove('is-loading');
}
