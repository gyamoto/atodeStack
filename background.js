chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  console.log('inputChanged: ' + text);

  var suggest = function(storage) {
    var stacks = storage.stacks;
    var suggests = [];
    stacks.forEach(function(stack) {
      if(isSuggest(text, stack)) {
        suggests.push(createStack(url));
      }
    })
    suggest(suggests);
  }
});

chrome.omnibox.onInputEntered.addListener(function(text) {
  console.log('inputEntered: ' + text);
  saveStack(text);
});

function saveStack(url) {
  var get = function(storage) {
    var stack = createStack(url);
    storage.stacks.push(stack);
    chrome.storage.sync.set({"stacks": storage.stacks}, function() {});
  }
  getStack(get);
}

function getStack(onGetStack) {
  var first = { "stacks": [] };
  chrome.storage.sync.get(first, onGetStack);
}

function Suggest() {
  this.content = "";
  this.description = "";
}

function createSuggest(url) {
  var suggest = new suggest();
  suggest.description = url;
  if (includeMemo(url)) {
    suggest.content = sliceMemo(url);
    suggest.description = sliceUrl(url);
  }
  return suggest;
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
  stack.url = url;
  if (includeMemo(url)) {
    stack.url = sliceMemo(url);
    stack.memo = sliceUrl(url);
  }
  return stack;
}

function includeMemo(url) {
  return (url.match(/:/g) || []).length > 0;
}

function sliceMemo(url) {
  return url.slice(0, url.indexOf(":"));
}

function sliceUrl(url) {
  return url.slice(url.indexOf(":") + 1);
} 
