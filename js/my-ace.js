var mErrors = new Array()
var mExecs = new Array()
var mExecTimer = null
var mFeedback = false
var mCode = ''
var isWhiteSpace = /^\s*$/m


/// /////////////////////////////////
//  ACE launch
/// /////////////////////////////////

var Range = ace.require('ace/range').Range

var langTools = ace.require('ace/ext/language_tools')
langTools.setCompleters([langTools.snippetCompleter, langTools.keyWordCompleter])

var editor = ace.edit('editor')
editor.setTheme('ace/theme/kuroir')
editor.setKeyboardHandler('sublime')
editor.$blockScrolling = Infinity
editor.setOptions({
  showPrintMargin: false,
  animatedScroll: false,
  displayIndentGuides: false,
  useWorker: true,
  showLineNumbers: true,
  showGutter: true,
  tabSize: 4,
  useSoftTabs: false,
  fontSize: '14pt',
  selectionStyle: "text",
  highlightActiveLine: false,
  highlightGutterLine: true,
  enableBasicAutocompletion: true,
  enableSnippets: true,
  enableLiveAutocompletion: false
})

editor.session.setMode('ace/mode/toml')
editor.livewriting = livewriting
editor.livewriting('create', 'ace', {}, '')

editor.commands.addCommand({
  name: 'openFile',
  bindKey: {
    win: 'Ctrl-O',
    mac: 'Command-O'
  },
  exec: function() {
    $('#edFile').trigger('click')
  }
})

editor.commands.addCommand({
  name: 'playPause',
  bindKey: {
    win: 'Ctrl-p',
    mac: 'Command-p'
  },
  exec: function(editor) {
    code = editor.getValue()
    var newObjects = TOML.parse(code)
    app.load(newObjects)
  }
})

editor.commands.addCommand({
  name: 'execLine',
  bindKey: {
    win: 'Shift-Return',
    mac: 'Shift-Return'
  },
  exec: function() {
    if (messages !== null) {
        messages.push({
          author: user.name,
          exec: 'execLine',
          range: editor.session.selection.getRange(),
          backwards: editor.session.selection.isBackwards() + 0
        })
    }

    editor.runCode(editor.session.selection.getRange(),
                  'execLine')
  }
})

editor.commands.addCommand({
  name: 'execBlock',
  bindKey: {
    win: 'Ctrl-Return',
    mac: 'Command-Return'
  },
  exec: function() {
    if (messages !== null) {
      messages.push({
        author: user.name,
        exec: 'execBlock',
        range: editor.session.selection.getRange(),
        backwards: editor.session.selection.isBackwards() + 0
      })
    }

    editor.runCode(editor.session.selection.getRange(),
                  'execBlock')
  }
})

editor.commands.addCommand({
  name: 'replace',
  bindKey: {win: 'Ctrl-R', mac: 'Command-Option-F'},
  exec: function(editor) {
    ace.config.loadModule("ace/ext/searchbox", function(e) {e.Search(editor, true)});
  },
  readOnly: true
})

//called locally, from firebase remote, and livewriting playback
editor.runCode = function(theRange, execType) {
  var theCode = ''
  var sel = JSON.parse(JSON.stringify(theRange));
  var lastLine = editor.session.doc.getLength()

  //find start
  while (sel.start.row > 0) {
    // !/\S/.test(editor.lineTextForBufferRow(bufferRow)))
    var theLine = editor.session.doc.getLine(sel.start.row)
    if (null !== isWhiteSpace.exec(theLine)){
      sel.start.row += 1
      break
    }
    sel.start.row -= 1
  }

  //find end
  while (sel.end.row < lastLine) {
    var lineEnd = editor.session.doc.getLine(sel.end.row)

    if (null !== isWhiteSpace.exec(lineEnd) || "" === lineEnd) {
      sel.end.row -= 1
      var theLine = editor.session.doc.getLine(sel.end.row)
      sel.end.column = theLine.length
      break
    }
    sel.end.row += 1
  }

  var lines = editor.session.doc.getLines(sel.start.row, sel.end.row)
  theCode = lines.join(editor.session.doc.getNewLineCharacter())

  // line highlighting
  sel.clipRows = function() {
    var range
    range = Range.prototype.clipRows.apply(this, arguments)
    range.isEmpty = function() {
      return false
    }
    return range
  }

  var id = editor.session.addMarker(sel, 'execHighlight', 'text')
  mExecs.push(id)
  mExecTimer = setTimeout(clearExecHighLighting, 250)

  var newObjects = TOML.parse(theCode)
  app.load(newObjects)
   // mCode = theCode //needed for livewriting
}

//TODO:: this will need updating for TD errors and lines
function setLineErrors(result, lineOffset) {
  while (mErrors.length > 0) {
    var mark = mErrors.pop()
    editor.session.removeMarker(mark)
  }

  editor.session.clearAnnotations()

  var lines = result.match(/^.*((\r\n|\n|\r)|$)/gm)
  var tAnnotations = []
  if(lines[0] != 'noError') {

    for (var i = 0; i < lines.length; i++) { //start on second line
      var parts = lines[i].split(':')

      if (parts.length > 2) {
        var annotation = {}
        annotation.row = parseInt(parts[2]) - lineOffset
        annotation.text = parts[3]
        annotation.type = 'error'

        tAnnotations.push(annotation)
        var theLine = editor.session.doc.getLine(annotation.row)
        var id = editor.session.addMarker(new Range(annotation.row,
            0,
            annotation.row,
            theLine.length),
          'errorHighlight',
          'text',
          false)
        mErrors.push(id)
      }
    }

    editor.session.setAnnotations(tAnnotations)
  }

}

function clearExecHighLighting() {
  while (mExecs.length > 0) {
    var mark = mExecs.pop()
    editor.session.removeMarker(mark)
  }
}

/// /////////////////////////////////
//  Feedback View
/// /////////////////////////////////

var feedback = window.ace.edit('feedback')
feedback.setTheme('ace/theme/kuroir')
feedback.session.setUseWrapMode(true)
feedback.session.setUseWorker(true)
feedback.session.selection.clearSelection()
feedback.setDisplayIndentGuides(false)
feedback.setShowPrintMargin(false)
feedback.$blockScrolling = Infinity
feedback.setOptions({
  fontSize: '10pt',
  readOnly: true,
  highlightActiveLine: false,
  highlightGutterLine: false,
  highlightSelectedWord: false
})
feedback.renderer.$cursorLayer.element.style.opacity = 0
$('#feedback .ace_active-line').hide()
feedback.session.on('change', () => {
    feedback.renderer.scrollToLine(Number.POSITIVE_INFINITY)
})
