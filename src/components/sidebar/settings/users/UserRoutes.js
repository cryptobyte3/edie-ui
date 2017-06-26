import React from 'react'
import { Switch } from 'react-router'
import { Route } from 'react-router-dom'

import SettingUsersContainer from 'containers/settings/users/UsersContainer'
import SettingCredentialsContainer from 'containers/settings/credentials/CredentialsContainer'

export default class UserRoutes extends React.Component {
  render () {
    return (
      <Switch>
        <Route path="/settings/users" exact component={SettingUsersContainer} />
        <Route path="/settings/users/credentials" component={SettingCredentialsContainer} />
      </Switch>
    )
  }
}
