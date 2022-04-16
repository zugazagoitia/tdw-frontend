import {
    deleteDataElement,
    loadEntities,
    loadPeople, loadProducts,
    saveDataElementToSessionStorage, saveEntities,
    savePeople, saveProducts
} from "./dataRepository.js";
import {
    changeSubmitFunction,
    closeEditModal, hidePeopleAndEntityList,
    openEditModal,
    populateFormLists,
    showEntityList,
    showPeopleList
} from "./editModal.js";
import {Entity, Person, Product} from "./model.js";


export async function setUpIndex() {

    document.getElementById("addEntityButton").onclick = function () {
        changeSubmitFunction(saveEntity);
        showPeopleList();
        openEditModal();
    }

    document.getElementById("addPersonButton").onclick = function () {

        changeSubmitFunction(savePerson);
        openEditModal();
    }

    document.getElementById("addProductButton").onclick = function () {
        changeSubmitFunction(saveProduct)
        showPeopleList();
        showEntityList();
        openEditModal();
    }

    document.getElementById('modal-close-button').onclick = function () {
        closeEditModal();
        hidePeopleAndEntityList();

    }

    document.getElementById('modal-cancel-button').onclick = function () {
        closeEditModal();
        hidePeopleAndEntityList();
    }

}

export async function showIndex(products, entities, people, session) {

    let deleteButton = false;
    if (session.role() === 'writer') {
        deleteButton = true;
        populateFormLists(people, entities);
        document.getElementById('add-items-section').classList.remove('is-hidden');
    }

    if ('content' in document.createElement('template')) {
        let entityCol = document.querySelector('#entityCol');
        let productCol = document.querySelector('#productCol');
        let personCol = document.querySelector('#personCol');

        if (typeof products !== 'undefined' && products !== null && products.length > 0) {
            showColumn(products, productCol, deleteButton);
        }

        if (typeof entities !== 'undefined' && entities !== null && entities.length > 0) {
            showColumn(entities, entityCol, deleteButton);
        }

        if (typeof people !== 'undefined' && people !== null && people.length > 0) {
            showColumn(people, personCol, deleteButton);
        }

    } else alert("La página no se puede mostrar! El navegador no soporta Templates.");


}

async function showColumn(dataElements, column, deleteButton = false) {

    let template = document.querySelector('#cardRow');
    for (let row of dataElements) {
        let clone = template.content.cloneNode(true);
        clone.querySelector('#card-name').textContent = row.name;
        clone.querySelector('#card-img').src = row.imgUrl;
        if (deleteButton) {
            clone.querySelector('#card-delete').classList.remove('is-hidden')

            clone.querySelector('#card-delete-button').addEventListener('click', () => {
                deleteDataElement(row).then(() => {
                    location.reload();
                });
            });
        }

        clone.querySelector('#card-link').onclick = () => {
            saveDataElementToSessionStorage(row).then(() => {
                window.location.href = './details.html';
            });
        }
        column.appendChild(clone);
    }

}



function savePerson() {
    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    //Validate form data
    if (formData.get("name") === "" || formData.get("birth") === "" || formData.get("death") === "" || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {
        let people = loadPeople();
        //Check if person already exists by name
        let person = people.find(p => p.name === formData.get("name"));
        if (person !== undefined) {
            alert("Ya existe una persona con ese nombre");
            return false;
        } else {
            let person = new Person(formData.get("name"), formData.get("birth"), formData.get("death"), formData.get("imgUrl"), formData.get("wikiUrl"));
            people.push(person);
            savePeople(people);
            closeEditModal();
            form.reset();
            location.reload();
            return false;
        }
    }
}

function saveEntity() {
    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    //Validate form data
    if (formData.get("name") === "" || formData.get("birth") === "" || formData.get("death") === "" || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {
        let entities = loadEntities();
        //Check if entity already exists by name
        let entity = entities.find(e => e.name === formData.get("name"));
        if (entity !== undefined) {
            alert("Ya existe una entidad con ese nombre");
            return false;
        } else {
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

            let entity = new Entity(formData.get("name"), formData.get("birth"), formData.get("death"), formData.get("imgUrl"), formData.get("wikiUrl"),people);
            entities.push(entity);
            saveEntities(entities);
            closeEditModal();
            form.reset();
            location.reload();
            return false;
        }
    }
}

function saveProduct() {
    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    //Validate form data
    if (formData.get("name") === "" || formData.get("birth") === "" || formData.get("death") === "" || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {
        let products = loadProducts();
        //Check if product already exists by name
        let product = products.find(p => p.name === formData.get("name"));
        if (product !== undefined) {
            alert("Ya existe un producto con ese nombre");
            return false;
        } else {
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

            let entity = new Product(formData.get("name"), formData.get("birth"), formData.get("death"), formData.get("imgUrl"), formData.get("wikiUrl"),people,entities);
            products.push(entity);
            saveProducts(products);
            closeEditModal();
            form.reset();
            location.reload();
            return false;
        }
    }
}
