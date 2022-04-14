import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Field, reduxForm } from 'redux-form';
import RenderCountrySelector from '../basic/CountrySelector';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Fade } from 'react-awesome-reveal';
import { RenderField } from '../basic/RenderField';
import { PricingPlan, Validate, env } from '../../config';
import { ButtonSpinner } from '../basic/Loader.js';
import { openModal, closeModal } from 'CommonUI/actions/modal';
import ExtraCharge from '../modals/ExtraCharge';


import { v4 as uuidv4 } from 'uuid';
import {
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    injectStripe,
    StripeProvider,
    Elements,

} from '@stripe/react-stripe-js';
import {
    addCard,
    addCardSuccess,
    addCardFailed,
    addCardRequest,
    signUpRequest,
    signupError,
    signupSuccess,
    signupUser,
} from '../../actions/register';

const createOptions: Function = () => {
    return {
        style: {
            base: {
                color: '#000000',
                fontFamily: 'Camphor, Segoe UI, Open Sans, sans-serif',
                fontSize: '18px',
                letterSpacing: '0.025em',
                '::placeholder': {
                    color: '#bbb',
                    fontSize: '18px',
                },
            },
            invalid: {
                color: '#c23d4b',
            },
        },
    };
};

const errorStyle = {
    color: '#c23d4b',
};

interface CardFormProps {
    openModal?: Function;
    handleSubmit: Function;
    submitForm: Function;
    register: object;
    planId: string;
    stripe?: object;
    addCard: Function;
    signUpRequest: Function;
    signupError: Function;
    signupSuccess: Function;
    signupUser: Function;
    formValues?: object;
}

class CardForm extends Component<ComponentProps> {
    plan: $TSFixMe;
    /* This state holds error 
    messages for cardNumber,
    cardCVC, cardExpiry */
    state = {
        cardNumber: '',
        cardCvc: '',
        cardExpiry: '',
        registerModal: uuidv4(),
    };

    handleChange = (event: $TSFixMe) => {
        const { error, empty } = event;
        if (empty) {
            this.setState({
                [event.elementType]: 'Required.',
            });
        }
        if (error) {
            this.setState({
                [event.elementType]: error.message,
            });
        }
        if (!error && !empty) {
            this.setState({
                [event.elementType]: '',
            });
        }
    };

    handleClick = () => {
        const { registerModal } = this.state;

        this.props.openModal({
            id: registerModal,
            onClose: () => '',
            content: ExtraCharge,
        });
    };

    handleSubmit = (values: $TSFixMe) => {
        const {

            stripe,

            addCard,

            signUpRequest,

            signupUser,

            signupSuccess,

            signupError,
        } = this.props;

        const { user, planId } = this.props.register;
        const { email, companyName } = user;
        if (stripe) {
            signUpRequest();
            stripe
                .createToken()
                .then(({
                    token
                }: $TSFixMe) => {
                    if (token) {
                        return addCard({
                            tokenId: token.id,
                            email,
                            companyName,
                        });
                    } else {
                        throw new Error('Your card details are incorrect.');
                    }
                })
                .then(({
                    data
                }: $TSFixMe) =>
                    stripe.handleCardPayment(data.client_secret)
                )
                .then((data: $TSFixMe) => {
                    if (data.paymentIntent)
                        return signupUser({
                            ...user,
                            ...values,
                            planId,
                            paymentIntent: data.paymentIntent,
                        });
                    else throw new Error(data.error.message);
                })
                .then(({
                    data
                }: $TSFixMe) => {
                    signupSuccess(data);
                })
                .catch((error: $TSFixMe) => {
                    signupError(error.message);
                });
        } else {
            signupError(
                'Problem connnecting to payment gateway, please try again later'
            );
        }
    };

    override render() {

        this.plan = PricingPlan.getPlanById(this.props.planId);

        const { handleSubmit } = this.props;

        const registerError = this.props.register.error;
        let header;
        if (registerError) {
            header = (
                <span id="error" style={errorStyle}>
                    {registerError}
                </span>
            );
        } else {
            header = <span>Enter your card details</span>;
        }
        return (
            <Fade>
                <div id="main-body" className="box css" style={{ width: 500 }}>
                    <div className="inner">
                        <div className="title extra">
                            <div>
                                <h2>{header}</h2>
                                <p>
                                    Your card will be charged $1.00 to check its
                                    billability.{' '}

                                    <span key={() => uuidv4()}></span>
                                    <span
                                        style={{
                                            color: 'green',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                        }}
                                        onClick={this.handleClick}
                                    >
                                        Learn Why?
                                    </span>
                                    <br></br> You will be charged $
                                    {this.plan.amount}/
                                    {this.plan.type === 'month' ? 'mo' : 'yr'}{' '}
                                    after your 14 day free trial.
                                </p>
                            </div>
                        </div>
                        <form
                            id="card-form"
                            onSubmit={handleSubmit(this.handleSubmit)}
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
                                        <label htmlFor="cardName">
                                            Card Holder Name
                                        </label>
                                        <Field
                                            type="text"
                                            name="cardName"
                                            id="cardName"
                                            placeholder="Card Holder Name"
                                            component={RenderField}
                                            required="required"
                                        />
                                    </span>
                                </p>
                                <p
                                    className="text"
                                    style={{
                                        display: 'block',
                                        marginTop: 0,
                                        width: 222,
                                    }}
                                >
                                    <span>
                                        <label htmlFor="cardNumber">
                                            Card Number
                                        </label>
                                        <div
                                            style={{
                                                border: '1px solid #bbb',
                                                height: 44,
                                                padding: '10px 12px',
                                            }}
                                        >
                                            <CardNumberElement
                                                {...createOptions()}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                        <span style={errorStyle}>
                                            {this.state.cardNumber}
                                        </span>
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
                                        width: 222,
                                    }}
                                >
                                    <span>
                                        <label htmlFor="cvv">CVC</label>
                                        <div
                                            style={{
                                                border: '1px solid #bbb',
                                                height: 44,
                                                padding: '10px 12px',
                                            }}
                                        >
                                            <CardCVCElement
                                                {...createOptions()}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                        <span style={errorStyle}>
                                            {this.state.cardCvc}
                                        </span>
                                    </span>
                                </p>
                                <p
                                    className="text"
                                    style={{
                                        display: 'block',
                                        maxWidth: '50%',
                                        marginTop: 0,
                                        width: 222,
                                    }}
                                >
                                    <span>
                                        <label htmlFor="expiry">
                                            Expiry Date
                                        </label>
                                        <div
                                            style={{
                                                border: '1px solid #bbb',
                                                height: 44,
                                                padding: '10px 12px',
                                            }}
                                        >
                                            <CardExpiryElement
                                                {...createOptions()}
                                                onChange={this.handleChange}
                                            />
                                        </div>
                                        <span style={errorStyle}>
                                            {this.state.cardExpiry}
                                        </span>
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
                                        <label htmlFor="address1">
                                            Street Address 1
                                        </label>
                                        <Field
                                            type="text"
                                            component={RenderField}
                                            name="address1"
                                            id="address1"
                                            placeholder="Street Address 1"
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
                                        <label htmlFor="address2">
                                            Street Address 2
                                        </label>
                                        <Field
                                            type="text"
                                            component={RenderField}
                                            name="address2"
                                            id="address2"
                                            placeholder="Street Address 2"
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
                                        <label htmlFor="city">City</label>
                                        <Field
                                            type="text"
                                            component={RenderField}
                                            name="city"
                                            id="city"
                                            placeholder="City"
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
                                        <label htmlFor="state">State</label>
                                        <Field
                                            type="text"
                                            component={RenderField}
                                            name="state"
                                            id="state"
                                            placeholder="State (Optional)"
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
                                        <label htmlFor="zipCode">
                                            Zip Code / Postal Code
                                        </label>
                                        <Field
                                            type="text"
                                            component={RenderField}
                                            name="zipCode"
                                            id="zipCode"
                                            placeholder="Zip Code or Postal Code"
                                            required="required"
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
                                        <label htmlFor="country">Country</label>
                                        <Field
                                            type="text"
                                            component={RenderCountrySelector}
                                            name="country"
                                            id="country"
                                            placeholder="Select Country"
                                            required="required"
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
                                        marginBottom: 30,
                                    }}
                                >
                                    <span>
                                        <label htmlFor="promocode">
                                            Promo Code
                                        </label>
                                        <Field
                                            type="text"
                                            component={RenderField}
                                            name="promocode"
                                            id="promocode"
                                            placeholder="Promocode (Optional)"
                                        />
                                    </span>
                                </p>
                            </div>
                            <div>
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

                                            this.props.register.requesting
                                        }
                                    >

                                        {!this.props.register.requesting && (
                                            <span>
                                                Create OneUptime Account
                                            </span>
                                        )}

                                        {this.props.register.requesting && (
                                            <ButtonSpinner />
                                        )}
                                    </button>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </Fade>
        );
    }
}


CardForm.displayName = 'CardForm';

const validate = function (values: $TSFixMe) {
    const errors = {};

    if (!Validate.text(values.cardName)) {

        errors.cardName = 'Name is required.';
    }

    if (!Validate.text(values.city)) {

        errors.city = 'City is required.';
    }

    if (!Validate.text(values.zipCode)) {

        errors.zipCode = 'Zip Code or Postal Code is required.';
    }

    if (!Validate.text(values.country)) {

        errors.country = 'Country is required.';
    }

    if (!Validate.postalCode(values.zipCode)) {

        errors.zipCode = 'Postal Code or Zip Code is invalid.';
    }

    return errors;
};

const cardForm = reduxForm({
    form: 'CardForm', // <------ same form name                     // <----- validate form data
    destroyOnUnmount: true, // <------ preserve form data
    forceUnregisterOnUnmount: true, // <------ unregister fields on unmount
    validate,
})(CardForm);

const mapDispatchToProps: Function = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            addCard,
            addCardSuccess,
            addCardFailed,
            addCardRequest,
            openModal,
            closeModal,
            signUpRequest,
            signupUser,
            signupError,
            signupSuccess,
        },
        dispatch
    );
};

function mapStateToProps(state: RootState) {
    return {
        register: state.register,
        addCard: state.register.addCard,
        formValues:
            state.form && state.form.CardForm && state.form.CardForm.values,
    };
}


CardForm.propTypes = {
    openModal: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired,
    register: PropTypes.object.isRequired,
    planId: PropTypes.string.isRequired,
    stripe: PropTypes.object,
    addCard: PropTypes.func.isRequired,
    signUpRequest: PropTypes.func.isRequired,
    signupError: PropTypes.func.isRequired,
    signupSuccess: PropTypes.func.isRequired,
    signupUser: PropTypes.func.isRequired,
    formValues: PropTypes.object,
};

const CardFormWithCheckOut = injectStripe(
    connect(mapStateToProps, mapDispatchToProps)(cardForm)
);
CardFormWithCheckOut.displayName = 'CardFormWithCheckOut';

export default class CardFormHOC extends Component<ComponentProps>{
    public static displayName = '';
    public static propTypes = {};

    override render() {
        return (
            <StripeProvider apiKey={env('STRIPE_PUBLIC_KEY')} >
                <Elements>
                    <CardFormWithCheckOut />
                </Elements>
            </StripeProvider>
        );
    }
}


CardFormHOC.displayName = 'CardFormHOC';
