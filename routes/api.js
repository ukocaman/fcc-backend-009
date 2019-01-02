/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

// var expect = require('chai').expect;
// var MongoClient = require('mongodb');

// const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const axios = require('axios')
const Stock = require('../models/stock')

async function getPrice(ticker) {
  const STOCK_API = `https://api.iextrading.com/1.0/stock/${ticker}/price`
  try {
    const response = await axios.get(STOCK_API)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

// function getLikes(ticker) {
//   return Stock.findOne({ ticker })
//   .then(stock => { 
//     return stock ? stock.ips.length : 0 
//   })
//   .catch(e => console.log(e))
// }
async function getLikes(ticker) {
  ticker = ticker.toUpperCase()
  try {
    let stock = await Stock.findOne({ ticker })
    return stock ? stock.ips.length : 0 
  } catch(e) {
    console.log(e)
  }
}

async function increaseLike(ticker, ip) {
  ticker = ticker.toUpperCase()
  try {
    let stock = await Stock.findOne({ ticker })
    if(!stock) {
      const newStock = new Stock({ ticker, ips: [ip] })
      let savedStock = await newStock.save()
      console.log('New stock created:', savedStock)
      return savedStock
    } else {
      if(!stock.ips.includes(ip)) {
        stock.ips = [...stock.ips, ip]
        let savedStock = await stock.save()
        console.log('IP is added to stock created:', savedStock)
        return savedStock
      } else {
        console.log('IP was already in stock:', stock)
        return stock
      }     
    }
  } catch (e) {
    console.log(e)
  }
}

async function noLikeResponse(stock) {
  try {
    if(Array.isArray(stock)) { // stock array
      let firstStockLikes = await getLikes(stock[0])
      let secondStockLikes = await getLikes(stock[1])
      let firstPrice = await getPrice(stock[0])
      let secondPrice = await getPrice(stock[1])
      return ({ stockData:[
                { stock: stock[0].toUpperCase(), price: firstPrice, "rel_likes": firstStockLikes - secondStockLikes },
                { stock: stock[1].toUpperCase(), price: secondPrice, "rel_likes": secondStockLikes - firstStockLikes }] 
             })
    } else { // single stock
      let likes = await getLikes(stock)
      let price = await getPrice(stock)
      return { stockData: { stock: stock.toUpperCase(), price, likes } }
    }
  } catch(e) {
    console.log(e)
  }
}

async function withLikeResponse(stock, ip) {
  try {    
    if(Array.isArray(stock)) { // stock array
      let firstStockWithLikes = await increaseLike(stock[0], ip)
      let secondStockWithLikes = await increaseLike(stock[1], ip)
      let firstStockLikes = await getLikes(stock[0])
      let secondStockLikes = await getLikes(stock[1])
      let firstPrice = await getPrice(stock[0])
      let secondPrice = await getPrice(stock[1])
      return ({ stockData:[
                { stock:stock[0].toUpperCase(), price: firstPrice, "rel_likes": firstStockLikes - secondStockLikes },
                { stock:stock[1].toUpperCase(), price: secondPrice, "rel_likes": secondStockLikes - firstStockLikes }] 
             })
  
    } else { // single stock
      let stockWithLikes = await increaseLike(stock, ip)
      let likes = await getLikes(stock)
      let price = await getPrice(stock)
      return ({
        stockData: { stock: stock.toUpperCase(), price, likes } 
      })
    }
  } catch(e) {
    console.log(e)
  }
}

// async function updateLikesInDB(stock, ip) {
//   if(Array.isArray(stock)) { // stock array
//     let firstStockWithLikes = await increaseLike(stock[0], ip)
//     let secondStockWithLikes = await increaseLike(stock[1], ip)
//   } else { //single stock
//     let stockWithLikes = await increaseLike(stock, ip)
//   }
// }

module.exports = async function (app) {

  app.route('/api/stock-prices')
    .get((req, res) => {
      console.log('query:', req.query)
      console.log('IP:', req.ip)
      // req-query: { stock: 'msft', like: 'true' } OR { stock: 'msft' }
      // req-query: { stock: [ 'goog', 'msft' ], like: 'true' } OR no like
      const { stock, like } = req.query
      const { ip } = req
      
      if(like) { //update db!
        withLikeResponse(stock, ip).then(json => res.json(json)).catch(e => console.log(e))
      } else { // just get req
        noLikeResponse(stock).then(json => res.json(json)).catch(e => console.log(e))
      }
    })
    
};
