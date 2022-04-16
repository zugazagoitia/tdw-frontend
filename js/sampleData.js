import {register} from "./sessionRepository.js";
import {Entity, Person, Product} from "./model.js";
import {saveEntities, savePeople, saveProducts} from "./dataRepository.js";

export async function loadSampleData() {

    localStorage.clear();
    sessionStorage.clear();

    register("hemingway", "123456","writer");
    register("dostoyevsky", "password","writer");
    register("tolstoy", "qwerty","writer");

    let people = [];
    people.push(new Person("Tim Berners-Lee","8 de junio de 1955",null,"img/tim-berners-lee.jpg","https://en.wikipedia.org/wiki/Tim_Berners-Lee"));
    people.push(new Person("Vannevar Bush","11 de marzo de 1890","28 de Junio de 1974","img/vannevar-bush.jpg","https://en.wikipedia.org/wiki/Vannevar_Bush"));
    savePeople(people);


    let entities = [];
    entities.push(new Entity("IBM","16 de junio de 1911",null,"img/ibm.webp","https://en.wikipedia.org/wiki/IBM",[]));
    entities.push(new Entity("CERN","29 de Septiembre de 1954",null,"img/CERN_logo.svg","https://en.wikipedia.org/wiki/CERN",[people[0]]));
    saveEntities(entities);

    let products = [];
    products.push(new Product("HTML","29 de octubre de 1991",null,"img/html.png","https://en.wikipedia.org/wiki/HTML",[people[0]],[entities[1]]));
    saveProducts(products);

    //reload page
    location.reload();
}