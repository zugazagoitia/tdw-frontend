/**
 * Modela los diferentes tipos de usuario.
 */
export class User{

    constructor() {
        this._role = "user";
    }
    get role(){
        return this._role;
    }
}

export class Reader extends User{

    constructor() {
        super();
        this._role = "reader";
    }

    get role(){
        return this._role;
    }
}

export class Writer extends User{
    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    set password(value) {
        this._password = value;
    }
    constructor(username,password) {
        super();
        this._username = username;
        this._password = password;
        this._role= "writer";
    }

    get role(){
        return _role;
    }
}

/**
 * Modela los diferentes tipos datos a mostrar.
 */
export class DataElement{
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get birth() {
        return this._birth;
    }

    set birth(value) {
        this._birth = value;
    }

    get death() {
        return this._death;
    }

    set death(value) {
        this._death = value;
    }

    get imgUrl() {
        return this._imgUrl;
    }

    set imgUrl(value) {
        this._imgUrl = value;
    }

    get wikiUrl() {
        return this._wikiUrl;
    }

    set wikiUrl(value) {
        this._wikiUrl = value;
    }
    constructor(name,birth,death,imgUrl,wikiUrl) {

        this._name = name;
        this._birth = birth;
        this._death = death;
        this._imgUrl = imgUrl;
        this._wikiUrl = wikiUrl;
    }
}

export class Person extends DataElement{

    constructor(name, birth, death, imgUrl, wikiUrl) {
        super(name, birth, death, imgUrl, wikiUrl);
    }
}

export class Entity extends DataElement{

    constructor(name, birth, death, imgUrl, wikiUrl, people) {
        super(name, birth, death, imgUrl, wikiUrl);
        this._people = people;
    }

    get people(){
        return this._people;
    }

    set people(people){
        this._people=people;
    }
}

export class Product extends DataElement{

    constructor(name, birth, death, imgUrl, wikiUrl, people, entities) {
        super(name, birth, death, imgUrl, wikiUrl);
        this._people = people;
        this._entities = entities;
    }

    get people(){
        return this._people;
    }

    set people(people){
        this._people=people;
    }


    get entities() {
        return this._entities;
    }

    set entities(value) {
        this._entities = value;
    }
}