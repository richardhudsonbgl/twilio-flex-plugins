const TokenValidator = require('twilio-flex-token-validator').functionValidator;

const enabledFor = ["ALL"];
// const enabledFor = [
// 	"name1@email.co.uk", 
// 	"name2@email.co.uk"
// ];


const isEnabled = (tokenresult) => {
    if(enabledFor.includes("ALL") || enabledFor.includes(tokenresult.realm_user_id.toLowerCase())){
        console.log(tokenresult.realm_user_id.toLowerCase());
        return true;
    }
    return false;
};

exports.handler = TokenValidator(function(context, event, callback) {
    let client = context.getTwilioClient(),
      user = event.TokenResult,
      action = event.action,
      conferenceSid = event.conferenceSid,
      recordingSid = event.recordingSid,
      responseBody = {
        recordingSid: null,
        status: null,
        error: null
    };
    
    const response = new Twilio.Response();
    response.appendHeader("Access-Control-Allow-Origin", "*");
    response.appendHeader("Access-Control-Allow-Methods", "POST");
    response.appendHeader("Content-Type", "application/json");
    response.appendHeader("Access-Control-Allow-Headers", "Content-Type");

    if(!isEnabled(user)){
        responseBody.status = "DISABLED";
        response.setBody(responseBody);
        callback(null, response);
    }

    let getRecording = () => {
        return client
            .recordings
            .list({conferenceSid: conferenceSid});
            
    };

    let updateRecording = (action) => {
        return client
            .conferences(conferenceSid)
            .recordings(recordingSid)
            .update({ status: action, pauseBehavior: 'skip' });
    };

    switch(action){
        case "INFO":
            getRecording()
                .then(result => {
                    responseBody.recordingSid = result[0].sid;
                    responseBody.status = result[0].status;
                    response.setBody(responseBody);
                    callback(null, response);
                })
                .catch(err => {
                    responseBody.status = "NOTAVAILABLE";
                    responseBody.error = err;
                    response.setBody(responseBody);
                    callback(null, response);
                });
            break;
        case "paused":
        case "in-progress":
            updateRecording(action)
                .then(result => {
                    responseBody.recordingSid = result.sid;
                    responseBody.status = result.status;
                    response.setBody(responseBody);
                    callback(null, response);
                })
                .catch(err => {
                    responseBody.status = "FAILED";
                    responseBody.error = err;
                    response.setBody(responseBody);
                    callback(null, response);
                });
            break;
        default:
            responseBody.error = "Action not recognised";
            responseBody.status = "NOTAVAILABLE";
            response.setBody(responseBody);
            callback(null, response);
            break;
    }

  });