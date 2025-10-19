const stringSimilarity = require("string-similarity");

const getBestMatch = (query, results) => {
  const names = results.map((r) => r.description);
  const { bestMatch } = stringSimilarity.findBestMatch(query, names);
  const index = names.indexOf(bestMatch.target);
  return results[index];
};

module.exports = {
  getBestMatch,
};
