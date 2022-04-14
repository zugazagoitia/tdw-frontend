
export function showIndex(products,entities,people) {

    if ('content' in document.createElement('template')) {
        let entityCol = document.querySelector('#entityCol');
        let productCol = document.querySelector('#productCol');
        let personCol = document.querySelector('#personCol');

        showColumn(products,productCol);
        showColumn(entities,entityCol);
        showColumn(people,personCol);

    }else alert("La página no se puede mostrar! El navegador no soporta Templates.");
}

function showColumn(dataElements,column){

    let template = document.querySelector('#cardRow');
    for (let row of dataElements){
        let clone = template.content.cloneNode(true);
        clone.querySelector('#card-name').textContent = row.name;
        clone.querySelector('#card-img').src = row.imgUrl;
        //TODO: link to detail page
        //clone.querySelector('#card-link').href = row.link;
        column.appendChild(clone);
        //TODO: crud operations
    }

}
