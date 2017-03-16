'use strict'

const https = require('https');

module.exports = {
    GET: performGETRequest,
    POST: performPOSTRequest,
};

function performGETRequest(host, path) {
    return new Promise((resolve, reject) => {
        var options = {
            hostname: host,
            path: path,
            method: 'GET',
            port: 443,
        };

        var req = https.request(options, (res) => {
            res.setEncoding('utf8');

            var data = "";

            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject({ statusCode: res.statusCode });
                }

                try {
                    resolve(data);
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
            reject(e);
        });

        req.end();
    });
}

function performPOSTRequest(host, path, postData) {
    return new Promise((resolve, reject) => {
        var options = {
            hostname: host,
            path: path,
            method: 'POST',
            port: 443,
            followAllRedirects: true,
        };

        var req = https.request(options, (res) => {
            res.setEncoding('utf8');

            var data = "";

            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject({ statusCode: res.statusCode });
                }
                resolve(data);
            });
        });

        req.on('error', (e) => {
            console.log(`problem with request: ${e.message}`);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}