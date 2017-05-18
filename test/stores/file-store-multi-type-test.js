/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    JSON5 = require('json5'),
    assert = require('assert'),
    nconf = require('../../lib/nconf'),
    data = require('../fixtures/data').data,
    store;

vows.describe('nconf/stores/file-multi-type').addBatch({
  "When using the nconf file store": {
    "with a valid JSON5 file": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'store.json5');
        fs.writeFileSync(filePath, JSON5.stringify(data, null, 2));
        this.store = store = new nconf.File({ file: filePath });
        return null;
      },
      "the load() method": {
        topic: function () {
          this.store.load(this.callback);
        },
        "should load the data correctly": function (err, data) {
          assert.isNull(err);
          assert.deepEqual(data, this.store.store);
        }
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json5'),
          tmpStore = new nconf.File({ file: tmpPath });
      return tmpStore;
    },
    "the save() method": {
      topic: function (tmpStore) {
        var that = this;

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        tmpStore.save(function (err) {
          fs.readFile(tmpStore.file, function (err, d) {
            fs.unlinkSync(tmpStore.file);

            return err
              ? that.callback(err)
              : that.callback(err, JSON5.parse(d.toString()));
          });
        });
      },
      "should save the data correctly": function (err, read) {
        assert.isNull(err);
        assert.deepEqual(read, data);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json5'),
          tmpStore = new nconf.File({ file: tmpPath });
      return tmpStore;
    },
    "the saveSync() method": {
      topic: function (tmpStore) {
        var that = this;

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        var saved = tmpStore.saveSync();

        fs.readFile(tmpStore.file, function (err, d) {
          fs.unlinkSync(tmpStore.file);

          return err
            ? that.callback(err)
            : that.callback(err, JSON5.parse(d.toString()), saved);
        });
      },
      "should save the data correctly": function (err, read, saved) {
        assert.isNull(err);
        assert.deepEqual(read, data);
        assert.deepEqual(read, saved);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    "the set() method": {
      "should respond with true": function () {
        assert.isTrue(store.set('foo:bar:bazz', 'buzz'));
        assert.isTrue(store.set('falsy:number', 0));
        assert.isTrue(store.set('falsy:string', ''));
        assert.isTrue(store.set('falsy:boolean', false));
        assert.isTrue(store.set('falsy:object', null));
      }
    },
    "the get() method": {
      "should respond with the correct value": function () {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.equal(store.get('falsy:number'), 0);
        assert.equal(store.get('falsy:string'), '');
        assert.equal(store.get('falsy:boolean'), false);
        assert.equal(store.get('falsy:object'), null);
      }
    },
    "the clear() method": {
      "should respond with the true": function () {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.isTrue(store.clear('foo:bar:bazz'));
        assert.isTrue(typeof store.get('foo:bar:bazz') === 'undefined');
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var secureStore = new nconf.File({
        file: path.join(__dirname, '..', 'fixtures', 'secure.json5'),
        secure: 'super-secretzzz'
      });

      secureStore.store = data;
      return secureStore;
    },
    "the stringify() method should encrypt properly": function (store) {
      var contents = JSON5.parse(store.stringify());
      Object.keys(data).forEach(function (key) {
        assert.isObject(contents[key]);
        assert.isString(contents[key].value);
        assert.equal(contents[key].alg, 'aes-256-ctr');
      });
    },
    "the parse() method should decrypt properly": function (store) {
      var contents = store.stringify();
      var parsed = store.parse(contents);
      assert.deepEqual(parsed, data);
    },
    "the load() method should decrypt properly": function (store) {
      store.load(function (err, loaded) {
        assert.isNull(err);
        assert.deepEqual(loaded, data);
      });
    },
    "the loadSync() method should decrypt properly": function (store) {
      var loaded = store.loadSync()
      assert.deepEqual(loaded, data);
    }
  }
}).export(module);

