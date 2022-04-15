/**
 *
 */
import {showIndex} from "./index.js";
import {loadSession} from "./sessionRepository.js";
import {loadEntities, loadPeople, loadProducts} from "./dataRepository.js";
import {setUpNavbar} from "./loginBox.js";


/**
 *  Inicialización de la aplicación
 */
let people = loadPeople();
let products = loadProducts();
let entities = loadEntities();

let session = loadSession();

//Configurar los modales
setUpNavbar(session);

showIndex(products, entities, people, session);