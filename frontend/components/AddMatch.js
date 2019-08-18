import React, { useState, useEffect } from "react";
import Form from "./styles/Form";
import Router from "next/router";
import Error from "./ErrorMessage";
import styled from "styled-components";
import PlayerInfo from "./PlayerInfo";
import debounce from "lodash.debounce";
import gql from "graphql-tag";
import { Mutation, Query } from "react-apollo";
import { useMutation } from "@apollo/react-hooks";
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
  mutation CREATE_TEAM_MUTATION($name: String!) {
    createTeam(name: $name) {
      id
      name
    }
  }
`;

const CREATE_PLAYER_MUTATION = gql`
  mutation CREATE_PLAYER_MUTATION($data: PlayerWhereInput!) {
    createPlayer(data: $data) {
      id
      team {
        id
      }
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
  const [matchID, setMatchID] = useState(null);
  const [blueTeam, setBlueTeam] = useState({ ...teamPlayerInfo });
  const [redTeam, setRedTeam] = useState({ ...teamPlayerInfo });
  const [teamNames, setTeamNames] = useState({ blue: "", red: "" });
  const [winner, setWinner] = useState("");
  const [createTeam, { data }] = useMutation(CREATE_TEAM_MUTATION);

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

    setTeamNames({ ...teamNames, blue: value });
  };

  const handleRedTeamDataChange = e => {
    const { value } = e.target;

    setTeamNames({ ...teamNames, red: value });
  };

  const getMatch = debounce(async e => {
    setMatchID(e.target.value);
  }, 350);

  const teamMutation = async (e, createTeamMutation, teamName) => {
    e.preventDefault();
    createTeam({
      variables: {
        name: teamName
      }
    });
  };

  const playerMutation = async (e, createPlayerMutation, summoner, teamID) => {
    e.preventDefault();
    console.log(`e: ${e}\nsummonerName: ${summoner.summonerName}`);
    const res = await createPlayerMutation({
      variables: {
        data: {
          summonerName: summoner.summonerName,
          role: summoner.role,
          teamID: teamID
        }
      }
    });

    return res;
  };

  useEffect(() => {
    callBackendAPI(matchID);
  }, [matchID]);

  return (
    <Mutation mutation={CREATE_PLAYER_MUTATION}>
      {(createPlayer, { loading: playerLoading, error: playerError }) => (
        <Form
          onSubmit={async e => {
            e.preventDefault();
            teamMutation(e, teamNames.blue);
            console.log(blueTeamID);
            // const res = await playerMutation(
            //   e,
            //   createPlayer,
            //   blueTeam.top,
            //   blueTeamID
            // );

            console.log(res);

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
                  type="text"
                  id="blueTeamName"
                  name="blueTeamName"
                  placeholder="Team Name"
                  value={teamNames.blue}
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
                  value={teamNames.red}
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
