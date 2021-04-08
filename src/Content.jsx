import React, { useState, useEffect } from 'react'
import G6 from '@antv/g6'
import './Content.css'
import { v4 as uuidv4 } from 'uuid'
import { Input, Button, message, Typography } from 'antd'

const { Paragraph } = Typography
function onDragOver (e) {
  e.preventDefault()
}

let graph = null, cacheNodes = [], cacheEdges = []
function Content ({ item }) {
  const ref = React.useRef(null)
  // 定义数据源
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [selectItem, setItem] = useState({})
  const [target, setTarget] = useState(null)
  useEffect(() => {
    if (!graph) {
      graph = new G6.Graph({
        container: ref.current,
        width: ref.current.scrollWidth,
        height: ref.current.scrollHeight || 500,
        minZoom: 0.1,
        fitCenter: true,
        modes: {
          default: [
            {
              type: 'drag-canvas',
              enableOptimize: true,
            },
            {
              type: 'zoom-canvas',
              enableOptimize: true,
              optimizeZoom: 0.5,
            }
          ],
          edit: ['click-select']
        },
        layout: {
          type: 'dagre',
          rankdir: 'LR',
          nodesep: 10,
          ranksep: 50,
        },
        defaultNode: {
          type: 'rect',
          labelCfg: {
            style: {
              fill: '#f00',
              // fontSize: 10,
            },
          },
          style: {
            stroke: '#72CC4A',
            width: 150,
          }
        },
        defaultEdge: {
          type: 'fund-polyline',
        },
      })
    }
    graph.on('click', evt => {
      evt.stopPropagation()
      if (evt.item) {
        const { id, value, label, target } = evt.item._cfg.model
        setItem({ id, value, label, target })
        setTarget(target)
      }
    })
    graph.data({ nodes: nodes, edges: edges })
    graph.render()
  }, [nodes, edges])

  function onDrop (e) {
    cacheNodes.push({
      ...item, id: uuidv4(), type: 'ellipse'
    })
    setNodes([...cacheNodes])
    createEdges()
  }

  function createEdges () {
    cacheEdges = cacheNodes.filter(elem => elem.target)
    const newEdges = []
    cacheEdges.forEach(elem => {
      let target = elem.target && elem.target.split(',')
      if (target) {
        const subs = target.map(sub => ({
          source: elem.id,
          target: sub,
          style: {
            endArrow: true,
          }
        }))
        newEdges.push(...subs)
      }
    })
    setEdges([...newEdges])
  }

  function handleClick (id) {
    if (!id || !target) {
      return message.error('请选择节点')
    }
    cacheNodes = [...nodes]
    cacheNodes.forEach(elem => {
      if (elem.id === id) {
        elem.target = target
      }
    })
    setNodes([...cacheNodes])
    createEdges()
    // 当前数据
    // console.log(cacheNodes, cacheEdges)
  }

  return (
    <div className="content">
      <div ref={ref} className="canvas" onDrop={onDrop} onDragOver={onDragOver}></div>
      {
        selectItem.id && <div className="box">
          <Paragraph
            copyable={{
              text: selectItem.id
            }}
            className="paragraph">
            ID: {selectItem.id}
          </Paragraph>
          <Input placeholder="名称" value={selectItem.label} disabled />
          <Input placeholder="类型" value={selectItem.value} disabled />
          <Input placeholder="目标" value={target} onChange={e => (setTarget(e.target.value))} />
          <Button type="primary" onClick={handleClick.bind(this, selectItem.id)}>编辑节点关系</Button>
        </div>
      }
    </div >
  )
}

export default Content