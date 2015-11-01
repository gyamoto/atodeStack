var command_open = "open:",
    command_save = "save:",
    command_delete = "delete:";

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  console.log('inputChanged: ' + text);

  var suggestion = function(storage) {
    console.log(storage);

    var stacks = storage.stacks;
    var suggests = [];
    stacks.forEach(function(stack) {
      if(isSuggest(text, stack)) {
        suggests.push(createOpenSuggest(stack));
        suggests.push(createDeleteSuggest(stack));
      }
    })
    suggest(suggests);
  }
  getStack(suggestion);
});

chrome.omnibox.onInputEntered.addListener(function(text) {
  console.log('inputEntered: ' + text);

  if(text.indexOf(command_open) != -1) {
    openStack(sliceUrl(text, command_open));
  } else if(text.indexOf(command_delete) != -1) {
    deleteStack(sliceUrl(text, command_delete));
  } else {
    saveStack(sliceUrl(text, command_save));
  }
});

function openStack(url) {
  var stack = createStack(url);
  chrome.tabs.create({url: stack.url});
}

function saveStack(url) {
  var save = function(storage) {
    console.log(storage);

    var stack = createStack(url);
    var index = indexOfStack(storage.stacks, stack);
    if(index != -1) {
      storage.stacks[index] = stack;
    } else {
      storage.stacks.push(stack);
    }
    chrome.storage.sync.set({"stacks": storage.stacks}, function() {});
  }
  getStack(save);
}

function deleteStack(url) {
  var del = function(storage) {
    console.log(storage);

    var stack = createStack(url);
    var index = indexOfStack(storage.stacks, stack);
    if(index != -1) {
      storage.stacks.splice(index, 1);
      chrome.storage.sync.set({"stacks": storage.stacks}, function() {});
    }
  }
  getStack(del);
}

function getStack(onGetStack) {
  var first = { "stacks": [] };
  chrome.storage.sync.get(first, onGetStack);
}

function createOpenSuggest(stack) {
  var content = command_open + stack.url;
  var description = (stack.memo == "")
    ? content
    : '"' + stack.memo + '"' + content;
  return {content: content, description: description};
}

function createDeleteSuggest(stack) {
  var content = command_delete + stack.url;
  var description = (stack.memo == "")
    ? content
    : '"' + stack.memo + '"' + content;
  return {content: content, description: description};
}

function isSuggest(text, stack) {
  var isMemo = stack.memo.indexOf(text) != -1;
  var isUrl = stack.url.indexOf(text) != -1;
  return isMemo || isUrl;
}

function Stack() {
  this.memo = "";
  this.url = "";
  this.datetime = new Date();
}

function createStack(url) {
  var stack = new Stack();
  if (includeMemo(url)) {
    stack.url = sliceMemoUrl(url);
    stack.memo = sliceMemo(url);
  } else {
    stack.url = url;
  }
  return stack;
}

function includeMemo(url) {
  return (url.split(":").length > 1);
}

function indexOfStack(stacks, target) {
  var index = -1;
  stacks.forEach(function(stack, i) {
    if(stack.url == target.url) {
      index = i;
    }
  });
  return index;
}

function sliceMemo(url) {
  if(url.split(":").length > 2) {
    return url.slice(0, url.indexOf(":"));
  } else {
    return "";
  }
}

function sliceMemoUrl(url) {
  if(url.split(":").length > 2) {
    return url.slice(url.indexOf(":") + 1);
  } else {
    return url;
  }
}

function sliceUrl(url, target) {
  if(url.split(target).length > 1) {
    return url.slice(url.indexOf(target) + target.length);
  } else {
    return url;
  }
  
}
