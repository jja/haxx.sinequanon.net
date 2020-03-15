var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown-remarkable');
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');
var serve       = require('metalsmith-serve');
var assets      = require('metalsmith-assets');
var pagination  = require('metalsmith-pagination');
var collections = require('metalsmith-collections');
var more        = require('metalsmith-more');
var tags        = require('metalsmith-tags');

var Handlebars  = require('handlebars');

Handlebars.registerHelper('dateFormat', require('handlebars-dateformat'));

var ms = Metalsmith(__dirname)
  .metadata({
    sitetitle: "haxx populi",
    sitedescription: "tips and tricks from a working coder",
    siteurl: "http://haxx.sinequanon.net/"
  })
  .source('./src')
  .destination('./build')
  .clean(false)     // must be false to use gh-pages clone as build/
  .use(collections({
    posts: {
      sortBy: 'date',
      reverse: true,
      pattern: 'posts/**/*.md',
    }
  }))
  .use(markdown('full',{
    html: true,
    linkify: true,
  }))
  .use(more({
    alwaysAddKey: true,
	regexp: /\s*<(!--\s*more\s*--|h2\s*id="comments"\s*)>/,
  }))
  .use(permalinks({
    pattern: ':date/:slug',
    date: 'YYYY/MM',

    linksets: [{
      match: { layout: 'page' },
      pattern: ':slug',
    }]
  }))
  .use(pagination({
    'collections.posts': {
      first:'index.html',
      layout:'pagination',
      path: 'page/:num/index.html',
    }
  }))
  .use(tags({
    path: 'tag/:tag/index.html',
    pathPage: 'tag/:tag/:num/index.html',
    sortBy: 'date',
    reverse: true,
    perPage: 10,
    layout: 'tag',
  }))
  .use(layouts({
    engine: 'handlebars',
    default: 'post',
    partials: 'layouts',
  }))
  .use(assets({
    source: './static',
    destination: '.',
  }))

  if ('--run' === process.argv[2]) { ms = ms.use(serve()); }

  ms.build(function(err, files) {
    if (err) { throw err; }
  });
