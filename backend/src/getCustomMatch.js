const { Kayn, REGIONS } = require("kayn");

const kayn = Kayn("RGAPI-cf44aa1c-3d3b-4bba-8731-1303d13c55aa")({
  region: REGIONS.NORTH_AMERICA,
  locale: "en_US",
  debugOptions: {
    isEnabled: true,
    showKey: false
  },
  requestOptions: {
    shouldRetry: true,
    numberOfRetriesBeforeAbort: 3,
    delayBeforeRetry: 1000,
    burst: false,
    shouldExitOn403: false
  },
  cacheOptions: {
    cache: null,
    timeToLives: {
      useDefault: false,
      byGroup: {},
      byMethod: {}
    }
  }
});

const _getCustomMatch = async (kayn, matchID) => {
  let match = await kayn.Match.get(matchID);
  const DDragonChampions = await kayn.DDragon.Champion.listDataByIdWithParentAsId();
  const championData = DDragonChampions["data"];
  const championIdToName = id => championData[id]["name"];

  for (let champID in match["participants"]) {
    match["participants"][champID]["champion"] = championIdToName(
      match["participants"][champID]["championId"]
    );
  }

  return match;
};

const getCustomMatch = async matchID => {
  const match = await _getCustomMatch(kayn, matchID);

  return match;
};

module.exports = getCustomMatch;
