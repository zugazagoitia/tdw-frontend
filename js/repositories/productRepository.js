import {Entity, Person, Product} from "../model.js";
import {loadSession} from "./sessionRepository.js";
import {logout} from "../components/loginBox.js";
import {parseEntity} from "./entityRepository.js";
import {parsePerson} from "./personRepository.js";
import {apiBaseUrl, serverUrl} from "../main.js";

const apiBase = apiBaseUrl();


/**
 * Loads the products from the server and parses them into an array of Product objects.
 * @returns {Product[]}
 */
export async function loadProducts() {

    //Get products from api endpoint /products and parse them
    let url = apiBase + "/products";
    let response = await fetch(
        url
        , {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loadSession().token
            }
        });
    if (response.ok) {
        let data = await response.json();
        if (data.products !== undefined && data.products.length > 0) {
            return data.products.map(product => parseProduct(product.product));
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
 * Function to get a product from the api
 * @param productId
 * @returns {Product} the product if it exists, null otherwise
 */
export async function getProduct(productId) {
    let url = apiBase + "/products/" + productId;
    let response = await fetch(
        url,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + loadSession().token
            }
        });
    let data = await response.json();

    if (response.ok) {
        data.product.eTag = response.headers.get("ETag");
        return parseProduct(data.product);
    } else if (response.status === 401) {
        logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to create a new product
 * @param product
 * @returns {Promise<Product>}
 */
export async function createProduct(product) {
    let url = apiBase + "/products";
    let data = {
        "name": product.name,
        "birthDate": product.birthDate,
        "deathDate": product.deathDate,
        "imageUrl": product.imageUrl,
        "wikiUrl": product.wikiUrl,
    };
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let data = await response.json();
        return parseProduct(data.product);
    } else if (response.status === 401) {
        await logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to update a product
 * @param product the product to update, must have an id and E-Tag
 * @returns {Product} the updated product
 */
export async function updateProduct(product) {

    if (product.eTag === undefined || product.eTag === null) {
        throw new Error("Product has no eTag");
    }

    let url = apiBase + "/products/" + product.id;
    let data = {
        ...(product.birthDate) && {"birthDate": product.birthDate},
        ...(product.deathDate) && {"deathDate": product.deathDate},
        ...(product.imageUrl) && {"imageUrl": product.imageUrl},
        ...(product.wikiUrl) && {"wikiUrl": product.wikiUrl}
    };
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": product.eTag
        },
        body: JSON.stringify(data)
    });
    if (response.ok) {
        let data = await response.json();
        return parseProduct(data.product);
    } else if (response.status === 401) {
        await logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to check if a product exists by name
 * @param name the name of the product
 * @returns {boolean} true if the product exists, false otherwise
 */
export async function productExistsByName(name) {
    let url = apiBase + "/products/productname/" + name;
    return (await fetch(url)).ok;
}

/**
 * Function to delete a product
 * @param product the product to delete
 * @returns {boolean} true if the product was deleted, false otherwise
 */
export async function deleteProduct(product) {
    let url = apiBase + "/products/" + product.id;
    let response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + loadSession().token,
            "If-Match": product.eTag
        }
    });
    if (response.ok) {
        return true;
    } else if (response.status === 401) {
        await logout();
        return false;
    } else {
        return false;
    }
}

/**
 * Function to get the entities of a product
 * @param productId the id of the product to get the entities of
 * @returns {Entity[]} the entities of the product
 * @returns {null} if the product does not exist
 */
export async function getProductEntities(productId) {
    let url = apiBase + "/products/" + productId + "/entities";
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return data.entities.map(parseEntity);
    } else {
        return null;
    }
}

/**
 * Function to modify the relationship between a product and an entity
 * @param productId the id of the product to modify
 * @param entityId the id of the entity to modify
 * @param operation the operation to perform
 * @returns {Product} the updated product
 */
async function modifyProductEntity(productId, entityId, operation) {
    let url = apiBase + "/products/" + productId + "/entities/" + operation + "/" + entityId;
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return parseProduct(data.product);
    } else if (response.status === 401) {
        await logout();
        return null;
    } else {
        return null;
    }
}

/**
 * Function to add an entity to a product
 * @param productId the id of the product to add the entity to
 * @param entityId the id of the entity to add
 * @returns {Product} the updated product
 */
export async function addEntityToProduct(productId, entityId) {
    return modifyProductEntity(productId, entityId, "add");
}

/**
 * Function to remove an entity from a product
 * @param productId the id of the product to remove the entity from
 * @param entityId the id of the entity to remove
 * @returns {Product} the updated product
 */
export async function removeEntityFromProduct(productId, entityId) {
    return modifyProductEntity(productId, entityId, "rem");
}

/**
 * Function to get the persons of a product
 * @param productId the id of the product to get the persons of
 * @returns {Person[]} the persons of the product
 * @returns {null} if the product does not exist
 */

export async function getProductPersons(productId) {
    let url = apiBase + "/products/" + productId + "/persons";
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return data.persons.map(parsePerson);
    } else {
        return null;
    }
}

/**
 * Function to modify the relationship between a product and a person
 * @param productId the id of the product to modify
 * @param personId the id of the person to modify
 * @param operation the operation to perform
 * @returns {Product} the updated product
 */
async function modifyProductPerson(productId, personId, operation) {
    let url = apiBase + "/products/" + productId + "/persons/" + operation + "/" + personId;
    let response = await fetch(url, {
        method: "PUT",
        headers: {
            "Authorization": "Bearer " + loadSession().token
        }
    });
    if (response.ok) {
        let data = await response.json();
        return parseProduct(data.product);
    } else if (response.status === 401) {
        await logout();
        return null;
    } else {
        return null;
    }

}

/**
 * Function to add a person to a product
 * @param productId the id of the product to add the person to
 * @param personId the id of the person to add
 * @returns {Product} the updated product
 */
export async function addPersonToProduct(productId, personId) {
    return modifyProductPerson(productId, personId, "add");
}

/**
 * Function to remove a person from a product
 * @param productId the id of the product to remove the person from
 * @param personId the id of the person to remove
 * @returns {Product} the updated product
 */
export async function removePersonFromProduct(productId, personId) {
    return modifyProductPerson(productId, personId, "rem");
}


/**
 * Function to parse a product from a json object
 * @param product the json object to parse
 * @returns {Product} the parsed product
 */
export function parseProduct(product) {
    return new Product(product.id, product.name, product.birthDate, product.deathDate, product.imageUrl, product.wikiUrl, product.eTag, product.persons || [], product.entities || []);
}


