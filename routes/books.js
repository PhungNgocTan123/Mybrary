const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Book = require('../models/book')
const Author = require('../models/author')
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Books Route
router.get('/', async (req, res) => {
    let query = Book.find()
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }
    if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
        query = query.lte('publishDate', req.query.publishedBefore)
    }
    if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
        query = query.gte('publishDate', req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book())
})

// Create Book Route
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        description: req.body.description
    })
    try {
        const newBook = await book.save()

        await Author.findOneAndUpdate({ _id: req.body.author }, {
            $push: { BungBau: newBook._id }
        })
        const Authors = await Author.aggregate([{
            $lookup: {
                from: "books",
                localField: "BungBau",
                foreignField: "_id",
                as: "DS"
            }
        }])
        res.redirect(`books/${newBook.id}`)
        // res.redirect(`books`)
    } catch (err) {
        console.log(err)
        if (book.coverImageName != null) {
            removeBookCover(book.coverImageName)
        }

        renderNewPage(res, book, true)
    }
})
function removeBookCover(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}
async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError)
}

// Show Book route 
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author')
            .exec()
        res.render('books/show', { book: book })
    } catch {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderEditPage(res, book)
    } catch {
        res.redirect('/')
    }
})

// method Delete 
router.delete('/:id', async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (err) {
        console.log(err)
        if (book != null) {
            res.render('books/show', {
                book: book,
                errorMessage: 'Could not remove book'
            })
        } else {
            res.redirect('/')
        }
    }
})
async function renderEditPage(res, book, hasError = false) {
    renderFormPage(res, book, 'edit', hasError)
}
async function renderFormPage(res, book, form, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render(`books/${form}`, params)
    } catch {
        res.redirect('/books')
    }
}
// Update Book 
router.put('/:id', upload.single('cover'), async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if (req.file.filename != null && req.file.filename !== '') {
            book.coverImageName = req.file.filename
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (err) {
        console.log('error: ' + err)
        renderEditPage(res, book, true)
    }
})
// Pagination
// router.get('/pagination/:page', async (req, res) => {
//     try {
//         const numberOfPage = 4
//         const page = req.params.page
//         const skip = (page - 1) * numberOfPage

//         const Books = await Book.find().skip(skip).limit(numberOfPage).exec()
//         res.json(Books)

//     } catch (err) {
//         console.log('err' + err)
//     }
// })
module.exports = router