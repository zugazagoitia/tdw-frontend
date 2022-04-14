import {Person} from "./model.js";

export function loadPeople(){
    let people = JSON.parse(localStorage.getItem("people"));
    let peopleArray = [];
    for(let i = 0; i < people.length; i++){
        peopleArray.push(parsePerson(people[i]));
    }
}

export function savePeople(peopleArray){
    localStorage.setItem("people", JSON.stringify(peopleArray));
}

function parsePerson(person){
    return new Person(person._name, person._birth, person._death, person._imgUrl, person._wikiUrl);
}