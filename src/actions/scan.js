import { Http } from "../services/http";

const MOCK = require("./mock.json");

export class ScanActions {

    constructor() {
    }

    static scan(isPreview, host, config, crop) {
        let queryParams = '?';
        if (isPreview) {
            queryParams += 'preview=true&';
        }
        if (crop) {
            queryParams += 'originX=' + crop.originX + '&originY=' + crop.originY + '&width=' + crop.width + '&height=' + crop.height;
        }

        if (queryParams.endsWith('&') || queryParams.endsWith('?')) {
            queryParams = queryParams.slice(0, -1);
        }
        if (MOCK) {
            return new Promise((success, fail) => {
                return success(MOCK);
            });
        } else {
            return Http.get(host.hostName + "/" + host.contextPath + '/scanners/' + config.idScanner + '/document' + queryParams)
                .then(function (res) {
                    return res.data;
                }).catch((e) => {
                    throw new Error(e);
                });
        }
    }

    static getScanners(host) {

        if (MOCK) {
            return new Promise((success, fail) => {
                return success({ 0: "mon Scanner 1", 2: "mon Scanner 2" });
            });
        } else {

            return Http.get(host.hostName + "/" + host.contextPath + '/scanners/')
                .then(function (res) {
                    return res.data;
                }).catch((e) => {
                    throw new Error(e);
                });
        }
    }
}