$(async () => {
  const tagData = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 5)

  const loading = (status) => {
    if (status) {
      $('.loading').removeClass('hidden').addClass('shown')
      $('.jumbotron').removeClass('shown').addClass('hidden')
      $('footer').removeClass('shown').addClass('hidden')
    } else {
      $('.loading').removeClass('shown').addClass('hidden')
      $('.jumbotron').removeClass('hidden').addClass('shown')
      $('footer').removeClass('hidden').addClass('shown')
    }
  }

  const list = $('<ul>')

  for (const tag of tagData) {
    if (tag.display === 'TRUE') {
      const li = $('<li>').append($('<a>').attr({
        href: `../gallery/#${tag.tag}`,
        'data-weight': 10 + tag.count / 15
      }).text(tag.tag))

      list.append(li)
    }
  }

  $('#tags').append(list)

  const canvas = $('#viewport')[0]
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight - 200

  if (!$('#viewport').tagcanvas({
    textColour: '#1A2330',
    outlineMethod: 'none',
    weight: true,
    weightFrom: 'data-weight',
    weightMode: 'size',
    reverse: true,
    depth: 0.8,
    maxSpeed: 0.05
  }, 'tags')) {
    $('#viewport').hide()
  }

  loading()

  $(window).resize(() => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - 200
    $('#viewport').tagcanvas({
      textColour: '#1A2330',
      outlineColour: '#1A2330',
      weight: true,
      weightFrom: 'data-weight',
      weightMode: 'size',
      reverse: true,
      depth: 0.8,
      maxSpeed: 0.05
    }, 'tags')
  })
})
