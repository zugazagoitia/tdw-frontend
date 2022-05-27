import {
    changeSubmitButtonToSpinner, changeSubmitButtonToText,
    changeSubmitFunction,
    closeEditModal,
    hidePeopleAndEntityList,
    openEditModal,
    setupEditModal,
    showEntityList,
    showPeopleList
} from "../components/editDataElementModal.js";
import {Entity, Person, Product} from "../model.js";
import {
    addEntityToProduct,
    addPersonToProduct, createProduct,
    deleteProduct, getProduct,
    loadProducts, productExistsByName
} from "../repositories/productRepository.js";
import {
    addPersonToEntity, addProductToEntity, createEntity,
    deleteEntity,
    entityExistsbyName,
    getEntity,
    loadEntities
} from "../repositories/entityRepository.js";
import {
    addEntityToPerson,
    addProductToPerson,
    createPerson,
    deletePerson,
    personExistsByName
} from "../repositories/personRepository.js";
import {GlobalEntityStore, GlobalPersonStore, GlobalProductStore, loadData} from "../stores.js";
import {loadSession, saveSession} from "../repositories/sessionRepository.js";
import {setUpRegisterForm} from "../components/registerForm.js";
import {setUpProfileEditModal} from "../components/editProfileModal.js";

/**
 * Function to set up the data needed for the index page.
 * @returns {Promise<void>} A promise that resolves when the data is loaded.
 */
export async function setUpIndex() {

    // If the user is logged in, hide the hero.
    if (loadSession().role !== 'user') {
        document.getElementById('headerAnales').classList.add('is-hidden');
        document.getElementById('columns-section').classList.remove('is-hidden');
        await loadData();
        setUpProfileEditModal();
        showIndex();
    } else {
        setUpRegisterForm();
    }

}


/**
 * Render the index page for logged in users.
 * @returns {Promise<void>}
 */
export async function showIndex() {

    let session = loadSession();

    let products = GlobalProductStore.getProducts();
    let people = GlobalPersonStore.getPersons();
    let entities = GlobalEntityStore.getEntitys();

    let productCol = document.querySelector('#productCol');
    let personCol = document.querySelector('#personCol');
    let entityCol = document.querySelector('#entityCol');

    clearColumn(productCol);
    clearColumn(personCol);
    clearColumn(entityCol);

    let deleteButton = false;

    if (session.role === 'writer') {
        deleteButton = true;
        setupEditModal(people, entities, products);

        document.getElementById('add-items-section').classList.remove('is-hidden');

        document.getElementById("addEntityButton").onclick = function () {
            changeSubmitFunction(() => {
                saveEntity();
                return false;
            });
            showPeopleList();
            openEditModal();
        }

        document.getElementById("addPersonButton").onclick = function () {

            changeSubmitFunction(() => {
                savePerson();
                return false;
            });
            openEditModal();
        }

        document.getElementById("addProductButton").onclick = function () {
            changeSubmitFunction(() => {
                saveProduct();
                return false;
            });
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

    if ('content' in document.createElement('template')) {
        //Load product list and render it
        renderColumn(products, productCol, deleteButton);

        //Load person list and render it
        renderColumn(people, personCol, deleteButton);

        //Load entity list and render it
        renderColumn(entities, entityCol, deleteButton);

    } else alert("La página no se puede mostrar! El navegador no soporta Templates.");


}

/**
 * Function to render a given column with a given list of objects
 * @param {DataElement[]} dataElements list List of objects to render
 * @param {HTMLElement} col Column to render
 * @param {boolean} deleteButton Whether to render a delete button or not
 * @returns {Promise<void>}
 */
function renderColumn(dataElements, column, deleteButton) {
    if (typeof dataElements !== 'undefined' && dataElements !== null && dataElements.length > 0) {
        column.querySelector("progress").classList.remove('is-hidden');
        renderRows(dataElements, column, deleteButton).then(() => {
            column.querySelector("progress").classList.add('is-hidden');
        });
        column.querySelector("#emptyColItem").classList.add("is-hidden");

    } else {
        column.querySelector("#emptyColItem").classList.remove("is-hidden");
        column.querySelector("progress").classList.add("is-hidden");
    }
}


/**
 * Clear the content of a given column without removing the progress bar and the empty message
 * @param {HTMLElement} col Column to clear
 */
function clearColumn(col) {

    //Remove all children except the progress bar and the empty message
    while (col.lastChild.id !== 'emptyColItem' && col.lastChild.id !== 'progress') {
        col.removeChild(col.lastChild);
    }

}

/**
 * Render a column with the given list of items
 * @param {DataElement[]} dataElements List of items to render
 * @param column The identifier of the column to render
 * @param deleteButton If true, the items in the column will have a delete button
 */
async function renderRows(dataElements, column, deleteButton = false) {


    let template = document.querySelector('#cardRow');
    for (let row of dataElements) {
        let clone = template.content.cloneNode(true);
        clone.querySelector('#card-name').textContent = row.name;
        clone.querySelector('#card-img').src = row.imageUrl;
        if (deleteButton) {
            clone.querySelector('#card-delete').classList.remove('is-hidden')

            clone.querySelector('#card-delete-button').addEventListener('click', (event) => {

                let confirmDelete = confirm("¿Estás seguro de que quieres eliminar este elemento?");
                if (confirmDelete) {
                    event.path[0].classList.add("is-loading");
                    deleteDataElement(row).then(() => {
                        showIndex();
                    });
                }
            });
        }

        clone.querySelector('#card-link').onclick = () => {
            let type;

            switch (true) {
                case row instanceof Product:
                    type = 'product';
                    break;
                case row instanceof Person:
                    type = 'person';
                    break;
                case row instanceof Entity:
                    type = 'entity';
                    break;
                default:
                    throw new Error("Invalid type");
            }
            window.location.href = "./details.html?id=" + row.id + "&type=" + type;
        }
        column.appendChild(clone);
    }
}




/**
 * Function to create a new {Person} from the form, add it to the server, list and render it
 * @returns {Promise<boolean>} Promise that resolves to true if the person was added successfully
 */
async function savePerson() {
    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    const birthElement = form.querySelector('[name="birth"]');
    const deathElement = form.querySelector('[name="death"]');

    let birth = null;
    if (birthElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        birth = birthElement.bulmaCalendar.value()
    }

    let death = null;
    if (deathElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        death = deathElement.bulmaCalendar.value()
    }

    //Validate form data
    if (formData.get("name") === "" || birth == null || death == null || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {

        changeSubmitButtonToSpinner();
        //Check if person already exists by name
        let exists = await personExistsByName(formData.get("name"));

        if (exists) {
            alert("Ya existe una persona con ese nombre");
            changeSubmitButtonToText();
            return false;
        } else {
            let person = new Person(null, formData.get("name"), formData.get("birth"), formData.get("death"), formData.get("imgUrl"), formData.get("wikiUrl"));

            //Save person to database
            let created = await createPerson(person);
            if (created === null) {
                alert("Error al crear la persona");
                changeSubmitButtonToText();
                return false;
            } else {
                alert("Persona creada correctamente");
                GlobalPersonStore.putPerson(created);
                closeEditModal();
                form.reset();
                showIndex();
                changeSubmitButtonToText();
                return true;
            }
        }
    }
}

/**
 * Function to create a new {Entity} from the form, add it to the server, list and render it
 * @returns {Promise<boolean>} Promise that resolves to true if the entity was added successfully
 */
async function saveEntity() {
    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    const birthElement = form.querySelector('[name="birth"]');
    const deathElement = form.querySelector('[name="death"]');

    let birth = null;
    if (birthElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        birth = birthElement.bulmaCalendar.value()
    }

    let death = null;
    if (deathElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        death = deathElement.bulmaCalendar.value()
    }

    //Validate form data
    if (formData.get("name") === "" || birth == null || death == null || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {

        changeSubmitButtonToSpinner();
        //Check if entity already exists by name
        let exists = await entityExistsbyName(formData.get("name"));


        if (exists) {
            alert("Ya existe una entidad con ese nombre");
            changeSubmitButtonToText();
            return false;
        } else {
            let people = formData.getAll("people[]");

            let entity = new Entity(null, formData.get("name"), formData.get("birth"), formData.get("death"), formData.get("imgUrl"), formData.get("wikiUrl"), null);

            //Save entity to database
            let created = await createEntity(entity);
            if (created === null) {
                alert("Error al crear la entidad");
                changeSubmitButtonToText();
                return false;
            } else {
                let promises = [];
                for (const person of people) {
                    promises.push(addPersonToEntity(created.id, person));
                }
                try {
                    await Promise.all(promises);
                } catch (e) {
                    alert("Error al crear la entidad");
                    throw e;
                }

                created = await getEntity(created.id);
                alert("Entidad creada correctamente");
                GlobalEntityStore.putEntity(created);
                closeEditModal();
                form.reset();
                showIndex();
                changeSubmitButtonToText();
                return true;
            }

        }

    }
}

/**
 * Function to create a new {Product} from the form, add it to the server, list and render it
 * @returns {Promise<boolean>} Promise that resolves to true if the product was added successfully
 */
async function saveProduct() {
    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    const birthElement = form.querySelector('[name="birth"]');
    const deathElement = form.querySelector('[name="death"]');

    let birth = null;
    if (birthElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        birth = birthElement.bulmaCalendar.value()
    }

    let death = null;
    if (deathElement) {
        // bulmaCalendar instance is available as element.bulmaCalendar
        death = deathElement.bulmaCalendar.value()
    }


    //Validate form data
    if (formData.get("name") === "" || birth == null || death == null || formData.get("imgUrl") === "" || formData.get("wikiUrl") === "") {
        alert("Por favor, rellene todos los campos");
        return false;
    } else {

        changeSubmitButtonToSpinner();
        //Check if entity already exists by name
        let exists = await productExistsByName(formData.get("name"));

        if (exists) {
            alert("Ya existe un producto con ese nombre");
            changeSubmitButtonToText();
            return false;
        } else {
            let people = formData.getAll("people[]");
            let entities = formData.getAll("entities[]");

            let product = new Product(null, formData.get("name"), formData.get("birth"), formData.get("death"), formData.get("imgUrl"), formData.get("wikiUrl"), null);

            //Save product to database
            let created = await createProduct(product);
            if (created === null) {
                alert("Error al crear el producto");
                changeSubmitButtonToText();
                return false;
            } else {
                let promises = [];
                for (const person of people) {
                    promises.push(addPersonToProduct(created.id, person));
                }
                for (const entity of entities) {
                    promises.push(addEntityToProduct(created.id, entity));
                }
                try {
                    await Promise.all(promises);
                } catch (e) {
                    alert("Error al crear el producto");
                    throw e;
                }

                created = await getProduct(created.id);
                alert("Producto creado correctamente");
                GlobalProductStore.putProduct(created);
                closeEditModal();
                form.reset();
                showIndex();
                changeSubmitButtonToText();
                return true;
            }


        }

    }
}

/**
 * Deletes any type of dataElement from the repository and state
 * @param {DataElement} dataElement The dataElement to delete
 * @returns {Promise<void>} A promise that resolves when the function is done
 */
async function deleteDataElement(dataElement) {

    let result;
    if (dataElement instanceof Entity) {
        result = await deleteEntity(dataElement);
        if (result) {
            GlobalEntityStore.deleteEntity(dataElement)
        } else {
            alert("Error al eliminar la entidad");
        }
    } else if (dataElement instanceof Product) {
        result = await deleteProduct(dataElement);
        if (result) {
            GlobalProductStore.deleteProduct(dataElement)
        } else {
            alert("Error al eliminar el producto");
        }
    } else if (dataElement instanceof Person) {
        result = await deletePerson(dataElement);
        if (result) {
            GlobalPersonStore.deletePerson(dataElement)
        } else {
            alert("Error al eliminar la persona");
        }
    } else {
        console.log(dataElement);
        throw new Error("Data element not supported");
    }
}