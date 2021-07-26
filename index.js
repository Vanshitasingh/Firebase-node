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
            'domainUriPrefix': process.env.DOMAIN,
            'link': process.env.LINK + marketid
        }
    }
 const API_KEY = process.env.API_KEY
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
var url=`https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${API_KEY}`;
    
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
 
    async function getMarketing(markid) {
        // refs
        const ref = secondarydb.firestore().collection("Affiliate_Marketing").doc(markid)
        const installRef = ref.collection('data').doc('install')
        const loginRef = ref.collection('data').doc('login')
        const purchasesRef = ref.collection('data').doc('purchases')
        const skuRef = purchasesRef.collection('users').doc("hz71u4cgZA6JQ9IR6Yeo")
        // docs
        const docs = [
          installRef.get(),
          loginRef.get(),
          purchasesRef.get(),
          skuRef.get()
        ]
        // fetch
        const [installDoc, loginDoc, purchasesDoc, skuDoc] = await Promise.all(docs)
        // combine result
        if (installDoc.exists && loginDoc.exists && purchasesDoc.exists && skuDoc.exists)
          return {
            install: installDoc.data().number,
            login: loginDoc.data().number,
            purchases: purchasesDoc.data().free_trial,
            des: skuDoc.data().skuDetails.description,
            gen: skuDoc.data().user.gender
          }
        else
          throw Error(`Marketing data not found`)
      }
    async function getUser(uid) {
        const doc = await db.firestore().collection("Users").doc(uid).get()
        if (doc.exists)
          return doc.data()
        else
          throw Error(`User not found`)
      }
      db.auth().onAuthStateChanged(user => {
        if (!user) next(Error("Login required"))
        getUser(user.uid)
         .then(({ short_link, markid }) =>
           getMarketing(markid)
             .then(({ install, login, purchases, des, gen }) =>
                res.render("dash",{shortL:short_link, first:install, second:login,third: purchases,des: des, gen:gen })
             ).catch(err=>{console.log(err)})
         ).catch(err=>{console.log(err)})
      })       
    
    
})



   app.get("/login", function (req, res) {
    res.sendFile(path.join(__dirname+'/login.html'));
   });

   app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });


   