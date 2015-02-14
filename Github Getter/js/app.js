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
    var searchDelay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    $input.focus();
    $input.on('keyup', function(e) {

      searchDelay(function(){
        // Set search string
        var searchString = $input.val();
        // if(searchString.length >= 3){
        //   searchRepo(searchString);
        // };
        // return false;
        console.log(searchString)
      }, 1000 );
    });
  }

  function searchRepo(searchString) {
    var request = $.ajax({
      url: "https://api.github.com/search/repositories?q="+searchString,
      // url: "http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&alt=json",
      cache: true,
      dataType: "jsonp",
      ifModified: true
    });

    request.done( function(data) {
      console.log('teste')
      updateTotalCount(data.total_count);
    });
  }

  function updateTotalCount(totalCount) {
    var $containerResults = $("#results-container");

    totalCount = totalCount > 1 ? totalCount+" results" : totalCount+" result";

    if($containerResults.hasClass('gg-has-result')) {
      $containerResults.find("p").html("<p>Your search found <strong>"+totalCount+"</strong>.</p>");
    } else {
      $containerResults.addClass('gg-has-result').append("<p>Your search found <strong>"+totalCount+"</strong>.</p>");
    }
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