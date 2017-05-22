import React, { Component } from 'react'
import moment from 'moment'
import Modal from 'react-bootstrap-modal'

import InfiniteTable from 'components/shared/InfiniteTable'
import { Header, CloseButton } from 'components/modal/parts'

export default class MonitorHistoryModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }

    this.cells = [{
      'displayName': 'Date/Time',
      'columnName': 'timestamp',
      'cssClassName': 'width-140',
      'customComponent': (props) => {
        return <span>{moment(props.data).format('YYYY-MM-DD HH:mm:ss')}</span>
      }
    }, {
      'displayName': 'Status',
      'columnName': 'lastResult.status',
      'cssClassName': 'width-80 text-center',
      'customComponent': props => {
        const val = props.rowData.eventType === 'AGENT' ? 'UP' : props.data
        let cls = 'fa-question'
        let color = '#FDB422'
        if (val === 'UP') {
          cls = 'fa-check-square'
          color = 'green'
        } else if (val === 'DOWN') {
          cls = 'fa-times'
          color = 'red'
        }
        return <i className={`fa ${cls}`} style={{color: color, fontSize: '20px', verticalAlign: 'middle'}} />
      }
    }, {
      'displayName': 'Response',
      'columnName': 'lastResult.resultdata',
      'customComponent': props => {
        if (props.rowData.eventType === 'AGENT') {
          return <span>{JSON.stringify(props.rowData.dataobj)}</span>
        }
        return <span>{JSON.stringify(props.rowData.lastResult)}</span>
      }
    }]
  }

  onClickClose () {
    this.props.onClose && this.props.onClose(this)
  }

  render () {
    const params = {
      monitorid: this.props.device.uid,
      sort: 'timestamp,desc'
    }

    return (
      <Modal show onHide={this.onClickClose.bind(this)} aria-labelledby="ModalHeader"
        className="bootstrap-dialog type-primary modal-750">
        <Header name="Monitor History" />
        <div className="modal-body bootstrap-dialog-message small-modal-table">
          <div style={{height: '400px', position: 'relative'}}>
            <InfiniteTable
              id="table"
              url="/event/search/findBy"
              params={params}
              cells={this.cells}
              rowMetadata={{'key': 'id'}}
            />
          </div>
        </div>
        <div className="padding-md-bottom">
          <CloseButton onClose={this.onClickClose.bind(this)} />
        </div>
      </Modal>
    )
  }
}

MonitorHistoryModal.defaultProps = {
  onClose: null,
  device: {}
}
