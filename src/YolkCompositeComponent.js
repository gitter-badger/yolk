const Rx = require(`rx`)
const create = require(`yolk-virtual-dom/create-element`)
const YolkCompositeFunctionWrapper = require(`./YolkCompositeFunctionWrapper`)
const CompositePropSubject = require(`./CompositePropSubject`)

function YolkCompositeComponent (fn, props, children) {
  const _props = {...props}
  const _children = children || []

  if (_props.key) {
    this.key = _props.key.toString()
    delete _props.key
  }

  this.name = `YolkCompositeComponent_${fn.name}`
  this.id = fn.name
  this._fn = fn
  this._props = _props
  this._children = _children
  this._component = null
}

YolkCompositeComponent.prototype = {
  type: `Widget`,

  init () {
    this._props$ = new CompositePropSubject(this._props)
    this._children$ = new Rx.BehaviorSubject(this._children)

    const props$ = this._props$.asObservableObject()
    const children$ = this._children$.asObservable()

    const fn = this._fn
    this._component = YolkCompositeFunctionWrapper.create(fn, props$, children$)

    return create(this._component.getVirtualNode())
  },

  update (previous) {
    this._props$ = previous._props$
    this._children$ = previous._children$
    this._component = previous._component

    this._props$.onNext(this._props)
    this._children$.onNext(this._children)
  },

  destroy () {
    this._component.destroy()

    const children = this._children
    const length = children.length
    let i = -1

    while (++i < length) {
      const child = children[i]
      isFunction(child.destroy) && child.destroy()
    }
  },
}

module.exports = YolkCompositeComponent
