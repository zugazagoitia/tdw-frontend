/**
 * Configurar los botones de la página de detalles
 * @param session
 * @returns {Promise<void>}
 */
import {Entity, Person, Product} from "./model.js";
import {
    deleteDataElement, loadDataElementFromSessionStorage, loadEntities, loadPeople, loadProducts,
    removeDataElementFromSessionStorage,
    saveDataElementToSessionStorage, saveEntities, savePeople, saveProducts
} from "./dataRepository.js";
import {closeEditModal, openEditModal, populateFormLists, showEntityList, showPeopleList} from "./editModal.js";

export async function setupDetails(session) {

    document.getElementById('index-button').onclick = function () {
        removeDataElementFromSessionStorage().then(() => {
            window.location.href = "index.html";
        });
    };

    document.getElementById('editButton').onclick = function () {
        openEditModal();
    }

    document.getElementById('deleteButton').onclick = async function () {

        deleteDataElement(await loadDataElementFromSessionStorage()).then(() => {
            removeDataElementFromSessionStorage().then(() => {
                window.location.href = "index.html";
            });
        });
    }


    document.getElementById('modal-close-button').onclick = function () {
        closeEditModal();
    }

    document.getElementById('modal-cancel-button').onclick = function () {
        closeEditModal();
    }

    if (session.role() === 'writer') {
        showCrudButtons();
    }


}

/**
 * Renderizar la página de detalles
 * @returns {Promise<void>}
 */
export async function showDetails(dataElement) {

    let fun;
    switch (true) {
        case dataElement instanceof Entity:
            fun = saveEntity;
            showPeopleList();
            populateFormLists(loadPeople(), []);
            break;
        case dataElement instanceof Person:
            fun = savePerson;
            break;
        case dataElement instanceof Product:
            fun = saveProduct;
            showPeopleList();
            showEntityList();
            populateFormLists(loadPeople(), loadEntities());
            break;
    }

    document.getElementById('modal-save-button').onclick = function () {
        fun();
        closeEditModal();
    }

    fillEditFormWithCurrentDetails(dataElement);

    renderData(dataElement.name, dataElement.birth, dataElement.imgUrl);
    renderIframe(dataElement.wikiUrl);
    renderFooter(dataElement);

}

/**
 * Función para mostrar los datos del item
 * @param name
 * @param born
 * @param img
 */
function renderData(name, born, img) {
    let template = document.querySelector('#data-card-content-template');
    let clone = template.content.cloneNode(true);

    clone.querySelector('#card-data-name').textContent = name;
    clone.querySelector('#card-data-born').textContent = born;
    clone.querySelector('#card-data-img').src = img;

    document.getElementById('data-card-content').appendChild(clone);
}

/**
 * Función para mostrar el iframe con la wiki
 * @param url
 */
function renderIframe(url) {
    let template = document.querySelector('#iframe-container-template');
    let clone = template.content.cloneNode(true);

    clone.querySelector('#iframe-element').src = url;

    document.getElementById('iframe-container').appendChild(clone);
}


function renderFooter(element) {
    let template = document.querySelector('#footer-template');
    let clone = template.content.cloneNode(true);

    switch (true) {
        case element instanceof Product:
            for (let entity of element.entities) {
                clone.querySelector('.level-left').appendChild(
                    renderFooterItem(entity));
            }
        // Fall through intended

        case element instanceof Entity:
            for (let person of element.people) {
                clone.querySelector('.level-right').appendChild(
                    renderFooterItem(person));
            }
        // Fall through intended

        default:
            break;
        //no hacer nada
    }

    document.getElementById('footer-container').appendChild(clone);
}

function renderFooterItem(dataElement) {
    let template = document.querySelector('#footer-item-template');
    let clone = template.content.cloneNode(true);

    clone.querySelector('#footer-item-link').onclick = function () {
        saveDataElementToSessionStorage(dataElement).then(function () {
            window.location.replace('./details.html');
        });
    }
    clone.querySelector('#footer-item-image').src = dataElement.imgUrl;
    clone.querySelector('#footer-item-image').alt = dataElement.name;

    return clone;
}

/**
 * Función que muestra los botones de edición
 */
function showCrudButtons() {
    document.getElementById('crudMenu').classList.remove('is-hidden');
}


function savePerson() {
    let old = loadDataElementFromSessionStorage();

    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    //Validate form data
    if (formData.get("name") === "" || formData.get("birth") === ""  || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {
        let people = loadPeople();

        //remove old person from people
        let oldPerson = people.find(function (person) {
            return person.name === old.name;
        });
        people.splice(people.indexOf(oldPerson), 1);

        let person = new Person(formData.get("name"), formData.get("birth"), formData.get("death") || null, formData.get("imgUrl"), formData.get("wikiUrl"));

        people.push(person);
        savePeople(people);
        closeEditModal();
        form.reset();
        saveDataElementToSessionStorage(person).then(() => {
            location.reload();
        });
        return false;

    }
}

function saveEntity() {
    let old = loadDataElementFromSessionStorage();

    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    //Validate form data
    if (formData.get("name") === "" || formData.get("birth") === "" || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {
        let entities = loadEntities();
        //remove old entity from entities
        let oldEntity = entities.find(function (entity) {
            return entity.name === old.name;
        });
        entities.splice(entities.indexOf(oldEntity), 1);


        let people = [];
        let peopleNames = formData.getAll("people[]");
        //Get people matching this names
        let allPeople = loadPeople();
        for (let name of peopleNames) {
            let person = allPeople.find(p => p.name === name);
            if (person !== undefined) {
                people.push(person);
            }
        }

        let entity = new Entity(formData.get("name"), formData.get("birth"), formData.get("death") || null, formData.get("imgUrl"), formData.get("wikiUrl"), people);
        entities.push(entity);
        saveEntities(entities);
        closeEditModal();
        form.reset();
        saveDataElementToSessionStorage(entity).then(() => {
            location.reload();
        });
        return false;

    }
}

function saveProduct() {
    let old = loadDataElementFromSessionStorage();

    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    //Validate form data
    if (formData.get("name") === "" || formData.get("birth") === "" || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {
        let products = loadProducts();
        //remove old product from products
        let oldProduct = products.find(function (product) {
            return product.name === old.name;
        });
        products.splice(products.indexOf(oldProduct), 1);

        let people = [];
        let peopleNames = formData.getAll("people[]");
        //Get people matching this names
        let allPeople = loadPeople();
        for (let name of peopleNames) {
            let person = allPeople.find(p => p.name === name);
            if (person !== undefined) {
                people.push(person);
            }
        }

        let entities = [];
        let entitiesNames = formData.getAll("entities[]");
        //Get entities matching this names
        let allEntities = loadEntities();
        for (let name of entitiesNames) {
            let entity = allEntities.find(e => e.name === name);
            if (entity !== undefined) {
                entities.push(entity);
            }
        }

        let product = new Product(formData.get("name"), formData.get("birth"), formData.get("death") || null, formData.get("imgUrl"), formData.get("wikiUrl"), people, entities);
        products.push(product);
        saveProducts(products);
        closeEditModal();
        form.reset();
        saveDataElementToSessionStorage(product).then(() => {
            location.reload();
        });
        return false;

    }
}

async function fillEditFormWithCurrentDetails(dataElement){
    let form = document.getElementById("edit-data-form");

    //Fill form with current data
    form.elements.namedItem("name").value = dataElement.name;
    form.elements.namedItem("birth").value = dataElement.birth;
    form.elements.namedItem("death").value = dataElement.death;
    form.elements.namedItem("imgUrl").value = dataElement.imgUrl;
    form.elements.namedItem("wikiUrl").value = dataElement.wikiUrl;

    let people = dataElement.people;
    if(people){
        let options = form.querySelector("#peopleList").children;
        for(let option of options){
            if(people.find(p => p.name === option.value)){
                option.selected = true;
            }
        }
    }

    let entities = dataElement.entities;
    if(entities){
        let options = form.querySelector("#entityList").children;
        for(let option of options){
            if(entities.find(e => e.name === option.value)){
                option.selected = true;
            }
        }
    }
}
