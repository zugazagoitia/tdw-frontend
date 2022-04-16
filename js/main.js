/**
 *
 */
import {setUpIndex, showIndex} from "./index.js";
import {loadSession} from "./sessionRepository.js";
import {loadDataElementFromSessionStorage, loadEntities, loadPeople, loadProducts} from "./dataRepository.js";
import {setUpLoginBar} from "./loginBox.js";
import {setupDetails, showDetails} from "./details.js";


/**
 *  Inicialización de la aplicación
 */

let session = loadSession();

if ( document.URL.includes("details") ) {
    // Si estamos en la página de detalles, mostramos el modal y no el index

    let dataElement = await loadDataElementFromSessionStorage();

    if (dataElement === null) {
        // Si no hay datos en el sessionStorage, mostramos el index
        window.location.replace("index.html");
    } else {
        // Si hay datos en el sessionStorage, mostramos los detalles
        setupDetails(session);
        showDetails(dataElement);
    }


}else {
    // Si no, mostramos el index
    let people = loadPeople();
    let products = loadProducts();
    let entities = loadEntities();

    setUpIndex();
    setUpLoginBar(session);
    showIndex(products, entities, people, session);
}

