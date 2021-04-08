import React, { useState } from 'react'
import './App.css'
import Aside from './Aside'
import Content from './Content'

function App () {

  let [item, setItem] = useState(null)

  function dragreStart (value) {
    setItem(value)
  }

  return (
    <div className="App">
      <header className="App-header">
        <Aside dragreStart={dragreStart} />
        <Content item={item} />
      </header>
    </div>
  )
}

export default App
