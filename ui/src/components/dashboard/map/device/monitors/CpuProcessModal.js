import React from 'react'
import CpuProcessModalView from './CpuProcessModalView'

export default class CpuProcessModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
    }
    this.columns = [{
      'displayName': 'Name',
      'columnName': 'Filename',
      'cssClassName': 'width-180'
    }, {
      'displayName': 'Id',
      'columnName': 'Id',
      'cssClassName': 'width-80'
    }, {
      'displayName': 'Owner',
      'columnName': 'Owner',
      'cssClassName': 'width-220'
    }, {
      'displayName': 'Parent',
      'columnName': 'Parent',
      'cssClassName': 'width-120'
    }, {
      'displayName': 'Location',
      'columnName': 'Location'
    }]
  }
  onClickClose () {
    this.props.showDeviceCpuProcessModal(false)
  }
  render () {
    return (
      <CpuProcessModalView
        onHide={this.onClickClose.bind(this)}
      />
    )
  }
}
