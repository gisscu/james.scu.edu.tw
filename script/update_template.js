const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')
const {GoogleSpreadsheet} = require('google-spreadsheet')
const creds = require('./credentials.json')
const creds2 = require('./gwtracker-sheet-7c4c126cc922.json')
const sharp = require('sharp')
const pdf = require('pdf-parse')
const { exec } = require('child_process')
const sleepTime = 200
const config = require('./config.js')
const sheetId = config.sheetId
const galleryId = config.galleryId
const tagsId = 1567870681


const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
]

const TOKEN_PATH = 'token.json'

console.log(`pdf max length: ${process.argv[2]}`)
authorize(api)

async function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms))
}

function authorize(callback) {
  const {client_secret, client_id, redirect_uris} = creds.installed
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0])

  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback)
    oAuth2Client.setCredentials(JSON.parse(token))
    callback(oAuth2Client)
  })
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })
  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', TOKEN_PATH)
      })
      callback(oAuth2Client)
    })
  })
}

function read(path) {
	return new Promise((resolve, reject) => {
		fs.readFile(path, 'utf-8', (err, data) => {
			if (err) {
				reject(err)
			} else {
				resolve(data)
			}
		})
	})
}

function write(path, text) {
	return new Promise((resolve, reject) => {
		fs.writeFile(path, text, (err, data) => {
			if (err) {
				reject(err)
      }
      resolve(data)
		})
	})
}

function func(cmd) {
	return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(stdout)
    });
  })
}

async function api(auth) {
  const drive = google.drive({version: 'v3', auth})
  let doc = new GoogleSpreadsheet(sheetId)
  let sheet
  let regex = /\/d\/(\S*)\/view/

  let getFile = (fileId) => {
    return new Promise((resolve, reject) => {
      console.log(fileId)
      drive.files.get(
        {
          fileId,
          alt: "media",
          supportsAllDrives: true
        },
        { responseType: "stream" },
        function(err, res) {
          // console.log(fileId)
          if (err) {
            console.log("The API returned an error: " + err.message)
            return getFile(fileId)
          }

          let buf = []
          res.data.on("data", function(e) {
            buf.push(e)
          })
          res.data.on("end", function() {
            const buffer = Buffer.concat(buf)
            // fs.writeFile("filename", buffer, err => console.log(err)) // For testing
            resolve({ data: buffer, mimeType: res.headers['content-type']})
          })
        }
      )
    })
  }

  await doc.useServiceAccountAuth(creds2)
  await doc.loadInfo()

  sheet = doc.sheetsById[galleryId]

  await write('./count.json', '{}')

  let galleryRows = await sheet.getRows()
  console.log('updated on ' + doc.title + ', sheet: ' + sheet.title)

  for (let i = 0; i < galleryRows.length; i++) {
    let row = galleryRows[i]
    if (regex.exec(row.media)) {
      let fileId = regex.exec(row.media)[1]
      let res = await getFile(fileId)
      let file = res.data
      let fileMeta = res.mimeType

      if (file && fileMeta.match('image')) {
        let thumbnailName = `./thumbnail/${fileId}.jpg`
        try {
          await sharp(file).resize({
            width: 300,
            fit: 'inside'
          }).jpeg().toFile(`../web/gallery/${thumbnailName}`)
          row.thumbnail = thumbnailName
        } catch (err) {
          console.log(err)
        }

        let sampleName = `./sample/${fileId}.jpg`
        try {
          await sharp(file).resize({
            width: 600,
            fit: 'inside'
          }).jpeg().toFile(`../web/gallery/${sampleName}`)
          row.sample = sampleName
        } catch (err) {
          console.log(err)
        }
      } else if (file && fileMeta.match('pdf')) {
        await write('./map.json', '{}')

        let fullText = await pdf(file)

        // let sampleText = await pdf(file, {
          // max: 1,
        // })

        await write('./word', fullText.text)
        await func('python3 jiebapy.py')

        let map = await read('./map.json')
        map = JSON.parse(map)

        let tag = []
        for (let key in map) {
          tag.push(key)
        }

        row.jieba_tags = tag.toString()
        // row.content = sampleText.text
        let max = parseInt(process.argv[2])
        if (isNaN(max)) max = 300
        row.content = fullText.text.substring(0, max)
      }

      await row.save()
      await sleep(sleepTime)
    }
  }

  // if (process.argv[2] === '1') {
    // let count = await read('./count.json')
    // count = JSON.parse(count)

    // sheet = doc.sheetsById[tagsId]
    // let tagsRows = await sheet.getRows()
    // console.log('updated on ' + doc.title + ', sheet: ' + sheet.title)

    // let fmtCount = []
    // for (let key in count) {
      // fmtCount.push({
        // tag: key,
        // count: count[key],
      // })
    // }

    // fmtCount.sort((a, b) => {
      // return b.count - a.count
    // })

    // let saveData = async (i) => {
      // try {
        // let word = fmtCount[i]
        // if (tagsRows[i]) {
          // tagsRows[i].tag = word.tag
          // tagsRows[i].count = word.count
          // tagsRows[i].display = false
          // await tagsRows[i].save()
        // } else {
          // let row = await sheet.addRow({
            // tag: word.tag,
            // count: word.count,
            // display: false,
          // })
          // await sleep(1000)
          // await row.save()
        // }
        // console.log(i)
        // await sleep(1000)
      // } catch (err) {
        // console.log("The API returned an error: " + err.message)
        // await saveData(i)
      // }
    // }

    // for (let i = 0; i < fmtCount.length; i++) {
      // await saveData(i)
    // }
  // }

}

module.exports = {
  SCOPES,
  api,
}
