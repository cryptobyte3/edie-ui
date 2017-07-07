import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import Collectors from 'components/sidebar/settings/collector/Collectors'

import {
  showCollectorModal
} from 'actions'

class CollectorsContainer extends React.Component {
  render () {
    return (
      <Collectors {...this.props} />
    )
  }
}
export default connect(
  state => ({
    collectorDraw: state.settings.collectorDraw,
    collectorModalOpen: state.settings.collectorModalOpen,
    editCollector: state.settings.editCollector
  }),{
    showCollectorModal
  }
)(withRouter(CollectorsContainer))

