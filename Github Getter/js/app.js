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

    // When keyup, initiate search
    $input.on('keypress', function(e) {
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
        url: "https://api.github.com/legacy/repos/search/"+searchString,
        dataType: "json",
        beforeSend: function () {
          $containerResults.addClass('gg-loading');
          removeRepositoryList();
        }
      });

      request.done( function(result) {
        // Put the object into storage
        localStorage.setItem(searchString, JSON.stringify(result));

        $containerResults.removeClass('gg-loading');
        implementRepositoryList(result['repositories']);
      });
    }
  }

  function removeRepositoryList(){
    var $containerResults = $("#results-container ul").html("");
  }

  function implementRepositoryList(result) {
    var $containerResults = $("#results-container");
    $containerResults.addClass('gg-has-result')

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

/*
    # Endpoint URL #

    https://api.github.com/legacy/repos/search/{query}

    Note: Github imposes a rate limit of 60 request per minute. Documentation can be found at http://developer.github.com/v3/.

    # Example Response JSON #

    {
      "meta": {...},
      "data": {
        "repositories": [
          {
            "type": string,
            "watchers": number,
            "followers": number,
            "username": string,
            "owner": string,
            "created": string,
            "created_at": string,
            "pushed_at": string,
            "description": string,
            "forks": number,
            "pushed": string,
            "fork": boolean,
            "size": number,
            "name": string,
            "private": boolean,
            "language": number
          },
          {...},
          {...}
        ]
      }
    }
*/