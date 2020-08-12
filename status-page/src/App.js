import React from 'react';
import './App.css';
import Main from './components/Main';
import ScheduledEvent from './components/ScheduledEvent';
import Socket from './components/basic/Socket';
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Redirect,
} from 'react-router-dom';
import { User } from './config';
import queryString from 'query-string';
import { removeQuery } from './store/store';

const userId = queryString.parse(window.location.search).userId;
const accessToken = queryString.parse(window.location.search).accessToken;

if (userId && accessToken) {
    User.setUserId(userId);
    User.setAccessToken(accessToken);
    removeQuery();
}

const App = () => (
    <>
        <Socket />
        <Router>
            <Switch>
                <Route exact path="/" component={Main} />
                <Route exact path="/status-page" component={Main} />
                <Route
                    exact
                    path="/status-page/:statusPageId"
                    component={Main}
                />
                <Route
                    exact
                    path="/status-page/:statusPageId/scheduledEvent/:eventId"
                    component={ScheduledEvent}
                />
                <Redirect to="/" />
            </Switch>
        </Router>
    </>
);

App.displayName = 'App';

export default App;
