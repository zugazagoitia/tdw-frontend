import {loadProducts} from "./repositories/productRepository.js";
import {loadPersons} from "./repositories/personRepository.js";
import {loadEntities} from "./repositories/entityRepository.js";
import {getUsers} from "./repositories/userRepository.js";

export const GlobalProductStore = (() => {
    let _products = []
    const needsArg = arg => {
        if (!arg) {
            throw new Error (`Undefined passed as argument to Store!`)
        }
        return arg
    }
    const needsId = product => {
        if (!product.id) {
            throw new Error (`Undefined id on product passed as argument to Store!`)
        }
        return product
    }
    const Store = {
        setProducts: products => _products = [...products],
        getProducts: () => [..._products],
        getProduct: id => {
            const product = _products.filter(m => m.id === id)
            return product.length === 1 ?
                { found: true, product: product[0]} :
                { found: false, product: undefined }
        },
        putProduct: product => {
            const m = needsId(needsArg(product))
            if (Store.getProduct(m.id).found) {
                throw new Error(`${m.id} already exists!`)
            }
            _products.push(m)
        },
        updateProduct: update => {
            const u = needsId(needsArg(update))
            if (!Store.getProduct(u.id).found) {
                throw new Error(`${u.id} does not exists!`)
            }
            _products = _products.map(m => m.id === u.id ?
                update : m)
        },
        deleteProduct: product => {
            const m = needsId(needsArg(product))
            if (!Store.getProduct(m.id).found) {
                throw new Error(`${m.id} does not exists!`)
            }
            _products = _products.filter(m => m.id !== product.id)
        }
    }
    return Object.freeze(Store)
})()

export const GlobalPersonStore = (() => {
    let _persons = []
    const needsArg = arg => {
        if (!arg) {
            throw new Error (`Undefined passed as argument to Store!`)
        }
        return arg
    }
    const needsId = person => {
        if (!person.id) {
            throw new Error (`Undefined id on person passed as argument to Store!`)
        }
        return person
    }
    const Store = {
        setPersons: persons => {
            return _persons = [...persons];
        },
        getPersons: () => {
            return [..._persons];
        },
        getPerson: id => {
            const person = _persons.filter(m => m.id === id)
            return person.length === 1 ?
                { found: true, person: person[0]} :
                { found: false, person: undefined }
        },
        putPerson: person => {
            const m = needsId(needsArg(person))
            if (Store.getPerson(m.id).found) {
                throw new Error(`${m.id} already exists!`)
            }
            _persons.push(m)
        },
        updatePerson: update => {
            const u = needsId(needsArg(update))
            if (!Store.getPerson(u.id).found) {
                throw new Error(`${u.id} does not exists!`)
            }
            _persons = _persons.map(m => m.id === u.id ?
                update : m)
        },
        deletePerson: person => {
            const m = needsId(needsArg(person))
            if (!Store.getPerson(m.id).found) {
                throw new Error(`${m.id} does not exists!`)
            }
            _persons = _persons.filter(m => m.id !== person.id)
        }
    }
    return Object.freeze(Store)
})()

export const GlobalEntityStore = (() => {
    let _entitys = []
    const needsArg = arg => {
        if (!arg) {
            throw new Error (`Undefined passed as argument to Store!`)
        }
        return arg
    }
    const needsId = entity => {
        if (!entity.id) {
            throw new Error (`Undefined id on entity passed as argument to Store!`)
        }
        return entity
    }
    const Store = {
        setEntitys: entitys => {
            return _entitys = [...entitys];
        },
        getEntitys: () => {
            return [..._entitys];
        },
        getEntity: id => {
            const entity = _entitys.filter(m => m.id === id)
            return entity.length === 1 ?
                { found: true, entity: entity[0]} :
                { found: false, entity: undefined }
        },
        putEntity: entity => {
            const m = needsId(needsArg(entity))
            if (Store.getEntity(m.id).found) {
                throw new Error(`${m.id} already exists!`)
            }
            _entitys.push(m)
        },
        updateEntity: update => {
            const u = needsId(needsArg(update))
            if (!Store.getEntity(u.id).found) {
                throw new Error(`${u.id} does not exists!`)
            }
            _entitys = _entitys.map(m => m.id === u.id ?
                update : m)
        },
        deleteEntity: entity => {
            const m = needsId(needsArg(entity))
            if (!Store.getEntity(m.id).found) {
                throw new Error(`${m.id} does not exists!`)
            }
            _entitys = _entitys.filter(m => m.id !== entity.id)
        }
    }
    return Object.freeze(Store)
})()

export const UserStore = (() => {
    let _users = []
    const needsArg = arg => {
        if (!arg) {
            throw new Error (`Undefined passed as argument to Store!`)
        }
        return arg
    }
    const needsId = user => {
        if (!user.id) {
            throw new Error (`Undefined id on user passed as argument to Store!`)
        }
        return user
    }
    const Store = {
        setUsers: users => {
            return _users = [...users];
        },
        getUsers: () => {
            return [..._users];
        },
        getUser: id => {
            const user = _users.filter(m => m.id === id)
            return user.length === 1 ?
                { found: true, user: user[0]} :
                { found: false, user: undefined }
        },
        putUser: user => {
            const m = needsId(needsArg(user))
            if (Store.getUser(m.id).found) {
                throw new Error(`${m.id} already exists!`)
            }
            _users.push(m)
        },
        updateUser: update => {
            const u = needsId(needsArg(update))
            if (!Store.getUser(u.id).found) {
                throw new Error(`${u.id} does not exists!`)
            }
            _users = _users.map(m => m.id === u.id ?
                update : m)
        },
        deleteUser: user => {
            const m = needsId(needsArg(user))
            if (!Store.getUser(m.id).found) {
                throw new Error(`${m.id} does not exists!`)
            }
            _users = _users.filter(m => m.id !== user.id)
        }
    }
    return Object.freeze(Store)
})()


/**
 * Asynchronously loads the data from the various repositories into the stores.
 * @returns {Promise<void>} A promise that resolves when the data is loaded.
 */
export async function loadData() {

    let data = await Promise.all([loadProducts(), loadPersons(), loadEntities()]);

    GlobalProductStore.setProducts(data[0]);
    GlobalPersonStore.setPersons(data[1]);
    GlobalEntityStore.setEntitys(data[2]);
}

/**
 * Asynchronously loads all users from the user repository into the user store.
 * @returns {Promise<void>} A promise that resolves when the data is loaded.
 */
export async function loadUsers() {
    let users = await getUsers();
    UserStore.setUsers(users);
}

