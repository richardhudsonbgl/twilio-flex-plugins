import React from "react";
import { connect } from "react-redux";
import {  
  RecordingControlsStatus, 
  RecordingControlsFetchAction, 
  RecordingControlsFetchResultAction, 
  RecordingControlStyles
} from "./RecordingControls.Constants";

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
          fetchCount++;
          setTimeout(()=>{this.fetchRecording(action, fetchCount)}, 2000);
      }
      else 
      {
        if(fetchCount >= 5){
          this.setState({
            recordingSid: null,
            recordingMessage: "Recording controls are currently not available",
            recordingStatus: RecordingControlsStatus.DISABLED
          });
        } else {
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
      }
    })
    .catch(err => {
      console.error("FETCH_ERR:***************" + JSON.stringify(err))
    });
  }

  manageState = () => {
    let { conference, task } = this.props;
    if(conference === undefined || task === undefined){
      return;
    }
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
      if(diffProps.includes("conference")&&this.props.conference!==undefined){
        var diffConf = Object.keys(this.props.conference).filter(q => this.props.conference[q] !== nextprops.conference[q]);
        if(diffConf.includes("source") && this.props.conference.source.status==="started"){
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
            <div id="RecordingControlTitle" className="firstline">
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