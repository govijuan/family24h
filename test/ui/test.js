var url = "http://localhost:3000/";
var siteName = "Family 24h";


casper.test.begin("Test scenario: Site is up", function (test) {
    casper.start(url, function () {
        test.assertHttpStatus(200, siteName + " is up");
        this.test.assert(
            this.getCurrentUrl() == url, "URL is the one expected (" + this.getCurrentUrl() + ")"
        );
        test.assertTitle(siteName, siteName + " has the correct title");
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin("Test scenario: Home Page", function (test) {
    casper.start(url, function () {
        test.assertHttpStatus(200, siteName + " is up");  
        test.assertTitle(siteName, siteName + " has the correct title");
    });

    casper.then(function () {
        test.assertSelectorHasText("a", "Downloads", siteName + " has a Download link");
    });

    casper.run(function() {
        test.done();
    });
});

casper.test.begin("Test scenario: Downloading the App", function (test) {
    casper.start(url, function () {
        test.assertSelectorHasText("a", "Downloads", siteName + " has a Download link");
    });

    casper.then(function () {
        this.clickLabel("Downloads", "a");
    });

    casper.then(function () {
        this.test.assert(
            this.getCurrentUrl() == url + "download/", "URL is the one expected (" + this.getCurrentUrl() + ")"
        );
    });

    casper.run(function() {
        test.done();
    });
});