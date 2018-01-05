function search() {
  var string = document.getElementById("searchbar").value;

  searchActivity(string.split(" "));
}

function getActivity(tags) {
  var activity = JSON.parse(JSON.stringify(activityFeed)).content.reverse();

  if(tags != undefined && tags.length > 0) {
    for(var i = activity.length - 1; i >= 0; i--) {
      var a = activity[i];
      for(var t of tags) {
        if(a.tags.indexOf(t) == -1)
          activity.splice(activity.indexOf(a), 1);
      }
    }
  }

  return activity;
}

function searchActivity(keywords) {
  var activity = JSON.parse(JSON.stringify(activityFeed)).content.reverse();

  if(keywords != undefined && keywords.length > 0) {
    for(var i = activity.length - 1; i >= 0; i--) {
      var a = activity[i];
      var title = a.title.split(" ");
      var desc  = a.desc.split(" ");
      for(var k of keywords) {
        if(!contains(k, title) && !contains(k, desc))
          activity.splice(i, 1);
      }
    }
  }

  return activity;
}

function contains(part, array) {
  for(var a of array) {
    var string = "";
    for(var b of a) {
      string += b;
      if(string == part)
        return true;
    }
  }

  return false;
}
