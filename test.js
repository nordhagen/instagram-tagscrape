var mocha   = require('mocha'),
    assert  = require('chai').assert,
    ig     = require('./index');

describe('instagram-tagscrape', function(){
    it('should throw error when called with missing tag argument', function(done){

        ig.scrapeTagPage().then(function(result){
            assert.fail('Promise should be rejected')
            done();
        })
        .catch(function(err){ 
            assert.typeOf(err, 'error');
            done();
        });

    });

    it('should return object containing count, total and media', function(done){

        ig.scrapeTagPage({tag:'nrkvalg'}).then(function(result){
            assert.isAtLeast(result.count, 1);
            assert.isAtLeast(result.total, 1);
            assert.equal(result.media.length, result.count);
            done();
        })

    });

    it('should throw error when called with missing code argument', function(done){

        ig.scrapeTagPage().then(function(result){
            assert.fail('Promise should be rejected')
            done();
        })
        .catch(function(err){ 
            assert.typeOf(err, 'error');
            done();
        });

    });

    it('should throw error when called with missing id argument', function(done){

        ig.scrapeLocationPage().then(function(result){
            assert.fail('Promise should be rejected')
            done();
        })
        .catch(function(err){ 
            assert.typeOf(err, 'error');
            done();
        });

    });

    it('should return location data from locationPage', function(done){

        ig.scrapeLocationPage({id:542401}).then(function(result){
            assert.equal(result.name, 'Det Akademiske Kvarter');
            done();
        });

    });

    it.only('should return data from single post', function(done){

        ig.scrapePostPage({code: 'BMmWPcBhGAv'}).then(function(result){
            assert.equal(result.id, 1380036423671849153);
            done();
        });

    });

    it('should return media containing data from loading each post page', function(done){
        
        ig.scrapeTagPage({tag:'nrkvalg', deep:true}).then(function(result){
            assert.isDefined(result.media[0].location);
            done();
        });

    });
});