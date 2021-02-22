import { createStore, applyMiddleware, compose } from 'redux';
import { createLogger } from 'redux-logger';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import queryString from 'query-string';
import { createBrowserHistory, createMemoryHistory } from 'history';
// import createHistory from 'history/createBrowserHistory';
import rootReducer from './reducers';

// A nice helper to tell us if we're on the server
export const isServer = !(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
);
// export const history = createHistory();
const url = '/';
export const history = isServer
    ? createMemoryHistory({ initialEntries: [url] })
    : createBrowserHistory();

export const removeQuery = () => {
    const location = Object.assign({}, history.location);
    const query = queryString.parse(location.search);
    if (!query.token) delete location.search;
    history.push(location);
};
const initialState = {};
const enhancers = [];
const logger = createLogger();
const middleware = [thunk, routerMiddleware(history)];

if (process.env.NODE_ENV === 'development') {
    let devToolsExtension;
    if (!isServer) {
        devToolsExtension = window.devToolsExtension;
    }
    middleware.push(logger);

    if (typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension());
    }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export default createStore(rootReducer, initialState, composedEnhancers);
