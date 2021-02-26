const request = require('request');

export function send(data: any) {
    return new Promise((resolve: any, reject: any) => {
        const url = 'http://localhost:3012/alive'; //process.env.RECETAR_HOST;
        const options = {
            url,
            method: 'POST',
            json: true,
            body: data,
            headers: {
                // Authorization: `JWT ${ANDES_KEY}`
                Authorization: `JWT recetar123456`
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

