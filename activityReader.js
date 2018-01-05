function getUpdates() {
  return getActivity();
}

function getActivity(tags) {
  var activity = JSON.parse(JSON.stringify(activityFeed)).content.reverse();

  if(tags != undefined && tags.length > 0) {
    loop1:
    for(var a of activity) {
      loop2:
      for(var t of tags) {
        if(a.tags.indexOf(t) == -1)
          activity.splice(activity.indexOf(a), 1);
      }
    }
  }

  return activity;
}
