/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
const Stock = require('../models/stock')

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.property(res.body.stockData, 'price');
          assert.property(res.body.stockData, 'likes');
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'C', like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.equal(res.body.stockData.stock, 'C');
          assert.property(res.body.stockData, 'price');
          assert.equal(res.body.stockData.likes, 1);
          Stock.findOneAndDelete({ ticker: 'C' }).then(s=>{}) // DB cleanup
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        const newStock = new Stock({ ticker: "C", ips: ["::ffff:127.0.0.1"] })
        newStock.save()
        .then(s => {
          chai.request(server)
          .get('/api/stock-prices')
          .query({stock: 'C', like: 'true'})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'stockData');
            assert.equal(res.body.stockData.stock, 'C');
            assert.property(res.body.stockData, 'price');
            assert.equal(res.body.stockData.likes, 1);
            Stock.findOneAndDelete({ ticker: 'C' }).then(s=>{}) // DB cleanup
            done();
          });
        })
        
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData)
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.property(res.body.stockData[0], 'price');
          assert.property(res.body.stockData[0], 'rel_likes');
          assert.equal(res.body.stockData[1].stock, 'MSFT');
          assert.property(res.body.stockData[1], 'price');
          assert.property(res.body.stockData[1], 'rel_likes');
          done();
        });
      });
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['A', 'C'], like: 'true'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'stockData');
          assert.isArray(res.body.stockData)
          assert.equal(res.body.stockData[0].stock, 'A');
          assert.property(res.body.stockData[0], 'price');
          assert.equal(res.body.stockData[0].rel_likes, 0);
          assert.equal(res.body.stockData[1].stock, 'C');
          assert.property(res.body.stockData[1], 'price');
          assert.equal(res.body.stockData[1].rel_likes, 0);
          Stock.findOneAndDelete({ ticker: 'A' }).then(s=>{}) // DB cleanup
          Stock.findOneAndDelete({ ticker: 'C' }).then(s=>{}) // DB cleanup
          done();
        });
      });
      
    });

});
