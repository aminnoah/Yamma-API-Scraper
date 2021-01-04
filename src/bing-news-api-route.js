const fs = require('fs');
const fetch = require('node-fetch');

// helper function to write data to file so we can see data format
const writeOutput = (res) => {
  let time = new Date(); 
  const timeString = `${time.getDate()}_${(time.getMonth()+1)}_${time.getFullYear()}`
                    +`@${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

  fs.appendFile(`./output/bing_output_${timeString}.json`, res, (err) => {
    if (err) {
      console.log(err);
      throw err;
    }
    console.log('JSON data is saved.');
  });
};

// NOTE: setInterval(), clearInterval(), and setTimeout() are all
// async functions that DON'T BELONG TO THIS CLASS.
// this means they can run without a class instance despite being called within class methods
// SO, for them to have access to instance-specific variables like 'this.queryParams'...
// we pass 'this' as a 3rd parameter in a respective call and it is
// passed to the anonymous function as 'router'

class BingNewsApiRoute {

  constructor(running = false, intervalSizeInMin = 1, timeOutSizeInMin = 1) {
    this.running = running;
    // default query params
    this.queryParams = 'textDecorations=false&count=100&mkt=en-US&';
    this.minutesPassed = 1;
    this.intervalSizeInMin = intervalSizeInMin;
    this.timeOutSizeInMin = timeOutSizeInMin;
    this.interval;

    // if class instance constructed with running, mount the instance
    if(this.running)
      this.mount();
  }

  // Mount the instance
  mount() {
    console.log(
      'OMGOMGOMGOMGOMGOMGOMGOMG MOUNTING BINGROUTER NOW!!!!!!!!!!!!!!!!!!!!!!'
    );
    this.running = true;
    this.fetchContent();
  }

  // Unmount the instance
  unMount(router) {
    // if the router has an interval loop, clear it and stop running
    if (!!router.interval) {
      clearInterval(router.interval);
      console.log('unmounted bing, setting running to false');
      router.running = false;
    } 
    // if there is no interval loop, this call was a mistake
    else {
      console.log(
        'trying to unmount, but we are not mounted!! running: ',
        router.running
      );
    }
  }

  async fetchContent() {

    // if not running, then not properly mounted. exit function
    if (!this.running) {
      console.log('mistakenly trying to start fetch... quitting now!');
      return;
    }

    // set this.interval to be a new interval
    // NOTE -> see line 19
    this.interval = setInterval(function (router) {
      // print and increment minutes passed
      console.log(`${router.minutesPassed} MINUTES HAVE PASSED, FETCHING NOW`);
      router.minutesPassed += 1;

      // check the queryParams
      console.log('the query params are: ', router.queryParams);

      fetch(
        `https://bing-news-search1.p.rapidapi.com/news?${router.queryParams}safeSearch=Off&textFormat=Raw`,
        {
          method: 'GET',
          headers: {
            'x-bingapis-sdk': 'true',
            'x-rapidapi-key':
              '5da2ae0b98msha23715ba207f2ddp1e59cejsnafe17b1f6602',
            'x-rapidapi-host': 'bing-news-search1.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
        }
      )
        .then((res) => {
          // convert res to json
          return res.json();
        })
        .then((res) => {
          // call helper to store the response
          console.log('writing output..');
          writeOutput(JSON.stringify(res));

          console.log('GOT THE RESPONSE!!!!!!!!!!!!! : ');
        })
        .catch((er) => {
          console.error(er);
        });

      // the interval is 'intervalSizeMultiplier * 1 min'
      // 60000 milliseconds = 1 minute
      // NOTE -> see line 19
    }, this.intervalSizeInMin * 60000, this);



    // set the timeout 
    // (basically a counter in the background that will run one time when it reaches the count)
    // NOTE -> see line 19
    setTimeout(function(router) {
      router.unMount(router);

    // the interval is 'intervalSizeMultiplier * 1 min'
    // 60000 milliseconds = 1 minute
    }, this.timeOutSizeInMin * 60000, this);

  }
}

module.exports = BingNewsApiRoute;