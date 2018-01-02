const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 8080
const server = require('http').createServer(app)
const io = require('socket.io')(server)

if(process.env.NODE_ENV !== 'production') {
    const webpackDevMiddleware = require('webpack-dev-middleware')
    const webpackHotMiddleware = require('webpack-hot-middleware')
    const webpack = require('webpack')
    const config = require('./webpack.dev')
    const compiler = webpack(config)

    app.use(webpackDevMiddleware(compiler, {
        noInfo: true, 
        publicPath: config.output.publicPath
    }))
    app.use(webpackHotMiddleware(compiler))
}

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
    res.sendFile(__dirname, '/dist/index.html')
})

const users = {}

io.on('connection', (socket) => {

    //When the client emits 'user joined', this executes
    socket.on('user joined', username => {
        //Store user data
        users[socket.id] = {
            username,
            //Generate random image for the user
            //the value of this key will be a number between 0 and 8
            //it will represent the name of the image from the images folder
            //for example if the value is 7 then the user image will be images/7.jpg
            picture: Math.floor((Math.random() * 9))
        }

        //Sends the list of users
        io.emit('users list', users)
    })

    //When the user disconnects, this executes
    socket.on('disconnect', () => {
        //Remove from the users object
        delete users[socket.id]

        //Sends the list of users to the current sockets
        socket.broadcast.emit('users list', users)
    })

})

server.listen(PORT, (error) => console.log(error ? error : `http://localhost:${PORT}`))