const http = require("http")
const https = require("https")
const path = require("path")

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

const app = http.createServer(function (req, res) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With",
    "Access-Control-Allow-Methods": "GET, PUT, POST",
    // This application can only provides json, so...
    "Content-type": "application/json",
  }
  res.writeHead(200, headers)

  const newPath  = path.join(__dirname, req.url)
  if (newPath.split("/").length < __dirname.split("/").length) {
    res.end("")
    return
  }
  const components = newPath.split("/")
  const id = components[components.length - 1]
  if (!fakeDatabase[id]) {
    res.end("")
    return
  }

  res.end(JSON.stringify(fakeDatabase[id]))
})
app.listen(80)

