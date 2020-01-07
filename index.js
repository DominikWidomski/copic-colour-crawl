const Crawler = require("crawler");
const fs = require("fs");

const pickedColors = [
  "B24",
  "B52",
  "B99",
  "BG07",
  "BG13",
  "BG72",
  "BV04",
  "BV23",
  "BV29",
  "R24",
  "R27",
  "R32",
  "R35",
  "R37",
  "RV14",
  "RV32",
  "RV34",
  "V15",
  "V25",
  "YG13",
  "YR01",
  "YR04",
  "YR09",
  "YR16"
];

const pastelColors = [
  "B02",
  "B21",
  "BG02",
  "BV31",
  "G02",
  "E13",
  "E21",
  "E31",
  "RV34",
  "V12",
  "Y08",
  "100"
];

const perfectPrimaries = [
  "B00","B04","R43","R46","Y123","Y19"
];

const palePastels = [
  "BG11","BG15","BV0000","BV01","YR12","YR31"
];

const finalChoices = [
  "V15", "YR16", "YR31", "YG13", "RV32", "RV34", "R24", "R35", "R43", "B04", "BG13", "BV01"
]

// const folderPath = 'images';
// const colorCodes = pickedColors;
// const folderPath = 'pastelSet';
// const colorCodes = pastelColors;
// const folderPath = 'perfectPrimaries';
// const colorCodes = perfectPrimaries;
// const folderPath = 'palePastels';
// const colorCodes = palePastels;
const folderPath = 'finalChoices';
const colorCodes = finalChoices;

const ensureDir = async dir => {
  try {
    await mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};

var fileCrawler = new Crawler({
  encoding: null,
  maxConnections: 10,
  jQuery: false,
  callback: function(err, res, done) {
    if (err) {
      console.error(err.stack);
    } else {
      console.log(`[${res.options.filename}] saving thumbnail`);
      ensureDir(folderPath);
      fs.createWriteStream(`${folderPath}/${res.options.filename}`).write(res.body);
    }

    done();
  }
});

var pageCrawler = new Crawler({
  maxConnections: 10,
  // This will be called for each crawled page
  callback: function(error, res, done) {
    if (error) {
      console.log(error);
    } else {
      var $ = res.$;
      // $ is Cheerio by default
      //a lean implementation of core jQuery designed specifically for the server
      const title = $("title").text();
      const thumbnail = $(".thum_img");
      if (thumbnail.length !== 1) {
        console.log(
          `[${title}] expected 1 thumbnail, found [${thumbnail.length}]`
        );
      } else {
        console.log(`[${title}] fetching thumbnail`);
        fileCrawler.queue([
          {
            uri: `https://copic.jp${thumbnail[0].attribs.src}`,
            filename: thumbnail[0].attribs.src.split("/").pop()
          }
        ]);
      }
    }
    done();
  }
});

pageCrawler.queue(colorCodes.map(colorCode => `https://copic.jp/en/color/${colorCode}/`));

// Queue URLs with custom callbacks & parameters
// pageCrawler.queue([
//   {
//     uri: "http://parishackers.org/",
//     jQuery: false,

//     // The global callback won't be called
//     callback: function(error, res, done) {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log("Grabbed", res.body.length, "bytes");
//       }
//       done();
//     }
//   }
// ]);
