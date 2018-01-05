function loadContent(status) {
  var activity;
  if(status == "video")
    activity = getActivity(["video"]);
  else
    activity = getActivity();

  displayContent(activity);
}

function displayContent(activity) {
  var container = document.getElementById("content_container");
  container.innerHTML = "";
  for(var a of activity)
    container.innerHTML += "<div class=content>" + a.title + a.desc + a.date + a.url + "</div>";
}

function search(status) {
  var string = document.getElementById("searchbar").value;

  var activity = getActivity([status]);
  displayContent(searchActivity(activity, string.split(" ")));
}

function getActivity(tags) {
  var activity = JSON.parse(JSON.stringify(activityFeed)).content.reverse();

  if(tags != undefined && tags.length > 0) {
    for(var i = activity.length - 1; i >= 0; i--) {
      var a = activity[i];
      for(var t of tags) {
        if(a.tags.indexOf(t) == -1)
          activity.splice(i, 1);
      }
    }
  }

  return activity;
}

function searchActivity(activity, keywords) {
  if(keywords != undefined && keywords.length > 0) {
    for(var i = activity.length - 1; i >= 0; i--) {
      var a = activity[i];
      var title = a.title.split(" ");
      var desc  = a.desc.split(" ");
      for(var k of keywords) {
        if(k == "")
          continue;
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
