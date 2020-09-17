$(function () {
  var embed = document.getElementById('timeline-embed')
  embed.style.height = getComputedStyle(document.body).height - 56

  const list = [
		'https://docs.google.com/spreadsheets/d/13tHmyywlhlOKatY-eTiL7RiMhM6Skk1HBvBqBopDL1U',
    'https://docs.google.com/spreadsheets/d/1mom80aIM61NXemnT7HsVI4dPU78Yrl3Q6zHGL1VNBmY',
  ]

  const load = (url) => {
		function ready(fn) {
			if (document.readyState != 'loading') {
				fn()
			} else {
				document.addEventListener('DOMContentLoaded', fn)
			}
		}

		ready(function() {
			window.timeline = new TL.Timeline('timeline-embed', url)

			window.addEventListener('resize', function() {
				var embed = document.getElementById('timeline-embed')
				embed.style.height = getComputedStyle(document.body).height - 56
				timeline.updateDisplay()
			})
		})
  }

  const open = (hash) => {
    if (hash) {
      let s = hash.replace('#', '')
      let i = parseInt(decodeURI(s))

      load(list[i])
    } else {
      load(list[0])
    }
  }


  $('.dropdown-item').click(function () {
    const hash = $(this).attr('href')
    open(hash)
  })

  open(location.hash)
})
