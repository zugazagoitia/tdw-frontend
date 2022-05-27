import {parseEntity} from "./entityRepository.js";
import {loadSession} from "./sessionRepository.js";
import {logout} from "../components/loginBox.js";
import {Person} from "../model.js";
import {parseProduct} from "./productRepository.js";
import {apiBaseUrl} from "../main.js";


/**
 * Function to load all persons from the server
 * @returns {Person[]} the persons from the server, empty array if none
 */
export async function loadPersons() {
    let url = apiBaseUrl() + "/persons";
    let response = await fetch(
        url,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loadSession().token
            }
        });
    if (response.ok) {
        let data = await response.json();
        if (data.persons !== undefined && data.persons.length > 0) {
            return data.persons.map(person => parsePerson(person.person));
        } else {
            return [];
        }
    } else if (response.status === 401) {
        logout();
        return [];
    } else {
        return [];
    }
}

/**
 * Function to get a person from the server by id
 * @param id the id of the person to get
 * @returns {Person} the person with the given id, null if none
 */
export async function getPerson(id) {
    let url = apiBaseUrl() + "/persons/" + id;
    let response = await fetch(
        url,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loadSession().token
            }
        });
    if (response.ok) {
        let data = await response.json();
        data.person.eTag = response.headers.get("etag");
        return parsePerson(data.person);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to create a person on the server
 * @param person the person to create
 * @returns {Person} the created person, null if none
 */
export async function createPerson(person) {
    let url = apiBaseUrl() + "/persons";
    let data = {
        "name": person.name,
        "birthDate": person.birthDate,
        "deathDate": person.deathDate,
        "imageUrl": person.imageUrl,
        "wikiUrl": person.wikiUrl

    };

    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + loadSession().token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let data = await response.json();
        return parsePerson(data.person);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to update a person on the server
 * @param person the person to update
 * @returns {Person} the updated person, null if none
 */
export async function updatePerson(person) {
    let url = apiBaseUrl() + "/persons/" + person.id;
    let data = {
        ...(person.birthDate) && {"birthDate": person.birthDate},
        ...(person.deathDate) && {"deathDate": person.deathDate},
        ...(person.imageUrl) && {"imageUrl": person.imageUrl},
        ...(person.wikiUrl) && {"wikiUrl": person.wikiUrl}
    };

    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": person.eTag,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let data = await response.json();
        return parsePerson(data.person);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to check if a person exists on the server by name
 * @param name the name of the person to check
 * @returns {boolean} true if the person exists, false if not
 */
export async function personExistsByName(name) {
    let url = apiBaseUrl() + "/persons/personname/" + name;
    let response = await fetch(url);
    if (response.ok) {
        return true;
    } else {
        return false;
    }
}

/**
 * Function to delete a person on the server
 * @param person the person to delete
 * @returns {boolean} true if the person was deleted, false if not
 */
export async function deletePerson(person) {
    let url = apiBaseUrl() + "/persons/" + person.id;
    let response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": person.eTag
        }
    });
    if (response.ok) {
        return true;
    } else if (response.status === 401) {
        logout();
        return false;
    } else {
        return false;
    }
}

/**
 * Function to get the entities of a person
 * @param person the person to get the entities of
 * @returns {Entity[]} the entities of the person
 * @returns {null} if the person does not exist
 */
export async function getPersonEntities(person) {
    let url = apiBaseUrl() + "/persons/" + person.id + "/entities";
    let response = await fetch(url);
    if (response.ok) {
        let data = await response.json();
        return data.entities.map(parseEntity);
    } else {
        return null;
    }
}

/**
 * Function to modify the relationship between a person and an entity
 * @param personId the id of the person
 * @param entityId the id of the entity
 * @param operation the operation to perform
 * @returns {Person} the person with the new relationship, null if it does not exist
 */
async function modifyPersonEntity(personId, entityId, operation) {
    let url = apiBaseUrl() + "/persons/" + personId + "/entities/" + operation + "/" + entityId;
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return parsePerson(data.person);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to add an entity to a person
 * @param personId the id of the person
 * @param entityId the id of the entity
 * @returns {Person} the person with the new relationship, null if it does not exist
 */
export async function addEntityToPerson(personId, entityId) {
    return modifyPersonEntity(personId, entityId, "add");
}

/**
 * Function to remove an entity from a person
 * @param personId the id of the person
 * @param entityId the id of the entity
 * @returns {Person} the person with the new relationship, null if it does not exist
 */
export async function removeEntityFromPerson(personId, entityId) {
    return modifyPersonEntity(personId, entityId, "rem");
}

/**
 * Function to get the products of a person
 * @param person the person to get the products of
 * @returns {Product[]} the products of the person
 * @returns {null} if the person does not exist
 */
export async function getPersonProducts(person) {
    let url = apiBaseUrl() + "/persons/" + person.id + "/products";
    let response = await fetch(url);
    if (response.ok) {
        let data = await response.json();
        return data.products.map(parseProduct);
    } else {
        return null;
    }
}

/**
 * Function to modify the relationship between a person and a product
 * @param personId the id of the person
 * @param productId the id of the product
 * @param operation the operation to perform
 * @returns {Person} the person with the new relationship, null if it does not exist
 */
async function modifyPersonProduct(personId, productId, operation) {
    let url = apiBaseUrl() + "/persons/" + personId + "/products/" + operation + "/" + productId;
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return parsePerson(data.person);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to add a product to a person
 * @param personId the id of the person
 * @param productId the id of the product
 * @returns {Person} the person with the new relationship, null if it does not exist
 */
export async function addProductToPerson(personId, productId) {
    return modifyPersonProduct(personId, productId, "add");
}

/**
 * Function to remove a product from a person
 * @param personId the id of the person
 * @param productId the id of the product
 * @returns {Person} the person with the new relationship, null if it does not exist
 */
export async function removeProductFromPerson(personId, productId) {
    return modifyPersonProduct(personId, productId, "rem");
}

/**
 * Function to parse a person from a json object
 * @param person the json object to parse
 * @returns {Person} the parsed person
 */
export function parsePerson(person) {
    return new Person(person.id, person.name, person.birthDate, person.deathDate, person.imageUrl, person.wikiUrl, person.eTag, person.entities || [], person.products || []);
}