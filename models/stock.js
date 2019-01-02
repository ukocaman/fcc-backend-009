const mongoose = require('mongoose')

const stockSchema = new mongoose.Schema({ 
  ticker: {
    type: String,
    unique: true
  },
  ips: [String] // ips need to be uniqe!!
})

module.exports = mongoose.model('Stock', stockSchema)
