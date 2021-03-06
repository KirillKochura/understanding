'use strict';

const {MongoClient, ObjectId} = require('mongodb');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const csv = require('csvtojson');
const fs = require('fs');

const url = 'mongodb://localhost:27017';
const app = express();
const port = 4245;
const perPage = 20;
const upload = multer({dest: "uploads/"});

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const wrap = f => (req, res) => {
  f(req, res).catch(er => {
    console.error(er.stack);
    res.status(500);
    res.json({error: er});
  });
}

const connect = async (name) => {
  const db = await MongoClient.connect(url);
  const dbo = db.db("understanding");
  await dbo.createCollection(name);
  return {db, dbo};
}

let db, dbo;

const indexGetter = name => async (req, res) => {
  let objs, count;
  try {
    const q = {};
    const sort = {[req.query.sort || '_id']: 1};
    const skip = +(req.query.skip || 0);
    objs = await dbo.collection(name).find(q).sort(sort)
                                     .limit(perPage).skip(skip).toArray();
    count = await dbo.collection(name).find(q).count();
    res.json({data: objs, count});
  } catch (er) {
    db.close();
    res.json({data: [], count: 0, error: er.message});
    return;
  }
}

const showGetter = name => async (req, res) => {
  let obj;
  try {
    obj = await dbo.collection(name)
                   .findOne({_id: ObjectId(req.params.id)});
    res.json({data: obj});
  } catch (er) {
    db.close();
    res.json({error: er.message});
    return ;
  }
}

const getObjects = path => new Promise((resolve, reject) => {
  const objects = [];
  csv().fromFile(path).on('json', o=>{
    objects.push(o);
  }).on('done', ()=>resolve(objects));
});

const extractImages = (path, dir) => {
  const dn = '../build/img/'+dir;
  fs.mkdirSync(dn);
}

const poster = (name, valid) => async (req, res) => {
  try {
    if (valid && !valid(req.body)) throw new Error("ivalid data");
    if (req.header('Content-Type').match(/^multipart\/form-data/)) {
      const file = req.files['file'][0];
      const questionFieldData = JSON.parse(req.body.questionFieldData)
      const iKs = questionFieldData.filter(d=>d.type === 'image');
      const objects = await getObjects(file.path);
      objects.forEach(obj=>{
        iKs.forEach(k=>obj[k] = '/img/' + file.filename + '/' + obj[k].replace(/^\//,''));
      });
      const obj = {
        questionFieldData,
        objects,
        title: req.body.title,
        extra: {},
      }
      const arch = req.files["arch"];
      if(arch) extractImages(arch.path, file.filename);
      await dbo.collection(name).insertOne(obj);
    } else {
      await dbo.collection(name).insertOne(req.body)
    }
    res.json({ok: true});
  } catch (er) {
    db.close();
    console.error(er.stack);
    res.json({ok: false, error: er.message});
    return ;
  }
};

const deleter = name => async (req, res) => {
  try {
    const q = {_id: ObjectId(req.params.id)};
    await dbo.collection(name).deleteOne(q);
    res.json({ok: true});
  } catch (er) {
    db.close();
    res.json({ok: false, error: er.message});
    return;
  }
};

app.get('/api/tests',         wrap(indexGetter('tests')));
app.get('/api/tests?/:id',    wrap(showGetter('tests')));
const upl = upload.fields([{name: 'file', maxCount: 1}, {name: 'arch', maxCount: 1}]);
app.post('/api/tests?',       upl, wrap(poster('tests')));
app.delete('/api/tests?/:id', wrap(deleter('tests')));
connect('tests').then(r=>{
  db = r.db;
  dbo = r.dbo;
  app.listen(port, ()=> console.log(`Listening on port ${port} since ${new Date()}`));
}).catch((e) => {
  console.error(e.stack);
  process.exit(1);
});
