import {register} from "./sessionRepository.js";
import {Person} from "./model.js";
import {savePeople} from "./dataRepository.js";

export async function loadSampleData() {

    localStorage.clear();
    sessionStorage.clear();

    register("hemingway", "123456","writer");
    register("dostoyevsky", "password","writer");
    register("tolstoy", "qwerty","writer");

    let people = [];
    people.push(new Person("Tim Berners-Lee","8 de junio de 1955",null,"img/tim-berners-lee.jpg","https://en.wikipedia.org/wiki/Tim_Berners-Lee"));
    savePeople(people);


    let products = [];
    products.push();
    //reload page
    location.reload();
}