const RAF = RAF ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  function (callback) {
    return window.setTimeout(callback, 1000 / 60)
  }
const CAF = window.cancelAnimationFrame || function (id) {
  window.clearTimeout(id)
}


const setTransform = function (el, prop) {
  el.style.transform = prop
  el.style.WebkitTransform = prop
}

const setTransition = function (el, prop) {
  el.style.transition = prop
  el.style.WebkitTransition = prop
}

class LefitParallax {
  constructor(props) {
    this.props = Object.assign({
      boxSelector: '.parallax-box',
      layersSelector: '.layer',
      auto: true
    }, props)
    this.orientationData = null
    this.init(this.props)
  }
  init({boxSelector, layersSelector, auto}) {
    this.box = document.querySelector(boxSelector)
    if (!this.box) {
      throw Error('请先传入视差容器选择器: boxSelector')
    }
    this.layers = [].slice.call(this.box.querySelectorAll(layersSelector))
    let rect = this.box.getBoundingClientRect()
    let offsetLeft = rect.left + document.body.scrollLeft
    let offsetTop = rect.left + document.body.scrollTop

    this.centerX = (rect.width || rect.right - rect.left) / 2
    this.centerY = (rect.heigth || rect.bottom - rect.top) / 2
    this.xRange = ~~(this.box.xRange || this.centerX * 0.2)
    this.yRange = ~~(this.box.yRange || this.centerY * 0.2)
    this.invertX = this.box.invertX || false
    this.invertX = this.box.invertX || false

    this.layers.forEach(layer => {
      layer.ox = layer.oy = layer.mx = layer.my = 0
      layer.depth = parseFloat(layer.getAttribute('data-depth') || parseFloat(layer.getAttribute('depth')) || 0.5)
    })

    this.props.auto && this.start()
  }
  start() {
    window.addEventListener('deviceorientation', this.deviceorientationHandle.bind(this))
    this.rId = RAF(this.render.bind(this))
  }
  deviceorientationHandle(evt) {
    this.orientationData = {
      x: evt.beta,
      y: evt.gamma > 180 ? evt.gamma - 360 : evt.gamma
    }
  }
  stop() {
    window.removeEventListener('deviceorientation', this.deviceorientationHandle)
    CAF(this.rId)
  }
  render() {
    if (this.orientationData) {
      let offsetX = this.orientationData.y / 90 * this.xRange * (this.invertX ? -1 : 1)
      let offsetY = this.orientationData.x / 90 * this.yRange * (this.invertY ? -1 : 1)
      this.layers.forEach(function(layer) {
        layer.mx = -offsetX
        layer.my = -offsetY
        switch (window.orientation) {
          case -90:
            let _mx = layer.mx
            layer.mx = -layer.my
            layer.my = _mx
            break
          case 90:
            var _mx = layer.mx
            layer.mx = layer.my
            layer.my = _mx * -1
            break
          case 180:
            layer.mx *= -1
            layer.my *= -1
            break
        }
        layer.ox += (layer.mx - layer.ox) * 0.1
        layer.oy += (layer.my - layer.oy) * 0.1
        setTransform(layer, `translate3d(${layer.ox * layer.depth}px, ${layer.oy * layer.depth}px, 0)`)
        setTransition(layer, '0.3s ease-out')
      })
    }
    this.rId = RAF(this.render.bind(this))
  }
}

export default {
  LefitParallax,
  install(Vue) {
    Vue.component('lefit-parallax', {
      name: 'LefitParallax',
      render(createElement) {
        this.layers = this.$slots.default || []
        return createElement('div', {
          attrs: {
            class: 'parallax-box'
          }
        }, this.layers)
      },
      data() {
        return {
          layers: [],
          parallaxBox: null,
        }
      },
      mounted() {
        this.layers.forEach(v => {
          v.elm.className = v.elm.className ? v.elm.className + ' layer' : 'layer' 
        })
        this.parallaxBox = new LefitParallax({
          boxSelector: '.parallax-box',
          layersSelector: '.layer'
        })
        window.parallaxBox = this.parallaxBox
      }
    })
  }
}