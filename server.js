const http = require("http")
const https = require("https")
const path = require("path")
const fs = require("fs")
const url = require("url")

// Map id to JSON.
const fakeDatabase = {}

function getJson(boardID, userSession) {
  https.get({
    hostname: "adventofcode.com",
    path: `/2018/leaderboard/private/view/${boardID}.json`,
    method: "GET",
    headers: {
      "cookie": `session=${userSession}`,
    }
  }, (res) => {
    let data = ""
    res.on("data", (d) => {
      data += d
    })
    res.on("end", () => {
      fakeDatabase[boardID] = JSON.parse(data)
    })
  }).on("error", (e) => {
    console.error(e)
  })
}

const { SESSION, BOARD_ID } = process.env
if (!SESSION) {
  console.error("SESSION should be provided as env variable")
  process.exit(1)
}
if (!BOARD_ID) {
  console.error("BOARD_ID should be provided as env variable")
  process.exit(1)
}
function fetchStuff() {
  getJson(BOARD_ID, SESSION)
  // Update Stuff every 5 mins
  setInterval(() => {
    console.log("OKAY, let me fetch new board data")
    getJson(BOARD_ID, SESSION)
  }, 60 * 1000 * 5)
}
fetchStuff()

function serveStaticFiles(req, res) {
  const parsedUrl = url.parse(req.url)
  let pathname = `.${parsedUrl.pathname}`
  const ext = path.parse(pathname).ext
  // maps file extention to MIME typere
  const map = {
    '.ico': 'image/x-icon',
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg'
  }


  fs.exists(pathname, function (exist) {
    if (!exist) {
      // if the file is not found, return 404
      res.statusCode = 404
      res.end(`File ${pathname} not found!`)
      return
    }

    // if is a directory search for index file matching the extention
    if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext

    // read file from file system
    fs.readFile(pathname, function (err, data) {
      if (err) {
        res.statusCode = 500
        res.end(`Error getting the file: ${err}.`)
      } else {
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', map[ext] || 'text/plain')
        res.end(data)
      }
    })
  })
}

const app = http.createServer(function (req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, PUT, POST",
    // This application can only provides json, so...
    "Content-type": "application/json",
  }
  const components = req.url.split("/")
  const id = components[components.length - 1]
  if (fakeDatabase[id]) {
    res.writeHead(200, headers)
    res.end(JSON.stringify(fakeDatabase[id]))
    return
  }

  serveStaticFiles(req, res)
})
app.listen(80)

