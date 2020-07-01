$(async () => {
  let sheet = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 4)

  let filterMap = {}
  let $grid
  let items
  let status
  let gallery = false
  let loadGallery = (data) => {
    status = false
    loading(true)
    $('.grid-item').remove()

    for (let key in data) {
      let item = data[key]

      let itemDomBorder = $('<div>').addClass('grid-item').addClass('center')
      let itemDom = $('<div>').addClass('grid-body')

      switch (item.type) {
        case '詩作':
          itemDom.addClass('grid-type1')
          break;
        case '照片':
          itemDom.addClass('grid-type2')
          break;
        case '書法':
          itemDom.addClass('grid-type3')
          break;
        case '文章':
          itemDom.addClass('grid-type4')
          break;
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
      let typeDom = $('<a>').addClass('badge badge-pill badge-success').html(item.type).attr('href', '#')
      tagsDom.append(typeDom)

      if (item.tag) {
        let tags = item.tag.split(',')

        for (let tag of tags) {
          if (tag) {
            let tagDom = $('<a>').addClass('badge badge-pill badge-info').html(tag).attr('href', '#')
            tagsDom.append(tagDom)
          }
        }
      }

      itemDom.append(tagsDom)

      itemDomBorder.attr('key', key)


      let openGallery = (key) => {
        $('.gallery').html('')
        let itemDomBorder = $('<div>').addClass('gallery-content').addClass('center')

        let titleDom = $('<div>').addClass('gallery-title').append($('<p>').html(data[key].content || data[key].title))

        if (!data[key].description) {
          itemDomBorder.addClass('full-h')
          titleDom.addClass('full-h')
        }

        if ((data[key].type === '書法' || data[key].type === '照片')
          && !data[key].title && !data[key].content) {
          itemDomBorder.addClass('full-w')
        }

        if (data[key].type === '詩作' || data[key].type === '文章') {
          itemDomBorder.addClass('full-w')
        }

        if ((data[key].type === '書法' || data[key].type === '照片') && (data[key].content || data[key].title)) {
          $('.gallery').append(titleDom)
        }

        let itemDom = $('<div>').addClass('grid-body')

        switch (item.type) {
          case '詩作':
            itemDom.addClass('grid-type1')
            break;
          case '照片':
            itemDom.addClass('grid-type2')
            break;
          case '書法':
            itemDom.addClass('grid-type3')
            break;
          case '文章':
            itemDom.addClass('grid-type4')
            break;
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

          console.log(item)
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

          itemDom.append(mediaDom)
        }

        let tagsDom = $('<div>').addClass('grid-tag')
        let typeDom = $('<a>').addClass('badge badge-pill badge-success').html(item.type).attr('href', '#')
        tagsDom.append(typeDom)

        if (item.tag) {
          let tags = item.tag.split(',')

          for (let tag of tags) {
            if (tag) {
              let tagDom = $('<a>').addClass('badge badge-pill badge-info').html(tag).attr('href', '#')
              tagsDom.append(tagDom)
            }
          }
        }

        if (data[key].media) {
          let linksDom = $('<div>').addClass('gallery-tag').append($('<a>').addClass('badge badge-pill badge-info').html('原始檔案').attr('href', data[key].media))
          itemDom.append(linksDom)
        }

        itemDom.append(tagsDom)
        itemDomBorder.append(itemDom)

        $('.gallery').append(itemDomBorder)
        if (data[key].description) {
          let description = $('<div>').addClass('gallery-description').append($('<p>').html(data[key].description))
          $('.gallery').append(description)
        }
      }

      itemDomBorder.click(function () {
        let c = $(this).attr("class").split(" ").indexOf('clicked')

        if (c !== -1) {
          $('#grid').removeClass('grid-move')
          $('.gallery').removeClass('gallery-show')
          $('.grid-block').css({
            height: 0,
            display: 'none',
          })

          setTimeout(() => {
            $grid.masonry('layout')
          }, 500)
          gallery = false;
        } else {
          if (!gallery) {
            $('#grid').addClass('grid-move')
            $('.gallery').addClass('gallery-show')
            $('.grid-block').css({
              height: $('.grid').height(),
              display: 'block',
            })

            setTimeout(() => {
              $grid.masonry('layout')
              display()
            }, 500)
          }

          openGallery($(this).attr('key'))
          $('.clicked').removeClass('clicked')
          $(this).addClass('clicked')

          gallery = true;
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

  let display = () => {
    let heightStart = window.scrollY
    let heightEnd = window.scrollY + window.innerHeight

    items.each((num, item) => {
      let offset = $(item).offset()

      if (offset.top >= heightStart && offset.top <= heightEnd && !$(item).hasClass('shown')) {
        $(item).addClass('shown')
      }
    })
  }

  let loading = (status) => {
    if (status) {
      $('.loading').removeClass('hidden').addClass('shown')
      $('footer').removeClass('shown').addClass('hidden')
    } else {
      $('.loading').removeClass('shown').addClass('hidden')
      $('footer').removeClass('hidden').addClass('shown')
    }
  }

  function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }


  let data = shuffle(sheet)
  if (location.hash) {
    let s = location.hash.replace('#', '')
    let arr = decodeURI(s).split(',')
    data = filter(sheet, {
      jiebatags: arr
    })
    console.log(sheet)
    console.log(data)
  }

  data.splice(2, 0, {
    mode: 'block',
  })

  loadGallery(data)

  for (let item of sheet) {
    if (item.type) {
      filterMap[item.type] = {}
    }
  }

  let dropdownItem = $('<a>').addClass('dropdown-item')
  for (let key in filterMap) {
    let item = dropdownItem.clone()

    item.text(key)
    item.click(function () {
      let type = $(this).text()

      let data = filter(sheet, {
        type: [type],
      })
      $('.loading').removeClass('hidden').addClass('hidden')
      $('footer').addClass('shown')

      loadGallery(data)
      $grid.masonry('reloadItems')
      $grid.imagesLoaded(() => {
        $grid.masonry('layout')
      })
    })

    $('.dropdown-menu').append(item)
  }

  let all = dropdownItem.clone()

  all.text('全部')
  all.click(function () {
    $('.loading').removeClass('hidden').addClass('hidden')
    $('footer').addClass('shown')

    loadGallery(sheet)
    $grid.masonry('reloadItems')
    $grid.imagesLoaded(() => {
      $grid.masonry('layout')
    })
  })

  $('.dropdown-menu').append(all)

  // init Masonry
  $grid = $('.grid').masonry({
    itemSelector: '.grid-item',
    columnWidth: '.grid-sizer',
    gutter: 5,
    // fitWidth: true,
  }).on('layoutComplete', () => {
    status = true
    loading(false)
    display()

    window.addEventListener('scroll', function (event) {
      display()
    })
  })



  $grid.imagesLoaded(() => {
    $('.loading').addClass('hidden')
    $('footer').addClass('shown')
    $grid.masonry('layout')
  })

  window.grid = $grid
})
