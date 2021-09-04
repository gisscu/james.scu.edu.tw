const search = {
  nodes: [],
  edges: {},
  nodeMap: {},
  graph: null,
  init: (nodeData, edgeData) => {
    let key = 0
    search.nodes = nodeData.map((node) => {
      node.key = key++
      search.nodeMap[node.name] = node.key

      return node
    })

    search.graph = new jsgraphs.Graph(key)

    edgeData.map((edge) => {
      if (!search.edges[edge.source]) {
        search.edges[edge.source] = {}
      }
      search.edges[edge.source][edge.target] = {}

      if (typeof search.nodeMap[edge.source] === 'number' &&
          typeof search.nodeMap[edge.target] === 'number') {
        search.graph.addEdge(search.nodeMap[edge.source], search.nodeMap[edge.target])
      }
    })
  },
  keyword: (key) => {
    const map = {}
    for (let i of search.nodes) {
      let val = i[key]

      if (val) {
        map[val] = val
      }
    }


    let res = []
    for (let k in map) {
      res.push(k)
    }

    return res
  },
  filter: (prop) => {
    let res = []

    for (let i of search.nodes) {
      let val = i
      for (let key in prop) {
        if (prop[key] && i[key] !== prop[key]) {
          val = null
        }
      }

      if (val) res.push(val)
    }

    return res
  },
  pathTo: (source, target) => {
    let dfs = new jsgraphs.DepthFirstSearch(search.graph, search.nodeMap[source])
    let path = dfs.pathTo(search.nodeMap[target])

    return path.map((key) => {
      return search.nodes[key].name
    })
  },
  getChild: (node) => {
    let res = []

    for (let key in search.edges[node]) {
      res.push(key)
    }

    return res
  },
  getAllChild: (nodes) => {
    // FIXME
  }
}

window.search = search
