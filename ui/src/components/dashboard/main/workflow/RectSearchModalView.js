import React from 'react'
import InfiniteTable from 'components/common/InfiniteTable'

import {Modal, CardPanel} from 'components/modal/parts'
import {renderEntity, getHighlighted} from 'components/common/CellRenderers'

export default class RectSearchModalView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      allExpanded: false,
      total: 0
    }
    this.cells = [{
      'displayName': ' ',
      'columnName': 'entity.id',
      'customComponent': (p) => {
        const {rowData} = p
        const {entity} = rowData
        if (!entity) return <span/>

        const highlighted = getHighlighted(entity, rowData.highlights)

        const timeField = entity.startTimestamp ? 'startTimestamp' : 'timestamp'
        delete highlighted[timeField]

        const {severity, ...others} = highlighted
        const data = {
          type: rowData.type,
          [timeField]: entity[timeField],
          severity,
          ...others
        }
        if (!severity) delete data.severity

        const options = {
          notNull: true,
          timeField,
          limit: 0
        }
        const ret = renderEntity(data, options)
        return ret
      }
    }]

    this.onResultCountUpdate = this.onResultCountUpdate.bind(this)
  }

  onClickToggleExpand () {

  }

  onResultCountUpdate () {

  }

  render () {
    const {onHide, name, params, onRowDblClick} = this.props
    return (
      <Modal title="Search Result" onRequestClose={onHide} contentStyle={{width: '90%', maxWidth: 'initial'}}>
        <CardPanel title="Result">
          <div className="header-red">
            {name}
            <div className="pull-right">
              <div className="link margin-md-right" onClick={this.onClickToggleExpand}>
                {this.state.allExpanded ? 'Collapse All' : 'Expand All'}
              </div>
              Total: {this.state.total}
            </div>
          </div>
          <div style={{height: 500, position: 'relative'}}>
            <InfiniteTable
              url="/search/query"
              cells={this.cells}
              ref="table"
              rowMetadata={{'key': 'id'}}
              onRowDblClick={onRowDblClick}
              params={params}
              pageSize={10}
              showTableHeading={false}
              selectable
              onUpdateCount={this.onResultCountUpdate}
            />
          </div>
        </CardPanel>
      </Modal>
    )
  }
}
