var request = require('request'),
    Promise = require('bluebird'),
    listURL = 'https://www.instagram.com/explore/tags/',
    postURL = 'https://www.instagram.com/p/',
    locURL  = 'https://www.instagram.com/explore/locations/',
    dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/;

exports.deepScrapeTagPage = function(tag) {
    return new Promise(function(resolve, reject){
        exports.scrapeTagPage(tag).then(function(tagPage){
            return Promise.map(tagPage.media, function(media, i, len) {
                return exports.scrapePostPage(media.node.shortcode).then(function(postPage){
                    tagPage.media[i] = postPage;
                    if (postPage.location != null && postPage.location.has_public_page) {
                        return exports.scrapeLocationPage(postPage.location.id).then(function(locationPage){
                            tagPage.media[i].location = locationPage;
                        })
                        .catch(function(err) {
                            console.log("An error occurred calling scrapeLocationPage inside deepScrapeTagPage" + ":" + err);
                        });
                    }
                })
                .catch(function(err) {
                    console.log("An error occurred calling scrapePostPage inside deepScrapeTagPage" + ":" + err);
                });
            })
            .then(function(){ resolve(tagPage); })
            .catch(function(err) {
                console.log("An error occurred resolving tagPage inside deepScrapeTagPage" + ":" + err);
            });
        })
        .catch(function(err) {
                console.log("An error occurred calling scrapeTagPage inside deepScrapeTagPage" + ":" + err);
        });        
    });
};

exports.scrapeTagPage = function(tag) {
    return new Promise(function(resolve, reject){
        if (!tag) return reject(new Error('Argument "tag" must be specified'));

        request(listURL + tag, function(err, response, body){
            if (err) return reject(err);

            var data = scrape(body)

            if (data && data.entry_data && 
                data.entry_data.TagPage[0] && 
                data.entry_data.TagPage[0].graphql &&
                data.entry_data.TagPage[0].graphql.hashtag &&
                data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media &&
                data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media.edges) {                
                var edge_hashtag_to_media = data.entry_data.TagPage[0].graphql.hashtag.edge_hashtag_to_media;
                resolve({
                    total: edge_hashtag_to_media.count,
                    count: edge_hashtag_to_media.edges.length,
                    media: edge_hashtag_to_media.edges
                });
            }
            else {
                reject(new Error('Error scraping tag page "' + tag + '"'));
            }
        })
    });
};

exports.scrapePostPage = function(code) {
    return new Promise(function(resolve, reject){
        if (!code) return reject(new Error('Argument "code" must be specified'));

        request(postURL + code, function(err, response, body){
            var data = scrape(body);
            if (data && data.entry_data && 
                data.entry_data.PostPage[0] && 
                data.entry_data.PostPage[0].graphql && 
                data.entry_data.PostPage[0].graphql.shortcode_media) {
                resolve(data.entry_data.PostPage[0].graphql.shortcode_media); 
            }
            else {
                reject(new Error('Error scraping post page "' + code + '"'));
            }
        });
    });
}

exports.scrapeLocationPage = function(id) {
    return new Promise(function(resolve, reject){
        if (!id) return reject(new Error('Argument "id" must be specified'));
        
        request(locURL + id, function(err, response, body){
            var data = scrape(body);

            if (data && data.entry_data && 
                data.entry_data.LocationsPage[0] && 
                data.entry_data.LocationsPage[0].location) {
                resolve(data.entry_data.LocationsPage[0].location);
            }
            else {
                reject(new Error('Error scraping location page "' + id + '"'));
            }
        });
    });
}

var scrape = function(html) {
    try {
        var dataString = html.match(dataExp)[1];
        var json = JSON.parse(dataString);
    }
    catch(e) {
        if (process.env.NODE_ENV != 'production') {
            //console.log(html);
            console.error('The HTML returned from instagram was not suitable for scraping');
        }
        return null
    }

    return json;
}
