const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

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
  fs.readdir(exports.dataDir, function (err, files) {
    if (err) {
      console.log('Err reading files');
    } else {
      var data = _.map(files, (file) => {
        var parsedFilename = file.replace('.txt', '');
        return {id: parsedFilename, text: parsedFilename};
      });
      callback(null, data); // data is the array that is the output of the mapping
    }
  }); // files is an array of file names
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
