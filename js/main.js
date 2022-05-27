/**
 *
 */
import {setUpIndex, showIndex} from "./views/index.js";
import {loadSession} from "./repositories/sessionRepository.js";
import {getProduct, loadProducts} from "./repositories/productRepository.js";
import {setUpLoginBar} from "./components/loginBox.js";
import {setupDetails, showDetails} from "./views/details.js";
import {getEntity, loadEntities} from "./repositories/entityRepository.js";
import {getPerson, loadPersons} from "./repositories/personRepository.js";
import {GlobalEntityStore, GlobalPersonStore, GlobalProductStore} from "./stores.js";
import {setUpUsersView} from "./views/users.js";



/**
 *  Inicialización de la aplicación
 */

export function serverUrl() {
    return "https://tdw.zuga.pw/";
}

export function apiBaseUrl() {
    return serverUrl() + "api/v1";
}

let session = await loadSession();

if (document.URL.includes("details")) {

    if (session.role === 'user') {
        window.location.href = "index.html";
    }
    // Si estamos en la página de detalles, mostramos el modal y no el index
    setupDetails(session);

    const querystring = window.location.search;
    const params = new URLSearchParams(querystring);

    let type = params.get("type");
    let id = params.get("id");

    //check if the type is valid and if the id is valid

    let dataElement = null;

    if (id) {
        switch (type) {
            case "product":
                dataElement = await getProduct(id);
                break;
            case "entity":
                dataElement = await getEntity(id);
                break;
            case "person":
                dataElement = await getPerson(id);
                break;
            default:
                dataElement = null;
                break;
        }
    }

    if (dataElement === null) {
        window.location.replace("index.html");
    } else {
        showDetails(dataElement);
    }


} else if (document.URL.includes("users")) {
    if (session.role !== 'writer') {
        window.location.replace("index.html");
    } else {
        setUpUsersView();
    }


} else {
    // Si no, mostramos el index

    setUpLoginBar(session);

    setUpIndex();


}



