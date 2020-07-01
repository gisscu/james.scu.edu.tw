$(async () => {
  let canvas = $('#viewport')[0]
  let ctx = canvas.getContext('2d')
  let gfx = arbor.Graphics(canvas)
  let particleSystem
  let left, top
  let Renderer = () => {
    let that = {
      init: function (system) {
        particleSystem = system

        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        particleSystem.screenSize(canvas.width, canvas.height)
        particleSystem.screenPadding(0)

        that.initMouseHandling()
        init()
      },

      redraw: function () {
        ctx.fillStyle = '#e9ecef'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        particleSystem.eachEdge(function (edge, pt1, pt2) {
          let source = edge.source.name
          let target = edge.target.name
          for (let line of edgeRule[source][target].style) {
            if (line) {

              let alpha = Math.floor((line.alpha * edge.target.data.alpha > 1 ? 1 : line.alpha * edge.target.data.alpha) * 255).toString(16)
              alpha = alpha.length < 2 ? `0${alpha}` : alpha

              ctx.strokeStyle = `${line.color}${alpha}`
              ctx.lineWidth = line.width
              ctx.beginPath()
              // TODO: multicolor line
              ctx.moveTo(pt1.x, pt1.y)
              ctx.lineTo(pt2.x, pt2.y)
              ctx.stroke()
            }
          }
        })

        particleSystem.eachNode(function (node, pt) {
          if (node.data.alpha > 0) {
            for (let circle of nodeRule[node.name].style) {
              if (circle) {
                let w = circle.width
                gfx.rect(pt.x - w/2, pt.y - w/2, w, w, w/1.8, {
                  fill: circle.color,
                  alpha: circle.alpha * node.data.alpha,
                })
              }
            }

            gfx.text(node.name, pt.x, pt.y+35, {
              color: '#000000',
              align: 'center',
              alpha: node.data.alpha,
              font: 'Noto Sans',
              size: 14,
            })
          } else {
            particleSystem.pruneNode(node)
          }
        })
      },

      initMouseHandling: function () {
        let dragged = null

        let handler = {
          clicked: function (e) {
            let pos = $(canvas).offset()
            let mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
            dragged = particleSystem.nearest(mouseP)

            if (dragged && dragged.node !== null && dragged.distance < 30) {
              dragged.node.fixed = true
              dragged.node.mass = 10
              click(dragged.node)
              $(canvas).bind('mousemove', handler.dragged)
              $(window).bind('mouseup', handler.dropped)
            }

            return false
          },
          dragged: function (e) {
            let pos = $(canvas).offset()
            let s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

            if (dragged && dragged.node !== null) {
              let p = particleSystem.fromScreen(s)
              dragged.node.p = p
              dragged.node.fixed = true
              dragged.node.mass = 10
            }

            return false
          },

          dropped: function (e) {
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
          let pos = $(canvas).offset()
          let mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
          let mouseNode = particleSystem.nearest(mouseP)

          if (mouseNode && mouseNode.node !== null && mouseNode.distance < 30) {
            move(mouseNode.node)
          } else {
            move(null)
          }
        })
      },
    }
    return that
  }

  let eduItemDom = $('.edu-item').clone()

  let updateItem = (data) => {
    $('.edu-item').remove()
    $('.container').removeClass('shown').delay(50).queue(function(next){
      $(this).addClass('shown');
      next();
    })
    $('.name').text(data.name)

    for (let eduItem of data.eduItems) {
      let dom = eduItemDom.clone()
      if (eduItem[0] && eduItem[1] && eduItem[2]) {
        dom.find('.title').text(`${eduItem[0]} - ${eduItem[1]}`)
        dom.find('.year').text(eduItem[2])
        if (eduItem[3]) {
          dom.find('.content').text(eduItem[3])
        }

        $('.col-md-4').append(dom)
      }
    }

    $('.description').text(data.description)

    if (data.name === '徐震') {
      $('#child').hide()
      $('#source').hide()
    } else {
      $('#child').show()
      $('#source').show()
    }
  }

  window.updateItem = updateItem

  let nodeRule = {}
  let edgeRule = {}
  let arborData = {
    nodes: {},
    edges: {},
  }

  let addNodeRule = (node, i) => {
    nodeRule[node.name] = {
      data: node,
      alpha: 1,
      style: [],
    }

    let style = {
      color: '#4F4F4F',
      width: 20,
      alpha: 1,
    }

    if (i === 0) {
      style.color = '#FF8B42'
      style.width = 30
    }

    nodeRule[node.name].style[3] = style
  }

  let addEdgeRule = (edge) => {
    let source = edge.source
    let target = edge.target
    if (nodeRule[source] && nodeRule[target]) {
      if (!edgeRule[source]) {
        edgeRule[source] = {}
      }

      if (!edgeRule[source][target]) {
        edgeRule[source][target] = {}
      }

      edgeRule[source][target] = {
        class: edge.class,
        style: [],
      }

      let style = {
        color: '#4F4F4F',
        width: 1,
        alpha: 0.3,
      }

      edgeRule[source][target].style[1] = style
    }
  }

  let addNode = (name, opt) => {
    let node = sys.addNode(name, {
      alpha: 0.01,
      clicked: false,
      ...opt
    })

    sys.tweenNode(node, 0.5, {
      alpha: 1,
    })

    return node
  }

  let addEdge = (source, target) => {
    sys.addEdge(source, target)
  }

  let addNodeChild = (name) => {
    sys.getNode(name).data.clicked = true

    nodeRule[name].style[4] = {
      color: '#FFF',
      width: nodeRule[name].style[3].width / 2,
      alpha: 1,
    }

    for (let child in edgeRule[name]) {
      if (!sys.getNode(child)) {
        addNode(child)
        addEdge(name, child)
      }
    }
  }

  let addNodeChildRecursion = (name) => {
    for (let child in edgeRule[name]) {
      if (!sys.getNode(child)) {
        addNode(child)
        addEdge(name, child)
      }

      edgeRule[name][child].style[0] = {
        color: '#ED3C07',
        width: edgeRule[name][child].style[1].width * 3,
        alpha: 0.6,
      }
      addNodeChildRecursion(child)
    }
  }

  let addNodeAllChildAndHighLight = (name) => {
    sys.getNode(name).data.clicked = true
    for (let key1 in edgeRule) {
      for (let key2 in edgeRule[key1]) {
        edgeRule[key1][key2].style[0] = null
      }
    }

    nodeRule[name].style[4] = {
      color: '#FFF',
      width: nodeRule[name].style[3].width / 2,
      alpha: 1,
    }

    for (let child in edgeRule[name]) {
      if (!sys.getNode(child)) {
        addNode(child)
        addEdge(name, child)
      }

      edgeRule[name][child].style[0] = {
        color: '#ED3C07',
        width: edgeRule[name][child].style[1].width * 3,
        alpha: 0.6,
      }
      addNodeChildRecursion(child)
    }
  }

  let removeNodeAllChild = (name) => {
    sys.getNode(name).data.clicked = false
    nodeRule[name].style[4] = null

    for (let child in edgeRule[name]) {
      let node = sys.getNode(child)

      if (node) {
        sys.tweenNode(node, 0.5, {
          alpha: 0,
        })
        removeNodeAllChild(node.name)
      }
    }
  }

  let status = 0
  let click = (node) => {
    console.log(node)
    $('#child').removeClass('btn-warning').addClass('btn-outline-warning')
    if (status) {
      selectGetSourceTarget(node.name)
    } else {
      for (let key in nodeRule) {
        nodeRule[key].style[2] = null
      }

      nodeRule[node.name].style[2] = {
        color: '#ED3C07',
        width: nodeRule[node.name].style[3].width * 1.3,
        alpha: 1,
      }

      node.data.highlight = false

      updateItem({
        name: node.name,
        description: nodeRule[node.name].data.description,
        eduItems: [
          [
            nodeRule[node.name].data['學士'],
            nodeRule[node.name].data['學士系所'],
            nodeRule[node.name].data['學士畢業年'],
          ],
          [
            nodeRule[node.name].data['碩士'],
            nodeRule[node.name].data['碩士系所'],
            nodeRule[node.name].data['碩士畢業年'],
            nodeRule[node.name].data['碩士論文'],
          ],
          [
            nodeRule[node.name].data['博士'],
            nodeRule[node.name].data['博士系所'],
            nodeRule[node.name].data['博士畢業年'],
            nodeRule[node.name].data['博士論文'],
          ]
        ]
      })

      if (!node.data.clicked) {
        addNodeChild(node.name)
      } else if (!node.data.force){
        removeNodeAllChild(node.name)
      }
    }
  }

  let highlight = (nodes) => {
    for (let node in nodeRule) {
      nodeRule[node].style[0] = null
    }

    for (let node of nodes) {
      let path = search.pathTo('徐震', node.name)

      path.forEach((p, i) => {
        if (i > 0 && edgeRule[path[i - 1]][p] && !sys.getNode(p)) {
          addNode(p, {
            highlight: true,
          })
          addEdge(path[i - 1], p)
        }
      })

      nodeRule[node.name].style[0] = {
        color: '#BF00FF',
        width: nodeRule[node.name].style[3].width * 1.3,
        alpha: 1,
      }
    }
  }

  let removeAllHighLight = () => {
    for (let node in nodeRule) {
      if (nodeRule[node].style[0]) {
        nodeRule[node].style[0] = null
      }
    }

    sys.eachNode((node) => {
      if (node.data.highlight) {
        sys.tweenNode(node, 0.5, {
          alpha: 0,
        })
      }
    })
  }

  let move = (node) => {
    for (let key in nodeRule) {
      nodeRule[key].style[1] = null
    }
    sys.eachNode((node) => {
      node.data.alpha = 1
    })

    if (node) {
      nodeRule[node.name].style[1] = {
        color: '#ED3C07',
        width: nodeRule[node.name].style[3].width * 1.3,
        alpha: 1,
      }
      node.data.alpha = 3
    }
  }

  let getSource = (target, source) => {
    let path = search.pathTo(target, source)
    for (let key1 in edgeRule) {
      for (let key2 in edgeRule[key1]) {
        edgeRule[key1][key2].style[0] = null
      }
    }
    $('#child').removeClass('btn-warning').addClass('btn-outline-warning')

    path.forEach((p1, i) => {
      if (i > 0) {
        let p2 = path[i - 1]

        for (let key1 in edgeRule) {
          for (let key2 in edgeRule[key1]) {
            if ((key1 === p1 && key2 === p2) ||
                (key1 === p2 && key2 === p1)) {
              edgeRule[key1][key2].style[0] = {
                color: '#ED3C07',
                width: edgeRule[key1][key2].style[1].width * 5,
                alpha: 0.6,
              }
            }
          }
        }
      }
    })
  }

  let selectGetSourceTarget = (target) => {
    for (let key in nodeRule) {
      if (nodeRule[key].style[2]) {
        getSource(target, key)
        status = 0
        $('#source').removeClass('btn-danger').addClass('btn-outline-danger')
      }
    }
  }


  window.getSource = getSource

  let init = () => {
    let name = '徐震'
    let node = addNode(name, {
      force: true,
    })

    addNodeChild(name)

    click(node)

    let keyword = {
      name: search.keyword('name'),
      school: search.keyword('碩士'),
      major: search.keyword('碩士系所'),
      year: search.keyword('碩士畢業年'),
    }

    let tName = $(".typeahead-name")

    tName.typeahead({
			source: keyword.name.map((name) => {
        return {
          name,
        }
      }),
			autoSelect: true
		})

    $('#child').click(() => {
      if ($('#child').hasClass('btn-warning')) {
        for (let key1 in edgeRule) {
          for (let key2 in edgeRule[key1]) {
            edgeRule[key1][key2].style[0] = null
          }
        }
        $('#child').removeClass('btn-warning').addClass('btn-outline-warning')
      } else {
        for (let key in nodeRule) {
          if (nodeRule[key].style[2]) {
            addNodeAllChildAndHighLight(key)
            $('#child').removeClass('btn-outline-warning').addClass('btn-warning')
          }
        }
      }
    })

    $('#source1').click(() => {
      for (let key in nodeRule) {
        if (nodeRule[key].style[2]) {
          getSource('徐震', key)
        }
      }
    })

    $('#source2').click(() => {
      status = 1
      $('#source').removeClass('btn-outline-danger').addClass('btn-danger')
    })

    $(".typeahead-school").typeahead({
			source: keyword.school.map((school) => {
        return {
          name: school,
        }
      }),
			autoSelect: true
		})

    $(".typeahead-major").typeahead({
			source: keyword.major.map((major) => {
        return {
          name: major,
        }
      }),
			autoSelect: true
		})

    $(".typeahead-year").typeahead({
			source: keyword.year.map((year) => {
        return {
          name: year,
        }
      }),
			autoSelect: true
		})


    $('#search-adv').click(() => {
      let res = search.filter({
        '碩士': $('.typeahead-school').val(),
        '碩士系所': $('.typeahead-major').val(),
        '碩士畢業年': $('.typeahead-year').val(),
      })

      highlight(res)
    })

    $('#search-clr').click(() => {
      removeAllHighLight()
    })

    tName.change(function() {
      let current = tName.typeahead("getActive")
      if (current && current.name == tName.val()) {
        let res = search.filter({
          name: tName.val()
        })

        highlight(res)
      }
    })

    // test
    window.particleSystem = particleSystem
    window.sys = sys
    window.nodeRule = nodeRule
    window.edgeRule = edgeRule
  }

  // let nodeData = await gsheet('16Ya5soMF7rCkBd-jeSPnpsmiuG5GpSKcwEtPnDXXSvk', 2)
  // let edgeData = await gsheet('16Ya5soMF7rCkBd-jeSPnpsmiuG5GpSKcwEtPnDXXSvk', 3)
  let nodeData = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 2)
  let edgeData = await gsheet('1jg3z98J9T_RqnlZ-hIE4-Bsj5RnyPi0RIjdwhej2Hdo', 3)

  search.init(nodeData, edgeData)
  nodeData.map(addNodeRule)
  edgeData.map(addEdgeRule)

  let sys = arbor.ParticleSystem()
  sys.parameters({
    stiffness: 100,
    repulsion: 10,
    friction: 0.5,
    gravity: true,
    fps: 30,
    dt: 0.02,
    precision: 0.5,
  })
  sys.renderer = Renderer('#viewport')
  sys.graft(arborData)

  let loading = (status) => {
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

  loading()

  $(window).resize(() => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    sys.screenSize(canvas.width, canvas.height)
  })

  window.resize = (w, h) => {
    canvas.width = w
    canvas.height = h
    sys.screenSize(canvas.width, canvas.height)
  }

  window.move = (t, l) => {
    particleSystem.eachNode(function (node, pt) {
      node.p.x += l
      node.p.y += t
    })
  }

  window.set = (parameters) => {
    sys.parameters({
      stiffness: 100,
      repulsion: 10,
      friction: 0.5,
      gravity: true,
      fps: 30,
      dt: 0.02,
      precision: 0.5,
      ...parameters
    })
  }

  // let screenSize = 1
  // canvas.addEventListener('wheel', function (e) {
    // e.preventDefault()

    // 縮放
    // screenSize +=  e.deltaY / Math.abs(e.deltaY) * 0.1
    // particleSystem.screenSize(canvas.width * screenSize, canvas.height * screenSize)
    // particleSystem.eachNode(function (node, pt) {
      // let pos = $(canvas).offset()
      // let s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)

      // let p = particleSystem.fromScreen(s)
      // if (node.data.name === '徐震') {
        // console.log('nodeP')
        // console.log('from screen')
        // console.log(node.p)
        // console.log('to screen')
        // console.log(particleSystem.toScreen(node.p))

        // console.log('mouse P')
        // console.log(`${e.pageX} , ${e.pageY}`)
        // console.log('from screen')
        // console.log(p)
        // console.log('to screen')
        // console.log(s)
      // }

      // let ns = particleSystem.toScreen(node.p)

      // ns.x -= (s.x - ns.x) * screenSize
      // ns.y -= (s.y - ns.y) * screenSize

      // let fp = particleSystem.fromScreen(ns)
      // node.p = fp
    // })
  // })
})
