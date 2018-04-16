const MINX = 0
const MAXX = 200
const MINY = 0
const MAXY = 0

const options = {
    minXValue:MINX,
    maxXValue:MAXX,
    minYValue:MINY,
    maxYValue:MAXY,
    friction:0.97
}

const D = new dance(options)
const D2 = new dance(options)

const B = document.getElementById("dancer")
const B2 = document.getElementById("prancer")

const moveElm = (elm) => ({x,y}) => elm.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`

D.bindTo(B)
D.update(moveElm(B))
D.enable()

D2.bindTo(B2)
D2.update(moveElm(B2))
D2.enable()
