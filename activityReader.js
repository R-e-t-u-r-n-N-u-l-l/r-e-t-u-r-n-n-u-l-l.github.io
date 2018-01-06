function loadContent() {
  displayContent(getActivityByTags());
}

function getActivityByTags() {
  var tagValues = [];
  var results   = [];
  var tagNodes  = document.querySelectorAll('.custom_checkbox[active=true] > .checkmark');
  for(var tag of tagNodes)
    tagValues.push(tag.innerHTML.split(tag.innerHTML.slice(tag.innerHTML.indexOf('<span')))[0].toLowerCase());

  if(tagValues[0] == "video") {
    results = getActivity(["video"]);
    tagValues.splice(0, 1);
  } else
    results = JSON.parse(JSON.stringify(activityFeed)).content;

  for(var i = results.length - 1; i >= 0; i--) {
    var a = results[i];
    for(var tag of tagValues) {
      if(a.tags.indexOf(tag) != -1)
        continue;
        results.splice(i, 1);
    }
  }

  return results;
}

function displayContent(activity) {
  var container = document.getElementById("content_container");
  container.innerHTML = "";
  for(var a of activity)
    container.innerHTML += "<div class=content><p><a href=javascript:void(0) onclick=\"window.open('" + a.url + "', '_blank')\">" + a.title + "</a><br /><br />" + a.desc + "<br /> Date: " + a.date + "</p><a href=javascript:void(0) onclick=\"window.open('" + a.url + "', '_blank')\"><img alt='Image not available' src=" + a.img + "></a></div>";
}

function search() {
  displayContent(getSearchActivity());
}

function getSearchActivity() {
  var activity = getActivityByTags();
  var keywords = document.getElementById("searchbar").value.toLowerCase().split(" ");

  if(keywords != undefined && keywords.length > 0) {
    for(var i = activity.length - 1; i >= 0; i--) {
      var a = activity[i];
      var title = a.title.toLowerCase().split(" ");
      var desc  = a.desc.toLowerCase().split(" ");
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

function getActivity(tags) {
  var activity = JSON.parse(JSON.stringify(activityFeed)).content;

  if(tags != undefined && tags[0] != undefined && tags.length > 0) {
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
