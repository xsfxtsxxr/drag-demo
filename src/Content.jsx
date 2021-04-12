import React, { useState, useEffect } from 'react'
import G6 from '@antv/g6'
import './Content.css'
import { v4 as uuidv4 } from 'uuid'
import { Button, message, Radio, Tabs } from 'antd'
import { Controlled as CodeMirror } from 'react-codemirror2'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/yaml/yaml.js'
const { TabPane } = Tabs
const yaml = require('js-yaml')

function onDragOver (e) {
  e.stopPropagation()
}

let graph = null, cacheNodes = [], cacheEdges = []
export default function Content ({ item }) {
  const ref = React.useRef(null)
  // 定义数据源
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [templateValue, setTemplateValue] = useState('') // Template value
  const [value, setValue] = useState('yaml') // CodeMirror mode value
  const [component, setComponent] = useState('') // Component value
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
    graph.data({ nodes: nodes, edges: edges })
    graph.render()
  }, [nodes, edges])

  useEffect(() => {
    let cachedItem = null
    graph.on('node:click', evt => {
      evt.stopPropagation()
      const yamlText = jsToYaml(evt.item._cfg.model)
      const jsText = yamlToJs(yamlText)
      setComponent(jsText)
      // if cachedItem, will create line for the two nodes(except cachedTtem)
      if (cachedItem && cachedItem.id !== evt.item._cfg.model.id) {
        cacheNodes.forEach(elem => {
          if (elem.id === cachedItem.id) {
            if (elem.target) {
              elem.target += `,${evt.item._cfg.model.id}`
            } else {
              elem.target = evt.item._cfg.model.id
            }
          }
        })
        setNodes([...cacheNodes])
        createEdges()
        cachedItem = null
      }
    })
    graph.on("node:dblclick", evt => {
      evt.stopPropagation()
      cachedItem = evt.item._cfg.model
    })
  }, [])

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
    setEdges([...newEdges])
  }

  // save template
  function saveTemplate () {
    message.error('开发中...')
  }

  function saveResource () {
    message.error('开发中...')
  }

  // radio group change
  function onChange (e) {
    setValue(e.target.value)
    if (e.target.value === 'javascript') {
      let result = yamlToJs(templateValue)
      setTemplateValue(result)
    } else {
      let result = jsToYaml(templateValue)
      setTemplateValue(result)
    }
  }

  // tab change
  function callback (key) {
    console.log(key, edges, nodes)
    // change to template tab, reset template value
    if (key === 'template') {
      if (value === 'yaml') {
        console.log('要转为yaml')
        setTemplateValue(jsToYaml(nodes))
      } else {
        console.log('要转为yaml')
        const yamlText = jsToYaml(nodes)
        const jsText = yamlToJs(yamlText)
        setTemplateValue(jsText)
      }
    }
  }

  // yaml格式转js
  function yamlToJs (text) {
    let result = yaml.load(text)
    return JSON.stringify(result, null, 2)
  }
  // js格式转yaml
  function jsToYaml (text) {
    let result = yaml.dump(typeof text !== 'object' ? JSON.parse(text) : text)
    return result
  }
  return (
    <div className="content">
      <div ref={ref} className="canvas" onDrop={onDrop} onDragOver={onDragOver}></div>
      <Tabs onChange={callback} type="card">
        <TabPane tab="Component" key="component">
          <div style={{ color: '#fff' }}>
            <Button type="primary" size="small" onClick={saveResource}>编辑资源</Button>
            <CodeMirror
              value={component}
              options={{
                mode: { name: 'javascript' },
                theme: 'material',
                lineNumbers: true
              }}
              onBeforeChange={(editor, data, value) => {
                setComponent(value)
              }}
            />
          </div>
        </TabPane>
        <TabPane tab="Template" key="template">
          <Radio.Group onChange={onChange} value={value}>
            <Radio value='javascript'>JSON</Radio>
            <Radio value='yaml'>YAML</Radio>
          </Radio.Group>
          <Button type="primary" size="small" onClick={saveTemplate}>保存模板</Button>
          <CodeMirror
            value={templateValue}
            options={{
              mode: { name: value },
              theme: 'material',
              lineNumbers: true
            }}
            onBeforeChange={(editor, data, value) => {
              setTemplateValue(value)
            }}
          />
        </TabPane>
      </Tabs>
      {/* {
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
      } */}
    </div >
  )
}