var debugging = false

$(document)
    .ready(function() {
        var ctrlDown = false,
            ctrlKey = 17,
            cmdKey = 91;

        $('#selectFontSize')
            .selectmenu({
                width: 'auto',
                position: { collision: 'flip' }
            })
            .on('selectmenuchange', function(event, data) {
                editor.setOptions({
                    fontSize: data.item.value + 'pt'
                })
                this.blur()
                editor.focus()
            })

        $('#autoComplete')
            .button()
            .bind('change', function(event) {
                editor.setOptions({
                    enableLiveAutocompletion: !editor.getOptions().enableLiveAutocompletion
                })
                this.blur()
                editor.focus()
            })

        $('#debug')
            .button()
            .bind('change', function(event) {
                this.blur()
                editor.focus()
            })

        $('#network')
            .button()
            .click(function(event) {
                $('#networkPanel').dialog('open')
            })

        $('#set_AMN')
            .button()
            .click(function(event) {
                createFirepad()
            })

        $('#disconnect_to_firebase')
            .button()
            .click(function(event) {
                if (firepad !== null) {
                    firepad.dispose()
                }
                firebase.auth().signOut().then(function() {
                    // Sign-out successful.
                }).catch(function(error) {
                    // An error happened.
                });
            })


        $('#networkPanel')
            .dialog({
                autoOpen: false,
                maxHeight: 400,
                minWidth: 520,
                show: {
                    effect: 'clip',
                    duration: 250
                },
                hide: {
                    effect: 'clip',
                    duration: 250
                }
            })

        $('#openFile')
            .button()
            .click(function(event) { // to hide the other file button interface from users
                $('#myFile').trigger('click')
            })

        $('#myFile')
            .change(function(event) {
                openFile(event, "live")
            })


        $('#openDoc')
            .button()
            .click(function(event) { // to hide the other file button interface from users
                $('#myFile').trigger('click')
            })
            
        $('#edFile')
            .change(function(event) {
                openFile(event, "editor")
            })

        $('#saveFile')
            .button()
            .click(function(event) {
                editor.livewriting('save', editor.livewriting('returnactiondata'))
            })

        $("#myFullScreen")
            .button()
            .bind("change", function(event)
            {
                if(!window.screenTop && !window.screenY)
                {
                    if (document.exitFullscreen)
                        document.exitFullscreen();
                    else if (document.mozCancelFullScreen)
                       document.mozCancelFullScreen();
                    else if (document.webkitExitFullscreen)
                       document.webkitExitFullscreen();
                } else {
                    if (document.body.requestFullScreen)
                        document.body.requestFullScreen();
                    else if (document.body.mozRequestFullScreen)
                        document.body.mozRequestFullScreen();
                    else if (document.body.webkitRequestFullScreen)
                        document.body.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                }
                editor.focus()
            });

        $('#playback')
            .button()
            .click(function(event) {
                $('.livewriting_navbar').dialog('open')
            })

        $('.livewriting_navbar')
            .dialog({
                autoOpen: false,
                maxHeight: 400,
                minWidth: 800,
                show: {
                    effect: 'clip',
                    duration: 250
                },
                hide: {
                    effect: 'clip',
                    duration: 250
                }
                // ,
                // beforeClose: function (event, ui) {
                //   $(this).parent().css('visibility', 'hidden')
                //   event.preventDefault()
                //   return false
                // }
            })

        //remember some settings
        if (typeof(Storage) !== "undefined") {
            if ( typeof(localStorage.username) !== "undefined"){
                $('#who_is_this').val(localStorage.username)
            }else{
                localStorage.username = $('#who_is_this').val()
            }
            if ( typeof(localStorage.wsserver) !== "undefined"){
                $('#AMN_DB').val(localStorage.wsserver)
            }else{
                localStorage.wsserver = $('#AMN_DB').val()
            }
        }

        editor.focus()
        
    
        $(document).keydown(function(e) {
             if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = true;
        }) // end document keydown
        $(document).keyup(function(e) {
            if (e.keyCode == ctrlKey || e.keyCode == cmdKey) ctrlDown = false;
        })
        $(document).keydown(function(e) {
            // console.log(e.keyCode)
            if (ctrlDown && (e.keyCode == 72)) {
                if ($("#editor").is(":hidden")) {
                    $("#editor").show()
                    $("#feedback").show()
                    $("#footer").show()
                } else {
                  $("#editor").hide()
                  $("#feedback").hide()
                  $("#footer").hide()
          f      }
            }
            // e.stopPropagation()
            // e.preventDefault()
        }) // end document catch 'h'
        $(document).on('dragenter', function(event) {
            event.stopPropagation()
            event.preventDefault()
        })
        $(document).on('dragover', function(event) {
            event.stopPropagation()
            event.preventDefault()
        })
        $(document).on('drop', function(event) {
            event.stopPropagation()
            event.preventDefault()
        })

        //  $('#firebase_user').val(localStorage.firebase_user)
        // $('#firebase_pass').val(localStorage.firebase_pass)
    }) // end document ready

function openFile(event, who) {
    var file
    if (event.target.files) {
        file = event.target.files
    } else {
        file = event.dataTransfer.files
    }

    var f
    var numFiles = file.length
    for (var i = 0; f = file[i]; i++) {
        // if (f.name.slice(-4) === '.txt') {
        var reader = new FileReader()

        reader.onload = (function(theFile) {
            return function(e) {
                 if (who === "live") {
                    editor.livewriting('playJson', reader.result)
                } else if (who === "editor") {
                    editor.setValue(reader.result, -1)
                    editor.focus()
                }
            }
        })(f)

        reader.readAsText(f, 'text/plain;charset=utf-8')
        // }
    }
}
