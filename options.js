function build_tag(fearDescription) {
  // TODO: Convert to Handlebars
  var cancel = $('<span class="cancel"><i class="fa fa-times-circle"></span>');
  cancel.click(closeTag);
  return $('<li class="tag">' + fearDescription + '</li>').append(cancel);
}

function update_fear(fearDescription, isRemove = false) {
  chrome.storage.local.get({
    fears: []
  }, function(items) {
    var fears = items.fears;
    var fearsIndex = fears.indexOf(fearDescription)
    if (!isRemove && fearsIndex == -1) {
      fears.push(fearDescription);
    } else if (isRemove && fearsIndex != -1) {
      fears.splice(fearsIndex, 1);
    } else {
      $('input').val('');
      return;
    }
    chrome.storage.local.set({
      fears: fears
    }, function() {
      refresh(fears);
      $('input').val('');
    });
  });
}

function refresh(fears) {
  $('ul#tags').empty();
  for (fear of fears) {
    $('ul#tags').append(build_tag(fear));
  }
}

function restore_fears() {
  chrome.storage.local.get({
    fears: []
  }, function(items) {
    var fears = items.fears;
    refresh(fears);
  });
}

$(document).ready(function() {
  restore_fears();
});

function closeTag(event) {
  update_fear($(this).parent().text(), true)
  $(this).parent().fadeOut();
}

$("input").keyup(function(e) {
  if (e.keyCode == 13) {
    var fearDescription = $(this).val();
    update_fear(fearDescription);
  }
});
