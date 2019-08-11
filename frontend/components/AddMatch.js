import React, { useState, useEffect } from "react";
import Form from "./styles/Form";
import Router from "next/router";
import Error from "./ErrorMessage";
import styled from "styled-components";
import PlayerInfo from "./PlayerInfo";
import debounce from "lodash.debounce";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import PropTypes from "prop-types";
import Search from "./Search";

const CREATE_MATCH_MUTATION = gql`
  mutation CREATE_MATCH_MUTATION(
    $players: [String!]!
    $stats: [Json!]!
    $teams: [Team!]!
    $duration: Int!
    $winner: Team!
  ) {
    createMatch(
      players: $players
      stats: $stats
      teams: $teams
      duration: $duration
      winner: $winner
    ) {
      id
    }
  }
`;

const CREATE_TEAM_MUTATION = gql`
  mutation CREATE_TEAM_MUTATION($name: String!, $players: [Player]!) {
    createTeam(players: [$players]) {
      id
    }
  }
`;

const CREATE_PLAYER_MUTATION = gql`
  mutation CREATE_PLAYER_MUTATION($summonerName: String!) {
    createPlayer(summonerName: $SummonerName) {
      id
    }
  }
`;

const Division = styled.div`
  float: ${props => props.direction};
  width: 45%;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

function AddMatch() {
  let baseStats = {
    summonerName: "",
    champion: "",
    role: "",
    kills: 0,
    deaths: 0,
    assists: 0,
    damage: 0,
    gold: 0
  };

  let teamPlayerInfo = {
    top: { ...baseStats },
    jungle: { ...baseStats },
    mid: { ...baseStats },
    carry: { ...baseStats },
    support: { ...baseStats }
  };

  const [isLoaded, setIsLoaded] = useState(false);
  const [matchID, setMatchID] = useState();
  const [blueTeam, setBlueTeam] = useState({ ...teamPlayerInfo });
  const [redTeam, setRedTeam] = useState({ ...teamPlayerInfo });
  const [teamNames, setTeamNames] = useState(["", ""]);
  const [winner, setWinner] = useState("");

  const callBackendAPI = async match => {
    const response = await fetch(
      `http://localhost:4444/addmatch?match=${match}`
    );
    if (response.status !== 200) {
      setIsLoaded(false);
      throw Error(body.message);
    }

    const body = await response.json();
    if (body["message"]) {
      delete baseStats.summonerName;
      setBlueTeam({ ...teamPlayerInfo });
      setRedTeam({ ...teamPlayerInfo });
      setIsLoaded(false);
    }
    const data = body["data"];

    // 3102504145
    if (data) {
      let blueLaneInfo = {};
      let redLaneInfo = {};
      const setLane = i => {
        const {
          kills,
          deaths,
          assists,
          totalDamageDealtToChampions: damage,
          goldEarned: gold
        } = data["participants"][i]["stats"];
        return {
          champion: data["participants"][i]["champion"],
          kills: Number(kills),
          deaths: Number(deaths),
          assists: Number(assists),
          damage: Number(damage),
          gold: Number(gold)
        };
      };

      Object.keys(blueTeam).forEach((position, index) => {
        blueLaneInfo[position] = {};
        redLaneInfo[position] = {};
        blueLaneInfo[position] = {
          ...setLane(index)
        };
        redLaneInfo[position] = {
          ...setLane(index + 5)
        };
      });
      setBlueTeam({ ...blueLaneInfo });

      setRedTeam({ ...redLaneInfo });
      setIsLoaded(false);
    }
  };

  const handleBlueTeamDataChange = e => {
    const { value } = e.target;
    let blueTeamName = teamNames;
    blueTeamName[0] = value;

    setTeamNames(blueTeamName);
  };

  const handleRedTeamDataChange = e => {
    const { value } = e.target;
    let redTeamName = teamNames;
    redTeamName[1] = value;

    setTeamNames(redTeamName);
  };

  const getMatch = debounce(async e => {
    setMatchID(e.target.value);
  }, 350);

  useEffect(() => {
    callBackendAPI(matchID);
  }, [matchID]);

  return (
    <Mutation
      mutation={CREATE_PLAYER_MUTATION}
      variables={{
        summonerName: blueTeam.summonerName,
        team: teamNames[0],
        role: blueTeam
      }}
    >
      {(createPlayer, { loading: playerLoading, error: playerError }) => (
        <Mutation
          mutation={CREATE_TEAM_MUTATION}
          variables={{
            name: teamNames[0]
          }}
        >
          {(createTeam, { loading: teamLoading, error: teamError }) => (
            <Mutation
              mutation={CREATE_MATCH_MUTATION}
              variables={{
                players: [blueTeam.top, blueTeam.jungle],
                stats: [blueTeam.top],
                teams: teamNames,
                duration: 5,
                winner: winner === "blue" ? teamNames[0] : teamNames[1]
              }}
            >
              {(createMatch, { loading: matchLoading, error: matchError }) => (
                <Form
                  onSubmit={async e => {
                    e.preventDefault();
                    Router.push({
                      pathname: "/addmatch"
                    });
                  }}
                >
                  <Column>
                    <label htmlFor="matchID">
                      <input
                        type="number"
                        id="matchID"
                        name="matchID"
                        placeholder="Match ID"
                        required
                        onChange={e => {
                          e.persist();
                          setIsLoaded(true);
                          getMatch(e);
                        }}
                      />
                    </label>
                  </Column>

                  <fieldset disabled={isLoaded} aria-busy={isLoaded}>
                    <Division direction="left">
                      Blue Side
                      <label players="true" htmlFor="blueTeamName">
                        <input
                          type={"text"}
                          id={"blueTeamName"}
                          name={"blueTeamName"}
                          placeholder={"Team Name"}
                          required
                          value={teamNames[0]}
                          onChange={e => {
                            e.persist();
                            handleBlueTeamDataChange(e);
                          }}
                        />
                      </label>
                      {Object.keys(blueTeam).map(role => (
                        <fieldset player="true" key={role}>
                          <legend>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </legend>
                          <PlayerInfo
                            playerData={blueTeam}
                            setPlayerData={setBlueTeam}
                            position={role}
                            key={role}
                          />
                        </fieldset>
                      ))}
                      <button type="submit">Submit</button>
                    </Division>
                    <Division direction="right">
                      Red Side
                      <label player="true" htmlFor="redTeam">
                        <input
                          type={"text"}
                          id={"redTeam"}
                          name={"redTeam"}
                          placeholder={"Team Name"}
                          required
                          value={teamNames[1]}
                          onChange={e => handleRedTeamDataChange(e)}
                        />
                      </label>
                      {Object.keys(redTeam).map(role => (
                        <fieldset player="true" key={role}>
                          <legend>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </legend>
                          <PlayerInfo
                            playerData={redTeam}
                            setPlayerData={setRedTeam}
                            position={role}
                            key={role}
                          />
                        </fieldset>
                      ))}
                    </Division>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          )}
        </Mutation>
      )}
    </Mutation>
  );
}

AddMatch.propTypes = {
  player: PropTypes.shape({
    accountID: PropTypes.string,
    summonerID: PropTypes.string,
    summonerName: PropTypes.string,
    role: PropTypes.string,
    matches: PropTypes.array,
    id: PropTypes.string
  }),
  match: PropTypes.shape({
    id: PropTypes.string,
    players: PropTypes.array,
    teams: PropTypes.array,
    duration: PropTypes.number
  }),
  stats: PropTypes.shape({
    id: PropTypes.string,
    player: PropTypes.object,
    role: PropTypes.string,
    match: PropTypes.object,
    champion: PropTypes.string,
    kills: PropTypes.Number,
    deaths: PropTypes.number,
    assists: PropTypes.number,
    gold: PropTypes.number,
    damage: PropTypes.number
  })
};

export default AddMatch;
