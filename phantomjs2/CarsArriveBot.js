var sys = require("system"),
    page = require("webpage").create(),
    logResources = false,
    jquery = "https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js";


page.open('https://login.carsarrive.com/', function() {
    page.includeJs(jquery, function() {
        page.evaluate(function() {


            $.get("https://carsarrive.firebaseio.com/.json", function(data) {
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
        console.log('console> ' + msg);
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
/* = {
    loads: 0,
    date: "",
    milage: 12345,
    sleep: false
};
*/
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

    if (loads % 10 === 0 || args.sleep) {
        firebasecheck();
    } else if (args && !args.sleep) {
        page.evaluate(main);
    }

    function firebasecheck() {
        page.evaluate(function(main) {
            /*
                    $.ajax({
                      type: "POST",
                      url: "https://carsarrivebot.firebaseio-demo.com/.json",
                      data: { "first": "Jack", "last": "Sparrow" },
                      success: function(){console.log("success");},
                      error: function(xhr, error){
                              console.debug(xhr); console.debug(error);
                              },
                      dataType: "json"
                    });
            */
            $.get("https://carsarrive.firebaseio.com/.json", function(data) {

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
        }, main); //page.evaluate
    }


    function main() {
        var args;
        if (typeof window.callPhantom === 'function') {
            args = window.callPhantom();
            //alert(args);
        }


        var milageLimit = args.milage;

        var url = document.location.href.split('?')[0];
        var login = 'https://login.carsarrive.com/';
        var findLoads = 'https://www.carsarrive.com/tab/Transport/FindLoads.asp';
        var viewLoadShort = 'https://www.carsarrive.com/tab/Transport/ViewLoadShort.asp';
        var viewLoadComplete = 'https://www.carsarrive.com/tab/Transport/ViewLoadComplete.asp';
        var whereToSend = 'https://www.carsarrive.com/tab/Transport/WhereToSend.asp';
        var searchPage = 'https://www.carsarrive.com/tab/TransportManager/Default.asp';



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
                WhereToSend('Marcos', args.date, args.date);
                break;
            case searchPage:
                doSearch();
                break;
            default:
                console.log("switch: " + url);
                break;
        }


        function doSearch() {
            console.log('Searching ...');
            var submit = "#frm1 > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(5) > td:nth-child(1) > a:nth-child(1)";
            // selects for origin & destination
            var $orig = $("#asmSelect0");
            var $dest = $("#asmSelect1");
            //                var miami = "6_10_12";
            var miami = "1_0_0";

            $orig.val(miami).change();
            $dest.val(miami).change();
            $(submit).click();
        }

        function checkResults() {
            //var results = $('#loads > tbody > tr').length;
            var results = $('.odd, .even').length;
            console.log("Results: " + results);

            if (!results) {
                dosearch();
            } else {
                found();
            }
        }

        function found() {

            var $results = $('.odd, .even');

            var id = $('.odd > td:nth-child(1)').html().trim();
            var cars = $('.odd > td:nth-child(2)').html().trim();
            var model = $('.odd > td:nth-child(3)').html().trim();
            var origCity = $('.odd > td:nth-child(4)').html().trim();
            var origargse = $('.odd > td:nth-child(5)').html().trim();
            var destCity = $('.odd > td:nth-child(6)').html().trim();
            var destargse = $('.odd > td:nth-child(7)').html().trim();
            var milage = $('.odd > td:nth-child(8)').html().trim();
            var priceShip = $('.odd > td:nth-child(9)').html().trim();
            var priceMile = $('.odd > td:nth-child(10)').html().trim();
            var $view = $('.odd > td:nth-child(11) > a:nth-child(1)');
            var comments = $('.odd > td:nth-child(12)').html().trim();



            if (milage < milageLimit) {
                window.location.href = $view.attr('href');
            } else {
                console.log("Load " + id + " exceeds milage " + milage);
                // FIXME do something better here, get next result if available              
                dosearch();
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
        function WhereToSend(user, pickup, delivery) {

            console.log('WhereToSend');
            var $continue1 = $('#content_contain > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(18) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(1) > a:nth-child(1)');
            var $username = $('#sdriver_name');
            var $pickup_date = $('#stransp_pickup_date');
            var $delivery_date = $('#stransp_delivery_date');
            var $rapid_ach = $('#nradTerms');

            $username.val(user);
            $pickup_date.val(pickup).change();
            $delivery_date.val(delivery);
            $rapid_ach.click();

            //  $continue1.click();
            dosearch();
        }


        function dosearch() {
            window.location.href = 'https://www.carsarrive.com/tab/TransportManager/Default.asp';
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
