import React from "react";
import { connect } from "react-redux";
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

export class RecordingControlsComponent extends React.Component {
  constructor(props) {
    super(props);
    // recording states: INPROGRESS, PAUSED, NOTSTARTED, NOTAVAILABLE, NOTKNOWN
    this.state = {
      conferenceSid: null,
      recordingStatus: RecordingControlsStatus.NOTKNOWN,
      recordingSid: null,
      recordingMessage: "Status not known"
    };
  }

  fetchRecording = (action, fetchCount) => {
    if(this.state.conferenceSid === null){
      console.error("Cannot fetch recording details as conferenceSid is null");
      return;
    }
    let url = `${this.props.serviceBaseUrl}/recording-control-current`;
    let payload ={
      action: action,
      conferenceSid: this.state.conferenceSid,
      recordingSid: this.state.recordingSid,
      Token: this.props.userToken
    };
    fetch(url, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {
      if(result.status === RecordingControlsStatus.NOTAVAILABLE && fetchCount < 5){
          setTimeout(()=>{this.fetchRecording(action, fetchCount++)}, 2000);
      }
      else 
      {
        switch(result.status){
          case RecordingControlsFetchResultAction.INPROGRESS:
          case RecordingControlsFetchResultAction.RESUMED:
            this.setState({
              recordingSid: result.recordingSid,
              recordingMessage: "Recording in Progress",
              recordingStatus: RecordingControlsStatus.INPROGRESS
            })
            break;
          case RecordingControlsFetchResultAction.PAUSED:
            this.setState({
              recordingSid: result.recordingSid,
              recordingMessage: "Recording paused",
              recordingStatus: RecordingControlsStatus.PAUSED
            })
            break;
          case RecordingControlsFetchResultAction.DISABLED:
            this.setState({
              recordingSid: null,
              recordingMessage: "Recording controls are currently disabled",
              recordingStatus: RecordingControlsStatus.DISABLED
            })
            break;
          default:
            break;
        }
      }
    })
    .catch(err => {
      console.error("FETCH_ERR:***************" + JSON.stringify(err))
    });
  }

  manageState = () => {
    let { conference, task } = this.props;
    var confsid = this.state.conferenceSid;
    if(confsid===null){
      if(conference.source.sid !== undefined){ 
          confsid = task.source.attributes.conference.sid;
      }
    }
    switch(this.state.recordingStatus){
      case RecordingControlsStatus.NOTKNOWN:
        if(confsid!==null){
          this.setState({
            recordingStatus: RecordingControlsStatus.GETTINGINFO,
            conferenceSid: confsid,
            recordingMessage: "Getting recording status"
          })
        }
        break;
      case RecordingControlsStatus.GETTINGINFO:
        //console.error("CALL FETCH")
        this.fetchRecording(RecordingControlsFetchAction.INFO, 0);
        break;
      default:
        break;
    }
  }

  shouldComponentUpdate(nextprops, nextstate) {
    var rtn = false;
    if(this.state!==nextstate){
      rtn = true;
    }
    if(this.props!==nextprops){
      var diffProps = Object.keys(this.props).filter(k => this.props[k] !== nextprops[k]);
      if(diffProps.includes("conference")){
        var diffConf = Object.keys(this.props.conference).filter(q => this.props.conference[q] !== nextprops.conference[q]);
        if(diffConf.includes("source")){
          rtn = true;
        }
      }
    }
    console.log("update="+rtn);
    return rtn;
  }

  simpleButton = (value, cssClass, action, showWhen) => {
    
    if(!showWhen.includes(this.state.recordingStatus)){
      return null;
    } else {
       return (
        <span id={"RecordingControlButton-" + action}>
                  <button
                    className={cssClass}
                    onClick={m => this.fetchRecording(action, 0)}>
                    {value}
                  </button>
               </span>
       );
    }
  };

  render() {
      this.manageState();
      return (
        <RecordingControlStyles>
        <div id="RecordingControls" key="RecordingControls" className="outer">
          <div id="RecordingControlsStatus" className="inner">
            <div id="RecordingControlTitle" className="title">
              <span className="Twilio">
                  {this.state.recordingMessage}
                </span>
              </div>
              <div id="RecordingControlsButtons" className="firstline">
                {this.simpleButton("Resume", "btn-recording-control", RecordingControlsFetchAction.RESUME, RecordingControlsStatus.PAUSED)}
                {this.simpleButton("Pause", "btn-recording-control", RecordingControlsFetchAction.PAUSE, RecordingControlsStatus.INPROGRESS)}   
              </div>
          </div>
        </div>
        </RecordingControlStyles>
      );
  
  }
}

const mapStateToProps = state => {
  return {
    serviceBaseUrl: `https://${state.flex.config.serviceBaseUrl}`,
    phoneCallActive: state.flex.phone.connection ? true : false,
    userToken: state.flex.session.ssoTokenPayload.token
  };
};

export default connect(mapStateToProps)(RecordingControlsComponent);