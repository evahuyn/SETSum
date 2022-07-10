const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors({ origin: true }));
var serviceAccount = require("./permissions.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.get('/hello-world', (req, res) => {
  return res.status(200).send('Hello World!');
});

// get all bubbleData
app.get('/Bubbles', (req, res) => {
    (async () => {
        try {
            let response = [];
            return db.collection('Bubbles').get().then(snapshot => {
                snapshot.forEach((doc) => {
                    let docid = doc.id;
                    let data = doc.data();
                    response.push({ id: docid, ...data });
                });
                console.log(response);
                return res.send(response);
            });
        } catch (error) {
            debug.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get bubbleData by id
app.get('/Bubbles/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Bubbles').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post bubbleData
app.post('/Bubbles', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Bubbles');
            let docid = await req.body.id;
            let doc = await document.doc(docid.toString()).set(req.body);
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get tableData by id
app.get('/Tables/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Tables').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post tableData
app.post('/Tables', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Tables');
            let docid = await req.body.id;
            let doc = await document.doc(docid.toString()).set(req.body);
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get scatterData by id
app.get('/Scatters/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Scatters').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post scatterData
app.post('/Scatters', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Scatters');
            let docid = await req.body.id;
            let doc = await document.doc(docid.toString()).set(req.body);
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get courseInfo by id
app.get('/Infos/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Infos').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post courseInfo
app.post('/Infos', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Infos');
            let docid = await req.body.id;
            let doc = await document.doc(docid.toString()).set(req.body);
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post courseStats
app.post('/CourseStats', (req, res) => {
    (async () => {
        try {
            const document = db.collection('CourseStats');
            let courseDic = req.body
            for (let [key, value] of Object.entries(courseDic)){
                let stats = {}
                stats["id"] = key
                stats["data"] = value
                let doc = await document.doc(key.toString()).set(stats);
            }
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get courseStats by id
app.get('/CourseStats/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('CourseStats').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post instructorStats
app.post('/InstructorStats', (req, res) => {
    (async () => {
        try {
            const document = db.collection('InstructorStats');
            let courseDic = req.body
            for (let [key, value] of Object.entries(courseDic)){
                let stats = {}
                stats["id"] = key
                stats["data"] = value
                let doc = await document.doc(key.toString()).set(stats);
            }
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get instructorStats by id
app.get('/InstructorStats/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('InstructorStats').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// post quantRates
app.post('/QuantRates', (req, res) => {
    (async () => {
        try {
            const document = db.collection('QuantRates');
            let courseDic = req.body
            for (let [key, value] of Object.entries(courseDic)){
                value["id"] = key
                let doc = await document.doc(key.toString()).set(value);
            }
            return res.status(200).send({...req.body });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get quantRates by id
app.get('/QuantRates/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('QuantRates').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// get user by id
app.get('/Users/:id', (req, res) => {
    (async () => {
        try {
            const document = db.collection('Users').doc(req.params.id);
            let doc = await document.get();
            let docid = doc.id;
            let data = doc.data();
            return res.status(200).send({ id: docid, ...data });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

// delete
// app.delete("/:id", async (req, res) => {
//   await
//   admin.firestore().collection("users").doc(req.params.id).delete();
//
//   res.status(200).send();
// })

exports.api = functions.https.onRequest(app);