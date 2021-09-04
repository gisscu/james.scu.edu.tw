$(async () => {
  const sheet = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 'gallery')
  let items
  const main = $('main')
  const body = $('html, body')
  let clickedItem = null
  const status = {
    gallery: false
  }

  const contentsLimit = 8
  const loadData = (data) => {
    data = shuffle(data)

    // 寬版元素移至第一個
    if (data.length > 1) {
      let item, len
      for (let i = 0; i < data.length; i++) {
        if (!item && data[i].type === '詩作' && data[i].content.split('\n').length > contentsLimit) {
          len = i
        }
      }

      if (len) {
        item = data.splice(len, 1)[0]
        data.splice(0, 0, item)
      }
    }

    if (data.length > 1) {
      if (data[0].type === '詩作' && data[0].content.split('\n').length > contentsLimit) {
        data.splice(1, 0, {
          mode: 'block'
        })
      } else {
        data.splice(2, 0, {
          mode: 'block'
        })
      }
    }

    loading(true)
    clickedItem = main
    loadGallery(false)
    $('.grid-item').remove()

    for (const key in data) {
      const item = data[key]

      const itemDomBorder = $('<div>').addClass('grid-item').addClass('center')
      const itemDom = $('<div>').addClass('grid-body')

      switch (item.type) {
        case '詩作':
          itemDom.addClass('grid-type1')
          break
        case '照片':
          itemDom.addClass('grid-type2')
          break
        case '書法':
          itemDom.addClass('grid-type3')
          break
        case '文章':
          itemDom.addClass('grid-type4')
          break
      }

      if (item.title) {
        const titleDom = $('<h5>').addClass('grid-title').html(item.title)
        if (!item.thumbnail) {
          titleDom.addClass('nomedia')
        } else {
          titleDom.addClass('media-title')
        }

        itemDom.append(titleDom)
      }

      if (item.content && !item.thumbnail) {
        const contentsDom = $('<div>').addClass('grid-content')

        if (!item.thumbnail) {
          contentsDom.addClass('nomedia')
        }

        const contents = item.content.split('\n')

        if (item.type === '詩作' && contents.length > contentsLimit) {
          itemDomBorder.addClass('grid-item-w5')
        }

        for (const content of contents) {
          if (content) {
            const contentDom = $('<p>').html(content)
            contentsDom.append(contentDom)
          }
        }

        itemDom.append(contentsDom)
      }

      if (item.type === '文章') {
        const contentsDom = $('<div>').addClass('grid-content')

        if (!item.thumbnail) {
          contentsDom.addClass('nomedia')
        }

        const contents = item.description.split('\n')

        for (const content of contents) {
          if (content) {
            const contentDom = $('<p>').html(content.slice(0, 100))
            contentsDom.append(contentDom)
          }
        }

        itemDom.append(contentsDom)
      }

      if (item.thumbnail) {
        const mediaDom = $('<img>').attr({
          src: item.thumbnail
        }).addClass('grid-image')

        itemDom.append(mediaDom)
      }

      const tagsDom = $('<div>').addClass('grid-tag')
      const typeDom = $('<a>').addClass('badge badge-pill badge-success').html(item.type).attr('href', 'javascript:void()')
      tagsDom.append(typeDom)

      if (item.tag) {
        const tags = item.tag.split(',')

        for (const tag of tags) {
          if (tag) {
            const tagDom = $('<a>').addClass('badge badge-pill badge-info').html(tag).attr('href', 'javascript:void()')
            tagsDom.append(tagDom)
          }
        }
      }

      itemDom.append(tagsDom)

      itemDomBorder.attr('key', key)
      itemDomBorder.attr('id', `test${key}`)

      const openGallery = (key) => {
        const galleryItem = data[key]

        $('.gallery').html('')
        const itemDomBorder = $('<div>').addClass('gallery-content').addClass('center')

        if (!galleryItem.description) {
          itemDomBorder.addClass('gallery-no-description')
        } else {
          itemDomBorder.addClass('gallery-has-description')
        }

        const itemDom = $('<div>').addClass('gallery-body')
        const close = $('<button>').addClass('gallery-close')
          .addClass('on').append($('<span>')).append($('<span>')).append($('<span>')).click(function () {
            $('.clicked').click()
          })

        itemDom.append(close)
        switch (item.type) {
          case '詩作':
            itemDom.addClass('grid-type1')
            itemDomBorder.addClass('full-w')
            break
          case '照片':
            itemDom.addClass('grid-type2')
            break
          case '書法':
            itemDom.addClass('grid-type3')
            break
          case '文章':
            itemDom.addClass('grid-type4')
            itemDomBorder.addClass('full-w')
            break
        }

        if (item.title) {
          const titleDom = $('<h5>').addClass('gallery-title').html(item.title)
          if (!item.thumbnail) {
            titleDom.addClass('nomedia')
          } else {
            titleDom.addClass('media-title')
          }

          itemDom.append(titleDom)
        }

        if (item.content && !item.thumbnail) {
          const contentsDom = $('<div>').addClass('grid-content')

          if (!item.thumbnail) {
            contentsDom.addClass('nomedia')
          }

          const contents = item.content.split('\n')

          for (const content of contents) {
            if (content) {
              const contentDom = $('<p>').html(content)
              contentsDom.append(contentDom)
            }
          }

          itemDom.append(contentsDom)
        }

        if (item.type === '文章') {
          const contentsDom = $('<div>').addClass('grid-content')

          if (!item.thumbnail) {
            contentsDom.addClass('nomedia')
          }

          const contents = item.description.split('\n')

          for (const content of contents) {
            if (content) {
              const contentDom = $('<p>').html(content.slice(0, 100))
              contentsDom.append(contentDom)
            }
          }

          itemDom.append(contentsDom)
        }

        if (item.sample) {
          const mediaDom = $('<img>').attr({
            src: item.sample
          }).addClass('gallery-image')

          if (galleryItem.displaytype === 'width') {
            mediaDom.addClass('full-w-img')
            itemDomBorder.addClass('gallery-has-media-full-w')
          } else {
            mediaDom.addClass('full-h-img')
          }

          itemDom.append(mediaDom)
        }

        const tagsDom = $('<div>').addClass('grid-tag')
        const typeDom = $('<a>').addClass('badge badge-pill badge-success').html(item.type)
          .attr('href', 'javascript:void()').click(function () {
            data = filter(sheet, {
              type: [$(this).attr('type')]
            })

            loadData(data)
            $grid.masonry('reloadItems')
            $grid.imagesLoaded(() => {
              $grid.masonry('layout')
            })
          }).attr('type', item.type)
        tagsDom.append(typeDom)

        if (item.tag) {
          const tags = item.tag.split(',')

          for (const tag of tags) {
            if (tag) {
              const tagDom = $('<a>').addClass('badge badge-pill badge-info').html(tag)
                .attr('href', 'javascript:void()').click(function () {
                  data = filter(sheet, {
                    tag: [$(this).attr('tag')]
                  })
                  loadData(data)
                  $grid.masonry('reloadItems')
                  $grid.imagesLoaded(() => {
                    $grid.masonry('layout')
                  })
                }).attr('tag', tag)
              tagsDom.append(tagDom)
            }
          }
        }

        if (galleryItem.media) {
          const linksDom = $('<div>').addClass('gallery-tag').append($('<a>').addClass('badge badge-pill badge-info').html('原始檔案')
            .attr('href', galleryItem.media)
            .attr('target', '_blank'))
          itemDom.append(linksDom)
        }

        itemDom.append(tagsDom)
        itemDomBorder.append(itemDom)

        $('.gallery').append(itemDomBorder)
        if (galleryItem.description) {
          const description = $('<div>').addClass('gallery-description').append($('<p>').html(galleryItem.description))
          $('.gallery').append(description)
        }
      }

      itemDomBorder.click(function () {
        const hasClicked = $(this).hasClass('clicked')
        const key = $(this).attr('key')
        clickedItem = $(this)
        if (hasClicked) {
          loadGallery(false)
          $(this).removeClass('clicked')
        } else {
          loadGallery(true)
          $('.clicked').removeClass('clicked')
          $(this).addClass('clicked')
          openGallery(key)
        }
      })

      if (item.mode !== 'block') {
        itemDomBorder.append(itemDom)
      } else {
        itemDomBorder.addClass('grid-block')
      }

      // $('.grid').append(itemDomBorder.append(itemDom))
      $('.grid').append(itemDomBorder)
    }

    items = $('.grid-item')
  }

  const loadGallery = (mode) => {
    if (mode !== status.gallery) {
      if (mode) {
        $('#grid').addClass('grid-move')
        $('.gallery').addClass('gallery-show')
        $('.grid-block').css({
          height: $('.grid').height(),
          display: 'block'
        })
        status.gallery = true
      } else {
        $('#grid').removeClass('grid-move')
        $('.gallery').removeClass('gallery-show')
        $('.grid-block').css({
          height: 0,
          display: 'none'
        })

        status.gallery = false
      }

      setTimeout(() => {
        $grid.masonry('layout')
      }, 500)
    }
  }

  const display = () => {
    const heightEnd = window.scrollY + window.innerHeight

    items.each((num, item) => {
      const offset = $(item).offset()

      if (offset.top <= heightEnd && !$(item).hasClass('shown')) {
        $(item).addClass('shown')
      }
    })
  }

  const loading = (mode) => {
    if (mode) {
      $('.loading').removeClass('hidden').addClass('shown')
      $('footer').removeClass('shown').addClass('hidden')
    } else {
      $('.loading').removeClass('shown').addClass('hidden')
      $('footer').removeClass('hidden').addClass('shown')
    }
  }

  function shuffle (array) {
    let temporaryValue, randomIndex
    let currentIndex = array.length

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex)
      currentIndex -= 1

      // And swap it with the current element.
      temporaryValue = array[currentIndex]
      array[currentIndex] = array[randomIndex]
      array[randomIndex] = temporaryValue
    }

    return array
  }

  let data = sheet

  // 接 word cloud 搜尋
  if (location.hash) {
    const s = location.hash.replace('#', '')
    const arr = decodeURI(s).split(',')
    data = filter(sheet, {
      jiebatags: arr
    })
  }

  loadData(data)

  const titleArr = []
  const tagMap = {}
  for (const item of sheet) {
    if (item.title) {
      titleArr.push(item.title)
    }

    if (item.tag) {
      const tags = item.tag.split(',')

      for (const tag of tags) {
        if (tag) {
          tagMap[tag] = false
        }
      }
    }
  }

  const filterArr = ['照片', '詩作', '書法', '文章', '全部']

  const labelItem = $('<label>').addClass('btn btn-outline-success dropdown-btn')
  const inputItem = $('<input>').attr({
    type: 'checkbox',
    autocomplete: 'off'
  })

  for (const key of filterArr) {
    const label = labelItem.clone()
    const item = inputItem.clone()
    if (key === '全部') {
      label.addClass('all')
    }

    label.text(key)
    label.click(function () {
      let data = sheet
      const lists = $('.dropdown-btn.active')
      const selected = $(this).text()

      if (selected === '全部') {
        const lists = $('.dropdown-btn')

        for (const list of lists) {
          $(list).addClass('active')
        }
      } else {
        const type = []
        for (const list of lists) {
          type.push($(list).text())
        }

        const sIndex = type.indexOf(selected)
        if (sIndex === -1) {
          type.push(selected)
        } else {
          type.splice(sIndex, 1)
        }

        if (type.length > 0 && type.indexOf('全部') === -1) {
          data = filter(sheet, {
            type
          })
        }
      }

      loadData(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
    })

    label.append(item)
    $('.btn-group-toggle').append(label)
  }

  $(document).on('keydown', 'form', function (event) {
    return event.key !== 'Enter'
  })

  const searchTitle = $('.typeahead-title')
  const pool = {}
  searchTitle.typeahead({
    source: titleArr,
    autoSelect: false,
    matcher: function (item) {
      if (item.toLowerCase().indexOf(this.query.toLowerCase()) === 0) {
        if (pool[this.query.toLowerCase()]) {
          pool[this.query.toLowerCase()].push(item)
        } else {
          pool[this.query.toLowerCase()] = [item]
        }
        return ~item.toLowerCase().indexOf(this.query.toLowerCase())
      }
    }
  })

  searchTitle.keyup((event) => {
    const code = event.key

    if (code === 'Enter') {
      event.preventDefault()
      const data = filter(sheet, {
        title: pool[searchTitle.val()]
      })
      $('.dropdown-btn').removeClass('active')

      loadData(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
    }
    return false
  })

  searchTitle.change(function () {
    const current = searchTitle.typeahead('getActive')
    if (current && current.replace('\n', '') === searchTitle.val()) {
      const data = filter(sheet, {
        title: [current]
      })
      $('.dropdown-btn').removeClass('active')

      loadData(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
    }
  })

  // searchTitle.typeahead.render(function(ev, suggestion, b, c) {
  // console.log(ev)
  // console.log('Selection: ' + suggestion);
  // console.log(b)
  // console.log(c)
  // });

  const tagArr = []
  for (const tag in tagMap) {
    tagArr.push(tag)
  }

  const searchTag = $('.typeahead-tags')
  searchTag.typeahead({
    source: tagArr,
    autoSelect: true
  })

  searchTag.change(function () {
    const current = searchTag.typeahead('getActive')
    if (current && current === searchTag.val()) {
      const data = filter(sheet, {
        tag: [current]
      })
      $('.dropdown-btn').removeClass('active')

      loadData(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
    }
  })

  $('#search-clr').click(() => {
    const lists = $('.search-input')

    for (const list of lists) {
      $(list).val('')
    }
    $('.dropdown-btn').removeClass('active')

    loadData(sheet)
    $grid.masonry('reloadItems')
    $grid.imagesLoaded(() => {
      $grid.masonry('layout')
    })
  })

  // init Masonry
  const $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    gutter: 4
    // fitWidth: true,
  }).on('layoutComplete', () => {
    loading(false)
    display()

    if (clickedItem) {
      body.stop().animate({
        scrollTop: clickedItem.offset().top - main.offset().top - 5
      }, 100, 'swing', () => {
        clickedItem = null
      })
    }

    window.addEventListener('scroll', () => {
      display()
    })
  })

  $grid.imagesLoaded(() => {
    $grid.masonry('layout')
  })
})
