import React, { useState, useEffect } from 'react'
import G6 from '@antv/g6'
import './Content.css'
import { v4 as uuidv4 } from 'uuid'
import { Input, Button, message, Typography, Radio } from 'antd'
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
const { Paragraph } = Typography
const { TextArea } = Input
let content = `heat_template_version: 2018-08-31
parameters:
  image:
    type: string
    constraints:
      - custom_constraint: glance.image
  flavor:
    type: string`
const yaml = require('js-yaml')

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
  const [text, setText] = useState(content)
  const [value, setValue] = useState('yaml')
  useEffect(() => {
    if (!graph) {
      graph = new G6.Graph({
        container: ref.current,
        width: ref.current.scrollWidth,
        height: ref.current.scrollHeight || 500,
        minZoom: 0.1,
        // fitCenter: true,
        modes: {
          default: [
            {
              type: 'drag-canvas',
              enableOptimize: true,
            }, {
              type: 'zoom-canvas',
              minZoom: 0.5,
              maxZoom: 2
            }, {
              type: 'drag-node',
            }],
          // edit: ['click-select']
        },
        layout: {
          type: 'force',
          preventOverlap: true,
          nodeSpacing: 50
        },
        defaultNode: {
          type: 'ellipse',
        },
        defaultEdge: {
          type: 'cubic',
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
      ...item, id: uuidv4()
    })
    setNodes([...cacheNodes])
    createEdges()
  }

  function createEdges () {
    cacheEdges = cacheNodes.filter(elem => elem.target)
    const newEdges = []
    cacheEdges.forEach(elem => {
      let target = elem.target && elem.target.split(/,|，|\s/)
      if (target) {
        const subs = target.map(sub => ({
          source: elem.id,
          target: sub,
          style: {
            endArrow: {
              path: G6.Arrow.vee(10, 20, 10),
              d: 15
            },
          }
        }))
        newEdges.push(...subs)
      }
    })
    console.log(cacheNodes, newEdges)
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
  }

  function onChange (e) {
    setValue(e.target.value)
    content = e.target.value
    // let isYaml = !!yaml.load(text)
    // console.log(isYaml)
    if (e.target.value === 'javascript') {
      let result = yaml.load(text)
      setText(JSON.stringify(result, null, 2))
    } else {
      let result = yaml.dump(JSON.parse(text))
      setText(result)
    }
  };

  return (
    <div className="content">
      <div ref={ref} className="canvas" onDrop={onDrop} onDragOver={onDragOver}></div>
      <Radio.Group onChange={onChange} value={value}>
        <Radio value='javascript'>JSON</Radio>
        <Radio value='yaml'>YAML</Radio>
      </Radio.Group>
      <CodeMirror
        value={text}
        options={{
          mode: { name: value },
          theme: 'material',
          lineNumbers: true
        }}
        onBeforeChange={(editor, data, value) => {
          setText(value)
        }}
      />
      {
        selectItem.id && <div className="box">
          <Paragraph
            copyable={{
              text: selectItem.id
            }}
            className="paragraph">
            ID: {selectItem.id}
          </Paragraph>
          <Input className="theInput" placeholder="名称" value={selectItem.label} disabled />
          <Input className="theInput" placeholder="类型" value={selectItem.value} disabled />
          <TextArea className="theInput" placeholder="目标" value={target} onChange={e => (setTarget(e.target.value))} />
          <Button type="primary" onClick={handleClick.bind(this, selectItem.id)}>编辑节点关系</Button>
        </div>
      }
    </div >
  )
}

export default Content