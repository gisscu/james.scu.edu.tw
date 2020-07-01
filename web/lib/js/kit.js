const gsheet = async (sheetId, tabNum) => {
  let sheetData = []
	let json = await $.get(`https://spreadsheets.google.com/feeds/list/${sheetId}/${tabNum}/public/full?alt=json`)
  let fmtJSON = (data) => {
    let obj = {}

    for (let key in data) {
      if (key.match('gsx')) {
        let keyName = key.replace('gsx$', '')

        obj[keyName] = data[key].$t
      }
    }

    return obj
  }

  json.feed.entry.map(data => {
    sheetData.push(fmtJSON(data))
  })


  return sheetData
}

const filter = (sheet, tags) => {
  let fmtSheet = []
  sheet.forEach((item) => {
    let status = false

    for (let key in tags) {
      if (item[key]) {
        let arr = item[key].split(',')
        tags[key].forEach((tag) => {
          if (arr.indexOf(tag) !== -1) {
            status = true
          }
        })
      }
    }

    if (status) {
      fmtSheet.push(item)
    }
  })

  return fmtSheet
}

window.filter = filter
window.gsheet = gsheet
