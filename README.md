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
world.play = true
world.play_pause = true
~~~

functions
~~~toml
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
shape = "square" #refer to shapes section
~~~

properties optional
~~~toml
number = 1 # defaults to 1
color = [1,1,1] # defaults to [0,0,0]
opacity = 1 # defaults to 1
stroke.width = 1 # defaults to 1
stroke.color = [1,1,1] # defaults to [0,0,0]
stroke.opacity = 1 # defaults to 1
x = 100 # defaults to 640
y = 360 # defaults to 360
rotation = 0 # defaults to 0, use degrees
parent = "name" # defaults to "stage"
replace = true # defaults to false
~~~

### Shapes

lists additional expected properties

#### Rect

~~~toml
shape = "rect"
width = 10 # defaults to 10
height = 10 #defaults to 10
~~~

#### Circle

~~~toml
shape = "circle"
radius = 10 # defaults to 10
~~~

#### Line

We should decide the behavior of lines. Currently x and y are first point on line. Points array are a list of points for drawing the line

~~~toml
shape = "line"
points = [10, 10] # no default, list of points required
stroke.width = 1 # width required
stroke.color = [0, 0, 0] # color required
~~~

#### Text

~~~toml
shape = "text"
font_face = "Arial" # defaults Arial
font_size = 12 # defaults to 12
text = "Hello World!" # defaults "Hello World!"
~~~

## Object Cues

Cues are an array of objects describing each timed action. Must have double square braces. Name must match object name. Cues will automatically start when executed and automatically delete the object when completed. 

To not delete the object after completion set
~~~toml
keep = true #default false
~~~
before the declaration block below, each sequetial declaration block adds another animation to the array


Declaration
~~~toml
[[name.cues]]
~~~

Required Properties
~~~toml
duration = 1 # time in seconds
delay = 0 #t time in seconds
~~~

Optional Properties
~~~toml
ease = "linear" # default is "linear"
repeat = true # default is false
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


### Eval

~~~toml
color.eval = "function(){}"
~~~


