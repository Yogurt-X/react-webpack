import React from 'react'
import {
  observer,
  inject,
} from 'mobx-react'
import PropTypes from 'prop-types'
import { AppState } from '../../store/app-state'

// Provider中传递的属性叫什么名字,就inject什么
@inject('appState') @observer
export default class TopicList extends React.Component {
  componentDidMount() {
    // do something here
  }

  render() {
    return (
      <div>{this.props.appState.msg}</div>
    )
  }
}

TopicList.propTypes = {
  appState: PropTypes.instanceOf(AppState).isRequired,
}
