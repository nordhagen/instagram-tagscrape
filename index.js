var request = require('request'),
    Promise = require('bluebird'),
    fs      = require('fs'),
    listURL = 'https://www.instagram.com/explore/tags/',
    postURL = 'https://www.instagram.com/p/',
    locURL  = 'https://www.instagram.com/explore/locations/',
    dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/;

exports.scrapeTagPage = function(opts) {
    opts = opts || {};

    var result = new Promise(function(resolve, reject){
        if (!opts.tag) return reject(new Error('Option "tag" must be specified'));

        request(listURL + opts.tag, function(err, response, body){
            if (err) return reject(err);

            var data = scrape(body)

            // fs.writeFileSync('./out.json', JSON.stringify(data.entry_data.TagPage[0].tag.media.nodes), 'utf8');

            var media = data.entry_data.TagPage[0].tag.media;

            resolve({
                total: media.count,
                count: media.nodes.length,
                media: media.nodes
            });
        })
    });

    if (opts.deep) {
        result.then(function(list){
            var postDataPromises = [];
            for (var i = media.nodes.length - 1; i >= 0; i--) {
                postDataPromises.push(exports.scrapePost(media.nodes[i].code));
            }
            result.all(postDataPromises);
        });
    }

    return result;
};

exports.scrapeLocationPage = function(opts) {
    opts = opts || {};
    
    return new Promise(function(resolve, reject){
        if (!opts.id) return reject(new Error('Option "id" must be specified'));
        
        request(locURL + opts.id, function(err, response, body){
            var loc = scrape(body).entry_data.LocationsPage[0].location;
            resolve({
                public: loc.has_public_page,
                name:   loc.name,
                slug:   loc.slug,
                lat:    loc.lat,
                lng:    loc.lng,
                id:     loc.id
            }); 
        });
    });
}

exports.scrapePostPage = function(opts) {
    opts = opts || {};

    return new Promise(function(resolve, reject){
        if (!opts.code) return reject(new Error('Option "code" must be specified'));

        request(postURL + opts.code, function(err, response, body){
            var data = scrape(body);
            resolve(data.entry_data.PostPage[0].media); 
        });
    });
}

var scrape = function(html) {
    var dataString = html.match(dataExp)[1];

    // console.log(dataString);

    try {
        var json = JSON.parse(dataString);
    }
    catch(e) {
        if (process.env.NODE_ENV == 'development') {
            console.log('Last 100 chars: ' + dataString.substr(-100, 100));
            fs.writeFileSync('./debug.html', body, 'utf8');
        }
        throw e;
    }

    return json;
}