"use client";

import { Logo } from '@pmndrs/branding'

import { useSnapshot } from 'valtio'
import { state } from './store'
import { motion, AnimatePresence } from 'framer-motion'
import { ChromePicker } from 'react-color';
import { useState } from 'react'

export default function Overlay() {
  const snap = useSnapshot(state)

  const transition = { type: 'spring', duration: 0.8 }

  const config = {
    initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
    animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
    exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } }
  }

  return (
    <div className="container">
      <motion.header
        initial={{ opacity: 0, y: -120 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 1.8, delay: 1 }}>
        {/* <Logo width="40" height="40" /> */}
        <div>
        </div>
      </motion.header>

      <AnimatePresence>
        {snap.intro ? (
          <Intro key="main" config={config} />
        ) : (
          <Customizer key="custom" config={config} />
        )}
      </AnimatePresence>
    </div>
  )
}

function Intro({ config }) {
  return (
    <motion.section {...config}>
      <div className="section--container">
        <div>
          <h1>LET'S DO IT.</h1>
        </div>
        <div className="support--content">
          <div>
            <p>
              Create your unique and exclusive shirt with our brand-new 3D
              customization tool. <strong>Unleash your imagination</strong> and
              define your own style.
            </p>
            <button
              style={{ background: 'black',zIndex:99,position:"relative"}}
              onClick={() => (state.intro = false)}>
              CUSTOMIZE IT 
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

function Customizer({ config }) {
  const snap = useSnapshot(state)
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleColorChange = (color) => {
    state.selectedColor = color.hex;
  };
  return (
    <motion.section {...config}>
      <div className="customizer">
      <div className="color-options">
          {snap.colors.map((color) => (
            <div
              key={color}
              className="circle"
              style={{ background: color, zIndex: "999", position: "relative" }}
              onClick={() => (state.selectedColor = color)}
            ></div>
          ))}
          
          <div
            className="circle"
            style={{
              background: snap.selectedColor,
              zIndex: "999",
              position: "relative",
            }}
            onClick={() => setShowColorPicker(true)}
          ></div>
        
        </div>
        {showColorPicker && (
            <div className="color-picker" style={{zIndex:"99",position:"absolute",bottom:"10%",right:"1%", }}>
              <ChromePicker color={snap.selectedColor} onChange={handleColorChange} />
            </div>
          )}

        <div className="decals" style={{zIndex:"9"}}>
          <div className="decals--container">
            {snap.decals.map((decal) => (
              <div
                key={decal}
                className="decal"
                onClick={() => (state.selectedDecal = decal)}>
                <img src={decal + '_thumb.png'} alt="brand" />
              </div>
            ))}
          </div>
        </div>

        <button
          className="share"
          style={{ background: snap.selectedColor,zIndex:"99",position:"absolute"}}
          onClick={() => {
            const link = document.createElement('a')
            link.setAttribute('download', 'canvas.png')
            link.setAttribute(
              'href',
              document
                .querySelector('canvas')
                .toDataURL('image/png')
                .replace('image/png', 'image/octet-stream')
            )
            link.click()
          }}>
          DOWNLOAD
        </button>

        <button
          className="exit"
          style={{ background: snap.selectedColor ,zIndex:"99",position:"absolute"}}
          onClick={() => (state.intro = true)}>
          GO BACK
        </button>
      </div>
    </motion.section>
  )
}
