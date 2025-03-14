var firepad = null
var messages = null

function createFirepad(){

  // if ('sith_temple' === who){
    localStorage.username = $('#who_is_this').val()
    localStorage.wsserver = $('#sith_temple').val()
    // localStorage.email = $('#the_email').val()
    // localStorage.pass = $('#the_pass').val()
    var config = {
      // apiKey: '',
      // autoDomain: '',
      databaseURL: localStorage.wsserver
    }

    if (firebase !== null) {
      firebase.initializeApp(config)
    }

    // firebase.auth().signInWithEmailAndPassword(localStorage.email, localStorage.pass)
    // .then((userCredential) => {
    //   // Signed in
    //   var user = userCredential.user;
    //   // ...
    // })
    // .catch((error) => {
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    // });
    window.location.hash = ''
    window.location = window.location + '#sith-temple'

    // var rootRef = firebase.database().ref()
    // var firepadRef = rootRef.child('NotationPlayer')
    var firepadRef = getExampleRef()

    //for reconnecting, ACE editor needs to be empty
    if (editor !== null) {
        editor.setValue("", 0)
    }

    firepad = Firepad.fromACE(
      firepadRef,
      editor,
      {
        userId: localStorage.username,
        defaultText: ''
      }
    );

    messages = firebase.database().ref('messages/')

    messages.on('child_added', function(data) {
      //if messages not by us
      if (data.val().author !== localStorage.username) {
        // record other user code executions
        editor.livewriting('record', data.val().range, data.val().exec, data.val().language)
        // run other user code executions
        editor.runCode(data.val().range, data.val().exec, data.val().language)
        // delete the message
        messages.child(data.key).remove()
      }
    })

  // }

} // end create

function post_message(msg) {
  var l = feedback.session.getLength()
  feedback.session.insert({
    row: l,
    column: 0
  }, msg + '\n')
  if (l > 400) {
    feedback.session.removeLines(0, 200)
  }
  feedback.scrollToLine(l, false, true, function () {})
  feedback.session.selection.clearSelection()
}

// Helper to get hash from end of URL or generate a random one.
function getExampleRef() {
    var ref = firebase.database().ref()
    var hash = window.location.hash.replace(/#/g, '')
    if (hash) {
        ref = ref.child(hash)
    } else {
        ref = ref.push() // generate unique location.
        window.location = window.location + '#' + ref.key // add it as a hash to the URL.
    }
    if (typeof console !== 'undefined') {
        console.log('Firebase data: ', ref.toString())
    }
    return ref
}

