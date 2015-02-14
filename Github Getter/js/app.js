//
// Revealing module pattern - https://carldanley.com/js-revealing-module-pattern/
//
var githubSearchRepo = githubSearchRepo || {};

githubSearchRepo = (function($) {
  'use strict';

  function init() {
    bindInput();
    searchRepo();
  }

  function bindInput() {
    $("#search").focus();
  }

  function searchRepo() {
    $.ajax({
      url: "https://api.github.com/search/repositories?q=wylkon",
      context: document.body
    }).done(function(data) {
      updateTotalCount(data.total_count);
    });
  }

  function updateTotalCount(totalCount) {
    totalCount = totalCount > 1 ? totalCount+" results" : totalCount+" result";
    $("#results-container").addClass('gg-has-result').append("<p>Your search found <strong>"+totalCount+"</strong>.</p>");
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