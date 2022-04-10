import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Validate } from '../../config';
import { RenderField } from '../basic/RenderField';
import { ButtonSpinner } from '../basic/Loader.js';
import { removeQuery, RootState } from '../../store';

import queryString from 'query-string';

import { getEmailFromToken } from '../../actions/register';

interface UserFormProps {
    submitForm: Function;
    handleSubmit: Function;
    register: object;
    location: object;
    getEmailFromToken?: Function;
    initialValues?: object;
}

class UserForm extends Component<ComponentProps> {
    state = {
        serverResponse: '',
    };

    override componentDidMount() {

        const query = queryString.parse(this.props.location.search);

        if (query && query.status === 'user-not-found') {
            this.setState({
                serverResponse: 'No user found for this token',
            });
        }


        removeQuery();

        this.props.getEmailFromToken(query.token);
    }

    override render() {
        const { serverResponse } = this.state;
        return (
            <div id="main-body" className="box css" style={{ width: 500 }}>
                <div className="inner">
                    <div className="title extra">
                        <h2>
                            {serverResponse ? (
                                <span>{serverResponse}</span>
                            ) : (
                                <span>
                                    {' '}

                                    {this.props.register.error ? (
                                        <span id="error-msg" className="error">

                                            {this.props.register.error}
                                        </span>
                                    ) : (
                                        'Create your OneUptime account'
                                    )}{' '}
                                </span>
                            )}
                        </h2>
                    </div>
                    <form

                        onSubmit={this.props.handleSubmit(

                            this.props.submitForm
                        )}
                    >
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <p
                                className="text"
                                style={{
                                    display: 'block',
                                    maxWidth: '50%',
                                    marginTop: 0,
                                }}
                            >
                                <span>
                                    <label htmlFor="email">Email</label>
                                    <Field
                                        type="email"
                                        id="email"
                                        name="email"
                                        component={RenderField}
                                        placeholder="jeff@example.com"
                                        required="required"
                                        value={

                                            this.props.register.user.email || ''
                                        }
                                        disabled={

                                            this.props.initialValues &&

                                            this.props.initialValues.email
                                        }
                                    />
                                </span>
                            </p>
                            <p
                                className="text"
                                style={{
                                    display: 'block',
                                    maxWidth: '50%',
                                    marginTop: 0,
                                }}
                            >
                                <span>
                                    <label htmlFor="name">Full Name</label>
                                    <Field
                                        type="text"
                                        component={RenderField}
                                        name="name"
                                        id="name"
                                        placeholder="Jeff Smith"
                                        required="required"
                                        value={

                                            this.props.register.user.name || ''
                                        }
                                    />
                                </span>
                            </p>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <p
                                className="text"
                                style={{
                                    display: 'block',
                                    maxWidth: '50%',
                                    marginTop: 0,
                                }}
                            >
                                <span>
                                    <label htmlFor="companyName">
                                        Company Name
                                    </label>
                                    <Field
                                        type="text"
                                        name="companyName"
                                        id="companyName"
                                        component={RenderField}
                                        placeholder="Company Name"
                                    />
                                </span>
                            </p>
                            <p
                                className="text"
                                style={{
                                    display: 'block',
                                    maxWidth: '50%',
                                    marginTop: 0,
                                }}
                            >
                                <span>
                                    <label htmlFor="companyPhoneNumber">
                                        Phone Number
                                    </label>
                                    <Field
                                        type="text"
                                        component={RenderField}
                                        name="companyPhoneNumber"
                                        id="companyPhoneNumber"
                                        placeholder="+1-123-456-7890"
                                    />
                                </span>
                            </p>
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                            }}
                        >
                            <p
                                className="text"
                                style={{
                                    display: 'block',
                                    maxWidth: '50%',
                                    marginTop: 0,
                                }}
                            >
                                <span>
                                    <label htmlFor="password">Password</label>
                                    <Field
                                        type="password"
                                        component={RenderField}
                                        name="password"
                                        id="password"
                                        placeholder="Your Password"
                                        className="password-strength-input"
                                        required="required"
                                        value={

                                            this.props.register.user.password ||
                                            ''
                                        }
                                    />
                                </span>
                            </p>
                            <p
                                className="text"
                                style={{
                                    display: 'block',
                                    maxWidth: '50%',
                                    marginTop: 0,
                                }}
                            >
                                <span>
                                    <label htmlFor="confirmPassword">
                                        Confirm Password
                                    </label>
                                    <Field
                                        type="password"
                                        component={RenderField}
                                        name="confirmPassword"
                                        id="confirmPassword"
                                        placeholder="Confirm Password"
                                        required="required"
                                        value={

                                            this.props.register.user
                                                .confirmPassword || ''
                                        }
                                    />
                                </span>
                            </p>
                        </div>

                        <p
                            className="submit"
                            style={{ width: '100%', maxWidth: '100%' }}
                        >
                            <button
                                style={{ width: '100%' }}
                                type="submit"
                                className="button blue medium"
                                id="create-account-button"
                                disabled={

                                    this.props.register &&

                                    ((this.props.register.isUserInvited &&

                                        this.props.register.isUserInvited
                                            .requesting) ||

                                        this.props.register.requesting)
                                }
                            >

                                {this.props.register &&

                                    ((this.props.register.isUserInvited &&

                                        this.props.register.isUserInvited
                                            .requesting) ||

                                        this.props.register.requesting) ? (
                                    <ButtonSpinner />
                                ) : (
                                    <span>Sign Up</span>
                                )}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        );
    }
}


UserForm.displayName = 'UserForm';

const validate = function (values: $TSFixMe) {
    const error = {};


    if (!Validate.text(values.name)) error.name = 'Name is required.';

    if (Validate.text(values.name) && !Validate.isValidName(values.name))

        error.name = 'Name is not valid.';


    if (!Validate.text(values.email)) error.email = 'Email is required.';

    if (Validate.text(values.email) && !Validate.email(values.email))

        error.email = 'Email is not valid.';

    if (
        !Validate.isValidBusinessEmail(values.email) &&
        Validate.email(values.email)
    )

        error.email = 'Please enter a business email address.';

    if (!Validate.text(values.companyName))

        error.companyName = 'Company name is required.';

    if (!Validate.text(values.companyPhoneNumber))

        error.companyPhoneNumber = 'Phone number is required.';

    if (
        Validate.text(values.companyPhoneNumber) &&
        !Validate.isValidNumber(values.companyPhoneNumber)
    )

        error.companyPhoneNumber = 'Phone number is invalid.';

    if (!Validate.text(values.password))

        error.password = 'Password is required.';
    if (
        Validate.text(values.password) &&
        !Validate.isStrongPassword(values.password)
    ) {

        error.password = 'Password should be atleast 8 characters long';
    }

    if (!Validate.text(values.confirmPassword))

        error.confirmPassword = 'Confirm Password is required.';

    if (!Validate.compare(values.password, values.confirmPassword)) {

        error.confirmPassword = 'Password and confirm password should match.';
    }

    return error;
};

const userForm = reduxForm({
    form: 'UserSignupForm', // <------ same form name
    destroyOnUnmount: true,
    validate,
})(UserForm);

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators({ getEmailFromToken }, dispatch);
};

function mapStateToProps(state: RootState) {
    return {
        register: state.register,
        initialValues: state.register.email,
    };
}


UserForm.propTypes = {
    submitForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    register: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    getEmailFromToken: PropTypes.func,
    initialValues: PropTypes.object,
};

export default connect(mapStateToProps, mapDispatchToProps)(userForm);
