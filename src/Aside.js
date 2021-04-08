import React from 'react'
import './Aside.css'
import { Menu } from 'antd'
import { AppstoreOutlined, MailOutlined } from '@ant-design/icons'
const { SubMenu } = Menu
const list = [
  { value: '1', label: '云主机' },
  { value: '2', label: '裸机' },
  { value: '3', label: '镜像' },
  { value: '4', label: '云硬盘' },
  { value: '5', label: '备份' },
  { value: '6', label: '快照' },
  { value: '7', label: '路由器' },
  { value: '8', label: '浮动IP' },
  { value: '9', label: 'VPN' },
]
const list2 = [
  { value: '10', label: '防火墙' },
  { value: '11', label: '负载均衡器' },
  { value: '12', label: '对象储存' },
  { value: '13', label: '网络' },
]

function handleClick (e) {
  console.log('click ', e)
};

function Aside (props) {
  const { dragreStart } = props
  return (
    <Menu
      onClick={handleClick}
      style={{ width: 256, height: '100vh' }}
      defaultSelectedKeys={['1']}
      defaultOpenKeys={['sub1']}
      mode="inline"
      className="aside"
    >
      <SubMenu key="sub1" icon={<MailOutlined />} title="Navigation One">
        {
          list.map(item => (<Menu.Item className="dragItem" key={item.value} draggable onDragStart={dragreStart.bind(this, item)}>{item.label}</Menu.Item>))
        }
      </SubMenu>
      <SubMenu key="sub2" icon={<AppstoreOutlined />} title="Navigation Two">
        {
          list2.map(item => (<Menu.Item className="dragItem" key={item.value} draggable onDragStart={dragreStart.bind(this, item)}>{item.label}</Menu.Item>))
        }
      </SubMenu>
    </Menu>
  )
}

export default Aside