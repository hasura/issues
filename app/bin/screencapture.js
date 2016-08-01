try {
  var system = require('system');
  var args = system.args;
  console.log(args);
  if (args.length !== 5) {
    console.error('Usage: phantomjs screencapture.js [url] [filename] sizeX sizeY');
    phantom.exit();
  } else {
    var page = require('webpage').create();
    page.viewportSize = { width: args[3], height: args[4]};
    page.open(args[1], function(state) {
      if (state !== 'success') {
        console.error('Unable to load');
        phantom.exit();
      } else {
        setTimeout(function () {
          page.render(args[2], {format: 'png', quality: 75});
          phantom.exit();
        }, 2000);
      }
    });
  }
} catch (e) {
  console.log(e);
  phantom.exit();
}
