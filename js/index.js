
export async function showIndex(products,entities,people,session) {

    let deleteButton = false;
    if(session.role()==='writer') deleteButton = true;

    if ('content' in document.createElement('template')) {
        let entityCol = document.querySelector('#entityCol');
        let productCol = document.querySelector('#productCol');
        let personCol = document.querySelector('#personCol');

        if (typeof products !== 'undefined' && products !== null && products.length > 0) {
            showColumn(products, productCol,deleteButton);
        }

        if (typeof entities !== 'undefined' && entities !== null && entities.length > 0) {
            showColumn(entities, entityCol,deleteButton);
        }

        if (typeof people !== 'undefined' && people !== null && people.length > 0) {
            showColumn(people, personCol,deleteButton);
        }

    }else alert("La página no se puede mostrar! El navegador no soporta Templates.");
}

async function showColumn(dataElements,column,deleteButton=false){

    let template = document.querySelector('#cardRow');
    for (let row of dataElements){
        let clone = template.content.cloneNode(true);
        clone.querySelector('#card-name').textContent = row.name;
        clone.querySelector('#card-img').src = row.imgUrl;
        if(deleteButton){
            clone.querySelector('#card-delete').classList.remove('is-hidden')

            clone.querySelector('#card-delete-button').addEventListener('click',()=>{
                //delete item
            });
        }
        //TODO: link to detail page
        //clone.querySelector('#card-link').href = row.link;
        column.appendChild(clone);
        //TODO: crud operations

    }

}
