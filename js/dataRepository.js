import {Entity, Person, Product} from "./model.js";

export function loadPeople(){
    let people = JSON.parse(localStorage.getItem("people") || "[]");
    return parsePeople(people);
}

export function savePeople(peopleArray){
    localStorage.setItem("people", JSON.stringify(peopleArray));
}

function parsePerson(person){
    return new Person(person._name, person._birth, person._death, person._imgUrl, person._wikiUrl);
}

function parsePeople(people){
    let peopleArray = [];
    for(let i = 0; i < people.length; i++){
        peopleArray.push(parsePerson(people[i]));
    }
    return peopleArray;
}


// Repeat for other models using the same pattern and the following constructors: Entity(name, birth, death, imgUrl, wikiUrl, people)
//  Product(name, birth, death, imgUrl, wikiUrl, people, entities)

export function loadEntities(){
    let entities = JSON.parse(localStorage.getItem("entities") || "[]");
    let entitiesArray = [];
    for(let i = 0; i < entities.length; i++){
        entitiesArray.push(parseEntity(entities[i]));
    }
    return entitiesArray;
}

export function saveEntities(entitiesArray){
    localStorage.setItem("entities", JSON.stringify(entitiesArray));
}

function parseEntity(entity){
    return new Entity(entity._name, entity._birth, entity._death, entity._imgUrl, entity._wikiUrl, parsePeople(entity._people || []));
}

function parseEntities(entities){
    let entitiesArray = [];
    for(let i = 0; i < entities.length; i++){
        entitiesArray.push(parseEntity(entities[i]));
    }
    return entitiesArray;
}

export function loadProducts(){
    let products = JSON.parse(localStorage.getItem("products") || "[]");
    let productsArray = [];
    for(let i = 0; i < products.length; i++){
        productsArray.push(parseProduct(products[i]));
    }
    return productsArray;
}

export function saveProducts(productsArray){
    localStorage.setItem("products", JSON.stringify(productsArray));
}

function parseProduct(product){
    return new Product(product._name, product._birth, product._death, product._imgUrl, product._wikiUrl, parsePeople(product._people || []), parseEntities(product._entities || []));
}

export async function deleteDataElement(dataElement){
    let dataElementArray = [];
    if(dataElement instanceof Person){
        dataElementArray = loadPeople();
    }
    else if(dataElement instanceof Entity){
        dataElementArray = loadEntities();
    }
    else if(dataElement instanceof Product){
        dataElementArray = loadProducts();
    }
    for(let i = 0; i < dataElementArray.length; i++){
        if(dataElementArray[i]._name === dataElement._name){
            dataElementArray.splice(i, 1);
            break;
        }
    }
    if(dataElement instanceof Person){
        savePeople(dataElementArray);
    }
    else if(dataElement instanceof Entity){
        saveEntities(dataElementArray);
    }
    else if(dataElement instanceof Product){
        saveProducts(dataElementArray);
    }

}


export async function loadDataElementFromSessionStorage(){
    let dataElement = JSON.parse(sessionStorage.getItem("dataElement") || "[]");

    switch (sessionStorage.getItem("dataElementType")) {
        case "person":
            return parsePerson(dataElement);
        case "entity":
            return parseEntity(dataElement);
        case "product":
            return parseProduct(dataElement);
        default:
            return null;
    }
}

export async function saveDataElementToSessionStorage(dataElement){
    sessionStorage.setItem("dataElement", JSON.stringify(dataElement));

    switch (true){
        case dataElement instanceof Person:
            sessionStorage.setItem("dataElementType", "person");
            break;
        case dataElement instanceof Entity:
            sessionStorage.setItem("dataElementType", "entity");
            break;
        case dataElement instanceof Product:
            sessionStorage.setItem("dataElementType", "product");
            break;
        default:
            sessionStorage.setItem("dataElementType", "null");
            break;
    }
}

export async function removeDataElementFromSessionStorage(){
    sessionStorage.removeItem("dataElement");
    sessionStorage.removeItem("dataElementType");
}
