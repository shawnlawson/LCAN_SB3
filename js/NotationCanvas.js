//PIXI v8 changed to an async load method

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

const app = new PIXI.Application()
const mCanvas = document.getElementById("pixicontainer")

async function setup() 
{
  await app.init({
      antialias: true,    // default: false
      // autoDensity: true,
      width:1280,
      height:720,
      background: '#FFFFFF',
      // resizeTo: mCanvas
    })

  mCanvas.appendChild(app.view);
};

app.play_pause = function() 
{
  if (gsap.globalTimeline.paused())
    gsap.globalTimeline.play()
  else
    glsap.globalTimeline.pause()
}

//CHECK
app.rewind = function() 
{
  for (const object of app.stage.children) {
    if('timeline' in object){
      object.timeline.pause()
      object.timeline.seek(0)
    }
  }
}

app.load = function(objects) 
{
  //load objects
  for (const [name, object] of Object.entries(objects)) {
    if ("world" === name){
      app.loadWorld(name, object)
    }else{

      //delete if same name, optional
      if ("replace" in object) {
        app.replaceGraphics(name, object)
      }

      //add drawables
      if ("shape" in object) {
          app.loadGraphics(name, object)
      }

    }
  }
}

app.loadWorld = function(name, object) 
{
  if ("speed" in object)
    gsap.globalTimeline.timescale(app.numberHelper(object.speed))
  if ("play" in object)
    if (object.play === true)
      gsap.globalTimeline.play()
    else if (object.play === false)
      gsap.globalTimeline.pause()
  if ("play_pause" in object && object.play_pause === true)
    app.play_pause()


  if ("clear" in object) {
    if("all" === object.clear)
      app.stage.removeChildren()
    else{
      var foundObject = app.stage.getChildByName(object.name, true)
      app.state.removeChild(foundObject)
    }
  }

  // background color, could add alpha
  if ("background_color" in object)
    app.renderer.background.backgroundColor = app.parseColor(object.background_color)
    // app.renderer.backgroundColor = app.parseColor(object.background_color)
}

app.loadGraphics = function(name, object)
{
  let howMany = 1
  let singleton = true
  //for multiple copies, optional
  if ("number" in object){
    howMany = app.numberHelper(object.number)
    singleton = false
  }

  while (howMany > 0) {
    let newObject = undefined

    if (object.shape === 'font') {
      newObject = new PIXI.Text()
    } else {
      newObject = new PIXI.Graphics()
    }

    if (singleton)
      newObject.name = name
    else
      newObject.name = name+"_"+howMany

    app.loadTRS(name, object, newObject)

    if (object.shape === 'circle') {
      app.makeCircle(name, object, newObject)
    } else if (object.shape === 'ellipse'){
      app.makeEllipse(name, object, newObject)
    } else if (object.shape === 'rect') {
      app.makeRect(name, object, newObject)
    } else if (object.shape === 'rounded_rect') {
      app.makeRoundedRect(name, object, newObject)
    } else if (object.shape === 'star') {
      app.makeStar(name, object, newObject)
    } else if (object.shape === 'line') {
      app.makeLine(name, object, newObject)
    } else if (object.shape === 'font') {
      app.makeText(name, object, newObject)
    }

    app.loadFillStroke(name, object, newObject)

    //for animation cued information
    if ("cues" in object) {
      newObject.timeline = app.loadCues(object, newObject)
    }

    app.setHierarchy(object, newObject)

    howMany -= 1
  } //end while how_many
} //end for each graphics

app.setHierarchy = function(o, no) 
{
    if ("parent" in o){
      let newParent = app.stage.getChildByLabel(o.parent, true)
      newParent.addChild(no)
    }else{
      app.stage.addChild(no)
    }
}

app.makeCircle = function(n, o, no) 
{  
  let r = app.parseFloatProperty(n, o, "radius")
  if ( r === null) return
  
  no.circle(0, 0, r)
}

app.makeEllipse = function(n, o, no) 
{  
  let rx = app.parseFloatProperty(n, o, "radiusX")
  if ( rx === null) return
  let ry = app.parseFloatProperty(n, o, "radiusY")
  if ( ry === null) return

  no.ellipse(0, 0, rx, ry)
}

app.makeRect = function(n, o, no) 
{
  let w = app.parseFloatProperty(n, o, "width")
  if ( w === null) return
  let h = app.parseFloatProperty(n, o, "height")
  if ( h === null) return

  no.pivot.x = w * .5 //only rect needs this
  no.pivot.y = h * .5 //only rect needs this

  no.rect(0, 0, w, h)
}

app.makeRoundedRect = function(n, o, no) 
{
  let r = app.parseFloatProperty(n, o, "radius")
  if ( r === null) return
  let w = app.parseFloatProperty(n, o, "width")
  if ( w === null) return
  let h = app.parseFloatProperty(n, o, "height")
  if ( h === null) return
  
  no.pivot.x = w * .5
  no.pivot.y = h * .5

  no.roundedRect(0, 0, w, h, r)
}

app.makeStar = function(n, o, no) 
{    
  let r = app.parseFloatProperty(n, o, "radius")
  if ( r === null) return
  let p = app.parseFloatProperty(n, o, "points")
  if ( p === null) return
  let ir = app.parseFloatProperty(n, o, "innerRadius")
  if ( ir === null) return

  no.star(0, 0, p, r, ir, 0)
}

app.makeLine = function(n, o, no) 
{
  if ("start" in o) { //if specified
    let p = app.parsePointProperty(n, o, "start")
    if (p === null) return
    no.moveTo(p.x, p.y)
  } else {
    no.moveTo(0, 0)  // x and y properties position entire line
  }
  
  if ("points" in o) {
    app.parsePointsProperty(n, o, no, "points") //lineTo() in this sub-routine
  }

  if ("end" in o) { //if specified
    let p = app.parsePointProperty(n, o, "end")
    if (p === null) return
    no.lineTo(p.x, p.y)
  } 

  no.stroke({ width: 1, color: 0x000000 }); //can be overriden with stroke

}

app.makeText = function(n, o, no)
{
    const s = new PIXI.TextStyle()
    text = "Hello World!"

    if ("font_face" in object){
      s.fontFamily = object.font_face
    } else {
      s.fontFamily = 'Arial'
    }
    if ("font_size" in object){
      s.fontSize = app.numberHelper(object.font_size)
    } else {
      s.fontSize = 12
    }
    if("text" in object){
      text = object.text
    } else {
      text = "Hello World!"
    }

    no.text = t
    no.style = s

}

app.loadCues = function(o, no) 
{
  gsap.defaults({ease: "none"})
  var tl = gsap.timeline({ease : "none", 
                          duration: 1, 
                          delay: 0,
                          onComplete: app.removeObject,
                          onCompleteParams: [no]
                        })

  for (const cue of o.cues) {
    c = {pixi: {}}
    //local overrides
    if ("duration" in cue)
      c.duration = app.numberHelper(cue.duration)
    if ("delay" in cue)
      c.delay = app.numberHelper(cue.delay)
    if ("ease" in cue)
      c.ease = cue.ease
    if ("repeat" in cue)
      c.repeat = cue.repeat
    if ("keep" in cue)
      tl.vars.onComplete = null

    //multiple properties can change
    if ("x" in cue.what)
      c.pixi.x = app.numberHelper(cue.what.x)
    if ("y" in cue.what)
      c.pixi.y = app.numberHelper(cue.what.y)
    if ('rotation' in cue.what)
      c.pixi.angle = app.numberHelper(cue.what.rotation)
    if ('color' in cue.what)//check
      c.pixi.fillColor = app.gsapParseColor(cue.what.color)
    if ('stroke.color' in cue.what)
      c.pixi.lineColor = app.parseColor(cue.what.color)
    if ('alpha' in cue.what)//check
      c.pixi.opacity = app.numberHelper(cue.what.opacity)
    if ('width' in cue.what)
      c.pixi.width = app.numberHelper(cue.what.width)
    if ('height' in cue.what)
      c.pixi.height = app.numberHelper(cue.what.height)
    if ('scale' in cue.what)
      c.pixi.scale = app.numberHelper(cue.what.scale)
    if ('start' in cue.what)
      c.pixi.start = app.numberHelper(cue.what.start)
    if ('end' in cue.what)
      c.pixi.end = app.numberHelper(cue.what.end)

    tl.to(no, c)
  }//end load cues

  return tl
}

app.removeObject = function(clip) 
{
  clip.parent.removeChild(clip)
}

app.replaceGraphics = function(name, object)
{
  let howMany = 1
  let singleton = true

  if ("number" in object) {
    howMany = app.numberHelper(object.number)
    singleton = false
  }

  while (howMany > 0) 
  {
    let child = null

    if(singleton)
      child = app.stage.getChildByLabel(name, true)
    else
      child = app.stage.getChildByLabel(name+"_"+howMany, true)

    if (child !== null)
      child.parent.removeChild(child)

    howMany -= 1 
  }
}

//////////////////////////////////////////////////////
/////////////////////   helpers   ///////////////////
/////////////////////////////////////////////////////

app.missingProperty = function(name, prop, o) 
{
  console.log(name + " is missing " + prop + " property")
  let ms = new Date()
  let session = feedback.session
  session.insert(
  {
    row: session.getLength(),
    column: 0
  },
  "\n"+ 
  String(ms.getHours()).padStart(2, '0') +":"+ 
  String(ms.getMinutes()).padStart(2, '0') +":"+ 
  String(ms.getSeconds()).padStart(2, '0') +"\t"+ 
  name + " is missing " + prop + " property"
  )
}

app.parseFloatProperty  = function(n, o, what) {
  if (what in o){
    return r = app.numberHelper(o[what])
  } else {
    app.missingProperty(n, what, o)
    return null
  }
}

app.parsePointProperty = function(n, o, what) {
  if (Array.isArray(o[what])) {
      let l = o[what].length
      if (l == 2) { //correct number of entries
          let x = app.numberHelper(o[what][0])
          let y = app.numberHelper(o[what][1])
          return { 'x': x, 'y': y }
      } else {
        app.missingProperty(n, "only two numbers for "+what, o)
        return null
      }
  } else {
    app.missingProperty(n, "array with "+what+" point or do not use "+what, o)
    return null
  }
}

app.parsePointsProperty = function(n, o, no, what) {
  if (Array.isArray(o[what])) {
    let l = o[what].length
    if (l % 2 == 0) { //even number of entries
      for (let i = 0; i < l; i += 2){
        let x = app.numberHelper(o[what][i])
        let y = app.numberHelper(o[what][i+1])
        no.lineTo(x, y)
      }
    } else {
        app.missingProperty(n, "even number of values needed", o)
        return null
    }
  } else {
    app.missingProperty(n, "array points or do not use points", o)
    return null
  }
}

app.loadTRS = function(n, o, no) {

    //position
    if ('x' in o){
      no.x = app.numberHelper(o.x)
    }
    if ('y' in o){
      no.y = app.numberHelper(o.y)
    }

    //rotation
    if('rotation' in o){
        no.angle = app.numberHelper(o.rotation)
    }

    //scale
    if('scale' in o){
      //TODO work on scale
      no.scale = app.numberHelper(o.scale)
    }
}

app.loadFillStroke = function(n, o, no) {
    //fill
    f = {
      color: [0,0,0],
      alpha: 1.0
    }
    if ("color" in o) {
      f.color = app.parseColor(o.color)
    }
    if ("opacity" in o){
      f.alpha = app.numberHelper(o.opacity)
    }
    no.fill(f)

    //stroke
    if ("stroke" in o) {
      s = {}
      if ("width" in o.stroke)
        s.width = app.numberHelper(o.stroke.width)
      if ("opacity" in o.stroke)
        s.alpha = app.numberHelper(o.stroke.opacity)
      if ("color" in o.stroke)
        s.color = app.parseColor(o.stroke.color)
      no.stroke(s)
    }
}

app.gsapParseColor = function(c) {
  let nc = app.parseColor(c)
  return "rgb("+app.floatToByte(nc[0])+
         ","+app.floatToByte(nc[1])+
         ","+app.floatToByte(nc[2])+")"
}

app.parseColor = function(c) {
  let r = 0, g = 0, b = 0

  //single color grey
  if (app.isCustomNumber(c)) {
    r = g = b = c
  }

  //rgb array color
  else if (Array.isArray(c)) {
    if (c.length == 3) {
      r = app.numberHelper(c[0])
      g = app.numberHelper(c[1])
      b = app.numberHelper(c[2])
    } else {
      r = g = b = app.numberHelper(c)
    }
  }

  //rgb by component or random long form
  else if (app.isObject(c)){
    if("r" in c){
      r = app.numberHelper(c.r)
    }
    if("g" in c){
      g = app.numberHelper(c.g)
    }
    if("b" in c){
      b = app.numberHelper(c.b)
    }
    if("random" in c){
      if (app.isCustomNumber(c.random))
        r = g = b = app.parseRand(c.random)
      if (Array.isArray(c.random)){
        if (c.random.length == 3){
          r = app.parseRand(c.random[0])
          g = app.parseRand(c.random[1])
          b = app.parseRand(c.random[2])
        }
      }
    }
  }

  return [r, g, b]
}

app.numberHelper = function(c) {
  if (app.isCustomNumber(c)) {
    return c
  }
  else if (Array.isArray(c)){
    return app.parseRand(c)
  }
  else if ("random" in c){
    return app.parseRand(c.random)
  }
}

app.parseRand = function(r) {
  if (r === null){
    //atom.notifications.addError('value missing')
    return 0.0 //nothing -- error
  }
  if (app.isCustomNumber(r))  //single value
    return gsap.utils.random(0, r)
  else if (Array.isArray(r)) {//range
    var l = r.length
    if (l == 1) //single element array
      return gsap.utils.random(0, r[0])
    else if (l == 2)
      return gsap.utils.random(r[0], r[1])
  }
  // return (r.length > 1 ? app.mRand(r[0], r[1]) : r[0])
}

app.isObject = function(o) {
  // typeof yourVariable === 'object' && yourVariable !== null
  if (o.constructor == Object)
    return true
  else
    return false
}

app.isNumber = function(value) {
  return typeof value === 'number' && isFinite(value);
}

app.isNumberObject = function(n) {
  return (Object.prototype.toString.apply(n) === '[object Number]');
}

app.isCustomNumber = function(n){
  return app.isNumber(n) || app.isNumberObject(n);
}

app.floatToByte = function(f) {
  return Math.floor(f >= 1.0 ? 255 : f * 256.0)
};

(async () =>
{
  await setup();
})();
