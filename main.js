const fs = require('fs')
const path = require('path')

const fetch = require('isomorphic-fetch')
const Dropbox = require('dropbox').Dropbox

const token = process.env.DROPBOX_TOKEN
const client = new Dropbox({ accessToken: token, fetch: fetch });

const { app, ipcMain, BrowserWindow } = require('electron')

class FiledropUploader {
  constructor(client, opts={}) {
    this.client = client
  }

  upload(uploadRequest) {
    let filePath = fs.realpathSync(uploadRequest.path)
    let fileInfo = path.parse(filePath)

    fs.readFile(filePath, (err, data) => {
      if(err) { throw err }

      this.client.filesUpload({
        contents: data,
        path: '/' + fileInfo.base,
        autorename: true
      })
      .then(console.log)
      .catch(console.error)
    })
  }
}

let uploadWindow = null
let uploader = new FiledropUploader(client)

function initApp() {
  console.log('Initializing app')

  ipcMain.on('file-upload-request', (event, file) => {
    console.log(event.sender === uploadWindow)
    console.log(event, file)

    uploader.upload(file)
  })

  uploadWindow = new BrowserWindow({ width: 305, height: 305 })
  uploadWindow.on('closed', () => { uploadWindow = null })
  uploadWindow.loadFile('filedrop.html')

  uploadWindow.webContents.openDevTools()
}

app.on('window-all-closed', () => { app.quit() })

app.on('ready', () => {
  console.log('App ready')
  initApp()
})
