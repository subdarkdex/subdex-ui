import React from 'react'
import { Popup } from 'semantic-ui-react'
import SettingsOutlinedIcon from '@material-ui/icons/SettingsOutlined'

const Settings = () => {
  return (
    <Popup trigger={<SettingsOutlinedIcon fontSize={'large'} style={{ marginLeft: 10 }} />} hoverable>
      Place holder
    </Popup>
  )
}

export default Settings
