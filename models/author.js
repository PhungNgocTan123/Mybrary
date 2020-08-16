const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    BungBau: [{ type: mongoose.Schema.Types.ObjectId }]
})

module.exports = mongoose.model('Author', authorSchema)