import * as http from 'http';
let base64 = require('base-64');

export class InformBuilder {
    build(url) {
        return new Promise((resolve, reject) => {
            http.get(url, function (response) {
                let data: any = [];
                
                response.on('data', function(chunk) { 
                    data.push(chunk);
                  });
                
                  response.on('end', function() {
                    data = Buffer.concat(data); // do something with data 
                  });

                  console.log('el data: ', data);
                  return resolve(base64.encode(data));
                // if (response.statusCode === 200) {
                //     console.log('El resopnse: ', response);
                //     return resolve(base64.encode(response));
                // } else {
                //     return reject(null);
                // }
            });
        });
    }
}

