import {loadSession} from "./sessionRepository.js";
import {logout} from "../components/loginBox.js";
import {Entity} from "../model.js";

const serverUrl = "http://localhost:8000";
const apiBase = serverUrl + "/api/v1";


/**
 * Function to load all entities from the server
 * @returns {Entity[]} the entities from the server, empty array if none
 */
export async function loadEntities() {
    let url = apiBase + "/entities";
    let response = await fetch(
        url,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loadSession().token
            }
        }
    );
    if (response.ok) {
        let data = await response.json();
        if (data.entities !== undefined && data.entities.length > 0) {
            return data.entities.map(entity => parseEntity(entity.entity));
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
 * Function to get an entity from the server by id
 * @param id the id of the entity to get
 * @returns {Entity} the entity with the given id, null if none
 */
export async function getEntity(id) {
    let url = apiBase + "/entities/" + id;
    let response = await fetch(
        url,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loadSession().token
            }
        }
    );
    if (response.ok) {
        let data = await response.json();
        data.entity.eTag = response.headers.get("ETag");
        return parseEntity(data.entity);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to create an entity on the server
 * @param entity the entity to create
 * @returns {Entity} the created entity, null if none
 */
export async function createEntity(entity) {
    let url = apiBase + "/entities";
    let data = {
        "name": entity.name,
        "birthDate": entity.birthDate,
        "deathDate": entity.deathDate,
        "imageUrl": entity.imageUrl,
        "wikiUrl": entity.wikiUrl
    }

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
        return parseEntity(data.entity);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to update an entity on the server
 * @param entity the entity to update
 * @returns {Entity} the updated entity, null if none
 */
export async function updateEntity(entity) {
    let url = apiBase + "/entities/" + entity.id;
    let data = {
        ...(entity.birthDate) && {"birthDate": entity.birthDate},
        ...(entity.deathDate) && {"deathDate": entity.deathDate},
        ...(entity.imageUrl) && {"imageUrl": entity.imageUrl},
        ...(entity.wikiUrl) && {"wikiUrl": entity.wikiUrl}
    };

    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": entity.eTag,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let data = await response.json();
        return parseEntity(data.entity);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to check if an entity exists on the server by name
 * @param name the name of the entity to check
 * @returns {boolean} true if the entity exists, false if not
 */
export async function entityExistsbyName(name) {
    let url = apiBase + "/entities/entityname/" + name;
    return (await fetch(url)).ok;
}

/**
 * Function to delete an entity on the server
 * @param entity the entity to delete
 * @returns {boolean} true if the entity was deleted, false if not
 */
export async function deleteEntity(entity) {
    let url = apiBase + "/entities/" + entity.id;
    let response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": entity.eTag
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
 * Function to get the products of an entity
 * @param entity the entity to get the products of
 * @returns {Product[]} the products of the entity
 * @returns {null} null if the entity does not exist
 */
export async function getEntityProducts(entity) {
    let url = apiBase + "/entities/" + entity.id + "/products";
    let response = await fetch(url);
    if (response.ok) {
        let data = await response.json();
        return data.products.map(parseProduct);
    } else {
        return null;
    }
}

/**
 * Funtion to modify the relationship between an entity and a product
 * @param entityId the id of the entity
 * @param productId the id of the product
 * @param operation the operation to perform
 * @returns {Entity} the entity with the new relationship, null if it does not exist
 */
async function modifyEntityProduct(entityId, productId, operation) {
    let url = apiBase + "/entities/" + entityId + "/products/" + operation + "/" + productId;
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return parseEntity(data.entity);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to add a product to an entity
 * @param entityId the id of the entity
 * @param productId the id of the product
 * @returns {Entity} the entity with the new relationship, null if it does not exist
 */
export async function addProductToEntity(entityId, productId) {
    return modifyEntityProduct(entityId, productId, "add");
}

/**
 * Function to remove a product from an entity
 * @param entityId the id of the entity
 * @param productId the id of the product
 * @returns {Entity} the entity with the new relationship, null if it does not exist
 */
export async function removeProductFromEntity(entityId, productId) {
    return modifyEntityProduct(entityId, productId, "rem");
}

/**
 * Function to get the persons of an entity
 * @param entity the entity to get the persons of
 * @returns {Person[]} the persons of the entity
 * @returns {null} null if the entity does not exist
 */
export async function getEntityPersons(entity) {
    let url = apiBase + "/entities/" + entity.id + "/persons";
    let response = await fetch(url);
    if (response.ok) {
        let data = await response.json();
        return data.persons.map(parsePerson);
    } else {
        return null;
    }
}

/**
 * Funtion to modify the relationship between an entity and a person
 * @param entityId the id of the entity
 * @param personId the id of the person
 * @param operation the operation to perform
 */
async function modifyEntityPerson(entityId, personId, operation) {
    let url = apiBase + "/entities/" + entityId + "/persons/" + operation + "/" + personId;
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token
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
 * Function to add a person to an entity
 * @param entityId the id of the entity
 * @param personId the id of the person
 * @returns {boolean} true if the operation was successful, false otherwise
 */
export async function addPersonToEntity(entityId, personId) {
    return modifyEntityPerson(entityId, personId, "add");
}

/**
 * Function to remove a person from an entity
 * @param entityId the id of the entity
 * @param personId the id of the person
 * @returns {boolean} true if the operation was successful, false otherwise
 */
export async function removePersonFromEntity(entityId, personId) {
    return modifyEntityPerson(entityId, personId, "rem");
}

/**
 * Function to parse an entity from a JSON object
 * @param entity JSON object
 * @returns {Entity} parsed entity
 */

export function parseEntity(entity) {
    return new Entity(entity.id, entity.name, entity.birthDate, entity.deathDate, entity.imageUrl, entity.wikiUrl, entity.eTag, entity.persons, entity.products);
}