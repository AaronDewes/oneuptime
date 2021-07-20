import React, { Suspense, lazy } from 'react';
import './App.css';
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
const Main = lazy(() => import('./components/Main'));
const ScheduledEvent = lazy(() => import('./components/ScheduledEvent'));
const Incident = lazy(() => import('./components/Incident'));
const SingleAnnouncement = lazy(() =>
    import('./components/SingleAnnouncement')
);

const userId = queryString.parse(window.location.search).userId;
const accessToken = queryString.parse(window.location.search).accessToken;

if (userId && accessToken) {
    User.setUserId(userId);
    User.setAccessToken(accessToken);
    removeQuery();
}

const AppLoader = () => (
    <div
        id="app-loading"
        style={{
            position: 'fixed',
            top: '0',
            bottom: '0',
            left: '0',
            right: '0',
            zIndex: '999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <div style={{ transform: 'scale(2)' }}>
            <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="bs-Spinner-svg"
            >
                <ellipse
                    cx="12"
                    cy="12"
                    rx="10"
                    ry="10"
                    className="bs-Spinner-ellipse"
                ></ellipse>
            </svg>
        </div>
    </div>
);

const App = () => (
    <>
        <Socket />
        <Router>
            <Suspense fallback={<AppLoader />}>
                <Switch>
                    <Route exact path="/" component={Main} />
                    <Route exact path="/status-page" component={Main} />
                    <Route
                        exact
                        path="/status-page/:statusPageSlug"
                        component={Main}
                    />
                    <Route
                        exact
                        path="/status-page/:statusPageSlug/scheduledEvent/:eventId"
                        component={ScheduledEvent}
                    />
                    <Route
                        exact
                        path="/status-page/:statusPageSlug/incident/:incidentId"
                        component={Incident}
                    />
                    <Route
                        exact
                        path="/status-page/:statusPageSlug/announcement/:announcementSlug"
                        component={SingleAnnouncement}
                    />
                    <Redirect to="/" />
                </Switch>
            </Suspense>
        </Router>
    </>
);

App.displayName = 'App';

export default App;
