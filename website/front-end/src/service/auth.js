import {auth,db} from "./firebase"
// export function signup(email, password,admin) {
//     auth().createUserWithEmailAndPassword(email, password).then(cred=>{
//         db.collection('Users').doc(cred.user.uid).set({
//
//         });
//     });
// }

export async function signin(email, password) {
    return auth().signInWithEmailAndPassword(email, password).then(async cred=>{
        try {
            const document = db.collection('Users').doc(cred.user.uid);
            let doc = await document.get();
            let docid = cred.user.uid;
            let data = doc.data();
            return { id: docid, ...data };
        } catch (error) {
            console.log(error);
        }
    });
}

export function signOut(){
    auth().signOut();
    window.localStorage.clear()
    window.sessionStorage.clear()
}
