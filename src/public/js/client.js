"use strict";

var answers = [];
var count;

var socket = io.connect('http://localhost:3000');
socket.on('connect', function() {
    socket.on('QuizQuestions', function(obj) {
        count = obj.count;
        $("#quizQuestionsArea").html("");
        for (let index = 0; index < obj.questions.length; index++) {
            $("#quizQuestionsArea").append(`
            <div class="card">
  <h4 class="card-header"><span style="margin-right: 7px" class="badge badge-primary">${index + 1} </span> <strong>${obj.questions[index].Question}</strong></h4>
  <div class="card-body">
    <p class="card-text">
		<div class="col-sm-10">
    <div class="form-check">
      <input onclick="Selected('${obj.questions[index]._id}' , '${obj.questions[index].Option1}')" class="form-check-input" type="radio" name="gridRadios${obj.questions[index]._id}" id="gridRadios1${obj.questions[index]._id}" >
      <label class="form-check-label" for="gridRadios1">
        ${obj.questions[index].Option1}
      </label>
    </div>
    <div class="form-check">
      <input onclick="Selected('${obj.questions[index]._id}' , '${obj.questions[index].Option2}')" class="form-check-input" type="radio" name="gridRadios${obj.questions[index]._id}" id="gridRadios2${obj.questions[index]._id}" >
      <label class="form-check-label" for="gridRadios2">
      ${obj.questions[index].Option2}
      </label>
    </div>
    <div class="form-check">
      <input  onclick="Selected('${obj.questions[index]._id}' , '${obj.questions[index].Option3}')" class="form-check-input" type="radio" name="gridRadios${obj.questions[index]._id}" id="gridRadios3${obj.questions[index]._id}" >
      <label class="form-check-label" for="gridRadios3">
      ${obj.questions[index].Option3}
      </label>
    </div>
    <div class="form-check">
      <input  onclick="Selected('${obj.questions[index]._id}' , '${obj.questions[index].Option4}')" class="form-check-input" type="radio" name="gridRadios${obj.questions[index]._id}" id="gridRadios3${obj.questions[index]._id}" >
      <label class="form-check-label" for="gridRadios3">
      ${obj.questions[index].Option4}
      </label>
    </div>
</div>
	</p>
  </div>
</div><br/>
        `)

        }
        $("#quizQuestionsArea").append(`<br><button onclick="SubmitClicked()" id="questSub" type="button" style="margin-bottom: 20px" class="btn btn-success btn-block">Submit</button>`);
        $("#timer").html("");
        $.unblockUI();
        $('#timer').countdown('destroy');
        $("#timer").countdown({ until: '+2m', compact: true, onExpiry: SubmitClicked, format: 'M:S' });
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

    socket.on("EndQuiz", function() {
        $('#timer').countdown('destroy');
        $.unblockUI({ message: '<h2>QUIZ COMPLETED. Please Wait...</h2>', css: { backgroundColor: '#f00', color: '#fff' } });
    });

    socket.on("TimerUpEndQuiz", function() {
        $('#timer').countdown('destroy');
        $.unblockUI({ message: '<h2>TIME UP!</h2>', css: { backgroundColor: '#f00', color: '#fff' } });
    });
});

function SubmitClicked() {
    $("#questSub").prop('disabled', true);
    $("#questSub").removeClass("btn btn-success btn-lg");
    $("#questSub").addClass("btn btn-danger btn-lg");
    $("#questSub").text("Please Wait..");
    $.blockUI({ message: '<h2>Submitting...</h2>', css: { backgroundColor: '#f00', color: '#fff' } });
    var contestantName = getParameterByName("name");
    socket.emit("QuizSubmission", { answers: answers, name: contestantName, count: count });

}

function Selected(id, chosen) {
    var selection = {
        "QuestionId": id,
        "SelectedAnswer": chosen
    };
    var index = answers.findIndex(x => x.QuestionId === id);
    if (index === -1) {
        answers.push(selection);
    } else {
        answers.splice(index, 1);
        answers.push(selection);
    }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$("#enterQuiz").click(function(e) {
    $(this).prop('disabled', true);
    e.preventDefault();
    var contestantName = $('#constestantName').val();
    if (contestantName == "" || contestantName == undefined || contestantName == null) {
        alert("Please enter your name to continue");
    } else {
        socket.emit('addUser', { name: contestantName });
        window.open(`/quizhome?name=${contestantName}`, "_self");
    }

});