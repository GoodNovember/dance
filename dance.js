(function() {
    // date now polyfill
    if (!Date.now) { Date.now = function now() { return new Date().getTime() } }

    // RequestAnimation Frame polyfill.
    var lastTime = 0
    var vendors = ['ms', 'moz', 'webkit', 'o']
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) { 
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame']
    }
 
    if (!window.requestAnimationFrame){
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime()
            var timeToCall = Math.max(0, 16 - (currTime - lastTime))
            var id = window.setTimeout(function() { callback(currTime + timeToCall) }, timeToCall)
            lastTime = currTime + timeToCall
            return id
        }
    }
 
    // cancel animation frame polyfill
    if (!window.cancelAnimationFrame) { window.cancelAnimationFrame = function(id) { clearTimeout(id) } }

    // object keys polyfill
    if (!Object.keys) Object.keys = function(o) {
        if (o !== Object(o)){
            throw new TypeError('Object.keys called on a non-object');
        }
        var output=[]
        var p
        for (p in o){
            if (Object.prototype.hasOwnProperty.call(o,p)){
                output.push(p)
            }
        } 
        return output
      }
}())

function dance(options){
    var self = this

    var scope = {
        minXValue:0,
        maxXValue:100,

        minYValue:0,
        maxYValue:100,

        friction:0.92,
        velocityStopTheshhold:0.3,
    }

    if(typeof options === "object" && options){
        Object.keys(options).map(function(key){ scope[key] = options[key] })
    }

    var boundElement = null
    var boundCallback = null

    var isBound = false
    var isPointerActive = false
    var isEnabled = true

    var activePointerId = 0 // for touch

    var shouldContinueHeartbeat = false // don't start our engine till we are told to.

    var activePointsArray = []

    var timeFudge = 15 // allows you to fine tune the time offset.

    // these values represent the active mouse cursor.
    var CurrentX = 0
    var CurrentY = 0
    var LastX = 0
    var LastY = 0
    
    // this tells us how old a sample can be before it is "forgotten"
    var PointExpirationMs = 120 

    var xDimension = createDimension({
        label:"x",
        lowerBounds:scope.minXValue,
        upperBounds:scope.maxXValue,
        friction:scope.friction,
        velocityStopTheshhold:scope.velocityStopTheshhold
    })
    var yDimension = createDimension({
        label:"y",
        lowerBounds:scope.minYValue,
        upperBounds:scope.maxYValue,
        friction:scope.friction,
        velocityStopTheshhold:scope.velocityStopTheshhold
    })

    // public methods
    self.bindTo = bindTo
    self.destroy = destroy
    self.enable = enable
    self.disable = disable
    self.update = update
    
    // event Functions
    function onMove(event){
        var normalEvent = normalizeEvent(event)
        if( ! (event instanceof TouchEvent) ){
            event.preventDefault()
        }
        CurrentX = normalEvent.x
        CurrentY = normalEvent.y
        trackPoint(normalEvent.x, normalEvent.y)
    }
    
    function onStart(event){
        var normalEvent = normalizeEvent(event)
        if( ! isPointerActive && isEnabled ){
            isPointerActive = true
            // stop the animation in its tracks
            // as if the user just grabbed a spinning object
            xDimension.halt()
            yDimension.halt()

            LastX = CurrentX = normalEvent.x
            LastY = CurrentY = normalEvent.y
            
            if(event instanceof TouchEvent){
                activePointerId = normalEvent.id
            }
            
            activePointsArray = [] // clean out the old data.
            trackPoint(normalEvent.x, normalEvent.y)
        }
    }
    
    function onEnd(event){
        var normalEvent = normalizeEvent(event)
        if(isPointerActive && (normalEvent.id === activePointerId)){
            isPointerActive = false
            startDecelAnimation()
        }
    }

    function normalizeEvent(event){
        var output = {
            id:0,
            x:-1,
            y:-1
        }

        if(event instanceof TouchEvent){
            var changed = event.changedTouches || []
            var newPointData = changed[activePointerId]
            output.x = newPointData.pageX
            output.y = newPointData.pageY
            output.id = newPointData.identifier
        }else if (event instanceof MouseEvent){
            output.x = event.pageX
            output.y = event.pageY
        }

        return output
    }
    
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onEnd)

    window.addEventListener("touchmove", onMove)
    window.addEventListener("touchend", onEnd)
    
    // methods
    function bindTo(element){

        if(isBound){
            destroy()
        }

        if(element instanceof Element){
            boundElement = element
        }else if (typeof element === string){
            boundElement = document.querySelector(element)
            if(!boundElement){
                boundElement = null
            }
        }

        if (!boundElement){
            console.error("Bind Error: Please provide a valid HTML element reference or a valid selector string.", element)
        }else{
            boundElement.addEventListener("mousedown", onStart)
            boundElement.addEventListener("touchstart", onStart)
            isBound = true
        }

    }

    function trackPoint(x,y){
        var currentTime = Date.now()
        activePointsArray.push({
            x:x,
            y:y,
            time:currentTime
        })
    }

    function cleanPointsArray(){
        // this function removes point data that is too old
        // by replacing the array continually with a new one
        // which has the most recent data required.
        var currentTime = Date.now()
        activePointsArray = activePointsArray.reduce(function(acc, point){
            if((currentTime - point.time) < PointExpirationMs){
                acc.push(point)
            }
            return acc
        },[])
    }

    function destroy(){
        isBound = false
        boundElement.removeEventListener("mousedown", onStart)
        boundElement.removeEventListener("touchstart", onStart)
    }

    function enable(){
        isEnabled = true
        shouldContinueHeartbeat = true
        requestAnimationFrame(heartbeat)
    }

    function disable(){
        isEnabled = false
        shouldContinueHeartbeat = false
    }

    function update(callback){
        if(typeof callback === "function"){
            boundCallback = callback
        }
    }

    function startDecelAnimation(){
        if(xDimension.isDecelerating() === false || yDimension.isDecelerating === false){
            var firstPoint = activePointsArray[0]
            var lastPoint = activePointsArray[activePointsArray.length - 1]
            if(firstPoint && lastPoint){
                var xOffset = lastPoint.x - firstPoint.x
                var yOffset = lastPoint.y - firstPoint.y
                var timeOffset = lastPoint.time - firstPoint.time
                var deltaTime = timeOffset / timeFudge
                var veloX = xOffset / deltaTime || 0
                var veloY = yOffset / deltaTime || 0
                xDimension.initDecel(veloX)
                yDimension.initDecel(veloY)
            }
        }
    }

    function callUpdateFn(pkg){
        if(typeof boundCallback === "function"){
            boundCallback(pkg)
        }else{
            console.log("No Bound Callback.")
        }
    }

    // the main heartbeat of the program.
    function heartbeat(){
        var deltaX = CurrentX - LastX
        var deltaY = CurrentY - LastY
        
        if(isPointerActive){ // move the target using the mouse.
            cleanPointsArray()
            xDimension.addToTarget(deltaX)
            yDimension.addToTarget(deltaY)
        }
        
        if(isPointerActive || xDimension.isDecelerating() || yDimension.isDecelerating()){
            // update the movement
            xDimension.decelStep()
            yDimension.decelStep()

            // send data to user
            callUpdateFn({
                x:xDimension.getTarget(),
                y:yDimension.getTarget()
            })
        }

        LastX = CurrentX
        LastY = CurrentY
    
        if(shouldContinueHeartbeat){
            requestAnimationFrame(heartbeat)
        }
    }

}// end of dance scope