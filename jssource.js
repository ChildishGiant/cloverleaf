var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
var autoCompleteData = {};
var jsonData = {};

window.onload=function(){
  new Clipboard('#copy');

  $("input").on('keyup', function (e) {
      if (e.keyCode == 13) {
          $("#submit").click();
      };
  });
};

function process(){
  var appName = $("#app").val();
  var masterPass = $("#pass").val();
  var length = Math.trunc($("#length").val());
  var result = ""; //Has to be here, not in the loop for scope purposes

  if (appName && masterPass && length){ //If all the inputs have something in them.


    Math.seedrandom(appName.toLowerCase()+masterPass);


    if (jsonData[appName]){//If it's a site with a preset
      if (jsonData[appName]["chars"]){
        chars = jsonData[appName]["chars"];
      }
      if (jsonData[appName]["regex"]){
        regex = jsonData[appName]["regex"];
      }else{
        regex = ".+"//default regex
      };
    };

    var pattern = new RegExp(regex);
    
    if (length<jsonData[appName]["minLength"]){
      $("#length").addClass("invalid");
    } else {
      $("#length").removeClass("invalid");

      while (true){
        result = "";
        while (result.length < length ) {
          result += chars[Math.floor(Math.random() * chars.length)];
        };
        if (pattern.test(result)){
          break;
        }
      };

      $("#result").text(result);

      $("#copy").css('display', 'block');
      $("#result").css('display', 'block');

      $("input").each(function() {
          $(this).removeClass("invalid");
      });
    }} else{

      $("input:not(#length)").each(function() {
        if ($(this).val() == ""){
          $(this).addClass("invalid");
        }else{
          $(this).removeClass("invalid");
        };
      });
    };

    };


$(function() {
  $("#length").bind("mousewheel", function(event, delta) {
      if (delta > 0) {
          this.value = parseInt(this.value) + 1;
      } else {
          if (parseInt(this.value) > 4) {
              this.value = parseInt(this.value) - 1;
          }
      }
      return false;
   });

  //Process the sites.json for the autocomplete structure
  $.getJSON("data/sites.json", function(json) {

    jsonData = json;

    $.each(json, function(i, val){
      autoCompleteData[i] = val.logo;
    });

    //Setup possible autocomplete sites
    $('input#app').autocomplete({
      data: autoCompleteData,
      limit: 3,
      onAutocomplete: function(val) {



        var length = 16;
        var max = json[val]["maxLength"];

        if (!max){
          max = 128;
        };

        if (!(json[val]["minLength"] <= 16 <= max)){
          length = json[val]["maxLength"];
        };

        $("#length").val(length);
      },
      minLength: 0,
    });
  });
});
