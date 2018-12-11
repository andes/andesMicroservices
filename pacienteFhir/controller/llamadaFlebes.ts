const request = require('request');

export function llamadaFlebes(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = '10.1.72.7:8060/flebes/andesapi.php/Patient';
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        request(options, (error, response, body) => {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                return resolve(body);
            }
            return resolve(error || body);
        });
    });
}
