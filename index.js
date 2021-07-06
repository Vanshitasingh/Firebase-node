const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const request = require('request');
const session  = require('express-session');
const flash = require('connect-flash');

const db = require(__dirname + "/firebase.js")
const secondarydb = require(__dirname + "/firebase2.js")


//Using bod-parser
app.use(bodyParser.urlencoded({extended:true}));
//The public folder which holds the CSS
app.use(express.static(__dirname + '/public'));



app.set('view engine', 'ejs');

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname+'/home.html'));
    
   });

app.get("/reg_error",(req,res)=>{
    res.render("error1")
})
app.get("/log_error",(req,res)=>{
    res.render("error2")
})

app.post("/",(req,res)=>{
    let fname = req.body.fname;
    let lname = req.body.lname;
    let company = req.body.company;
    let phone = req.body.phone;
    let message = req.body.message;
    let email = req.body.email;
    let password = req.body.pass;
    var random = Math.floor(Math.random() * 100);
    var markid = company.replace(/ /g,'').slice(0, 4).toUpperCase()+ random;
    var marketid = markid.toString();
    console.log(marketid);
    function createElement( ) {
        var frag = document.createDocumentFragment();
    
        var elem = document.createElement('div');
        const scriptHTML = '<script>alert("Weak password");</script>'
        elem.innerHTML = scriptHTML;
    
        while (elem.childNodes[0]) {
            frag.appendChild(elem.childNodes[0]);
        }
        return frag;
    }
function httpGet(url, callback){
    const body = {
        'dynamicLinkInfo': {
            'domainUriPrefix': 'https://wizdom.page.link',
            'link': 'https://www.wizdomapp.com/?mar=' + marketid
        }
    }
 
   request({
            url: url,
            method: 'POST', json: true, body
        }, function (error, response) {
        if (error) {
            console.log('Error :', error)
        } else {
            if (response && response.statusCode !== 200) {
                console.log('Error on Request :', response.body.error.message)
            } else {
                callback(response.body.shortLink);
            }
        }
    });
}
var url="https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=AIzaSyCJa1bsCnlBQKTJerZ8XtPgr0bmSzjXZC8";
    
httpGet(url,(response)=>{
     var resq = response;
     db.auth().createUserWithEmailAndPassword(email,password).then(function(cred){
         
        return db.firestore().collection('Users').doc(cred.user.uid).set({
             firstName:fname,
             lastName:lname,
             companyName:company,
             phone:Number(phone),
             markid:"lklk",
             message:message,
             short_link:resq
         })
    }).then(()=>{
          
        res.redirect("dashboard");
    }).catch((error) => {
        var errorCode = error.code;
        console.log(errorCode);
        res.render('error1');
      });
    })
    

})

app.post("/login",(req,res)=>{
    let email = req.body.email;
    let password = req.body.pass;
    
  db.auth().signInWithEmailAndPassword(email,password)
         
    .then((userCredential) => {
        // Signed in
        var user = userCredential.user;
        res.redirect("dashboard");
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode)
            res.redirect("/log_error");
        
      });
})


   app.get("/dashboard",(req,res,next)=>{
  
    db.auth().onAuthStateChanged((user) => {
        
        if (user) {
            
          var uid = user.uid;
          db.firestore().collection("Users").doc(uid).get()
          .then(async(doc)=>{
              if(doc.exists){
                  var shortL =doc.data().short_link
                  var markId = doc.data().markid;
                  
                  //rosan's db
                 let firstColl = secondarydb.firestore().collection("Affiliate_Marketing").doc(markId);
                 let first = await firstColl.collection('data').doc('install').get()
                 .then(
                     function(doc){
                    if(doc.exists){
                        var install =doc.data().number
                        return install;
                        }else{
                            console.log('No such document!');
                        }
                        
                    })
                .catch(function(err){
                        console.log(err);
                    })
                    let secondColl= secondarydb.firestore().collection("Affiliate_Marketing").doc(markId);
                   let second=await secondColl.collection('data').doc('login').get()
                    .then(
                        function (doc){
                        if(doc.exists){
                            var login =doc.data().number
                            return login;
                            }else{
                                console.log('No such document!');
                            }
                    })
                    .catch(function(err){
                            console.log(err);
                        })
                    let thirdColl= secondarydb.firestore().collection("Affiliate_Marketing").doc(markId);
                    let thirdF= thirdColl.collection('data').doc('purchases');
                     let third=await thirdF.get()
                        .then(function (doc){
                            if(doc.exists){
                                var puchases=doc.data().free_trial
                                return puchases;
                                }else{
                                    console.log('No such document!');
                                }
                        })
                        .catch(function(err){
                                console.log(err);
                            })
                   let pur= await thirdF.collection('users').doc("hz71u4cgZA6JQ9IR6Yeo").get()
                        .then(function(doc){
                        if(doc.exists){
                            var des = doc.data().skuDetails.description;
                            var gen = doc.data().user.gender;
                             return [des,gen];
                              
                            }else{
                                console.log('No such document!');
                            }

                        })
                    .catch(function(err){
                            console.log(err);
                        })
                        res.render("dash",{shortL:shortL,first:first,second:second,third:third,des:pur[0],gen:pur[1]});  
                  }else{
                      console.log('No such document!');
                  } 
                  
            })
          .catch(function(err){
                  console.log(err);
            })
        } else {
          console.log("User signed out");
        }
        
    });
    
})



   app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname+'/login.html'));
   });

   app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


   