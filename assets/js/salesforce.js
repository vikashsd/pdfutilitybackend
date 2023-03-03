var jsforce = require('jsforce')

exports.accounts = function(){
    var conn = new jsforce.Connection({
        // you can change loginUrl to connect to sandbox or prerelease env.
        loginUrl : 'https://jobdepot-c-dev-ed.develop.my.salesforce.com'
        });
      conn.login('abhinav.anvikar@sandbox.in','Abhinav@1990ANQ8jXG3gBgcRVllHOuoiM0B',(err,userInfo)=>{
          if(err){
            console.error(err)
          }
          else{
            console.log("user ID: " + userInfo.id);
            console.log("org ID: " + userInfo.organizationId);
          }
      });
    conn.query("SELECT id, Name from Account",(err,result) =>{
        if(err){
            return err
        }
        else
            return result.records
    })
};
