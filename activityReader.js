function getUpdates() {
  return searchActivity(["algorithm"]);
}

function getActivity(tags) {
  var activity = JSON.parse(JSON.stringify(activityFeed)).content.reverse();

  if(tags != undefined && tags.length > 0) {
    for(var a of activity) {
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
    for(var a of activity) {
      var title = a.title.split(" ");
      var desc  = a.desc.split(" ");
      for(var k of keywords) {
        if(title.indexOf(k) == -1 && desc.indexOf(k) == -1)
          activity.splice(activity.indexOf(a), 1);
      }
    }
  }

  return activity;
}
