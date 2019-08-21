const path = require("path");
const fs = require("fs");
const request = require("request-promise-native");
const deepcopy = require("deepcopy");

const pairDir = path.resolve(__dirname, "./out/pairs");
const pairFiles = fs.readdirSync(pairDir);

const charts = [];
const pairs = [];

request
  .get({ uri: "http://localhost:3333/charts/count" })
  .then(res => {
    let lastChart = res["count"];
    if (lastChart === undefined) {
      lastChart = 0;
    }

    request
      .get({ uri: "http://localhost:3333/pairs/count" })
      .then(res => {
        const lastPair = res["count"];
        console.log(lastChart);

        let nextChartId = lastChart + 1;
        let nextPairId = lastPair + 1;
        for (let i = 0; i < pairFiles.length; i += 1) {
          const file = pairFiles[i];

          const contents = fs.readFileSync(
            path.resolve(__dirname, "./out/pairs/", `${file}`)
          );

          const pair = JSON.parse(contents);

          const left = deepcopy(pair.left);
          const right = deepcopy(pair.right);

          left.vegalite = JSON.stringify(left.vegalite);
          right.vegalite = JSON.stringify(right.vegalite);
          left.draco = JSON.stringify(left.draco);
          right.draco = JSON.stringify(right.draco);

          charts.push(left);
          charts.push(right);

          pairs.push({
            left_chart_id: nextChartId,
            right_chart_id: nextChartId + 1,
            comparator: null
          });

          nextChartId += 2;
        }

        for (let i = 0; i < pairs.length; i += 1) {
          const chartsToAdd = [charts[2 * i], charts[2 * i + 1]];
          const pairsToAdd = [pairs[i]];

          console.log(pairsToAdd);
          request
            .post({
              uri: "http://localhost:3333/charts/add",
              json: true,
              body: {
                charts: chartsToAdd
              }
            })
            .then(val => {
              request
                .post({
                  uri: "http://localhost:3333/pairs/add",
                  json: true,
                  body: {
                    pairs: pairsToAdd
                  }
                })
                .then(val => console.log("done"))
                .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => {
        console.log(err);
      });
  })
  .catch(err => {
    console.log(err);
  });
// for (const file in pairFiles) {
//   const contents = fs.readFileSync(
//     path.resolve(__dirname, "./out/pairs/", `${file}.json`)
//   );

//   const pair = JSON.parse(contents);

//   const left = pair.left;
//   const right = pair.right;

//   charts.push(left);
//   charts.push(right);

//   pairs.request
//     .post({
//       uri: "http://localhost:3333/charts/add",
//       json: true,
//       body: {
//         charts: [left, right]
//       }
//     })
//     .then((err, res) => {
//       if (err) {
//         console.log(err);
//       } else {
//         const added = res.body.added;

//         request
//           .post({
//             uri: "http://localhost:3333/pairs/add",
//             json: true,
//             body: {
//               pairs: [
//                 {
//                   left_chart_id: added[0],
//                   right_chart_id: added[1],
//                   comparator: null
//                 }
//               ]
//             }
//           })
//           .then((err, res) => {
//             if (err) {
//               console.log(err);
//             }
//           });
//       }
//     });
// }
