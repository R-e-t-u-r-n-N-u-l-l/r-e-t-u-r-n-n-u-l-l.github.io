function readActivity(index) {
  var activity = JSON.parse(JSON.stringify(activityFeed));
  return activity;
}
console.log(readActivity());
