import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"


export const config: PlasmoCSConfig = {
  matches: ["https://chatgpt.com/*","https://chat.openai.com/*"],
  all_frames: false,
  run_at: "document_start"
};


export const getStyle = (): HTMLStyleElement => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize

    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")

  styleElement.textContent = updatedCssText

  return styleElement
}

const PlasmoOverlay = () => {
  return (
    <></>
  )
}

export default PlasmoOverlay
