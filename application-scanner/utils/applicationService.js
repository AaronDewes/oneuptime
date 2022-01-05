const crypto = require('crypto');
const EncryptionKeys = require('./encryptionKeys');
const algorithm = EncryptionKeys.algorithm;
const key = EncryptionKeys.key;
const git = require('simple-git/promise');
const uuidv1 = require('uuid/v1');
const Path = require('path');
const ErrorService = require('./errorService');
const fs = require('fs');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);
const { spawn } = require('child_process');
const {
    updateApplicationSecurityToScanning,
    updateApplicationSecurityLogService,
    updateApplicationSecurityScanTime,
    updateApplicationSecurityToFailed,
} = require('./applicationSecurityUpdate');

const { Client } = require('ssh2');
module.exports = {
    scan: async function(security) {
        if (
            security.gitCredential.gitUsername &&
            security.gitCredential.gitPassword
        ) {
            const decryptedSecurity = await this.decryptPassword(security);
            await this.scanApplicationSecurity(decryptedSecurity);
        }
        if (
            security.gitCredential.sshTitle &&
            security.gitCredential.sshPrivateKey
        ) {
            await this.sshScanApplicationSecurity(security);
        }
    },
    decryptPassword: async function(security) {
        try {
            const values = [];
            for (let i = 0; i <= 15; i++) {
                values.push(security.gitCredential.iv[i]);
            }
            const iv = Buffer.from(values);
            security.gitCredential.gitPassword = await this.decrypt(
                security.gitCredential.gitPassword,
                iv
            );
            return security;
        } catch (error) {
            ErrorService.log(
                'applicationSecurityService.decryptPassword',
                error
            );
            throw error;
        }
    },
    decrypt: (encText, iv) => {
        const promise = new Promise((resolve, reject) => {
            try {
                const decipher = crypto.createDecipheriv(algorithm, key, iv);
                let decoded = decipher.update(encText, 'hex', 'utf8');
                decoded += decipher.final('utf8');
                resolve(decoded);
            } catch (error) {
                reject(error);
            }
        });
        return promise;
    },
    sshScanApplicationSecurity: async security => {
        try {
            let securityDir = 'application_security_dir';
            securityDir = await createDir(securityDir);
            const cloneDirectory = `${uuidv1()}security`; // always create unique paths
            const repoPath = Path.resolve(securityDir, cloneDirectory);
            const conn = new Client();

            conn.on('ready', () => {
                // eslint-disable-next-line no-console
                console.log('SSH Client :: ready');
                return new Promise((resolve, reject) => {
                    git(securityDir)
                        .silent(true)
                        .clone(
                            'git@github.com:adeoluwadavid/my_portfolio_website.git',
                            cloneDirectory
                        )
                        .then(() => {
                            const output = spawn('npm', ['install'], {
                                cwd: repoPath,
                            });
                            output.on('error', error => {
                                error.code = 500;
                                throw error;
                            });

                            output.on('close', () => {
                                let auditOutput = '';
                                const audit = spawn(
                                    'npm',
                                    ['audit', '--json'],
                                    {
                                        cwd: repoPath,
                                    }
                                );

                                audit.on('error', error => {
                                    error.code = 500;
                                    throw error;
                                });

                                audit.stdout.on('data', data => {
                                    const strData = data.toString();
                                    auditOutput += strData;
                                });

                                audit.on('close', async () => {
                                    let advisories = [];
                                    auditOutput = JSON.parse(auditOutput); // parse the stringified json
                                    for (const key in auditOutput.vulnerabilities) {
                                        advisories.push(
                                            auditOutput.vulnerabilities[key]
                                        );
                                    }

                                    const criticalArr = [],
                                        highArr = [],
                                        moderateArr = [],
                                        lowArr = [];
                                    advisories.map(advisory => {
                                        if (advisory.severity === 'critical') {
                                            criticalArr.push(advisory);
                                        }
                                        if (advisory.severity === 'high') {
                                            highArr.push(advisory);
                                        }
                                        if (advisory.severity === 'moderate') {
                                            moderateArr.push(advisory);
                                        }
                                        if (advisory.severity === 'low') {
                                            lowArr.push(advisory);
                                        }
                                        return advisory;
                                    });

                                    // restructure advisories from the most critical case to the least critical(low)
                                    advisories = [
                                        ...criticalArr,
                                        ...highArr,
                                        ...moderateArr,
                                        ...lowArr,
                                    ];

                                    const auditData = {
                                        dependencies:
                                            auditOutput.metadata.dependencies,
                                        devDependencies:
                                            auditOutput.metadata
                                                .devDependencies,
                                        optionalDependencies:
                                            auditOutput.metadata
                                                .optionalDependencies,
                                        totalDependencies:
                                            auditOutput.metadata
                                                .totalDependencies,
                                        vulnerabilities:
                                            auditOutput.metadata
                                                .vulnerabilities,
                                        advisories,
                                    };

                                    const resolvedLog = await updateApplicationSecurityLogService(
                                        {
                                            securityId: security._id,
                                            componentId:
                                                security.componentId._id,
                                            data: auditData,
                                        }
                                    );
                                    await updateApplicationSecurityScanTime({
                                        _id: security._id,
                                    });
                                    await deleteFolderRecursive(repoPath);
                                    return resolve(resolvedLog);
                                });
                            });
                        })
                        .catch(async error => {
                            await updateApplicationSecurityToFailed(security);
                            error.message =
                                'Authentication failed please check your git credentials or git repository url';
                            ErrorService.log(
                                'applicationSecurityUpdate.updateApplicationSecurityToFailed',
                                error
                            );

                            await deleteFolderRecursive(repoPath);
                            return reject(error);
                        });
                });
            }).connect({
                // This is where we use the ssh private Key to connect to github
                host: 'github.com',
                // port: 22,
                username: 'git',
                privateKey: security.gitCredential.sshPrivateKey,
            });
        } catch (error) {
            ErrorService.log(
                'applicationScannerService.scanApplicationSecurity',
                error
            );
            throw error;
        }
    },
    scanApplicationSecurity: async security => {
        try {
            let securityDir = 'application_security_dir';
            securityDir = await createDir(securityDir);

            const USER = security.gitCredential.gitUsername;
            const PASS = security.gitCredential.gitPassword;
            // format the url
            const REPO = formatUrl(security.gitRepositoryUrl);
            const remote = `https://${USER}:${PASS}@${REPO}`;
            const cloneDirectory = `${uuidv1()}security`; // always create unique paths
            const repoPath = Path.resolve(securityDir, cloneDirectory);

            // update application security to scanning true
            // to prevent pulling an applicaiton security multiple times by running cron job
            // due to network delay
            await updateApplicationSecurityToScanning(security);

            return new Promise((resolve, reject) => {
                git(securityDir)
                    .silent(true)
                    .clone(remote, cloneDirectory)
                    .then(() => {
                        const output = spawn('npm', ['install'], {
                            cwd: repoPath,
                        });
                        output.on('error', error => {
                            error.code = 500;
                            throw error;
                        });

                        output.on('close', () => {
                            let auditOutput = '';
                            const audit = spawn('npm', ['audit', '--json'], {
                                cwd: repoPath,
                            });

                            audit.on('error', error => {
                                error.code = 500;
                                throw error;
                            });

                            audit.stdout.on('data', data => {
                                const strData = data.toString();
                                auditOutput += strData;
                            });

                            audit.on('close', async () => {
                                let advisories = [];
                                auditOutput = JSON.parse(auditOutput); // parse the stringified json
                                for (const key in auditOutput.vulnerabilities) {
                                    advisories.push(
                                        auditOutput.vulnerabilities[key]
                                    );
                                }

                                const criticalArr = [],
                                    highArr = [],
                                    moderateArr = [],
                                    lowArr = [];
                                advisories.map(advisory => {
                                    if (advisory.severity === 'critical') {
                                        criticalArr.push(advisory);
                                    }
                                    if (advisory.severity === 'high') {
                                        highArr.push(advisory);
                                    }
                                    if (advisory.severity === 'moderate') {
                                        moderateArr.push(advisory);
                                    }
                                    if (advisory.severity === 'low') {
                                        lowArr.push(advisory);
                                    }
                                    return advisory;
                                });

                                // restructure advisories from the most critical case to the least critical(low)
                                advisories = [
                                    ...criticalArr,
                                    ...highArr,
                                    ...moderateArr,
                                    ...lowArr,
                                ];

                                const auditData = {
                                    dependencies:
                                        auditOutput.metadata.dependencies,
                                    devDependencies:
                                        auditOutput.metadata.devDependencies,
                                    optionalDependencies:
                                        auditOutput.metadata
                                            .optionalDependencies,
                                    totalDependencies:
                                        auditOutput.metadata.totalDependencies,
                                    vulnerabilities:
                                        auditOutput.metadata.vulnerabilities,
                                    advisories,
                                };

                                const resolvedLog = await updateApplicationSecurityLogService(
                                    {
                                        securityId: security._id,
                                        componentId: security.componentId._id,
                                        data: auditData,
                                    }
                                );
                                await updateApplicationSecurityScanTime({
                                    _id: security._id,
                                });
                                await deleteFolderRecursive(repoPath);
                                return resolve(resolvedLog);
                            });
                        });
                    })
                    .catch(async error => {
                        await updateApplicationSecurityToFailed(security);
                        error.message =
                            'Authentication failed please check your git credentials or git repository url';
                        ErrorService.log(
                            'applicationSecurityUpdate.updateApplicationSecurityToFailed',
                            error
                        );

                        await deleteFolderRecursive(repoPath);
                        return reject(error);
                    });
            });
        } catch (error) {
            ErrorService.log(
                'applicationScannerService.scanApplicationSecurity',
                error
            );
            throw error;
        }
    },
};
async function deleteFolderRecursive(dir) {
    if (fs.existsSync(dir)) {
        const entries = await readdir(dir, { withFileTypes: true });
        await Promise.all(
            entries.map(entry => {
                const fullPath = Path.join(dir, entry.name);
                return entry.isDirectory()
                    ? deleteFolderRecursive(fullPath)
                    : unlink(fullPath);
            })
        );
        await rmdir(dir); // finally remove now empty directory
    }
}
function formatUrl(url) {
    // remove https://www. from url
    if (url.indexOf('https://www.') === 0) {
        return url.slice(12);
    }
    // remove http://www. from url
    if (url.indexOf('http://www.') === 0) {
        return url.slice(11);
    }
    // remove https:// from url
    if (url.indexOf('https://') === 0) {
        return url.slice(8);
    }
    // remove http:// from url
    if (url.indexOf('http://') === 0) {
        return url.slice(7);
    }
    // remove www. from url
    if (url.indexOf('www.') === 0) {
        return url.slice(4);
    }

    return url;
}

function createDir(dirPath) {
    return new Promise((resolve, reject) => {
        const workPath = Path.resolve(process.cwd(), dirPath);
        if (fs.existsSync(workPath)) {
            resolve(workPath);
        }

        fs.mkdir(workPath, error => {
            if (error) reject(error);
            resolve(workPath);
        });
    });
}
