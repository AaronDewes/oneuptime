const axios = require('axios');
const { clusterKey, serverUrl, dataIngestorVersion } = require('./config');

const _this = {
    getHeaders: () => {
        return {
            'Access-Control-Allow-Origin': '*',
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
            clusterKey,
            dataIngestorVersion,
        };
    },
    postApi: (url, data, withBaseUrl = false) => {
        const headers = _this.getHeaders();

        return new Promise((resolve, reject) => {
            axios({
                method: 'POST',
                url: withBaseUrl ? `${url}` : `${serverUrl}/${url}`,
                headers,
                data,
            })
                .then(function(response) {
                    resolve(response.data);
                })
                .catch(function(error) {
                    if (error && error.response && error.response.data)
                        error = error.response.data;
                    if (error && error.data) {
                        error = error.data;
                    }
                    reject(error);
                });
        });
    },

    getApi: (url, withBaseUrl = false) => {
        const headers = _this.getHeaders();
        return new Promise((resolve, reject) => {
            axios({
                method: 'GET',
                url: withBaseUrl ? `${url}` : `${serverUrl}/${url}`,
                headers,
            })
                .then(function(response) {
                    resolve(response.data);
                })
                .catch(function(error) {
                    if (error && error.response && error.response.data)
                        error = error.response.data;
                    if (error && error.data) {
                        error = error.data;
                    }
                    reject(error);
                });
        });
    },

    putApi: (url, data, withBaseUrl) => {
        const headers = _this.getHeaders();
        return new Promise((resolve, reject) => {
            axios({
                method: 'PUT',
                url: withBaseUrl ? `${url}` : `${serverUrl}/${url}`,
                headers,
                data,
            })
                .then(function(response) {
                    resolve(response.data);
                })
                .catch(function(error) {
                    if (error && error.response && error.response.data)
                        error = error.response.data;
                    if (error && error.data) {
                        error = error.data;
                    }
                    reject(error);
                });
        });
    },

    deleteApi: (url, data, withBaseUrl) => {
        const headers = _this.getHeaders();
        return new Promise((resolve, reject) => {
            axios({
                method: 'DELETE',
                url: withBaseUrl ? `${url}` : `${serverUrl}/${url}`,
                headers,
                data,
            })
                .then(function(response) {
                    resolve(response.data);
                })
                .catch(function(error) {
                    if (error && error.response && error.response.data)
                        error = error.response.data;
                    if (error && error.data) {
                        error = error.data;
                    }
                    reject(error);
                });
        });
    },
};

module.exports = _this;
