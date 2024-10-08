const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
require('dotenv').config()
const Person = require('./models/person.js')

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

morgan.token('data', (req) => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({}).then(persons => {
    response.send(
      `<p>The phonebook has info for ${persons.length} people</p>
            <p>${new Date()}</p>`
    )
  })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
    
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
    
})

app.delete('/api/persons/:id', (request, response, next) => {
    
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))

})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }
    
  Person.findByIdAndUpdate(
    request.params.id, 
    person, 
    { new: true, runValidators: true }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))

})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
    
  if(error.name === 'CastError') {
    response.status(400).send({ error: 'malformated id' })
  } else if (error.name === 'ValidationError') {
    response.status(400).send({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

