// Collect all image elements on the page

function isValidURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
  return pattern.test(str);
}

function getAbsPath(href) {
  var link = document.createElement("a");
  link.href = href;
  return link.href;
  // return (link.protocol+"//"+link.host+link.pathname+link.search+link.hash);
}

$(document).ready(function() {
  var img_elements = $('img');
  var replaced_elems = {};
  var img_srcs = [];

  for (img of img_elements) {
    var url = getAbsPath(img.src);
    if (isValidURL(url)) {
      // TODO: Loading animation
      var width = img.clientWidth;
      var height = img.clientHeight;
      img.src = "http://via.placeholder.com/" + width + "x" + height;

      replaced_elems[url] = img;
      img_srcs.push({
        url: url,
        size: width * height
      });
    }
  }

  img_srcs.sort(function(a, b) {
    return a["size"] - b["size"];
  });

  var img_srcs = img_srcs.map(function(img_src) {
    return img_src["url"]
  });

  // grab chrome storage filters
  chrome.storage.local.get({
    fears: []
  }, function(items) {
    // Moderate server load to 10 images per second, starting with the largest images
    for (var i = 0; i < img_srcs.length; i += 9) {
      next_srcs = img_srcs.slice(i, i + 9);
      var json = {
        spooks: items.fears,
        urls: next_srcs
      };
      setTimeout(function() {
        $.ajax("https://sp00k-server.herokuapp.com/api", {
          data: JSON.stringify(json),
          contentType: 'application/json',
          type: 'POST',
          success: function(result) {
            for (data of result["data"]) {
              var url = data["url"];
              var isScary = data["scary"];
              console.log(url + " is scary? " + isScary);

              if (!isScary) {
                console.log(replaced_elems);
                replaced_elems[url].src = url;
              }
            }
          }
        });
      }, i * 1000);
    }
  });
});
