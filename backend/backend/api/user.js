const express = require('express');
const UserService = require('../services/userService');
const ProjectService = require('../services/projectService');
const jwtSecretKey = process.env['JWT_SECRET'];
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saml2 = require('saml2-js');
const sp = new saml2.ServiceProvider({
    entity_id: 'hackerbay.io',
});
const MailService = require('../services/mailService');
const SsoService = require('../services/ssoService');
const getUser = require('../middlewares/user').getUser;
const sendErrorResponse = require('../middlewares/response').sendErrorResponse;
const sendItemResponse = require('../middlewares/response').sendItemResponse;
const sendListResponse = require('../middlewares/response').sendListResponse;
const router = express.Router();
const multer = require('multer');
const storage = require('../middlewares/upload');
const winston = require('winston');
const constants = require('../config/constants.json');
const { emaildomains } = require('../config/emaildomains');
const randToken = require('rand-token');
const VerificationTokenModel = require('../models/verificationToken');
const { IS_SAAS_SERVICE } = require('../config/server');
const UserModel = require('../models/user');
const ErrorService = require('../services/errorService');
const isUserMasterAdmin = require('../middlewares/user').isUserMasterAdmin;

router.post('/signup', async function(req, res) {
    try {
        if (
            typeof process.env.DISABLE_SIGNUP === 'string' &&
            process.env.DISABLE_SIGNUP === 'true'
        ) {
            // res,and next is skipped in isUserMasterAdmin because we don't want to reject the request.
            if (!(await isUserMasterAdmin(req))) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Sign up is disabled.',
                });
            }
        }

        const data = req.body;

        if (IS_SAAS_SERVICE) {
            //ALERT: Delete data.role so user don't accidently sign up as master-admin from the API.
            delete data.role;
        } else {
            const users = await UserService.findBy({});

            if (!users || users.length === 0) {
                data.role = 'master-admin';
            } else {
                delete data.role;
            }
        }

        if (!data.email) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email must be present.',
            });
        }

        if (typeof data.email !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email is not in string format.',
            });
        }

        if (!emaildomains.test(data.email)) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Business email address is required.',
            });
        }

        if (!data.password) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password must be present.',
            });
        }

        if (typeof data.password !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password is not in string format.',
            });
        }

        if (!data.confirmPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Confirm password must be present.',
            });
        }

        if (typeof data.confirmPassword !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Confirm password is not in string format.',
            });
        }

        if (data.confirmPassword !== data.confirmPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password and Confirm password are not same.',
            });
        }

        if (!data.name) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Name must be present.',
            });
        }

        if (typeof data.name !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Name is not in string format.',
            });
        }
        let user = await UserService.findOneBy({ email: data.email });
        //Checks if user is registered with only email
        if (user) {
            if (!user.password) {
                const hash = await bcrypt.hash(
                    data.password,
                    constants.saltRounds
                );
                // creating jwt refresh token
                const jwtRefreshToken = randToken.uid(256);
                user = await UserService.updateOneBy(
                    { _id: user._id },
                    {
                        name: data.name,
                        password: hash,
                        jwtRefreshToken: jwtRefreshToken,
                    }
                );

                // Call the MailService.
                MailService.sendSignupMail(user.email, user.name);
                UserService.sendToken(user, user.email);
                // create access token and refresh token.
                const authUserObj = {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    cardRegistered: user.stripeCustomerId ? true : false,
                };
                winston.info('User just signed up');
                return sendItemResponse(req, res, authUserObj);
            } else {
                return sendErrorResponse(req, res, {
                    message: 'Email Address is already taken.',
                    code: 400,
                });
            }
        } else {
            if (!data.companyName) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Company Name must be present.',
                });
            }

            if (typeof data.companyName !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Company Name is not in string format.',
                });
            }

            if (!data.companyPhoneNumber) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Company phone number must be present.',
                });
            }

            if (typeof data.companyPhoneNumber !== 'string') {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'Company phone number  is not in string format.',
                });
            }
            // Call the UserService.
            user = await UserService.signup(data);
            // Call the MailService.
            MailService.sendSignupMail(user.email, user.name);
            // create access token and refresh token.
            const authUserObj = {
                id: user._id,
                name: user.name,
                email: user.email,
                airtableId: user.airtableId,
                cardRegistered: user.stripeCustomerId ? true : false,
                tokens: {
                    jwtAccessToken: `${jwt.sign(
                        {
                            id: user._id,
                        },
                        jwtSecretKey,
                        { expiresIn: 8640000 }
                    )}`,
                    jwtRefreshToken: user.jwtRefreshToken,
                },
                role: user.role || null,
                verificationToken: user.verificationToken || null,
            };
            winston.info('A User just signed up');
            const project = await ProjectService.findOneBy({
                'users.userId': user._id,
            });
            return sendItemResponse(
                req,
                res,
                Object.assign(authUserObj, { project: project })
            );
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/masterAdminExists', async function(req, res) {
    try {
        const masterAdmin = await UserService.findBy({ role: 'master-admin' });

        if (masterAdmin && masterAdmin.length > 0) {
            return sendItemResponse(req, res, { result: true });
        } else {
            return sendItemResponse(req, res, { result: false });
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: SSO login function for  user
// Params:
// Param 1: req.query-> {email }
// Returns: 400: Error; 500: Server Error; 200: redirect to login page
router.get('/sso/login', async function(req, res) {
    const { email } = req.query;
    if (!email) {
        return sendErrorResponse(req, res, {
            code: 400,
            message: 'Email must be present.',
        });
    }

    const domainRegex = /^[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})$/;
    const matchedTokens = email.toLocaleLowerCase().match(domainRegex);

    if (!matchedTokens) {
        return sendErrorResponse(req, res, {
            code: 400,
            message: 'Invalid email.',
        });
    }

    const domain = matchedTokens[1];

    try {
        const sso = await SsoService.findOneBy({ domain });
        if (!sso) {
            return sendErrorResponse(req, res, {
                code: 404,
                message: 'Domain not found.',
            });
        }
        const { 'saml-enabled': samlEnabled, samlSsoUrl } = sso;

        if (!samlEnabled) {
            return sendErrorResponse(req, res, {
                code: 401,
                message: 'SSO disabled for this domain.',
            });
        }

        const idp = new saml2.IdentityProvider({
            sso_login_url: samlSsoUrl,
        });

        sp.create_login_request_url(idp, {}, function(error, login_url) {
            if (error != null) return sendErrorResponse(req, res, error);
            return sendItemResponse(req, res, { url: login_url });
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Callback function after SSO authentication page
// param: query->{domain}
router.post('/sso/callback', async function(req, res) {
    const idp = new saml2.IdentityProvider({});
    const options = {
        request_body: req.body,
        allow_unencrypted_assertion: true,
        ignore_signature: true,
    };
    sp.post_assert(idp, options, async function(err, saml_response) {
        if (err != null)
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Invalid request',
            });

        // The structure of the saml_response is not the same from the different servers.
        const email =
            saml_response.user.email || saml_response.user.attributes.email[0];

        const domainRegex = /^[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})$/;
        const matchedTokens = email.toLocaleLowerCase().match(domainRegex);

        if (!matchedTokens) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Invalid email.',
            });
        }

        const domain = matchedTokens[1];
        const sso = await SsoService.findOneBy({ domain });

        if (!sso)
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'SSO not defined for the domain.',
            });

        if (!sso['saml-enabled'])
            return sendErrorResponse(req, res, {
                code: 401,
                message: 'SSO is disabled for the domain.',
            });

        let user = await UserService.findOneBy({ email });

        if (!user) {
            // User is not create yet
            try {
                user = await UserService.create({ email, sso: sso._id });
            } catch (error) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: error,
                });
            }
        }

        const authUserObj = {
            id: user._id,
            name: user.name,
            email: user.email,
            redirect: null,
            cardRegistered: user.stripeCustomerId ? true : false,
            tokens: {
                jwtAccessToken: `${jwt.sign(
                    {
                        id: user._id,
                    },
                    jwtSecretKey,
                    { expiresIn: 8640000 }
                )}`,
                jwtRefreshToken: user.jwtRefreshToken,
            },
            role: user.role || null,
        };

        return res.redirect(
            `${global.accountsHost}` +
                `/ssologin?id=${authUserObj.id}` +
                `&name=${authUserObj.name}` +
                `&email=${authUserObj.email}` +
                `&jwtAccessToken=${authUserObj.tokens.jwtAccessToken}` +
                `&jwtRefreshToken=${authUserObj.tokens.jwtRefreshToken}` +
                `&role=${authUserObj.role}` +
                `&redirect=${authUserObj.redirect}` +
                `&cardRegistered=${authUserObj.cardRegistered}`
        );
    });
});

// Route
// Description: login function for  user
// Params:
// Param 1: req.body-> {email, password }
// Returns: 400: Error; 500: Server Error; 200: user
router.post('/login', async function(req, res) {
    try {
        const data = req.body;
        const clientIP =
            req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        if (!data.email) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email must be present.',
            });
        }

        if (typeof data.email !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email is not in string format.',
            });
        }

        if (!data.password) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password must be present.',
            });
        }

        if (typeof data.password !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password is not in string format.',
            });
        }

        // Call the UserService
        const user = await UserService.login(
            data.email,
            data.password,
            clientIP
        );

        let authUserObj;

        if (!user._id) {
            authUserObj = { ...user };
        } else {
            // create access token and refresh token.
            authUserObj = {
                id: user._id,
                name: user.name,
                email: user.email,
                redirect: data.redirect || null,
                cardRegistered: user.stripeCustomerId ? true : false,
                tokens: {
                    jwtAccessToken: `${jwt.sign(
                        {
                            id: user._id,
                        },
                        jwtSecretKey,
                        { expiresIn: 8640000 }
                    )}`,
                    jwtRefreshToken: user.jwtRefreshToken,
                },
                role: user.role || null,
            };
        }
        return sendItemResponse(req, res, authUserObj);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: verify function for  user
// Params:
// Param 1: req.body-> {token}
// Returns: 400: Error; 500: Server Error; 200: user
router.post('/totp/verifyToken', async function(req, res) {
    try {
        const data = req.body;
        const token = data.token;
        let userId = data.userId;
        if (data.email && !data.userId) {
            const foundUser = await UserService.findOneBy({
                email: data.email,
            });
            userId = foundUser._id;
        }
        const user = await UserService.verifyAuthToken(token, userId);
        if (!user || !user._id) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Invalid token.',
            });
        }

        // create access token and refresh token.
        const userObj = {
            id: user._id,
            name: user.name ? user.name : '',
            email: user.email ? user.email : '',
            password: user.password,
            companyName: user.companyName,
            companyRole: user.companyRole,
            companySize: user.companySize,
            referral: user.referral,
            isVerified: user.isVerified,
            twoFactorAuthEnabled: user.twoFactorAuthEnabled,
            companyPhoneNumber: user.companyPhoneNumber
                ? user.companyPhoneNumber
                : '',
            alertPhoneNumber: user.alertPhoneNumber
                ? user.alertPhoneNumber
                : '',
            profilePic: user.profilePic,
            backupCodes: user.backupCodes,
            timezone: user.timezone ? user.timezone : '',
            tokens: {
                jwtAccessToken: `${jwt.sign(
                    {
                        id: user._id,
                    },
                    jwtSecretKey,
                    { expiresIn: 8640000 }
                )}`,
                jwtRefreshToken: user.jwtRefreshToken,
            },
            tempEmail: user.tempEmail || null,
            tempAlertPhoneNumber: user.tempAlertPhoneNumber || null,
        };
        return sendItemResponse(req, res, userObj);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: verify function for user backup code.
// Params:
// Param 1: req.body-> {code}
// Returns: 400: Error; 500: Server Error; 200: user
router.post('/verify/backupCode', async function(req, res) {
    try {
        const data = req.body;
        // Call the UserService
        let user;
        user = await UserService.findOneBy({ email: data.email });
        if (!user) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'User not found',
            });
        }
        const backupCode = user.backupCodes.filter(
            code => code.code === data.code
        );
        if (backupCode.length > 0 && backupCode[0].used) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'This backup code was used once, show another code.',
            });
        }
        if (backupCode.length > 0)
            user = await UserService.verifyUserBackupCode(
                data.code,
                user.twoFactorSecretCode,
                backupCode[0].counter
            );
        if (backupCode.length === 0 || !user || !user._id) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Invalid backup code.',
            });
        }

        // create access token and refresh token.
        const userObj = {
            id: user._id,
            name: user.name ? user.name : '',
            email: user.email ? user.email : '',
            password: user.password,
            companyName: user.companyName,
            companyRole: user.companyRole,
            companySize: user.companySize,
            referral: user.referral,
            isVerified: user.isVerified,
            twoFactorAuthEnabled: user.twoFactorAuthEnabled,
            companyPhoneNumber: user.companyPhoneNumber
                ? user.companyPhoneNumber
                : '',
            alertPhoneNumber: user.alertPhoneNumber
                ? user.alertPhoneNumber
                : '',
            profilePic: user.profilePic,
            backupCodes: user.backupCodes,
            timezone: user.timezone ? user.timezone : '',
            tokens: {
                jwtAccessToken: `${jwt.sign(
                    {
                        id: user._id,
                    },
                    jwtSecretKey,
                    { expiresIn: 8640000 }
                )}`,
                jwtRefreshToken: user.jwtRefreshToken,
            },
            tempEmail: user.tempEmail || null,
            tempAlertPhoneNumber: user.tempAlertPhoneNumber || null,
        };
        return sendItemResponse(req, res, userObj);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: generate user secret token for creating QRcode
// Params:
// Param 1: req.params-> {userId}
// Returns: 400: Error; 500: Server Error; 200: user
router.post('/totp/token/:userId', async function(req, res) {
    try {
        const userId = req.params.userId;
        const user = await UserService.findOneBy({ _id: userId });
        if (!userId || !user._id) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Provide a valid user Id',
            });
        }

        if (user.otpauth_url) {
            const response = { otpauth_url: user.otpauth_url };
            return sendItemResponse(req, res, response);
        }

        const response = await UserService.generateTwoFactorSecret(userId);
        return sendItemResponse(req, res, response);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: forgot password function for  user
// Params:
// Param 1: req.body-> {email}; req.headers-> {host}
// Returns: 400: Error; 500: Server Error: 200: User password has been reset successfully.

router.post('/forgot-password', async function(req, res) {
    try {
        const data = req.body;

        if (!data.email) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email must be present.',
            });
        }

        if (typeof data.email !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email is not in string format.',
            });
        }
        // Call the UserService.
        const user = await UserService.forgotPassword(data.email);
        const forgotPasswordURL = `${global.accountsHost}/change-password/${user.resetPasswordToken}`;
        // Call the MailService.
        MailService.sendForgotPasswordMail(forgotPasswordURL, user.email);

        return sendItemResponse(req, res, {
            message: 'User received mail succcessfully.',
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: reset password function for user
// Params:
// Param 1: req.body-> {password}; req.params-> {token}
// Returns: 400: Error; 500: Server Error; 200: User password has been reset successfully.
router.post('/reset-password', async function(req, res) {
    try {
        const data = req.body;

        if (!data.password) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password must be present.',
            });
        }

        if (typeof data.password !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Password is not in string format.',
            });
        }

        if (!data.token) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Token must be present.',
            });
        }

        if (typeof data.token !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Token is not in string format.',
            });
        }
        // Call the UserService
        const user = await UserService.resetPassword(data.password, data.token);
        if (!user) {
            return sendErrorResponse(req, res, {
                code: 400,
                message:
                    'Reset password token has expired or token is invalid.',
            });
        }

        // Call the MailService.
        MailService.sendResetPasswordConfirmMail(user.email);
        return sendItemResponse(req, res, {
            message: 'User password has been reset successfully.',
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: login function for  user
// Params:
// Param 1: req.body-> {email, password }
// Returns: 400: Error; 500: Server Error; 200: user
router.post('/isInvited', async function(req, res) {
    try {
        const data = req.body;

        if (!data.email) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Email must be present.',
            });
        }
        // Call the UserService
        const user = await UserService.findOneBy({ email: data.email });
        if (user) {
            return sendItemResponse(req, res, true);
        } else {
            return sendItemResponse(req, res, false);
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// I used to validate token given to redirected urls such as status page
router.post('/isAuthenticated', getUser, async (req, res) => {
    // request will get here if user is authenticated.
    return sendItemResponse(req, res, { authenticated: true, user: req.user });
});

// Route
// Description: Updating profile setting.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.files-> {profilePic};
// Returns: 200: Success, 400: Error; 500: Server Error.
router.put('/profile', getUser, async function(req, res) {
    try {
        const upload = multer({
            storage,
        }).fields([
            {
                name: 'profilePic',
                maxCount: 1,
            },
        ]);
        upload(req, res, async function(error) {
            const userId = req.user ? req.user.id : null;
            const data = req.body;

            if (error) {
                return sendErrorResponse(req, res, error);
            }
            if (
                req.files &&
                req.files.profilePic &&
                req.files.profilePic[0].filename
            ) {
                data.profilePic = req.files.profilePic[0].filename;
            }
            const userData = await UserService.findOneBy({ _id: userId });
            if (data.email !== userData.email) {
                if (data.email === userData.tempEmail) delete data.email;
                else {
                    await UserService.sendToken(userData, data.email);
                    delete data.email;
                }
            }
            if (data.alertPhoneNumber !== userData.alertPhoneNumber)
                delete data.alertPhoneNumber;
            // Call the UserService
            const user = await UserService.updateOneBy({ _id: userId }, data);
            return sendItemResponse(req, res, user);
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Turns on or off 2FA.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id};
// Returns: 200: Success, 400: Error; 500: Server Error.
router.put('/:userId/2fa', isUserMasterAdmin, async function(req, res) {
    try {
        const { userId } = req.params;
        const data = req.body;
        const userData = await UserService.findOneBy({ _id: userId });
        if (userData.email !== data.email) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Invalid user data.',
            });
        }
        // Call the UserService
        const user = await UserService.updateOneBy({ _id: userId }, data);
        return sendItemResponse(req, res, user);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/profile/:userId', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const upload = multer({
            storage,
        }).fields([
            {
                name: 'profilePic',
                maxCount: 1,
            },
        ]);

        upload(req, res, async function(error) {
            const userId = req.params.userId;
            const data = req.body;

            if (error) {
                return sendErrorResponse(req, res, error);
            }

            if (
                req.files &&
                req.files.profilePic &&
                req.files.profilePic[0].filename
            ) {
                data.profilePic = req.files.profilePic[0].filename;
            }

            // Call the UserService
            const user = await UserService.updateOneBy({ _id: userId }, data);
            return sendItemResponse(req, res, user);
        });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Updating change password setting.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id}; req.files-> {profilePic}; req.data- {currentPassword, newPassword, confirmPassword}
// Returns: 200: Success, 400: Error; 500: Server Error.
router.put('/changePassword', getUser, async function(req, res) {
    try {
        const data = req.body;
        const userId = req.user ? req.user.id : null;
        data._id = userId;

        if (!data.currentPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Current Password must be present.',
            });
        }

        if (typeof data.currentPassword !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Current Password  is not in string type.',
            });
        }

        if (!data.newPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'New Password  must be present.',
            });
        }

        if (typeof data.newPassword !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'New Password is not in string type.',
            });
        }

        if (!data.confirmPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Confirm Password must be present.',
            });
        }

        if (typeof data.confirmPassword !== 'string') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Confirm Password  is not in string type.',
            });
        }

        if (data.confirmPassword !== data.newPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'New Password does not match confirm password.',
            });
        }

        if (data.currentPassword === data.newPassword) {
            return sendErrorResponse(req, res, {
                code: 400,
                message:
                    'New password should not be the same as current password.',
            });
        }

        const user = await UserService.changePassword(data);
        const userObj = {
            id: user._id,
            name: user.name,
            email: user.email,
            redirect: data.redirect,
            tokens: {
                jwtAccessToken: `${jwt.sign(
                    {
                        id: user._id,
                    },
                    jwtSecretKey,
                    { expiresIn: 8640000 }
                )}`,
                jwtRefreshToken: user.jwtRefreshToken,
            },
        };
        return sendItemResponse(req, res, userObj);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Get Previous User Settings.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id};
// Returns: 200: Success, 400: Error; 500: Server Error.
router.get('/profile', getUser, async function(req, res) {
    try {
        const userId = req.user ? req.user.id : null;

        if (!userId) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'UserId must be present.',
            });
        }
        // Call the UserService
        const user = await UserService.findOneBy({ _id: userId });
        const userObj = {
            id: user._id,
            name: user.name ? user.name : '',
            email: user.email ? user.email : '',
            companyName: user.companyName,
            companyRole: user.companyRole,
            companySize: user.companySize,
            referral: user.referral,
            isVerified: user.isVerified,
            twoFactorAuthEnabled: user.twoFactorAuthEnabled,
            backupCodes: user.backupCodes,
            companyPhoneNumber: user.companyPhoneNumber
                ? user.companyPhoneNumber
                : '',
            alertPhoneNumber: user.alertPhoneNumber
                ? user.alertPhoneNumber
                : '',
            profilePic: user.profilePic,
            timezone: user.timezone ? user.timezone : '',
            tokens: {
                jwtAccessToken: `${jwt.sign(
                    {
                        id: user._id,
                    },
                    jwtSecretKey,
                    { expiresIn: 8640000 }
                )}`,
                jwtRefreshToken: user.jwtRefreshToken,
            },
            tempEmail: user.tempEmail || null,
            tempAlertPhoneNumber: user.tempAlertPhoneNumber || null,
        };
        return sendItemResponse(req, res, userObj);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/confirmation/:token', async function(req, res) {
    try {
        if (req.params && req.params.token) {
            const token = await VerificationTokenModel.findOne({
                token: req.params.token,
            });
            if (!token) {
                return res.redirect(
                    global.accountsHost +
                        '/user-verify/resend?status=link-expired'
                );
            }
            const user = await UserModel.findOne({
                _id: token.userId,
            });
            if (!user) {
                return res.redirect(
                    global.accountsHost + '/register?status=user-not-found'
                );
            }
            if (
                user.isVerified &&
                (!user.tempEmail ||
                    (user.tempEmail && user.tempEmail === user.email))
            ) {
                return res.redirect(
                    global.accountsHost + '/login?status=already-verified'
                );
            }
            let dataUpdate = { isVerified: true };
            if (user.tempEmail && user.tempEmail !== user.email) {
                dataUpdate = {
                    isVerified: true,
                    email: user.tempEmail,
                    tempEmail: null,
                };
            }
            await UserModel.findByIdAndUpdate(user._id, {
                $set: dataUpdate,
            });
            return res.redirect(global.accountsHost + '/login?status=verified');
        } else {
            return res.redirect(
                global.accountsHost +
                    '/user-verify/resend?status=invalid-verification-link'
            );
        }
    } catch (error) {
        ErrorService.log('user.router.get(/confirmation/:token)', error);
        throw error;
    }
});

router.post('/resend', async function(req, res) {
    if (req.body && req.body.email) {
        const { email, userId } = req.body;
        let user;
        if (!userId) {
            user = await UserModel.findOne({ email });
            if (!user) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'No user associated with this account',
                });
            }
        } else {
            user = await UserModel.findOne({ _id: userId });
            if (!user) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'No user associated with this account',
                });
            }
            const checkUser = await UserModel.findOne({ email });
            if (checkUser && checkUser.id !== user.id) {
                return sendErrorResponse(req, res, {
                    code: 400,
                    message: 'User already registered with this email',
                });
            }
        }
        if (user.isVerified && user.email === email) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'User has already been verified.',
            });
        }
        const token = await UserService.sendToken(user, email);
        if (token) {
            res.status(200).send(
                `A verification email has been sent to ${user.email}`
            );
        }
    } else {
        return sendErrorResponse(req, res, {
            code: 400,
            message: 'Email should be present',
        });
    }
});

router.get('/users', getUser, isUserMasterAdmin, async function(req, res) {
    try {
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 10;
        const users = await UserService.getAllUsers(skip, limit);
        const count = await UserService.countBy({
            _id: { $ne: null },
            deleted: { $ne: null },
        });
        return sendListResponse(req, res, users, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.get('/users/:userId', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const userId = req.params.userId;
        const user = await UserService.findOneBy({
            _id: userId,
            deleted: { $ne: null },
        });

        return sendItemResponse(req, res, user);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.delete('/:userId', getUser, isUserMasterAdmin, async function(req, res) {
    try {
        const userId = req.params.userId;
        const masterUserId = req.user.id || null;
        const user = await UserService.deleteBy({ _id: userId }, masterUserId);
        return sendItemResponse(req, res, user);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:userId/restoreUser', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const userId = req.params.userId;
        const user = await UserService.restoreBy({
            _id: userId,
            deleted: true,
        });
        return sendItemResponse(req, res, user);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:userId/blockUser', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const userId = req.params.userId;
        const user = await UserService.updateOneBy(
            { _id: userId },
            { isBlocked: true }
        );
        return sendItemResponse(req, res, user);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.put('/:userId/unblockUser', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const userId = req.params.userId;
        const user = await UserService.updateOneBy(
            { _id: userId },
            { isBlocked: false }
        );
        return sendItemResponse(req, res, user);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/:userId/addNote', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const userId = req.params.userId;
        if (Array.isArray(req.body)) {
            const data = [];
            if (req.body.length > 0) {
                for (const val of req.body) {
                    if (!val._id) {
                        // Sanitize
                        if (!val.note) {
                            return sendErrorResponse(req, res, {
                                code: 400,
                                message: 'User note must be present.',
                            });
                        }

                        if (typeof val.note !== 'string') {
                            return sendErrorResponse(req, res, {
                                code: 400,
                                message: 'User note is not in string format.',
                            });
                        }
                    }
                    data.push(val);
                }

                const adminNotes = await UserService.addNotes(userId, data);
                return sendItemResponse(req, res, adminNotes);
            } else {
                const adminNotes = await UserService.addNotes(userId, data);
                return sendItemResponse(req, res, adminNotes);
            }
        } else {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'Admin notes are expected in array format.',
            });
        }
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

router.post('/users/search', getUser, isUserMasterAdmin, async function(
    req,
    res
) {
    try {
        const filter = req.body.filter;
        const skip = req.query.skip || 0;
        const limit = req.query.limit || 10;
        const users = await UserService.searchUsers(
            {
                deleted: { $ne: null },
                $or: [
                    { name: { $regex: new RegExp(filter), $options: 'i' } },
                    { email: { $regex: new RegExp(filter), $options: 'i' } },
                ],
            },
            skip,
            limit
        );
        const count = await UserService.countBy({
            deleted: { $ne: null },
            $or: [
                { name: { $regex: new RegExp(filter), $options: 'i' } },
                { email: { $regex: new RegExp(filter), $options: 'i' } },
            ],
        });

        return sendListResponse(req, res, users, count);
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

// Route
// Description: Delete user account.
// Params:
// Param 1: req.headers-> {authorization}; req.user-> {id};
// Returns: 200: Success, 400: Error; 401: Unauthorized; 500: Server Error.
router.delete('/:userId/delete', getUser, async function(req, res) {
    try {
        if (req.params.userId !== req.user.id) {
            return sendErrorResponse(req, res, {
                code: 401,
                message: 'You are unauthorized to access the page',
            });
        }
        const userId = req.user.id;
        const user = await UserService.findOneBy({ _id: userId });
        if (!user) {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'No user associated with this account',
            });
        }
        const { deleteMyAccount } = req.body;
        if (deleteMyAccount !== 'DELETE MY ACCOUNT') {
            return sendErrorResponse(req, res, {
                code: 400,
                message: 'No confirmation was provided by the user',
            });
        }

        const { projects } = user;
        projects
            .filter(project => {
                return project.users.find(
                    user =>
                        user.userId === userId &&
                        user.role === 'Owner' &&
                        project.users.length > 1
                );
            })
            .forEach(async project => {
                const { _id: projectId } = project;
                await ProjectService.exitProject(projectId, userId);
            });

        projects
            .filter(project => {
                return project.users.find(
                    user =>
                        (user.userId === userId && user.role !== 'Owner') ||
                        (user.userId === userId &&
                            user.role === 'Owner' &&
                            project.users.length === 1)
                );
            })
            .forEach(async project => {
                const { _id: projectId, users } = project;
                const user = users.find(user => user.userId === userId);
                if (user) {
                    if (user.role === 'Owner') {
                        await ProjectService.deleteBy(
                            { _id: projectId },
                            userId
                        );
                    } else {
                        await ProjectService.exitProject(projectId, userId);
                    }
                }
            });
        const deletedUser = await UserService.deleteBy({ _id: userId }, userId);
        return sendItemResponse(req, res, { user: deletedUser });
    } catch (error) {
        return sendErrorResponse(req, res, error);
    }
});

module.exports = router;
