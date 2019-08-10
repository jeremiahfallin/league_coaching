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

const CREATE_MATCH_MUTATION = gql`
  mutation CREATE_MATCH_MUTATION(
    $players: [Players!]!
    $stats: [Stats!]!
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

  const getMatch = debounce(async e => {
    setMatchID(e.target.value);
  }, 350);

  useEffect(() => {
    callBackendAPI(matchID);
  }, [matchID]);

  return (
    <Mutation
      mutation={CREATE_MATCH_MUTATION}
      variables={{
        players: players,
        stats: stats,
        teams: team,
        duration: 5,
        winner: team
      }}
    >
      {(createMatch, { loading, error }) => (
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

          <fieldset disabled={isLoaded} aria-busy={loading}>
            <Division direction="left">
              Blue Side
              <label htmlFor="blueTeam">
                <input
                  type="text"
                  id="blueTeam"
                  name="blueTeam"
                  placeholder="Blue Team"
                  required
                  onChange={e => {
                    e.persist();
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
                  type="text"
                  id="redTeam"
                  name="redTeam"
                  placeholder="Red Team"
                  required
                  onChange={e => {
                    e.persist();
                  }}
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

AddMatch.PropTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    id: PropTypes.string,
    permissions: PropTypes.array
  }).isRequired
};

export default AddMatch;
