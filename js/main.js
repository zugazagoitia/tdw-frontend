/**
 *
 */
import {showIndex} from "./index.js";
import {loadSession, register} from "./sessionRepository.js";

/**
 *  Carga de datos de prueba
 */

register("hemingway", "123456","writer");
register("dostoyevsky", "password","writer");
register("tolstoy", "qwerty","writer");

let products = localStorage.getItem()


let session = loadSession();


//showIndex()