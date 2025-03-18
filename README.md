# readme


# Documentation

## World

properties
~~~toml
world.speed = 1.0
world.background_color = [1, 1, 1]
~~~

commands
~~~toml
world.play = true|false
world.play_pause = true
world.clear = "all"
world.clear = "name"
~~~

## Object

declaration and naming
~~~toml
[name]
~~~

properties required
~~~toml
shape = "rect" #refer to shapes section. Options: circle, ellipse, rect, rounded_rect, star, line, font
~~~

properties optional for all shapes
~~~toml
number = 1 # defaults to 1
color = [1,1,1] # defaults to [0,0,0]
opacity = 1 # defaults to 1
stroke.width = 1 # defaults to 1
stroke.color = [1,1,1] # defaults to [0,0,0]
stroke.opacity = 1 # defaults to 1
x = 100
y = 360
scale = 1
rotation = 0 # defaults to 0, use degrees
parent = "name" # defaults to "stage"
replace = true # defaults to false, will replace object with same name on stage when created
~~~

### Shapes

Shapes have additional expected properties

#### Circle
~~~toml
shape = "circle"
radius = 10
~~~

#### Ellipse
~~~toml
shape = "ellipse"
radiusX = 10
radiusY = 10
~~~

#### Rect
~~~toml
shape = "rect"
width = 10
height = 10
~~~

#### Rounded Rect
~~~toml
shape = "rounded_rect"
width = 10
height = 10
radius = 10
~~~

#### Star
~~~toml
shape = "star"
radius = 100
innerRadius = 50
points = 5
~~~

#### Line

Lines have options for making, use stroke property to change color

~~~toml
shape = "line"
start = [0, 100]
end = [0, 200]

# or

shape = "line"
start = [0, 100]
points = [10, 10]
end = [0, 200]

# or

shape = "line"
points = [0, 100, 10, 10, 0, 200]
~~~

#### Font
~~~toml
shape = "font"
text = "This is text." # defaults "Hello World!"

# optional:
font_face = "Arial" # defaults Arial
font_size = 12 # defaults to 12
~~~

## Object Cues

Cues are an array of objects describing each timed action. Must have double square braces. Name must match object name. Cues will automatically start when executed and automatically delete the object when completed. Before the declaration block below, each sequetial declaration block adds another animation to the array

Declaration
~~~toml
[[name.cues]]
~~~

What Properties, any number of these can be set to animation when the cue runs
~~~toml
what.x = 0
what.y = 0
what.rotation = 0
what.color = [0,0,0]
what.stroke_color = [0,0,0]
what.opactiy = 1
~~~

Optional Properties
~~~toml
duration = 1 # time in seconds
delay = 0 #t time in seconds
ease = "linear" # default is "linear"
repeat = 3 # default is 0, forever is -1
keep = true #default false, To not delete the object after completion set
~~~

Example
~~~toml
# one object, one property animation
[[name.cues]]
what.x = 100

# one object, two property animations in parallel
[[name.cues]]
what.x = 100
what.rotation = 90

# one object, two property animations in sequence
[[name.cues]]
what.x = 100
[[name.cues]]
what.rotation = 90

# one object, one property animation with two steps in sequence
[[name.cues]]
what.x = 100
[[name.cues]]
what.x = 10

~~~


## Special Notes

### Color

~~~toml
color = 0 # set greyscale
color = [1,1,1] # set red, green, blue
color.r = 1 # set red only
~~~

### Random

longform
~~~toml
color.random = 1 # set random greyscale from 0 to this max
color.random = [0.5, 1] # set random greyscale from 0.5 to 1
color.random = [[0.5, 1], [0.5, 1], [0.5, 1]] # set random red, green, blue from 0.5 to 1
color.r.random = 1 # set random red only from 0 to this max
color.r.random = [0.5, 1] # set random red only from 0.5 to 1
~~~

shortform, basically drop the .random
~~~toml
color = [0, 1] # set random greyscale from 0 to 1
color = [[0.5, 1], [0.5, 1], [0.5, 1]] # set random red, green, blue from 0.5 to 1
color = [[0.5, 1], 1, 1] # set random red only from 0.5 to 1
color.r = [0.5, 1] # set random red only from 0.5 to 1
~~~


<!-- ### Eval

~~~toml
color.eval = "function(){}"
~~~ -->


# install
install node.js

npm install --omit=dev

# tidal server
in ghciSuperDirt
	edit oAddress for remote_target
	edit oAddress for local_target
~~~ c
npm run tidal
~~~

# firepad server
in fireDB/firebase.json 
	edit ip and port
~~~ c
> npm run firebase
~~~

# webserver
~~~ c
> npm run webserver
~~~

# start
open http://192.168.0.2:8000

## network connection settings
username - whatever
Sith Temple Address - ws://192.168.0.2:1234
Tidal Address - ws://localhost:9000
TD Address - depends... ws://192.168.0.4:9980
