/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');

var connect = require('connect'); // include connect middleware: https://www.npmjs.org/package/connect
var brackets = require('brackets'); // include brackets web module: https://www.npmjs.org/package/brackets




module.exports = function(app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());


  app.use(connect()); // BEST GUESS...
  app.use('/brackets', brackets()); // BEST GUESS...


    /************************
     * NOTE: Aaron changed this as part of deploy testing.
     * Lines 56 & 57 are the original Yeoman lines.
     * Aaron rolled them back from the modified lines below:
     *
     *   app.use(express.static(path.join(config.root, 'dist/public')));
     *   app.set('appPath', config.root + '/dist/public');
     *
     * We were getting a weird build error where paths were looking for '.../dist/dist/...'
     * This is the fix for that error.
     ********************************/
  app.use(passport.initialize());
  if ('production' === env) {
    // app.use(favicon(path.join(config.root, 'client/components', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }
};