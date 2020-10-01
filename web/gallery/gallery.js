$(async () => {
  let sheet = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 4)
  let $grid
  let items
  let main = $('main')
  let body = $('html, body')
  let clickedItem = null
  let status = {
    gallery: false,
  }

  let contentsLimit = 8
  let loadData = (data) => {
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
          mode: 'block',
        })
      } else {
        data.splice(2, 0, {
          mode: 'block',
        })
      }
    }

    loading(true)
    clickedItem = main
    loadGallery(false)
    $('.grid-item').remove()

    for (let key in data) {
      let item = data[key]

      let itemDomBorder = $('<div>').addClass('grid-item').addClass('center')
      let itemDom = $('<div>').addClass('grid-body')

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
        let titleDom = $('<h5>').addClass('grid-title').html(item.title)
        if (!item.thumbnail) {
          titleDom.addClass('nomedia')
        } else {
          titleDom.addClass('media-title')
        }

        itemDom.append(titleDom)
      }

      if (item.content && !item.thumbnail) {
        let contentsDom = $('<div>').addClass('grid-content')

        if (!item.thumbnail) {
          contentsDom.addClass('nomedia')
        }

        let contents = item.content.split('\n')

        if (item.type === '詩作' && contents.length > contentsLimit) {
          itemDomBorder.addClass('grid-item-w5')
        }

        for (let content of contents) {
          if (content) {
            let contentDom = $('<p>').html(content)
            contentsDom.append(contentDom)
          }
        }

        itemDom.append(contentsDom)
      }

      if (item.type === '文章') {
        let contentsDom = $('<div>').addClass('grid-content')

        if (!item.thumbnail) {
          contentsDom.addClass('nomedia')
        }

        let contents = item.description.split('\n')

        for (let content of contents) {
          if (content) {
            let contentDom = $('<p>').html(content.slice(0, 100))
            contentsDom.append(contentDom)
          }
        }

        itemDom.append(contentsDom)
      }

      if (item.thumbnail) {
        let mediaDom = $('<img>').attr({
          'src': item.thumbnail,
        }).addClass('grid-image')

        itemDom.append(mediaDom)
      }

      let tagsDom = $('<div>').addClass('grid-tag')
      let typeDom = $('<a>').addClass('badge badge-pill badge-success').html(item.type).attr('href', 'javascript:void()')
      tagsDom.append(typeDom)

      if (item.tag) {
        let tags = item.tag.split(',')

        for (let tag of tags) {
          if (tag) {
            let tagDom = $('<a>').addClass('badge badge-pill badge-info').html(tag).attr('href', 'javascript:void()')
            tagsDom.append(tagDom)
          }
        }
      }

      itemDom.append(tagsDom)

      itemDomBorder.attr('key', key)
      itemDomBorder.attr('id', `test${key}`)


      let openGallery = (key) => {
        let galleryItem = data[key]

        $('.gallery').html('')
        let itemDomBorder = $('<div>').addClass('gallery-content').addClass('center')

        if (!galleryItem.description) {
          itemDomBorder.addClass('gallery-no-description')
        } else {
          itemDomBorder.addClass('gallery-has-description')
        }

        let itemDom = $('<div>').addClass('gallery-body')
        let close = $('<button>').addClass('gallery-close')
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
          let titleDom = $('<h5>').addClass('gallery-title').html(item.title)
          if (!item.thumbnail) {
            titleDom.addClass('nomedia')
          } else {
            titleDom.addClass('media-title')
          }

          itemDom.append(titleDom)
        }

        if (item.content && !item.thumbnail) {
          let contentsDom = $('<div>').addClass('grid-content')

          if (!item.thumbnail) {
            contentsDom.addClass('nomedia')
          }

          let contents = item.content.split('\n')

          for (let content of contents) {
            if (content) {
              let contentDom = $('<p>').html(content)
              contentsDom.append(contentDom)
            }
          }

          itemDom.append(contentsDom)
        }

        if (item.type === '文章') {
          let contentsDom = $('<div>').addClass('grid-content')

          if (!item.thumbnail) {
            contentsDom.addClass('nomedia')
          }

          let contents = item.description.split('\n')

          for (let content of contents) {
            if (content) {
              let contentDom = $('<p>').html(content.slice(0, 100))
              contentsDom.append(contentDom)
            }
          }

          itemDom.append(contentsDom)
        }

        if (item.sample) {
          let mediaDom = $('<img>').attr({
            'src': item.sample,
          }).addClass('gallery-image')

          if (galleryItem.displaytype === 'width') {
            mediaDom.addClass('full-w-img')
            itemDomBorder.addClass('gallery-has-media-full-w')
          } else {
            mediaDom.addClass('full-h-img')
          }

          itemDom.append(mediaDom)
        }

        let tagsDom = $('<div>').addClass('grid-tag')
        let typeDom = $('<a>').addClass('badge badge-pill badge-success').html(item.type).attr('href', 'javascript:void()')
        tagsDom.append(typeDom)

        if (item.tag) {
          let tags = item.tag.split(',')

          for (let tag of tags) {
            if (tag) {
              let tagDom = $('<a>').addClass('badge badge-pill badge-info').html(tag).attr('href', 'javascript:void()')
              tagsDom.append(tagDom)
            }
          }
        }

        if (galleryItem.media) {
          let linksDom = $('<div>').addClass('gallery-tag').append($('<a>').addClass('badge badge-pill badge-info').html('原始檔案')
            .attr('href', galleryItem.media)
            .attr('target', '_blank'))
          itemDom.append(linksDom)
        }

        itemDom.append(tagsDom)
        itemDomBorder.append(itemDom)

        $('.gallery').append(itemDomBorder)
        if (galleryItem.description) {
          let description = $('<div>').addClass('gallery-description').append($('<p>').html(galleryItem.description))
          $('.gallery').append(description)
        }
      }

      itemDomBorder.click(function () {
        let hasClicked = $(this).hasClass('clicked')
        let key = $(this).attr('key')
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

  let loadGallery = (mode) => {
    if (mode !== status.gallery) {
      if (mode) {
        $('#grid').addClass('grid-move')
        $('.gallery').addClass('gallery-show')
        $('.grid-block').css({
          height: $('.grid').height(),
          display: 'block',
        })
        status.gallery = true

      } else {
        $('#grid').removeClass('grid-move')
        $('.gallery').removeClass('gallery-show')
        $('.grid-block').css({
          height: 0,
          display: 'none',
        })

        status.gallery = false
      }

      setTimeout(() => {
        $grid.masonry('layout')
      }, 500)
    }

  }

  let display = () => {
    let heightStart = window.scrollY
    let heightEnd = window.scrollY + window.innerHeight

    items.each((num, item) => {
      let offset = $(item).offset()

      if (offset.top <= heightEnd && !$(item).hasClass('shown')) {
        $(item).addClass('shown')
      }
    })
  }

  let loading = (mode) => {
    if (mode) {
      $('.loading').removeClass('hidden').addClass('shown')
      $('footer').removeClass('shown').addClass('hidden')
    } else {
      $('.loading').removeClass('shown').addClass('hidden')
      $('footer').removeClass('hidden').addClass('shown')
    }
  }

  function shuffle(array) {
    let temporaryValue, randomIndex
    let currentIndex = array.length

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

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
    let s = location.hash.replace('#', '')
    let arr = decodeURI(s).split(',')
    data = filter(sheet, {
      jiebatags: arr
    })

  }

  loadData(data)

  let titleArr = []
  let tagMap = {}
  for (let item of sheet) {
    if (item.title) {
      titleArr.push(item.title)
    }

    if (item.tag) {
      let tags = item.tag.split(',')

      for (let tag of tags) {
        if (tag) {
          tagMap[tag] = false
        }
      }
    }
  }

  let filterArr = ['照片', '詩作', '書法', '文章', '全部']

  let labelItem= $('<label>').addClass('btn btn-outline-success dropdown-btn')
  let inputItem = $('<input>').attr({
    type: 'checkbox',
    autocomplete: 'off',
  })

  for (let key of filterArr) {
    let label = labelItem.clone()
    let item = inputItem.clone()
    if (key === '全部') {
      label.addClass('all')
    }

    label.text(key)
    label.click(function () {
      let data = sheet
      let lists = $('.dropdown-btn.active')
      let selected = $(this).text()

      if (selected === '全部') {
        let lists = $('.dropdown-btn')

        for (let list of lists) {
          $(list).addClass('active')
        }
      } else {
        let type = []
        for (let list of lists) {
          type.push($(list).text())
        }

        let sIndex = type.indexOf(selected)
        if (sIndex === -1) {
          type.push(selected)
        } else {
          type.splice(sIndex, 1)
        }

        if (type.length > 0 && type.indexOf('全部') === -1) {
          data = filter(sheet, {
            type,
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

  let searchTitle = $('.typeahead-title')
	searchTitle.typeahead({
    source: titleArr,
    autoSelect: true
  })

	searchTitle.change(function() {
		let current = searchTitle.typeahead('getActive');
		if (current && current === searchTitle.val()) {
      let data = filter(sheet, {
        title: [current],
      })
      $('.dropdown-btn').removeClass('active')

      loadData(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
		}
	});

  let tagArr = []
  for (let tag in tagMap) {
    tagArr.push(tag)
  }

  let searchTag = $('.typeahead-tags')
	searchTag.typeahead({
    source: tagArr,
    autoSelect: true
  })

	searchTag.change(function() {
		let current = searchTag.typeahead('getActive');
		if (current && current === searchTag.val()) {
      let data = filter(sheet, {
        tag: [current],
      })
      $('.dropdown-btn').removeClass('active')

      loadData(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
		}
	});

  $('#search-clr').click(() => {
    let lists = $('.search-input')

    for (list of lists) {
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
  $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    gutter: 4,
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

  window.grid = $grid
})
