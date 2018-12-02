const fs = require('fs')
const path = require('path')

const fetch = require('isomorphic-fetch'); // or another library of choice.
const Dropbox = require('dropbox').Dropbox

const token = process.env.DROPBOX_TOKEN
const client = new Dropbox({ accessToken: token, fetch: fetch });

let filePath = process.argv[2] || 'filedrop-test-file.txt'
filePath = fs.realpathSync(filePath)
let fileInfo = path.parse(filePath)

fs.readFile(filePath, (err, data) => {
  if(err) { throw err }

  client.filesUpload({
    contents: data,
    path: '/' + fileInfo.base,
    autorename: true
  })
  .then(console.log)
  .catch(console.error)
})
