const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

const readdirAsync = Promise.promisify(fs.readdir);
const readFileAsync = Promise.promisify(fs.readFile);
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId(function (err, counterString) {
    if (err) {
      console.log('some error');
    } else {
      var id = counterString;
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, (err, data) => {
        if (err) {
          callback(error, null);
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.readAll = (callback) => {
  var ids = [];
  return readdirAsync(exports.dataDir)
    .then(function (files) {
      return Promise.map(files, function(filename) {
        ids.push(filename.replace('.txt', ''));
        return readFileAsync(`${exports.dataDir}/${filename}`);
      });
    })
    .then(function(todos) {
      var data = [];
      for (let i = 0; i < ids.length; i++) {
        var todoObj = {};
        todoObj['id'] = ids[i];
        todoObj['text'] = todos[i].toString();
        data.push(todoObj);
      }
      callback(null, data);
    })
    .catch(function(e) {
      callback(e, null);
    });
};

exports.readOne = (id, callback) => {
  fs.readFile(`${exports.dataDir}/${id}.txt`, (err, text) => {
    if (err) {
      callback(Error('No id exists'), null);
    } else {
      var todo = { id: id, text: text.toString()};
      callback(null, todo);
    }
  });
};

exports.update = (id, text, callback) => {
  exports.readOne(id, (err, data) => {
    if (err) {
      callback(Error('No id exists'), null);
    } else {
      fs.writeFile(`${exports.dataDir}/${id}.txt`, text, (err) => {
        if (err) {
          callback(Error('Error updating file'), null);
        } else {
          callback(null, { id, text } );
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  exports.readOne(id, (err, data) => {
    if (err) {
      callback(Error('No id exists'), null);
    } else {
      fs.unlink(`${exports.dataDir}/${id}.txt`, (err) => {
        if (err) {
          callback(Error('Error deleting file'), null);
        } else {
          callback();
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
