import { default as styled } from 'react-emotion';

const RecordingControlsStatus = {
    INPROGRESS: "INPROGRESS",
    PAUSED: "PAUSED",
    NOTAVAILABLE: "NOTAVAILABLE",
    NOTKNOWN: "NOTKNOWN",
    GETTINGINFO: "GETTINGINFO",
    DISABLED: "DISABLED"
  } 
  
  const RecordingControlsFetchAction = {
    INFO: "INFO",
    PAUSE: "paused",
    RESUME: "in-progress"
  }
  
  const RecordingControlsFetchResultAction = {
    DISABLED: "DISABLED",
    NOTAVAILABLE: "NOTAVAILABLE",
    INPROGRESS: "processing",
    PAUSED: "paused",
    RESUMED: "in-progress"
  }
  
  const RecordingControlStyles = styled('div')`
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      -webkit-box-align: center;
      align-items: center;
      -webkit-box-pack: center;
      justify-content: center;
      align-content: center;
      flex: 1 1 0%;
  
    .outer {
      display: flex;
      flex-wrap: nowrap;
      -webkit-box-flex: 1;
      flex-grow: 1;
      flex-shrink: 1;
      flex-direction: column;
      overflow: hidden;
      align: center;
    }
    
    .inner {
      text-align: center;
      margin: auto;
    }
    
    .title {
      font-size: 12px;
      margin-bottom: 15px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    
    .firstline {
       font-size: 16px;
      font-weight: bold;
      margin-bottom: 2px;
      margin-left: 4px;
      margin-right: 4px;
    }
    
    .secondline {
      font-size: 12px;
      margin-bottom: 0px;
      margin-top: 0px;
      color: rgb(96, 100, 113);
    }

    button.btn-recording-control {
        margin: 10px;
        padding: 17px 28px;
        font-size: 2em;
        font-weight: bold;
        background-color: rgb(41, 123, 241);
        color: rgb(255, 255, 255);
        border: solid 1px #666;
        cursor: pointer;
    }
    
    button.btn-recording-control:hover  {
        background-color: #e7e7e7;
        color: black;
    } 
    `;

export { 
    RecordingControlsStatus, 
    RecordingControlsFetchAction, 
    RecordingControlsFetchResultAction, 
    RecordingControlStyles
};