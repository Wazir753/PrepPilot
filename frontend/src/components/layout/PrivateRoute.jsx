import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../common/Spinner';
import { ROUTES } from '../../utils/constants';

function PrivateRoute({ component: Component, adminOnly = false, ...rest }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (loading) {
          return (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <Spinner size="lg" />
            </div>
          );
        }

        if (!isAuthenticated) {
          return <Redirect to={{ pathname: ROUTES.LOGIN, state: { from: props.location } }} />;
        }

        if (adminOnly && !isAdmin) {
          return <Redirect to={ROUTES.DASHBOARD} />;
        }

        return <Component {...props} />;
      }}
    />
  );
}

PrivateRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  adminOnly: PropTypes.bool,
};

export default PrivateRoute;
