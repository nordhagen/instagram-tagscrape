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

        ig.scrapeTagPage('nrkvalg').then(function(result){
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

        ig.scrapeLocationPage(542401).then(function(result){
            assert.equal(result.name, 'Det Akademiske Kvarter');
            done();
        });

    });

    it('should return data from single post', function(done){

        ig.scrapePostPage('BMmWPcBhGAv').then(function(result){
            assert.equal(result.id, 1379888153741254703);
            done();
        });

    });

    it('should return media containing data from loading each post page and location page', function(done){
        this.timeout(10000);

        ig.deepScrapeTagPage('nrkvalg').then(function(result){
            assert.isDefined(result.media[0].owner.username);
            assert.isDefined(result.media[5].location.lat);
            done();
        });

    });
});