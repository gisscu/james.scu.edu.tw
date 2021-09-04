$(async () => {
  const canvas = $('#viewport')[0]
  const ctx = canvas.getContext('2d')
  const gfx = arbor.Graphics(canvas)
  const color = {
    a: '#e9ecef', // background
    b: '#1A2330', // node fill
    c: '#AD4040', // cneter node
    e: '#F99F00', // focus
    f: '#2283EB' // highlight
  }
  const config = {
    node: {
      width: 30,
      alpha: 1,
      font: {
        name: 'Noto Sans',
        size: 14
      },
      scale: {
        minNode: 25,
        maxNode: 300,
        minSize: 0.4,
        maxSize: 1
      }
    },
    line: {
      width: 0.5,
      alpha: 0.3,
      scale: 0.3
    }
  }
  const status = {
    focusNode: null,
    getSource: false,
    info: true
  }

  let particleSystem

  const setCanvasSize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight - $('main').offset().top
  }

  const renderer = () => {
    const that = {
      init: (system) => {
        particleSystem = system

        setCanvasSize()
        particleSystem.screenSize(canvas.width, canvas.height)
        particleSystem.screenPadding(100)

        that.initMouseHandling()
        init()
      },

      redraw: () => {
        ctx.fillStyle = color.a
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        particleSystem.eachEdge((edge, pt1, pt2) => {
          const source = edge.source.name
          const target = edge.target.name
          for (const line of edgeRule[source][target].style) {
            if (line) {
              let alpha = Math.floor(
                (line.alpha * edge.target.data.alpha > 1 ? 1 : line.alpha * edge.target.data.alpha) * 255
              ).toString(16)
              alpha = alpha.length < 2 ? `0${alpha}` : alpha

              ctx.strokeStyle = `${line.color}${alpha}`
              ctx.lineWidth = line.width
              ctx.beginPath()

              // TODO: multiline
              // 偏移
              ctx.moveTo(pt1.x, pt1.y)
              ctx.lineTo(pt2.x, pt2.y)
              ctx.stroke()
            }
          }
        })

        particleSystem.eachNode((node, pt) => {
          if (node.data.alpha > 0) {
            for (const circle of nodeRule[node.name].style) {
              if (circle) {
                const w = circle.width * node.data.scale
                gfx.rect(pt.x - w / 2, pt.y - w / 2, w, w, w / 1.8, {
                  fill: circle.color,
                  alpha: circle.alpha * node.data.alpha
                })
              }
            }

            gfx.text(node.name, pt.x, pt.y + 35, {
              color: color.b,
              align: 'center',
              alpha: node.data.alpha,
              font: config.node.font.name,
              size: config.node.font.size
            })

            // 移動功能 badge
            if (node.name === status.focusNode.name) {
              $('.canvas-btn').css({
                left: pt.x + 20,
                top: pt.y + 35
              })
            }
          } else {
            particleSystem.pruneNode(node)
          }
        })
      },

      initMouseHandling: () => {
        let dragged = null

        const handler = {
          clicked: (e) => {
            const pos = $(canvas).offset()
            const mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
            dragged = particleSystem.nearest(mouseP)

            if (dragged && dragged.node !== null && dragged.distance < 30) {
              if (!status.getSource) {
                addCanvasBtn(e.pageX + 30, e.pageY - 20, dragged.node.name)
              } else {
                $('.badge').removeClass('clicked')
              }

              // dragged.node.fixed = true
              dragged.node.mass = 10

              sys.eachNode((node) => {
                if (node.data.focus) {
                  node.data.focus = false
                }
              })

              dragged.node.data.focus = true

              if (!status.getSource) {
                // status.focusNode = dragged.node.name

                if (!edgeRule[dragged.node.name]) {
                  $('.open-bage').show()
                  $('.open').hide()
                } else if (dragged.node.name === '徐震') {
                  $('.open-bage').hide()
                } else {
                  $('.open-bage').show()
                  $('.open').show()
                }
              }

              click(dragged.node)
              $(canvas).bind('mousemove', handler.dragged)
              $(window).bind('mouseup', handler.dropped)
            }

            return false
          },
          dragged: (e) => {
            const pos = $(canvas).offset()
            const s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)

            if (dragged && dragged.node !== null) {
              const p = particleSystem.fromScreen(s)
              dragged.node.p = p
              dragged.node.fixed = true
              dragged.node.mass = 10
            }

            return false
          },
          dropped: (e) => {
            if (dragged && dragged.node !== null) {
              dragged.node.fixed = false
              dragged.node.mass = 1
              dragged = null

              $(canvas).unbind('mousemove', handler.dragged)
              $(window).unbind('mouseup', handler.dropped)
            }

            return false
          }
        }

        $(canvas).mousedown(handler.clicked)

        $(canvas).mousemove((e) => {
          const pos = $(canvas).offset()
          const mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
          const mouseNode = particleSystem.nearest(mouseP)

          if (mouseNode && mouseNode.node !== null && mouseNode.distance < 30) {
            hoverNode(mouseNode.node)
          } else {
            hoverNode(null)
          }
        })
      }
    }
    return that
  }

  const nodeRule = {}
  const edgeRule = {}
  const arborData = {
    nodes: {},
    edges: {}
  }

  const addNodeRule = (node, i) => {
    nodeRule[node.name] = {
      data: node,
      alpha: config.node.alpha,
      style: []
    }

    const year = parseInt(node['碩士畢業年'])
    if (year > 0) {
      yearPool.push(parseInt(node['碩士畢業年']))
    }

    const style = {
      color: color.b,
      width: config.node.width,
      alpha: config.node.alpha
    }

    if (i === 0) {
      style.color = color.c // 徐震用
      style.width = config.node.width * 1.5
    }

    nodeRule[node.name].style[3] = style
  }

  const addEdgeRule = (edge) => {
    const source = edge.source
    const target = edge.target
    if (nodeRule[source] && nodeRule[target]) {
      if (!edgeRule[source]) {
        edgeRule[source] = {}
      }

      if (!edgeRule[source][target]) {
        edgeRule[source][target] = {}
      }

      edgeRule[source][target] = {
        class: edge.class,
        style: []
      }

      let alpha = config.line.alpha
      let width = config.line.width
      const year = parseInt(nodeRule[target].data['碩士畢業年'])
      if (year > 0) {
        const scale = Math.max(...yearPool) - Math.min(...yearPool)
        const diff = year - Math.min(...yearPool)
        const min = config.line.scale

        alpha += min - (min / scale) * diff
        width += (min - (min / scale) * diff) * 4
      }

      const style = {
        color: color.b,
        width,
        alpha
      }

      edgeRule[source][target].style[1] = style
    }
  }

  const addNode = (name, opt) => {
    const node = sys.addNode(name, {
      alpha: 0.01,
      scale: 1,
      clicked: false,
      ...opt
    })

    sys.tweenNode(node, 0.5, {
      alpha: 1
    })

    if (edgeRule[name] && Object.keys(edgeRule[name]).length > 0) {
      nodeRule[name].style[4] = {
        color: color.a,
        width: nodeRule[name].style[3].width / 2,
        alpha: 1
      }
    }

    return node
  }

  const addEdge = (source, target) => {
    sys.addEdge(source, target)
  }

  const addNodeChild = (name, mode) => {
    sys.getNode(name).data.clicked = true
    if (edgeRule[name] && Object.keys(edgeRule[name]).length > 0) {
      sys.getNode(name).data.open = true
    }

    nodeRule[name].style[4] = null

    for (const child in edgeRule[name]) {
      if (!sys.getNode(child)) {
        addNode(child)
        addEdge(name, child)

        if (mode) {
          addNodeChild(child, true)
        }
      }
    }
  }

  const addNodeChildRecursion = (name) => {
    for (const child in edgeRule[name]) {
      if (!sys.getNode(child)) {
        addNode(child)
        addEdge(name, child)
      }

      edgeRule[name][child].style[0] = {
        color: color.e,
        width: edgeRule[name][child].style[1].width * 3,
        alpha: 0.6
      }
      addNodeChildRecursion(child)
    }
  }

  const addNodeAllChildAndHighLight = (name) => {
    sys.getNode(name).data.clicked = true
    for (const key1 in edgeRule) {
      for (const key2 in edgeRule[key1]) {
        edgeRule[key1][key2].style[0] = null
      }
    }

    nodeRule[name].style[4] = null

    for (const child in edgeRule[name]) {
      if (!sys.getNode(child)) {
        addNode(child)
        addEdge(name, child)
      }

      edgeRule[name][child].style[0] = {
        color: color.e,
        width: edgeRule[name][child].style[1].width * 3,
        alpha: 0.6
      }
      addNodeChildRecursion(child)
    }
  }

  const removeNodeAllChild = (name) => {
    sys.getNode(name).data.clicked = false
    sys.getNode(name).data.open = false

    for (const child in edgeRule[name]) {
      const node = sys.getNode(child)

      if (node) {
        sys.tweenNode(node, 0.5, {
          alpha: 0
        })
        removeNodeAllChild(node.name)
      }
    }

    if (edgeRule[name] && Object.keys(edgeRule[name]).length > 0) {
      nodeRule[name].style[4] = {
        color: color.a,
        width: nodeRule[name].style[3].width / 2,
        alpha: 1
      }
    }
  }

  const click = (node, st) => {
    $('#child').removeClass('btn-warning').addClass('btn-outline-warning')
    if (status.getSource) {
      selectGetSourceTarget(node.name)
    } else {
      for (const key in nodeRule) {
        nodeRule[key].style[2] = null
      }

      nodeRule[node.name].style[2] = {
        color: color.e,
        width: nodeRule[node.name].style[3].width * 1.3,
        alpha: 1
      }

      node.data.highlight = false

      if (st) {
        loadGallery(false)
      } else {
        loadGallery(status.info)
      }

      selectGetSourceTarget('徐震')

      openGallery({
        name: node.name,
        description: nodeRule[node.name].data.description,
        class: [
          nodeRule[node.name].data['現職'],
          nodeRule[node.name].data['經歷']
        ],
        eduItems: [
          [
            nodeRule[node.name].data['學士'],
            nodeRule[node.name].data['學士系所'],
            nodeRule[node.name].data['學士畢業年']
          ],
          [
            nodeRule[node.name].data['碩士'],
            nodeRule[node.name].data['碩士系所'],
            nodeRule[node.name].data['碩士畢業年'],
            nodeRule[node.name].data['碩士論文']
          ],
          [
            nodeRule[node.name].data['博士'],
            nodeRule[node.name].data['博士系所'],
            nodeRule[node.name].data['博士畢業年'],
            nodeRule[node.name].data['博士論文']
          ]
        ]
      })

      status.focusNode = node
    }
  }

  const highlight = (nodes) => {
    for (const node in nodeRule) {
      nodeRule[node].style[0] = null
    }

    for (const node of nodes) {
      const path = search.pathTo('徐震', node.name)

      path.forEach((p, i) => {
        if (i > 0 && edgeRule[path[i - 1]][p] && !sys.getNode(p)) {
          addNode(p, {
            highlight: true
          })
          addEdge(path[i - 1], p)
        }
      })

      nodeRule[node.name].style[0] = {
        color: color.f,
        width: nodeRule[node.name].style[3].width * 1.3,
        alpha: 0.9
      }
    }
  }

  const removeAllHighLight = () => {
    for (const node in nodeRule) {
      if (nodeRule[node].style[0]) {
        nodeRule[node].style[0] = null
      }
    }

    sys.eachNode((node) => {
      if (node.data.highlight) {
        sys.tweenNode(node, 0.5, {
          alpha: 0
        })
      }
    })
  }

  const resizeNode = () => {
    let nodeNum = 0
    const pool = []
    sys.eachNode((node) => {
      nodeNum += 1
      pool.push(node)
    })

    const scale = nodeNum > config.node.scale.minNode
      ? nodeNum > config.node.scale.maxNode
          ? config.node.scale.minSize
          : 1 - (nodeNum / config.node.scale.maxNode * (1 - config.node.scale.minSize))
      : config.node.scale.maxSize
    console.log(scale)

    for (const node of pool) {
      sys.tweenNode(node, 0.5, {
        scale
      })
    }
  }

  const hoverNode = (node) => {
    for (const key in nodeRule) {
      nodeRule[key].style[1] = null
    }

    sys.eachNode((node) => {
      node.data.alpha = 1
    })

    if (node) {
      nodeRule[node.name].style[1] = {
        color: color.e,
        width: nodeRule[node.name].style[3].width * 1.3,
        alpha: 1
      }
      node.data.alpha = 3
    }
  }

  const getSource = (target, source, mode) => {
    const path = search.pathTo(target, source)
    for (const key1 in edgeRule) {
      for (const key2 in edgeRule[key1]) {
        edgeRule[key1][key2].style[0] = null
      }
    }
    $('#child').removeClass('btn-warning').addClass('btn-outline-warning')

    path.forEach((p1, i) => {
      if (i > 0) {
        const p2 = path[i - 1]

        for (const key1 in edgeRule) {
          for (const key2 in edgeRule[key1]) {
            if ((key1 === p1 && key2 === p2) ||
                (key1 === p2 && key2 === p1)) {
              edgeRule[key1][key2].style[0] = {
                color: color.e,
                width: edgeRule[key1][key2].style[1].width * 5,
                alpha: 0.6
              }
            }
          }
        }
      }
    })
  }

  const selectGetSourceTarget = (target) => {
    for (const key in nodeRule) {
      if (nodeRule[key].style[2]) {
        getSource(target, key)
        status.getSource = 0
        $('#source').removeClass('btn-danger').addClass('btn-outline-danger')
      }
    }
  }

  const addCanvasBtn = (x, y, name) => {
    const tags2Dom = $('<div>').addClass('grid-tag2 open-bage')
    const tag1Dom = $('<a>').addClass('badge badge-pill badge-light open open1').html('開闔').attr('href', '#').click(function () {
      if (!status.focusNode.data.clicked) {
        addNodeChild(status.focusNode.name)
        $(this).addClass('clicked')
      } else if (!status.focusNode.data.center) {
        removeNodeAllChild(status.focusNode.name)
        $(this).removeClass('clicked')
      }
    })

    if (sys.getNode(name).data.open) {
      tag1Dom.addClass('clicked')
    }

    const tag2Dom = $('<a>').addClass('badge badge-pill badge-light').html('朔源').attr('href', '#').click(function () {
      if (status.getSource) {
        status.getSource = false
        $(this).removeClass('clicked')
      } else {
        status.getSource = true
        $(this).addClass('clicked')
      }
    })

    const tag3Dom = $('<a>').addClass('badge badge-pill badge-light open').html('桃李').attr('href', '#').click(function () {
      $('.open1').addClass('clicked')
      addNodeChild(status.focusNode.name, true)
    })

    tags2Dom.append(tag1Dom)
    tags2Dom.append(tag2Dom)
    tags2Dom.append(tag3Dom)

    $('.canvas-btn').remove()
    const canvasBtn = $('<div>').addClass('canvas-btn').css({
      top: y,
      left: x
    })
    canvasBtn.append(tags2Dom)

    $('.canvas').append(canvasBtn)
  }

  const init = () => {
    const name = '徐震'
    const node = addNode(name, {
      center: true
    })

    addNodeChild(name)

    click(node)
    setInterval(resizeNode, 1000)

    const keyword = {
      name: search.keyword('name'),
      school: search.keyword('碩士'),
      major: search.keyword('碩士系所'),
      year: search.keyword('碩士畢業年')
    }

    const tName = $('.typeahead-name')

    tName.typeahead({
      source: keyword.name.map((name) => {
        return {
          name
        }
      }),
      autoSelect: true
    })

    $('#child').click(() => {
      if ($('#child').hasClass('btn-warning')) {
        for (const key1 in edgeRule) {
          for (const key2 in edgeRule[key1]) {
            edgeRule[key1][key2].style[0] = null
          }
        }
        $('#child').removeClass('btn-warning').addClass('btn-outline-warning')
      } else {
        for (const key in nodeRule) {
          if (nodeRule[key].style[2]) {
            addNodeAllChildAndHighLight(key)
            $('#child').removeClass('btn-outline-warning').addClass('btn-warning')
          }
        }
      }
    })

    $('#source2').click(() => {
      status.getSource = 1
      $('#source').removeClass('btn-outline-danger').addClass('btn-danger')
    })

    const doSearch = function () {
      const current = $(this).typeahead('getActive')
      if (current && current.name === $(this).val()) {
        const res = search.filter({
          碩士: $('.typeahead-school').val(),
          碩士系所: $('.typeahead-major').val(),
          碩士畢業年: $('.typeahead-year').val()
        })
        highlight(res)
      }
    }

    $('.typeahead-school').typeahead({
      source: keyword.school.map((school) => {
        return {
          name: school
        }
      }),
      autoSelect: true
    }).change(doSearch)

    $('.typeahead-major').typeahead({
      source: keyword.major.map((major) => {
        return {
          name: major
        }
      }),
      autoSelect: true
    }).change(doSearch)

    $('.typeahead-year').typeahead({
      source: keyword.year.map((year) => {
        return {
          name: year
        }
      }),
      autoSelect: true
    }).change(doSearch)

    $('#search-clr').click(() => {
      removeAllHighLight()
    })

    tName.change(() => {
      const current = tName.typeahead('getActive')
      if (current && current.name === tName.val()) {
        const res = search.filter({
          name: tName.val()
        })

        highlight(res)
      }
    })
  }

  const nodeData = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 'sna')
  const edgeData = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 'snaclass')
  const yearPool = []

  search.init(nodeData, edgeData)
  nodeData.map(addNodeRule)
  edgeData.map(addEdgeRule)

  const sys = arbor.ParticleSystem()
  sys.parameters({
    stiffness: 100,
    repulsion: 10,
    friction: 0.5,
    gravity: true,
    fps: 30,
    dt: 0.02,
    precision: 0.5
  })
  sys.renderer = renderer('#viewport')
  sys.graft(arborData)

  const loading = (st) => {
    if (st) {
      $('.loading').removeClass('hidden').addClass('shown')
      $('.canvas').removeClass('shown').addClass('hidden')
      $('footer').removeClass('shown').addClass('hidden')
    } else {
      $('.loading').removeClass('shown').addClass('hidden')
      $('.canvas').removeClass('hidden').addClass('shown')
      $('footer').removeClass('hidden').addClass('shown')
    }
  }

  loading()

  $(window).resize(() => {
    setCanvasSize()
    sys.screenSize(canvas.width, canvas.height)
  })

  const loadGallery = (mode) => {
    if (mode) {
      $('.gallery').addClass('gallery-show')
    } else {
      $('.gallery').removeClass('gallery-show')
    }
  }

  const openGallery = (item) => {
    $('.gallery').html('')
    const itemDomBorder = $('<div>').addClass('gallery-content').addClass('center')
    itemDomBorder.addClass('gallery-no-description')

    const itemDom = $('<div>').addClass('gallery-body')
    const close = $('<div>').addClass('gallery-close').click(function () {
      if (status.info) {
        $(this).find('i').removeClass('left').addClass('right')
      } else {
        $(this).find('i').removeClass('right').addClass('left')
      }
      status.info = !status.info
      loadGallery(status.info)
    }).append($('<i>').addClass('arrow left'))

    itemDom.append(close)
    itemDom.addClass('grid-type4')
    itemDomBorder.addClass('full-w')

    if (item.name) {
      const titleDom = $('<h5>').addClass('gallery-title').html(item.name)

      itemDom.append(titleDom)
    }

    const tagsDom = $('<div>').addClass('grid-tag')

    for (const tag of item.eduItems) {
      if (tag[0] || tag[1] || tag[2]) {
        const tagDom = $('<a>').addClass('badge badge-pill badge-secondary').html(`${tag[0]} ${tag[1]} ${tag[2]}`).attr('href', '#')
        tagsDom.append(tagDom)
      }
    }
    const class0Arr = item.class[0].split('\n')
    let linksDom = $('<div>').addClass('gallery-tag')
    for (const tag of class0Arr) {
      linksDom.append($('<a>').addClass('badge badge-pill badge-primary').html(tag).attr('href', '#'))
    }
    itemDom.append(linksDom)

    const class1Arr = item.class[1].split('\n')
    linksDom = $('<div>').addClass('gallery-tag')
    for (const tag of class1Arr) {
      linksDom.append($('<a>').addClass('badge badge-pill badge-info').html(tag).attr('href', '#'))
    }
    itemDom.append(linksDom)

    // let tag2Dom = $('<a>').addClass('badge badge-pill badge-success').html(`桃李`).attr('href', '#')
    // tags2Dom.append(tag2Dom).click(() => {
    // status.getSource = 1
    // })
    // let tag3Dom = $('<a>').addClass('badge badge-pill badge-success').html(`朔源`).attr('href', '#').click(() => {
    // for (let key in nodeRule) {
    // if (nodeRule[key].style[2]) {
    // getSource('徐震', key)
    // }
    // }
    // })
    // tags2Dom.append(tag3Dom)
    const contentsDom = $('<div>').addClass('grid-content')

    const contents = item.description.split('\n')

    for (const content of contents) {
      if (content) {
        const contentDom = $('<p>').html(content.slice(0, 100))
        contentsDom.append(contentDom)
      }
    }

    itemDom.append(tagsDom)
    // itemDom.append(tags2Dom)
    itemDom.append(contentsDom)
    itemDomBorder.append(itemDom)

    $('.gallery').append(itemDomBorder)
  }
})
