function createDimension(options){

    var defaultTarget = 0
    var defaultLabel = null
    var defaultLowerBounds = 0
    var defaultUpperBounds = 100
    var defaultVelocityStopThreshhold = 0.3
    var defaultVelocity = 0
    var defaultFriction = 0.92
    var defaultIsDecelerating = false

    var scope = {
        decelerating:defaultIsDecelerating,
        label:defaultLabel,
        target:defaultTarget,
        upperBounds:defaultUpperBounds,
        lowerBounds:defaultLowerBounds,
        velocityStopTheshhold:defaultVelocityStopThreshhold,
        velocity:defaultVelocity,
        friction:defaultFriction
    }
    
    if(typeof options === "object" && options){
        Object.keys(options).map(function(key){ scope[key] = options[key] })
    }

    return {
        label:scope.key,
        
        addToTarget:addToTarget,
        setTarget:setTarget,
        setUpperBounds:setUpperBounds,
        setLowerBounds:setLowerBounds,
        
        setVelocityThreshhold:setVelocityThreshhold,
        setVelocity:setVelocity,
        
        getTarget:getTarget,
        getDiff:getDiff,
        
        initDecel:initDecel,
        decelStep:decelStep,
        
        isInBounds:isInBounds,
        isDecelerating:isDecelerating,
        
        decelerate:decelerate,
        halt:halt,
        
        log:log,
    }

    function setTarget(newTarget){
        var boundTarget = newTarget

        if(newTarget > scope.upperBounds){
            boundTarget = scope.lowerBounds
        }
        if(newTarget < scope.lowerBounds){
            boundTarget = scope.upperBounds
        }

        scope.target = boundTarget
    }
    function setUpperBounds(newUpperBounds){
        scope.upperBounds = newUpperBounds
    }
    function setLowerBounds(newLowerBounds){
        scope.lowerBounds = newLowerBounds
    }
    function setVelocity(newVelocity){
        scope.velocity = newVelocity
    }
    function setVelocityThreshhold(newVelocityThreshhold){
        scope.velocityTheshhold = newVelocityThreshhold
    }

    function getDiff(){
        var output = 0
        if(scope.target < scope.lowerBounds){
            output = scope.lowerBounds - scope.target
        }else if(scope.target > scope.upperBounds){
            output = scope.upperBounds - scope.target
        }
        return output
    }

    function getTarget(){
        return scope.target
    }

    function addToTarget(whatToAdd){
        if(typeof Number(whatToAdd) === "number"){
            var newTarget = scope.target + Number(whatToAdd)
            setTarget(newTarget)
        }
        return scope.target
    }

    function decelerate(){
        scope.decelerating = true
    }

    function isInBounds(){
        return getDiff() === 0
    }

    function initDecel(velocity){
        setVelocity(velocity)
        if( (Math.abs(velocity) > 1) || (isInBounds() === false) ){
            decelerate()
        }
    }

    function decelStep(){
        var velocityIsValid = Math.abs(scope.velocity) > scope.velocityStopTheshhold
        if( scope.decelerating ){

            scope.velocity *= scope.friction
            var newTarget = scope.target + scope.velocity
            
            setTarget(newTarget)

            if((velocityIsValid === false) || isInBounds() === false){
                scope.decelerating = false
            }
        }
    }

    function isDecelerating(){
        return scope.decelerating
    }

    function halt(){
        if(scope.decelerating){
            scope.decelerating = false
            scope.velocity = 0
        }
    }

    function log(){
        console.log("Dimension Log:", scope)
    }

}
