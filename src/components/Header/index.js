import React from 'react'
import Node from '../Node'
import Account from '../Account'
import './header.css'

export default function Header() {
  return (
    <div className="header">
      <Node />
      <Account />
    </div>
  )
}
