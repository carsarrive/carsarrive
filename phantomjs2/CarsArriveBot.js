var sys = require("system"),
    page = require("webpage").create(),
    logResources = false,
    jquery = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js";

// TODO not available date select max available
// TODO add ios icon

page.open('https://login.carsarrive.com/', function() {
    page.includeJs(jquery, function() {
        page.evaluate(function() {



            $.ajax({
                accept: "application/json",
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: "https://carsarrive.firebaseio.com/server/.json",
                headers: {"X-HTTP-Method-Override": "PATCH"},
                data: JSON.stringify({"timestamp": (new Date()).toString()}),
                success: function(){

                              $.get("https://carsarrive.firebaseio.com/server/.json", function(data) {
                                  if (typeof window.callPhantom === 'function') {
                                      var args = window.callPhantom(data);
                                      //alert(args);
                                  }


                                  console.log(JSON.stringify(data));
                                  

                                  var today = new Date();
                                  var appdate = new Date(data.date);
                                  if(appdate<today){
                                    console.log("Failed datecheck");
                                    return;
                                  }


                                  if ($('#edit-name--2').length == 1) {
                                      console.log("Logging in");
                                      $('#edit-name--2').val('marron').change();
                                      $('#edit-pass--2').val('ale5849').change();
                                      $('#edit-submit--2').click();
                                  }
                              }); //$.get
                          }// success
            });//$.ajax

        });
    });
});




/**
 * From PhantomJS documentation:
 * This callback is invoked when there is a JavaScript console. The callback may accept up to three arguments: 
 * the string for the message, the line number, and the source identifier.
 */
page.onConsoleMessage = function(msg, line, source) {
    if (msg.indexOf('JQMIGRATE:') == -1 && msg.length > 0) {
        console.log('> ' + msg);
    }
};

/**
 * From PhantomJS documentation:
 * This callback is invoked when there is a JavaScript alert. The only argument passed to the callback is the string for the message.
 */
page.onAlert = function(msg) {
    //console.log('alert!!> ' + msg);
};

var loads = 0;
var args;


page.onCallback = function(data) {
    if (data) {
        args = data;
        //return args;
    }
    return args;
};


page.onLoadFinished = function() {
//    console.log("page.onLoadFinished");
    loads = loads + 1;


    if (loads % 25 === 0 || args.sleep) {
        firebasecheck();
    } else if (args && !args.sleep) {
        page.evaluate(main);
    }

    function firebasecheck() {
        page.evaluate(function(main) {

            $.ajax({
                accept: "application/json",
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: "https://carsarrive.firebaseio.com/server/.json",
                headers: {"X-HTTP-Method-Override": "PATCH"},
                data: JSON.stringify({"timestamp": (new Date()).toString()}),
                success: function(){
                            $.get("https://carsarrive.firebaseio.com/server/.json", function(data) {

                                if (typeof window.callPhantom === 'function') {
                                    var args = window.callPhantom(data);
                                    //alert(args);
                                }
                                //console.log(JSON.stringify(data));
                                  if(!data.sleep){
                                      main();
                                  }else{
                                     setTimeout(function() { window.location.href = "https://www.carsarrive.com/tab/TransportManager/Default.asp"; }, 6666);

                                      
                                  }
                            }); //$.get
                         } // success
            });


        }, main); //page.evaluate
    }


    function main() {
        var args;
        if (typeof window.callPhantom === 'function') {
            args = window.callPhantom();
            //alert(args);
        }
        
        function Results(results){
            var items;

            this.get = function (i){
                return {"id":$(items[i]).find('> td:nth-child(1)').html().trim(),
                        "cars":$(items[i]).find('> td:nth-child(2)').html().trim(),
                        "model":$(items[i]).find('> td:nth-child(3)').html().trim(),
                        "origcity":$(items[i]).find('> td:nth-child(4)').html().trim(),
                        "origargse":$(items[i]).find('> td:nth-child(5)').html().trim(),
                        "destCity":$(items[i]).find('> td:nth-child(6)').html().trim(),
                        "destargse":$(items[i]).find('> td:nth-child(7)').html().trim(),
                        "milage":Number($(items[i]).find('> td:nth-child(8)').html().trim()),
                        "priceShip":Number($(items[i]).find('> td:nth-child(9)').html().trim().split('$')[1]),
                        "priceMile":Number($(items[i]).find('> td:nth-child(10)').html().trim().split('$')[1]),
                        "link":$(items[i]).find('> td:nth-child(11) > a:nth-child(1)').attr('href').trim(),
                        "comments":$(items[i]).find('> td:nth-child(12)').html().trim(),
                        "timestamp": (new Date()).toString()
                      };
            };

            items = results;
        } // Results

        var milageLimit = args.milage;

        var url = document.location.href.split('?')[0];
        var login = 'https://login.carsarrive.com/';
        var findLoads = 'https://www.carsarrive.com/tab/Transport/FindLoads.asp';
        var viewLoadShort = 'https://www.carsarrive.com/tab/Transport/ViewLoadShort.asp';
        var viewLoadComplete = 'https://www.carsarrive.com/tab/Transport/ViewLoadComplete.asp';
        var whereToSend = 'https://www.carsarrive.com/tab/Transport/WhereToSend.asp';
        var searchPage = 'https://www.carsarrive.com/tab/TransportManager/Default.asp';
        var confirm = 'https://www.carsarrive.com/tab/Transport/LoadAssigned2.asp';


        switch (url) {
            case login:
                break;
            case findLoads:
                checkResults();
                break;
            case viewLoadShort:
                ViewLoadShort();
                break;
            case viewLoadComplete:
                ViewLoadComplete();
                break;
            case whereToSend:
                WhereToSend('Marcos', args.pickup, args.deliver);
                break;
            case searchPage:
                doSearch();
                break;
            case confirm:
                confirmed();
                break;
            default:
                console.log("Error: " + url);
                searchAgain();
                break;
        }


        function confirmed(){
          console.log("Finished successfully!");
          searchAgain();
        }

        // function to simulate a confirmed without adding the car
        function test$continue1_click(){
          window.location.href = confirm;
        }

        function doSearch() {
            console.log('Searching ...');
            var submit = "#frm1 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(5) > td:nth-child(1) > a:nth-child(1)";
            // selects for origin & destination
            var $orig = $("#asmSelect0");
            var $dest = $("#asmSelect1");
            var miami = "6_10_12";
            
            $orig.val("0_0_0").change();
            $dest.val(miami).change();
            $(submit).click();
        }

        function checkResults() {
            //var results = $('#loads > tbody > tr').length;
            var results = $('.odd, .even').length;
            console.log("Results: " + results);

            if (!results) {
                searchAgain();
            } else {
                found();
            }
        }

        function found() {

            var $results = $('.odd, .even');
            var found = false;
            var greedy = -1;
            var I = -1;

            var results = new Results($results);



            for( var i=0;i<$results.length;i++){

              if (results.get(i).milage < Number(milageLimit)) {
                  found = true;
                  if(Number(greedy) < results.get(i).priceShip){
                    greedy=results.get(i).priceShip;
                    I=i;
                  }
              } else {
                  console.log("Load " + results.get(i).id + " exceeds milage " + results.get(i).milage);
              }
            }

            if(found){
              // get largest
              console.log("Multiple found, selected largest");
//              console.log($($results[I]).find('td:nth-child(9)').html().trim().split('$')[1]);
              console.log(results.get(I).priceShip);

              $.ajax({
                  accept: "application/json",
                  type: 'POST',
                  contentType: "application/json; charset=utf-8",
                  dataType: "json",
                  url: "https://carsarrive.firebaseio.com/loads/.json",
                  data: JSON.stringify(results.get(I)),
                  success: function(){
                              window.location.href = results.get(I).link;
                           } // success
              });

            }else{
              searchAgain();
            }
      }

        //https://www.carsarrive.com/tab/Transport/ViewLoadShort.asp?nload_id=4907345&npickup_code=
        function ViewLoadShort() {
            console.log('ViewLoadShort');
            var $accept = $('#frmYesNo > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > a:nth-child(1)');
            $accept.click();
        }
        //https://www.carsarrive.com/tab/Transport/ViewLoadComplete.asp?nload_id=4907345&npickup_code=
        function ViewLoadComplete() {
            console.log('ViewLoadComplete');
            var $continue1 = $('#frm2 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > a:nth-child(1)');
            $continue1.click();
        }
        //https://www.carsarrive.com/tab/Transport/WhereToSend.asp
        function WhereToSend(user, pickup, deliver) {

            console.log('WhereToSend');
            var $continue1 = $('#content_contain > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(18) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > a:nth-child(1)');
            var $username = $('#sdriver_name');
            var $pickup_date = $('#stransp_pickup_date');
            var $delivery_date = $('#stransp_delivery_date');
            var $rapid_ach = $('#nradTerms');

            $username.val(user).change();
            $pickup_date.val(pickup).change();
            $delivery_date.val(deliver).change();
            $rapid_ach.click();
            
            //$continue1.click();
            test$continue1_click();
        }


        function searchAgain() {
            window.location.href = searchPage;
        }

        function getToday(days) {
            var MyDate = new Date();
            var MyDateString;

            MyDate.setDate(MyDate.getDate() + days);

            MyDateString = ('0' + (MyDate.getMonth() + 1)).slice(-2) + '/' + ('0' + MyDate.getDate()).slice(-2) + '/' + MyDate.getFullYear();

            return MyDateString;
        }


    } // main



}; //page.onLoadFinished



/*
if (sys.args.length > 1 && sys.args[1] === "-v") {
    logResources = true;
}

page.onUrlChanged = function() {
    console.log("page.onUrlChanged");
    printArgs.apply(this, arguments);
};
page.onNavigationRequested = function() {
    console.log("page.onNavigationRequested");
    printArgs.apply(this, arguments);
};
function printArgs() {
    var i, ilen;
    for (i = 0, ilen = arguments.length; i < ilen; ++i) {
        console.log("    arguments[" + i + "] = " + JSON.stringify(arguments[i]));
    }
    console.log("");
}

if (logResources === true) {
    page.onResourceRequested = function() {
        console.log("page.onResourceRequested");
        printArgs.apply(this, arguments);
    };
    page.onResourceReceived = function() {
        console.log("page.onResourceReceived");
        printArgs.apply(this, arguments);
    };
}
*/

////////////////////////////////////////////////////////////////////////////////
/*
page.onInitialized = function() {
    console.log("page.onInitialized");
    //printArgs.apply(this, arguments);
};
page.onLoadStarted = function() {
    console.log("page.onLoadStarted");
    //printArgs.apply(this, arguments);
};

page.onLoadFinished = function() {
    console.log("page.onLoadFinished");
    printArgs.apply(this, arguments);
};


page.onRepaintRequested = function() {
    console.log("page.onRepaintRequested");
    printArgs.apply(this, arguments);
};

page.onClosing = function() {
    console.log("page.onClosing");
    //printArgs.apply(this, arguments);
};

// window.console.log(msg);

page.onConsoleMessage = function() {
    console.log("page.onConsoleMessage");
    printArgs.apply(this, arguments);
};

// window.console.log(msg);

page.onAlert = function() {
    console.log("page.onAlert");
    printArgs.apply(this, arguments);
};
// var confirmed = window.confirm(msg);
page.onConfirm = function() {
    console.log("page.onConfirm");
    printArgs.apply(this, arguments);
};
// var user_value = window.prompt(msg, default_value);
page.onPrompt = function() {
    console.log("page.onPrompt");
    printArgs.apply(this, arguments);
};

////////////////////////////////////////////////////////////////////////////////

setTimeout(function() {
    console.log("");
    console.log("### STEP 1: Load '" + step1url + "'");
    page.open(step1url);
}, 0);

setTimeout(function() {
    console.log("");
    console.log("### STEP 2: Load '" + step2url + "' (load same URL plus FRAGMENT)");
    page.open(step2url);
}, 5000);

setTimeout(function() {
    console.log("");
    console.log("### STEP 3: Click on page internal link (aka FRAGMENT)");
    page.evaluate(function() {
        var ev = document.createEvent("MouseEvents");
        ev.initEvent("click", true, true);
        document.querySelector("a[href='#Event_object']").dispatchEvent(ev);
    });
}, 10000);

setTimeout(function() {
    console.log("");
    console.log("### STEP 4: Click on page external link");
    page.evaluate(function() {
        var ev = document.createEvent("MouseEvents");
        ev.initEvent("click", true, true);
        document.querySelector("a[title='JavaScript']").dispatchEvent(ev);
    });
}, 15000);

setTimeout(function() {
    console.log("");
    console.log("### STEP 5: Close page and shutdown (with a delay)");
    page.close();
    setTimeout(function(){
        phantom.exit();
    }, 100);
}, 20000);

*/
