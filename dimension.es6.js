class Dimension{
    constructor(options){
        const self = this
        self._decelerating = false
        self._label = null
        self._lowerBounds = 0
        self._upperBounds = 100
        self._velocity = 0
        self._velocityThreshhold = 0.3
        self._friction = 0.93
        self._target = 0
        if(typeof options === "object" && object){ Object.keys(options).map((key)=>self[`_${key}`]=options[key]) }
        self.options = options
    }

    get target(){ return this._target }
    set target(value){
        let newTarget = value
        if(value < this._lowerBounds){ newTarget = this._lowerBounds }
        if(value > this._upperBounds){ newTarget = this._upperBounds }
        this.target = newTarget
    }

    get upperBounds(){ return this._upperBounds }
    set upperBounds(value){ this._upperBounds = value }

    get lowerBounds(){ return this._lowerBounds }
    set lowerBounds(value){ this._lowerBounds = value }

    set friction(value){ this._friction = value }
    set velocity(value){ this._velocity = value }
    set velocityThreshhold(value){ this._velocityThreshhold = value }

    get decelerating(){ return this._decelerating }

    get diff(){
        let output = 0
        const { target, lowerBounds, upperBounds } = this
        if(target < lowerBounds){ output = lowerBounds - target }
        if(target > upperBounds){ output = upperBounds - target }
        return output
    }

    get isInBounds(){
        return this.diff === 0
    }

    initDecel(velocity){
        const { isInBounds } = velocity
        this.velocity = velocity
        if( ( Math.abs(velocity) > 1 ) || ( ! isInBounds ) ){ this.decelerating = true }
    }

    step(){
        const {velocityThreshhold, decelerating, friction, isInBounds} = this
        if(decelerating){
            this.velocity *= friction
            this.target += this.velocity
            if( ( ! ( Math.abs(this.velocity) > velocityThreshhold ) ) && ( ! isInBounds ) ){ 
                this.decelerating = false
            }
        }
    }

    halt(){
        this._velocity = 0
        this._decelerating = false
    }
}