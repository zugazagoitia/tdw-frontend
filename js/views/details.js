import {Entity, Person, Product} from "../model.js";
import {
    addEntityToProduct,
    addPersonToProduct,
    deleteProduct,
    getProduct,
    removeEntityFromProduct, removePersonFromProduct, updateProduct,

} from "../repositories/productRepository.js";
import {
    closeEditModal,
    openEditModal,
    setupEditModal,
    showEntityList,
    showPeopleList,
    showProductList
} from "../components/editDataElementModal.js";
import {
    addPersonToEntity,
    addProductToEntity,
    deleteEntity,
    getEntity,
    removePersonFromEntity,
    removeProductFromEntity, updateEntity
} from "../repositories/entityRepository.js";
import {GlobalEntityStore, GlobalPersonStore, GlobalProductStore, loadData} from "../stores.js";
import {
    addEntityToPerson,
    addProductToPerson,
    deletePerson,
    getPerson, removeEntityFromPerson,
    removeProductFromPerson,
    updatePerson
} from "../repositories/personRepository.js";

/**
 * Configure the details view buttons.
 * @param session User session.
 * @returns {Promise<void>} Promise that resolves when the buttons are configured.
 */
export async function setupDetails(session) {

    document.getElementById('index-button').onclick = function () {
        window.location.href = "index.html";
    };

    document.getElementById('editButton').onclick = function () {
        openEditModal();
    }

    document.getElementById('deleteButton').onclick = async function () {

        document.getElementById('deleteButton').classList.add('is-loading');

        await deleteElement();

        window.location.href = "index.html";
    }


    document.getElementById('modal-close-button').onclick = function () {
        closeEditModal();
    }

    document.getElementById('modal-cancel-button').onclick = function () {
        closeEditModal();
    }

    if (session.role === 'writer') {
        showCrudButtons();
    }


}

/**
 * Render the details view.
 * @param dataElement Data element to render.
 * @returns {Promise<void>} Promise that resolves when the view is rendered.
 */
export async function showDetails(dataElement) {

    loadData().then(() => {
        setupEditModal(GlobalPersonStore.getPersons(), GlobalEntityStore.getEntitys(), GlobalProductStore.getProducts()).then(() => {
            fillEditFormWithCurrentDetails(dataElement);
        });
        renderFooter(dataElement);
    })

    let fun;
    switch (true) {
        case dataElement instanceof Entity:
            fun = saveEntity;
            showPeopleList();
            showProductList();
            break;
        case dataElement instanceof Person:
            fun = savePerson;
            showEntityList();
            showProductList();
            break;
        case dataElement instanceof Product:
            fun = saveProduct;
            showPeopleList();
            showEntityList();
            break;
    }

    document.getElementById('edit-data-form').onsubmit = function () {
        document.getElementById('modal-save-button').classList.add('is-loading');
        fun();
        return false;
    }


    renderData(dataElement.name, dataElement.birthDate, dataElement.imageUrl);
    renderIframe(dataElement.wikiUrl);

    document.getElementById('progressBar').classList.add('is-hidden');
    document.getElementById('itemContainer').classList.remove('is-hidden');

}

/**
 * Function to render the data of the element.
 * @param name Name of the element.
 * @param born Date of birth of the element.
 * @param img Image of the element.
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
 * Function to render the iframe of the element.
 * @param url Url of the element.
 */
function renderIframe(url) {
    let template = document.querySelector('#iframe-container-template');
    let clone = template.content.cloneNode(true);

    clone.querySelector('#iframe-element').src = url;

    document.getElementById('iframe-container').appendChild(clone);
}

/**
 * Function to render the footer of the page.
 * @param element
 */
function renderFooter(element) {
    let template = document.querySelector('#footer-template');
    let clone = template.content.cloneNode(true);

    let leftItems = [];
    let rightItems = [];
    switch (true) {
        case element instanceof Product:
            //Check that the lists are not null or undefined
            if (element.people !== null && element.people !== undefined) {
                for (const id of element.people) {
                    rightItems.push(GlobalPersonStore.getPerson(id).person);
                }
            }
            if (element.entities !== null && element.entities !== undefined) {
                for (const id of element.entities) {
                    leftItems.push(GlobalEntityStore.getEntity(id).entity);
                }
            }
            break;

        case element instanceof Entity:
            if (element.people !== null && element.people !== undefined) {
                for (const id of element.people) {
                    rightItems.push(GlobalPersonStore.getPerson(id).person);
                }
            }
            if (element.products !== null && element.products !== undefined) {
                for (const id of element.products) {
                    leftItems.push(GlobalProductStore.getProduct(id).product);
                }
            }
            break;

        case element instanceof Person:
            if (element.entities !== null && element.entities !== undefined) {
                for (const id of element.entities) {
                    leftItems.push(GlobalEntityStore.getEntity(id).entity);
                }
            }
            if (element.products !== null && element.products !== undefined) {
                for (const id of element.products) {
                    rightItems.push(GlobalProductStore.getProduct(id).product);
                }
            }
            break;

        default:
            throw new Error('Unknown type');
    }

    for (let item of leftItems) {
        clone.querySelector('.level-left').appendChild(
            renderFooterItem(item));
    }
    for (let item of rightItems) {
        clone.querySelector('.level-right').appendChild(
            renderFooterItem(item));
    }

    document.getElementById('footer-container').appendChild(clone);
}

/**
 * Function to render each footer item.
 * @param dataElement Data element to render.
 * @returns {Node} Node of the footer item.
 */
function renderFooterItem(dataElement) {

    let template = document.querySelector('#footer-item-template');
    let clone = template.content.cloneNode(true);

    let id = dataElement.id;
    let type;

    switch (true) {
        case dataElement instanceof Product:
            type = 'product';
            break;
        case dataElement instanceof Person:
            type = 'person';
            break;
        case dataElement instanceof Entity:
            type = 'entity';
            break;
        default:
            throw new Error("Invalid type");
    }

    clone.querySelector('#footer-item-link').href = "./details.html?id=" + id + "&type=" + type;
    clone.querySelector('#footer-item-image').src = dataElement.imageUrl;
    clone.querySelector('#footer-item-image').alt = dataElement.name;

    return clone;
}

/**
 * Function to show the edit functionality.
 */
function showCrudButtons() {
    document.getElementById('crudMenu').classList.remove('is-hidden');
}

/**
 * Function to retrieve the current element from the server
 * @returns {Promise<Product|Entity|Person>} A promise with the current element
 */
async function getCurrentElement() {
    const querystring = window.location.search;
    const params = new URLSearchParams(querystring);

    let type = params.get("type");
    let id = parseInt(params.get("id"));

    if (id) {
        switch (type) {
            case "product":
                return await getProduct(id);
            case "entity":
                return await getEntity(id);
            case "person":
                return await getPerson(id);
            default:
                throw new Error("Invalid type");
        }
    }
}

/**
 * Function to delete the current element from the server
 * @returns {Promise<void>} Promise that resolves when the element is deleted
 */
async function deleteElement() {

    let element = await getCurrentElement();

    if (element) {
        switch (true) {
            case element instanceof Product:
                await deleteProduct(element);
                break;
            case element instanceof Person:
                await deletePerson(element);
                break;
            case element instanceof Entity:
                await deleteEntity(element);
                break;
            default:
                throw new Error("Invalid type");
        }
    }

}

/**
 * Function to update a person in the server using the form data
 * @returns {Promise<boolean>} Promise that resolves to true if the update was successful
 */
async function savePerson() {

    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);


    let person = await getCurrentElement();


    if (formData.get("birth")) {
        person.birthDate = formData.get("birth");
    }
    if (formData.get("death")) {
        person.deathDate = formData.get("death");
    }
    if (formData.get("imgUrl")) {
        person.imageUrl = formData.get("imgUrl");
    }
    if (formData.get("wikiUrl")) {
        person.wikiUrl = formData.get("wikiUrl");
    }

    let products = formData.getAll("products[]").map(id => parseInt(id.toString()));

    if (products === null || products === undefined) {
        products = [];
    }
    if (person.products === null || person.products === undefined) {
        person.products = [];
    }
    let newProducts = products.filter(id => !person.products.includes(id));
    let oldProducts = person.products.filter(id => !products.includes(id));

    let entities = formData.getAll("entities[]").map(id => parseInt(id.toString()));

    if (entities === null || entities === undefined) {
        entities = [];
    }
    if (person.entities === null || person.entities === undefined) {
        person.entities = [];
    }
    let newEntities = entities.filter(id => !person.entities.includes(id));
    let oldEntities = person.entities.filter(id => !entities.includes(id));

    let updatedPerson = await updatePerson(person);

    if (updatedPerson) {
        let promises = [];
        for (const id of newProducts) {
            promises.push(addProductToPerson(person.id, id));
        }
        for (const id of oldProducts) {
            promises.push(removeProductFromPerson(person.id, id));
        }
        for (const id of newEntities) {
            promises.push(addEntityToPerson(person.id, id));
        }
        for (const id of oldEntities) {
            promises.push(removeEntityFromPerson(person.id, id));
        }

        try {
            await Promise.all(promises);
            closeEditModal();
            form.reset();
            location.reload();
            return false;
        } catch (e) {
            alert("Error while saving");
            throw new Error("Error updating person");
        }

    } else {
        alert("Error while saving");
        throw new Error("Error updating person");
    }


}

/**
 * Function to update a product in the server using the form data
 * @returns {Promise<boolean>} Promise that resolves to true if the update was successful
 */
async function saveEntity() {

    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    let entity = await getCurrentElement();

    if (formData.get("birth")) {
        entity.birthDate = formData.get("birth");
    }
    if (formData.get("death")) {
        entity.deathDate = formData.get("death");
    }
    if (formData.get("imgUrl")) {
        entity.imageUrl = formData.get("imgUrl");
    }
    if (formData.get("wikiUrl")) {
        entity.wikiUrl = formData.get("wikiUrl");
    }

    let products = formData.getAll("products[]").map(id => parseInt(id.toString()));

    if (products === null || products === undefined) {
        products = [];
    }

    if (entity.products === null || entity.products === undefined) {
        entity.products = [];
    }
    let newProducts = products.filter(id => !entity.products.includes(id));
    let oldProducts = entity.products.filter(id => !products.includes(id));

    let persons = formData.getAll("persons[]").map(id => parseInt(id.toString()));

    if (persons === null || persons === undefined) {
        persons = [];
    }
    if (entity.persons === null || entity.persons === undefined) {
        entity.persons = [];
    }
    let newPersons = persons.filter(id => !entity.persons.includes(id));
    let oldPersons = entity.persons.filter(id => !persons.includes(id));

    let updatedEntity = await updateEntity(entity);

    if (updatedEntity) {
        let promises = [];
        for (const id of newProducts) {
            promises.push(addProductToEntity(entity.id, id));
        }
        for (const id of oldProducts) {
            promises.push(removeProductFromEntity(entity.id, id));
        }
        for (const id of newPersons) {
            promises.push(addPersonToEntity(entity.id, id));
        }
        for (const id of oldPersons) {
            promises.push(removePersonFromEntity(entity.id, id));
        }

        try {
            await Promise.all(promises);
            closeEditModal();
            form.reset();
            location.reload();
            return false;
        } catch (e) {
            alert("Error while saving");
            throw new Error("Error updating entity");
        }

    } else {
        alert("Error while saving");
        throw new Error("Error updating entity");
    }


}

/**
 * Function to update an entity in the server using the form data
 * @returns {Promise<boolean>} Promise that resolves to true if the update was successful
 */
async function saveProduct() {

    let form = document.getElementById("edit-data-form");
    let formData = new FormData(form);

    let product = await getCurrentElement();

    console.log(product);
    if (formData.get("birth")) {
        product.birthDate = formData.get("birth");
    }
    if (formData.get("death")) {
        product.deathDate = formData.get("death");
    }
    if (formData.get("imgUrl")) {
        product.imageUrl = formData.get("imgUrl");
    }
    if (formData.get("wikiUrl")) {
        product.wikiUrl = formData.get("wikiUrl");
    }

    let persons = formData.getAll("people[]").map(id => parseInt(id.toString()));

    if (persons === null || persons === undefined) {
        persons = [];
    }
    if (product.people === null || product.people === undefined) {
        product.people = [];
    }
    let newPersons = persons.filter(id => !product.people.includes(id));
    let oldPersons = product.people.filter(id => !persons.includes(id));

    let entities = formData.getAll("entities[]").map(id => parseInt(id.toString()));

    if (entities === null || entities === undefined) {
        entities = [];
    }
    if (product.entities === null || product.entities === undefined) {
        product.entities = [];
    }
    let newEntities = entities.filter(id => !product.entities.includes(id));
    let oldEntities = product.entities.filter(id => !entities.includes(id));

    let updatedProduct = await updateProduct(product);

    if(updatedProduct) {
        let promises = [];
        for (const id of newPersons) {
            promises.push(addPersonToProduct(product.id, id));
        }
        for (const id of oldPersons) {
            promises.push(removePersonFromProduct(product.id, id));
        }
        for (const id of newEntities) {
            promises.push(addEntityToProduct(product.id, id));
        }
        for (const id of oldEntities) {
            promises.push(removeEntityFromProduct(product.id, id));
        }

        try {
            await Promise.all(promises);
            closeEditModal();
            form.reset();
            location.reload();
            return false;
        } catch (e) {
            alert("Error while saving");
            throw new Error("Error updating product");
        }
    } else {
        alert("Error while saving");
        throw new Error("Error updating product");
    }

}

/**
 * Fills the edit modal with the data of the current element
 * @param dataElement the current element
 * @returns {Promise<void>} a promise that resolves when the modal is filled
 */
async function fillEditFormWithCurrentDetails(dataElement) {
    let form = document.getElementById("edit-data-form");

    //Fill form with current data
    form.elements.namedItem("name").value = dataElement.name;
    form.elements.namedItem("birth").value = dataElement.birthDate;
    form.elements.namedItem("death").value = dataElement.deathDate;
    form.elements.namedItem("imgUrl").value = dataElement.imageUrl;
    form.elements.namedItem("wikiUrl").value = dataElement.wikiUrl;

    let people = dataElement.people;
    if (people) {
        let options = form.querySelector("#peopleList").children;
        for (let option of options) {
            if (people.includes(parseInt(option.value))) {
                option.selected = true;
            }
        }
    }

    let entities = dataElement.entities;
    if (entities) {
        let options = form.querySelector("#entityList").children;
        for (let option of options) {
            if (entities.includes(parseInt(option.value))) {
                option.selected = true;
            }
        }
    }

    let products = dataElement.products;
    if (products) {
        let options = form.querySelector("#productList").children;
        for (let option of options) {
            if (products.includes(parseInt(option.value))) {
                option.selected = true;
            }
        }
    }
}
