function loadContent(status) {
  getActivityByTags();
  displayContent(getActivity([status]));
}

function getActivityByTags() {
  var tagValues = [];
  var results   = [];
  var tagNodes  = document.querySelectorAll('.custom_checkbox[active=true] > .checkmark');
  for(var tag of tagNodes)
    tagValues.push(tag.innerHTML.split(tag.innerHTML.slice(tag.innerHTML.indexOf('<span')))[0]);

  var activity = JSON.parse(JSON.stringify(activityFeed)).content;

  for(var i = activity.length - 1; i >= 0; i--) {
    var a = activity[i];
    for(var tag of tagValues) {
      if(a.tags.indexOf(tag) != -1)
        results.push(a);
    }
  }
  console.log(results);
  displayContent(results)
}

function displayContent(activity) {
  var container = document.getElementById("content_container");
  container.innerHTML = "";
  for(var a of activity)
    container.innerHTML += "<div onclick=\"window.location=\'" + a.url + "\'\" class=content><p>" + a.title + "<br /><br />" + a.desc + "<br /> Date: " + a.date + "</p><img alt='Image not available' src=" + a.img + "></div>";
}

function search(status) {
  var string = document.getElementById("searchbar").value.toLowerCase();

  activity = getActivity([status]);

  displayContent(searchActivity(activity, string.split(" ")));
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

function searchActivity(activity, keywords) {
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
