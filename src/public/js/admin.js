"use strict"

var socket = io.connect('http://localhost:3000');
var connected = false;
var minutes;

socket.on('connect', function() {
    socket.on('activeContestants', function(obj) {
        $("#actConstests").append(`
        <div class="user-progress justify-center">
        <div class="col-sm-3 col-md-2 col-xl-1" style="padding: 0;">
            <img src="/img/teksmartest.jpeg" alt="profile photo" class="circle profile-photo" style="width: 100%; max-width: 100px;">
        </div>

        <div class="col-sm-6 col-md-8 col-xl-10">
            <h6 class="pt-1">${obj.name}</h6>

        </div>

    </div>
        `)
    });

    socket.on('QuizStarted', function() {
        $("#timer").countdown({ until: `+${minutes}m`, compact: true, onExpiry: EndQuiz, format: 'M:S' });
        $.blockUI({ message: '<h2>Quiz in Progress</h2>', css: { backgroundColor: '#f00', color: '#fff' } });
    })
});

function EndQuiz() {
    socket.emit('EndQuizForAll');
    $.unblockUI();
}

$("#beginShow").click(function() {
    minutes = prompt("How long should the quiz run for?");
    if (minutes) {
        $(this).prop('disabled', true);
        socket.emit('StartQuiz');
    }

});

$(".deletebutton").click(function() {
    var id = $(this).attr("data-id");
    var ans = confirm("Delete Question?");
    if (ans) {
        window.open(`/admin/deletequestion/${id}`, "_self");
    }
});

$(".editbutton").click(function() {
    var id = $(this).attr("data-id");
    window.open(`/admin/editquestion/${id}`, "_self");
});