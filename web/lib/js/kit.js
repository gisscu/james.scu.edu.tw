const gsheet = async (sheetId, tabNum) => {
  const sheetData = []
  const json = await $.get(`https://spreadsheets.google.com/feeds/list/${sheetId}/${tabNum}/public/full?alt=json`)
  const fmtJSON = (data) => {
    const obj = {}

    for (const key in data) {
      if (key.match('gsx')) {
        const keyName = key.replace('gsx$', '')

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
  const fmtSheet = []
  sheet.forEach((item) => {
    let status = false

    for (const key in tags) {
      if (item[key]) {
        const arr = item[key].split(',')
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
