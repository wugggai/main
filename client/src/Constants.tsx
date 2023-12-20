import axios from 'axios'
import Cookies from 'react-cookies'

export const API_BASE = "http://localhost:4000/api"
export const SERVER = axios.create({
  baseURL: API_BASE,
  headers: { Authorization: `Bearer ${Cookies.load('access_token')}` }
})

SERVER.interceptors.response.use(
  response => response, // return the response for successful requests
  (err) => {
      if (err.response?.status === 401) {
          Cookies.remove('access_token')
          Cookies.remove('user_id')
          window.location.assign('/')
          return
      }
      return Promise.reject(err); // always return the error
  }
)

export const SUPPORTED_MODELS = ["gpt-3.5-turbo-16k", "gpt-4", "llama", "DALL-E2", "stable-diffusion-v3", "midjourney-v4"]

export const TAG_PALETTE = ["#CA5690", "#F7AECA", "#FCDFBA", "#DCB36E", "#E59769", "#83B19E", "#52A1BE", "#63A5F7", "#5850B6", "#1C406D"]

export const SYNTAX_THEME = {
    "code[class*=\"language-\"]": {
      "color": "black",
      "maxWidth": "100%",
      "background": "none",
      "fontFamily": "Menlo, Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      "fontSize": "95%",
      "textAlign": "left",
      "whiteSpace": "pre",
      "wordSpacing": "normal",
      "wordBreak": "normal",
      "wordWrap": "break-word",
      "lineHeight": "1.5",
      "MozTabSize": "4",
      "OTabSize": "4",
      "tabSize": "4",
      "WebkitHyphens": "none",
      "MozHyphens": "none",
      "msHyphens": "none",
      "hyphens": "none",
    },
    "pre[class*=\"language-\"]": {
      "borderRadius": "5px",
      "maxWidth": "100%",
      "color": "black",
      "background": "#f2f2f2",
      "fontFamily": "Menlo, Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      "fontSize": "1em",
      "textAlign": "left",
      "whiteSpace": "pre",
      "wordSpacing": "normal",
      "wordBreak": "normal",
      "wordWrap": "break-word",
      "lineHeight": "1.5",
      "MozTabSize": "4",
      "OTabSize": "4",
      "tabSize": "4",
      "WebkitHyphens": "none",
      "MozHyphens": "none",
      "msHyphens": "none",
      "hyphens": "none",
      "padding": "1em",
      "margin": ".5em 0",
      "overflow": "auto"
    },
    "pre[class*=\"language-\"]::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "pre[class*=\"language-\"] ::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"]::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"] ::-moz-selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "pre[class*=\"language-\"]::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "pre[class*=\"language-\"] ::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"]::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    "code[class*=\"language-\"] ::selection": {
      "textShadow": "none",
      "background": "#b3d4fc"
    },
    ":not(pre) > code[class*=\"language-\"]": {
      "background": "#f5f2f0",
      "padding": ".1em",
      "borderRadius": ".3em",
      "whiteSpace": "normal"
    },
    "comment": {
      "color": "slategray"
    },
    "prolog": {
      "color": "slategray"
    },
    "doctype": {
      "color": "slategray"
    },
    "cdata": {
      "color": "slategray"
    },
    "punctuation": {
      "color": "#555"
    },
    "namespace": {
      "Opacity": ".7"
    },
    "property": {
      "color": "#905"
    },
    "tag": {
      "color": "#905"
    },
    "boolean": {
      "color": "#AD3DA4",
      "fontWeight": "600"
    },
    "number": {
      "color": "#272AD8"
    },
    "constant": {
      "color": "#905"
    },
    "symbol": {
      "color": "#905"
    },
    "deleted": {
      "color": "#905"
    },
    "selector": {
      "color": "#690"
    },
    "attr-name": {
      "color": "#690"
    },
    "string": {
      "color": "#D12F1B"
    },
    "char": {
      "color": "#690"
    },
    "builtin": {
      "color": "#804FB8"
    },
    "inserted": {
      "color": "#690"
    },
    "operator": {
      "color": "#202020",
    },
    "entity": {
      "color": "#9a6e3a",
      "cursor": "help"
    },
    "url": {
      "color": "#9a6e3a",
    },
    ".language-css .token.string": {
      "color": "#9a6e3a",
    },
    ".style .token.string": {
      "color": "#9a6e3a",
    },
    "atrule": { // Swift decorator
      "color": "#b5b"
    },
    "attr-value": {
      "color": "#07a"
    },
    "keyword": {
      "color": "#AD3DA4",
      "fontWeight": "600"
    },
    "function": {
      "color": "#3E8087"
    },
    "class-name": {
      "color": "#4B21B0"
    },
    "regex": {
      "color": "#e90"
    },
    "important": {
      "color": "#e90",
      "fontWeight": "bold"
    },
    "variable": {
      "color": "#e90"
    },
    "bold": {
      "fontWeight": "bold"
    },
    "italic": {
      "fontStyle": "italic"
    }
  };

export function getUserId(): number | undefined {
  return Cookies.load('user_id')
}

export function hexToRgb(hex: string) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/** Returns whether the color is dark (i.e. suitable for white text).*/
export function isDark(hex: string) {
  const rgb = hexToRgb(hex)
  if (rgb !== null) {
    const { r, g, b } = rgb
    const sRGBLuma = r * 0.2126 + g * 0.7152 + b * 0.0722
    return sRGBLuma / 255 < 0.6
  } else {
    return false
  }
}

export function textColorFromHex(hex: string) {
  return isDark(hex) ? "white" : "black"
}