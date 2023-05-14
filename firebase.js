import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js";
import { getFirestore,doc, getDoc,collection,addDoc,getDocs, query, where, onSnapshot, limit, orderBy, setDoc, serverTimestamp,  updateDoc, arrayUnion, arrayRemove,  increment, deleteDoc, deleteField} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, sendEmailVerification, signOut , signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js"
import { randomString } from "../tools/ramdoms";

const firebaseConfig = {
    apiKey: "AIzaSyDbTyrJG-Ps21mTsxB3NxpTEPVxdecmSFE",
    authDomain: "musicbeer-1.firebaseapp.com",
    projectId: "musicbeer-1",
    storageBucket: "musicbeer-1.appspot.com",
    messagingSenderId: "705639433555",
    appId: "1:705639433555:web:c6fc40d9b1c78f5a28cda6",
    measurementId: "G-BBP3MW6VV5"
};

const AppF= initializeApp(firebaseConfig);
const db = getFirestore(AppF);

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Function to extract data from firestore query
async function getDocumentsFromQuery(q) {
    const result = [];
    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            result.push({ id: doc.id, data: doc.data() });
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
    return result;
}

// Get unique data from a specific path
export const getUniqueData = async (path) => {
    const docRef = doc(db, path);
    try {
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
        console.error("Error getting document: ", error);
        return null;
    }
}

// Get data matching a specific condition
export const getDataWithCondition = async (path, field, condition, value) => {
    const q = query(collection(db, path), where(field, condition, value));
    return await getDocumentsFromQuery(q);
}

// Get limited amount of data from a collection
export const getLimitedData = async (collectionName, limitCount) => {
    const q = query(collection(db, collectionName), limit(limitCount));
    return await getDocumentsFromQuery(q);
}

// Get data ordered by a specific field
export const getOrderedData = async (collectionName, orderByField) => {
    const q = query(collection(db, collectionName), orderBy(orderByField));
    return await getDocumentsFromQuery(q);
}

// Get data with multiple conditions (where, orderBy, limit)
export const getFilteredData = async (collectionName, whereInfo, orderByField, limitCount) => {
    const q = query(
        collection(db, collectionName),
        where(whereInfo.field, whereInfo.condition, whereInfo.value),
        orderBy(orderByField),
        limit(limitCount)
    );
    return await getDocumentsFromQuery(q);
}

// Get all data from a collection
export const getAllData = async (collectionName) => {
    return await getDocumentsFromQuery(collection(db, collectionName));
}

// Function to monitor changes in a document
export const monitorDocumentChanges = (path, id) => {
    return onSnapshot(doc(db, path, id), (doc) => {
        return { data: doc.data() };
    });
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Helper function to assign a timestamp to the data
const addTimestampToData = (data) => {
    return { ...data, timestamp: serverTimestamp() };
}

// Agregar datos únicos
export const addUniqueData = async (path, data) => {
    await setDoc(doc(db, path), data);
}

// Agregar datos únicos con ID automático
export const addUniqueDataWithAutoId = async (collectionName, data, callback) => {
    const docRef = await addDoc(collection(db, collectionName), data);
    callback(docRef.id);
}

// Agregar datos únicos con timestamp
export const addUniqueDataWithTimestamp = async (path, data) => {
    const newData = addTimestampToData(data);
    await setDoc(doc(db, path), newData);
}

// Agregar datos únicos con ID automático y timestamp
export const addUniqueDataWithAutoIdAndTimestamp = async (path, data, callback) => {
    const newData = addTimestampToData(data);
    const id = randomString(20);
    await setDoc(doc(db, `${path}${id}`), newData);
    callback(id);
}

// Actualizar datos únicos
export const updateUniqueData = async (path, data) => {
    const docRef = doc(db, path);
    await updateDoc(docRef, data);
}

// Actualizar datos únicos con timestamp
export const updateUniqueDataWithTimestamp = async (path, data) => {
    const newData = addTimestampToData(data);
    const docRef = doc(db, path);
    await updateDoc(docRef, newData);
}

// Actualizar array de datos
export const updateArrayData = async (path, data) => {
    const updatedData = { [data.apiKey]: arrayUnion(data.item) };
    const docRef = doc(db, path);
    await updateDoc(docRef, updatedData);
}

// Incrementar datos
export const incrementData = async (collectionName, id, data) => {
    const updatedData = { [data.apiKey]: increment(data.item) };
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
}

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Eliminar un elemento de un array de datos
export const removeItemFromArrayData = async (collectionName, id, data) => {
    const updatedData = { [data.apiKey]: arrayRemove(data.item) };
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
}

// Eliminar un documento
export const removeDocument = async (collectionName, id) => {
    await deleteDoc(doc(db, collectionName, id));
}

// Eliminar un campo de un documento
export const removeFieldFromDocument = async (collectionName, id, data) => {
    const updatedData = { [data.apiKey]: deleteField() };
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, updatedData);
}
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Obtener el usuario actual
export function getCurrentUser(callback) {
    const auth = getAuth();
    onAuthStateChanged(auth, async(user) => {
        if (user) {
            await callback(user)
        } else {
            await callback(false)
            console.log("Error: no existe usuario actual")
        }
    });
}

// Autenticar usuario con email y contraseña
export function authenticateUserWithEmailPassword(email, password, callback) {
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            callback([true, user]);
        })
        .catch((error) => {
            callback([false, error.code]);
        }); 
}

// Enviar correo de verificación
export function sendEmailVerification(callback) {
    const auth = getAuth();
    sendEmailVerification(auth.currentUser)
        .then(() => {
            callback({ send: true, resp: auth.currentUser.email });
        })
        .catch((error) => {
            callback({ send: false, resp: error });
        }); 
}

// Cerrar sesión del usuario
export function signOutUser(callback) {
    const auth = getAuth();
    signOut(auth)
        .then(() => {
            callback();
        })
        .catch((error) => {
            console.log(error);
            return error;
        });
}
// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Fusiones
/**
 * Fusiona la funcionalidad de obtener el usuario actual y establecer datos únicos con un timestamp.
 * 
 * @param {string} route - La ruta a la colección en la base de datos.
 * @param {Object} data - Los datos que se van a establecer en la base de datos.
 * @param {Function} callback - Una función callback que se llama después de que los datos se han establecido.
 */

export function getCurrentUserSetDataWithTimestamp(route, data, callback) {
    getCurrentUser(async (user) => {
        await addUniqueDataWithTimestamp(route + "/", { ...data, user: user.email }, callback);
    });
}

/**
 * Retorna la información del usuario actualmente autenticado.
 *
 * @returns {Object|null} Un objeto con la información del usuario, o null si no hay ningún usuario autenticado.
 */
// Obtener información del usuario
export const getUserInfo = () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user !== null) {
        const displayName = user.displayName;
        const email = user.email;
        const photoURL = user.photoURL;
        const emailVerified = user.emailVerified;
        const uid = user.uid;
        
        return user;
    }
}


/**
 * Inicia sesión de un usuario con correo electrónico y contraseña.
 *
 * @param {string} email - El correo electrónico del usuario.
 * @param {string} password - La contraseña del usuario.
 * @param {Function} callback - Una función callback que se llama después de que el usuario ha iniciado sesión.
 * @returns {string|null} Un mensaje de error, o null si no hay ningún error.
 */
// Iniciar sesión de usuario
export const signInUser = (email, password, callback) => {
    console.table(email, password);
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            callback(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage, errorCode);
            return errorMessage;
        });
}

// -----------------------------  Filtros de búsqueda  -------------------------------------------------------------------------------------------------------------------

/**
 * Obtiene datos de la base de datos que cumplen con tres filtros.
 *
 * @param {string} route - La ruta a la colección en la base de datos.
 * @param {Object} filter1 - El primer filtro que se aplicará. Debe ser un objeto con las propiedades 'key', 'condition' y 'value'.
 * @param {Object} filter2 - El segundo filtro que se aplicará. Debe ser un objeto con las propiedades 'key', 'condition' y 'value'.
 * @param {Object} filter3 - El tercer filtro que se aplicará. Debe ser un objeto con las propiedades 'key', 'condition' y 'value'.
 * @returns {Array|boolean} Un array con los datos que cumplen los filtros, o false si no hay ningún dato que cumpla los filtros.
 */
// Obtener datos con tres filtros
export async function getDataWithThreeFilters(route, filter1, filter2, filter3) {
    let result = [];
    const q = query(
        collection(db, route),
        where(filter1.key, filter1.condition, filter1.value),
        where(filter2.key, filter2.condition, filter2.value),
        // Descomente la siguiente línea si necesita el tercer filtro
        // where(filter3.key, filter3.condition, filter3.value),
    );
    
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        result.push({ ...doc.data(), idThis: doc.id });
    });

    return result.length !== 0 ? result : false;
}

// ---------------------------------------------------------------------For GPT-------------------------------------------------------------------------------------
/**
 * Función para autenticar y establecer datos en la base de datos.
 * 
 * @param {string} email - El correo electrónico del usuario.
 * @param {string} password - La contraseña del usuario.
 * @param {string} route - La ruta a la colección en la base de datos.
 * @param {Object} data - Los datos que se van a establecer en la base de datos.
 * @returns {Promise} Promesa que se resuelve una vez que el usuario se ha autenticado y los datos se han establecido en la base de datos.
 */
export async function signInAndSetData(email, password, route, data) {
    try {
        signInUser(email, password, () => { });
        getCurrentUserSetDataWithTimestamp(route, data, () => { });
        return Promise.resolve("User signed in and data set successfully.");
    } catch (error) {
        return Promise.reject(error.message);
    }
}


/**
 * Función para autenticar a un usuario, establecer datos en la base de datos y luego enviar un correo electrónico de verificación.
 * 
 * @param {string} email - El correo electrónico del usuario.
 * @param {string} password - La contraseña del usuario.
 * @param {string} route - La ruta a la colección en la base de datos.
 * @param {Object} data - Los datos que se van a establecer en la base de datos.
 * @returns {Promise} Promesa que se resuelve una vez que el usuario se ha autenticado, los datos se han establecido en la base de datos y se ha enviado el correo electrónico de verificación.
 */
export async function signUpSetDataAndVerifyEmail(email, password, route, data) {
    try {
        // Autenticamos al usuario.
        await authUserEmailPass(email, password, () => {});

        // Establecemos los datos en la base de datos.
        await userCurrentSetUniqAutoIdDataWhithTimestamp(route, data, () => {});

        // Enviamos el correo de verificación.
        await sendAEmailVerification(() => {});

        return Promise.resolve("Usuario autenticado, datos establecidos y correo de verificación enviado exitosamente.");
    } catch (error) {
        return Promise.reject(error.message);
    }
}
