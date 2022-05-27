/**
 * Modela los diferentes tipos de usuario.
 */
export class User {

    constructor(id, username, email, active, birthDate, name, eTag) {
        this._role = "user";
        this._id = id;
        this._username = username;
        this._email = email;
        this._active = active;
        this._birthDate = birthDate;
        this._name = name;
        this._eTag = eTag;
    }

    role() {
        return "user";
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }


    get email() {
        return this._email;
    }

    set email(value) {
        this._email = value;
    }

    get active() {
        return this._active;
    }

    set active(value) {
        this._active = value;
    }

    get birthDate() {
        return this._birthDate;
    }

    set birthDate(value) {
        this._birthDate = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get eTag() {
        return this._eTag;
    }

    set eTag(value) {
        this._eTag = value;
    }
}

export class Reader extends User {

    constructor(id, username, email, active, birthDate, name, eTag) {
        super(id, username, email, active, birthDate, name, eTag);
        this._role = "reader";
    }

    role() {
        return "reader";
    }
}

export class Writer extends User {

    constructor(id, username, email, active, birthDate, name, eTag) {
        super(id, username, email, active, birthDate, name, eTag);
        this._role = "writer";
    }

    role() {
        return "writer";
    }
}


export class Session {
    constructor(user, token, role) {
        this._user = user;
        this._token = token;
        this._role = role;
    }

    get user() {
        return this._user;
    }

    set user(value) {
        this._user = value;
    }

    get token() {
        return this._token;
    }

    set token(value) {
        this._token = value;
    }

    get role() {
        return this._role;
    }

    set role(value) {
        this._role = value;
    }
}

/**
 * Modela los diferentes tipos datos a mostrar.
 */
export class DataElement {
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get birthDate() {
        return this._birthDate;
    }

    set birthDate(value) {
        this._birthDate = value;
    }

    get deathDate() {
        return this._deathDate;
    }

    set deathDate(value) {
        this._deathDate = value;
    }

    get imageUrl() {
        return this._imageUrl;
    }

    set imageUrl(value) {
        this._imageUrl = value;
    }

    get wikiUrl() {
        return this._wikiUrl;
    }

    set wikiUrl(value) {
        this._wikiUrl = value;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get eTag() {
        return this._eTag;
    }

    set eTag(value) {
        this._eTag = value;
    }

    constructor(id, name, birthDate, deathDate, imageUrl, wikiUrl, eTag) {

        this._name = name;
        this._birthDate = birthDate;
        this._deathDate = deathDate;
        this._imageUrl = imageUrl;
        this._wikiUrl = wikiUrl;
        this._id = id;
        this._eTag = eTag;
    }

}

export class Person extends DataElement {

    constructor(id, name, birth, death, imgUrl, wikiUrl, eTag, entities, products) {
        super(id, name, birth, death, imgUrl, wikiUrl, eTag);
        this._entities = entities;
        this._products = products;
    }

    get entities() {
        return this._entities;
    }

    set entities(entities) {
        this._entities = entities;
    }

    get products() {
        return this._products;
    }

    set products(products) {
        this._products = products;
    }
}

export class Entity extends DataElement {

    constructor(id, name, birth, death, imgUrl, wikiUrl, eTag, people, products) {
        super(id, name, birth, death, imgUrl, wikiUrl, eTag);
        this._people = people;
        this._products = products;
    }

    get people() {
        return this._people;
    }

    set people(people) {
        this._people = people;
    }

    get products() {
        return this._products;
    }

    set products(products) {
        this._products = products;
    }
}

export class Product extends DataElement {

    constructor(id, name, birthDate, deathDate, imageUrl, wikiUrl, eTag, persons, entities) {
        super(id, name, birthDate, deathDate, imageUrl, wikiUrl, eTag);
        this._persons = persons;
        this._entities = entities;
    }

    get people() {
        return this._persons;
    }

    set people(people) {
        this._persons = people;
    }


    get entities() {
        return this._entities;
    }

    set entities(value) {
        this._entities = value;
    }
}