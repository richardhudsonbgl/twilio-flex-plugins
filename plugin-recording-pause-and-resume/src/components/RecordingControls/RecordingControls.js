import React from 'react';

import RecordingControlsComponent from './RecordingControls.Component';
  
export class RecordingControls{

  Setup = (flex, manager) => {
    flex.TaskCanvasTabs.Content
         .add(
            <RecordingControlsComponent label="Recording" key="recordingControls"/>,
         {
            if: props => props.task.source.taskChannelUniqueName === "voice" 
            && props.task.status === "accepted"
         });
  }
}

const recordingControls = new RecordingControls();

export default recordingControls;