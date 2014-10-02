'use strict';

angular.module('appceptionApp')
  .factory('indexedDB', function ($q) {

    var databaseName = 'makedrive';

    // Insert files and directories for a given repo
    // into the user's browsers local database.
    var insertRepoIntoLocalDB = function(repo, items) {

      var filer = new Filer.FileSystem({
        name: 'files',
        provider: new Filer.FileSystem.providers.Fallback(databaseName)
      });
      
      // iterate through the items from the repo.
      for(var i =0; i < items.length; i++){
        var item = items[i];

        var filePath = '/'+repo + '/' + item[0].path.replace(/^.*?\//, '');

        // if item has no content, create a directory
        if(! item[0].hasOwnProperty('content')) {
          filer.mkdir( filePath , function(err){
            if(err) throw err;
          });
        // if item has content, create a file
        }  else {
          filer.writeFile(filePath , item[0].content, function(error) {
            if(error) throw error;
          })
        }
      }
    };

    // Export files and directories from the user's browsers local database.
    // exportLocalDB() returns a flat array containing information about 
    // all the files and folders.
    var exportLocalDB = function(){

      var filer = new Filer.FileSystem({
        name: 'files',
        provider: new Filer.FileSystem.providers.Fallback(databaseName)
      });
      var shell = filer.Shell();

      var promises = [];
      var results = [];

      // turn shell.ls callback into a promise
      var defer = $q.defer();

      // shell.ls returns a  nested list of all files and directories 
      //in user's browsers local DB
      shell.ls('/', {recursive: true}, function(err, entries){
        // console.log('entries', entries[0])
        if (err) throw err;
        // counter keeps track of the number of promises
        var counter = 0;

        // traverse the nested directory structure to produce a flat array
        // of files and folders. 
        var traverseDirectory = function(item, fullpath){

          // loop through every item in a directory
          angular.forEach(item.contents, function(entry, i){
            var entry = item.contents[i];
            var itemPath = fullpath + '/' + entry.path;

            // if item is a file, read the file,  
            // and add  file path and content 
            if(entry.type === 'FILE'){

              (function(i) {
                // turns filer.readFile callback into a promise
                promises[i] = $q.defer();
                filer.readFile(itemPath, function(err, data){
                  if (err) {
                    return promises[i].reject(err);
                  } 
                  // console.log('file2:', itemPath, data);
                  promises[i].resolve({path: itemPath, content: data.toString()});
                }) 
              })(counter++)

            // if item is directory, add directory path, and 
            //  recursively traverse the directory
            } else if (entry.type === 'DIRECTORY') {
             // console.log('directory:', itemPath);
              promises[counter]  = $q.defer();
              promises[counter].resolve({path: itemPath});
              counter++;
              traverseDirectory(entry, itemPath );
            }

            // console.log(promises)

          })
        }

        // get all the files and directories for the root directory
        if(entries[0] && entries[0].type==="DIRECTORY"){
          traverseDirectory(entries[0], '/' + entries[0].path)
        } else {
          alert('You need a folder folder at the root of your project.')
        }

        // since there are two nested level of promises,
        // push every  promise in 2nd level of promise (promises[])
        // into the promise of the 1st level (REALpromises[]) 
        var REALpromises = [];
        angular.forEach(promises, function(promise) {
          REALpromises.push(promise.promise);
        })
        defer.resolve($q.all(REALpromises));
    
      });

      return defer.promise;

    };

    // Empty the user's local database so there will only be one repo
    // in the local database at a time
    var emptyLocalDB = function() {

      var filer = new Filer.FileSystem({
        name: 'files',
        provider: new Filer.FileSystem.providers.Fallback(databaseName)
      });
      var shell = filer.Shell();

      // gets  every directory file at the root
      filer.readdir('/', function(err, files){
        if (err) throw err;
        console.log(files)

        // delete each root file and directory
        angular.forEach(files, function(file, i){
          console.log(file)

          shell.rm(file, {recursive : true }, function(err){
            if (err) throw err;
            console.log(file, ' from indexedDB is cleared.')
          })
        })

      })



      // shell.rm('/test3', {recursive : true }, function(err){
      //   if (err) throw err;
      //   console.log('indexedDB is cleared.')
      // });
    }

    return {
      exportLocalDB: exportLocalDB,
      insertRepoIntoLocalDB: insertRepoIntoLocalDB,
      emptyLocalDB: emptyLocalDB
    }

  });