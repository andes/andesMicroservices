import * as Hrequest from 'request';

export function request(params): Promise<any> {
    return new Promise((resolve, reject) => {
        Hrequest(params, (err, response, body) => {
            if (!err) {
                let status = response && response.statusCode;
                return resolve([status, body]);
            } else {
                return reject(err);
            }
        });
    });
}
