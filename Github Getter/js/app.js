//
// Revealing module pattern - https://carldanley.com/js-revealing-module-pattern/
//
var githubSearchRepo = githubSearchRepo || {};

githubSearchRepo = (function($) {
  'use strict';

  function init() {
    bindInput();
  }

  function bindInput() {
    var $input = $("#search");

    // Limit Requisitions
    var searchDelay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    // Set Focus to input
    $input.focus();

    // When keydown, initiate search
    $input.on('keydown', function(e) {
      searchDelay(function(){

        // Set search string
        var searchString = $input.val();

        // The search string must be at least 3 characters
        if(searchString.length >= 3){
          searchRepo(searchString);
        };
        return false;
      }, 1000 );
    });
  }

  function searchRepo(searchString) {
    var $containerResults = $("#results-container");
    var actualSearch      = JSON.parse(localStorage.getItem(searchString));

    if(actualSearch) {
      removeRepositoryList();
      implementRepositoryList(actualSearch['repositories']);
    } else {
      var request = $.ajax({
        url: "https://api.github.com/legacy/repos/search/"+encodeURI(searchString),
        dataType: "json",
        beforeSend: function () {
          $containerResults.addClass('gg-loading');
          removeRepositoryList();
        }
      });

      request.done( function(result) {

        var checkResult = $.isEmptyObject(result['repositories']);

        if(checkResult) {
          $("#results-container p").remove();
          $("#results-container").append("<p>Your search did not match any results.</p>");
          $containerResults.removeClass('gg-loading');
          $containerResults.addClass('gg-has-result');
        } else {
          $("#results-container p").remove();
          // Put the object into storage
          localStorage.setItem(searchString, JSON.stringify(result));

          $containerResults.removeClass('gg-loading');
          implementRepositoryList(result['repositories']);
        }
      });
    }
  }

  function removeRepositoryList(){
    $("#results-container ul").html("");
  }

  function implementRepositoryList(result) {
    var $containerResults = $("#results-container");
    $containerResults.addClass('gg-has-result');

    $.each(result, function() {
      var repositoryTemplate = "<li><a href='#'>"+this.name+" <span>by: <strong>"+this.owner+"</strong><span></a></li>"
      $("ul", $containerResults).append(repositoryTemplate);
    });

    bindListRepository(result);
  }

  function bindListRepository(result) {
    var $containerResults = $("#results-container ul");
    $("#results-container li a").off('click');
    $("li a",$containerResults).on('click', function (e) {
      e.preventDefault();
      var parentIndex = $(this).parent("li").index();
      implementRepositoryView(result[parentIndex]);
    });
  }

  function implementRepositoryView(repository) {
    var modalTemplate = "<a href='#' class='gg-modal-close'>close</a><h1>"+repository['name']+" <small>Language: "+repository['language']+" / Followers: "+repository['followers']+"</small></h1>"
                      + "<div class='gg-description'>"+repository['description']+"</div>"
                      + "<label data-prefix='URL:'><input type='text' value='"+repository['url']+"' readonly></label>"

    $(".gg-modal").html(modalTemplate).removeClass("gg-modal-closed");
    bindClose();
  }

  function bindClose() {
    $(".gg-modal-close").off('click');
    $(document).off('keyup');

    $(".gg-modal-close").on('click', function (e) {
      e.preventDefault();
      $(this).parent('.gg-modal').addClass("gg-modal-closed");
    });

    $(document).keyup(function(e) {
      if (e.keyCode == 27) { // esc keycode
        $(".gg-modal-close").parent('.gg-modal').addClass("gg-modal-closed");
      }
    });
  }

  return {
    init: init
  };

}(jQuery));

$(document).ready( function() {
  githubSearchRepo.init();
});