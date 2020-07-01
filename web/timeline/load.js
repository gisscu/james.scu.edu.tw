$(function () {
  var embed = document.getElementById('timeline-embed')
  embed.style.height = getComputedStyle(document.body).height - 56

  $.get('https://spreadsheets.google.com/feeds/list/1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo/1/public/full?alt=json', (data) => {

    console.log(data)

    let fmtData = {
      events: [],
      eras: [],
    }

    let fmtEntry = (data) => {
      return {
        start_date: {
          year: data.gsx$year.$t,
          month: data.gsx$month.$t,
          day: data.gsx$day.$t,
          hour: data.gsx$time.$t.split(':')[0],
          minute: data.gsx$time.$t.split(':')[1],
          second: data.gsx$time.$t.split(':')[2],
          daisplay_text: data.gsx$displaydate.$t,
        },
        end_date: {
          year: data.gsx$endyear.$t,
          month: data.gsx$endmonth.$t,
          day: data.gsx$endday.$t,
          hour: data.gsx$endtime.$t.split(':')[0],
          minute: data.gsx$endtime.$t.split(':')[1],
          second: data.gsx$endtime.$t.split(':')[2],
        },
        media: {
          caption: data.gsx$mediacaption.$t,
          credit: data.gsx$mediacredit.$t,
          url: data.gsx$media.$t,
          thumbnail: data.gsx$mediathumbnail.$t,
        },
        text: {
          headline: data.gsx$headline.$t,
          text: data.gsx$text.$t,
        },
        type: data.gsx$type.$t,
        group: data.gsx$group.$t,
        background: data.gsx$background.$t,
      }
    }

    let makeTitle = (data) => {
      return {
        media: data.media,
        text: data.text,
      }
    }

    let makeEvent = (data) => {
      return {
        media: data.media,
        text: data.text,
        start_date: data.start_date,
        end_date: data.end_date,
      }
    }


    data.feed.entry.map(data => {
      let fmt = fmtEntry(data)

      if (fmt.type === 'title') {
        fmtData.title = makeTitle(fmt)
      } else if (fmt.type === 'era'){
        fmtData.eras.push(makeEvent(fmt))
      } else {
        fmtData.events.push(makeEvent(fmt))
      }
    })

    let blob = new Blob([JSON.stringify(fmtData)], { type: 'application/json' })
    let url = URL.createObjectURL(blob)
    window.timeline = new TL.Timeline('timeline-embed', url, {
      theme_color: '#288EC3',
      hash_bookmark: false
    })

    window.addEventListener('resize', function() {
      var embed = document.getElementById('timeline-embed')
      embed.style.height = getComputedStyle(document.body).height - 56
      timeline.updateDisplay()
    })
  })

})
